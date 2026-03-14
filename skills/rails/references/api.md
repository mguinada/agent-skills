# Rails API Reference

Detailed patterns for API-only applications.

## Table of Contents
- [Creating API Apps](#creating-api-apps)
- [API Controllers](#api-controllers)
- [Rendering JSON](#rendering-json)
- [Versioning](#versioning)
- [Authentication](#authentication)
- [Serialization](#serialization)
- [Error Handling](#error-handling)
- [CORS](#cors)
- [Rate Limiting](#rate-limiting)

---

## Creating API Apps

### New API Application
```bash
rails new myapi --api

# Creates:
# - ActionController::API as base controller
# - No views, helpers, or assets
# - Limited middleware stack
```

### Converting Existing App
```ruby
# config/application.rb
config.api_only = true

# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
end
```

### API Middleware Stack
Default middleware for API apps:
- `Rack::Sendfile`
- `ActionDispatch::Static`
- `ActionDispatch::Executor`
- `ActiveSupport::Cache::Strategy::LocalCache::Middleware`
- `Rack::Runtime`
- `ActionDispatch::RequestId`
- `ActionDispatch::RemoteIp`
- `Rails::Rack::Logger`
- `ActionDispatch::ShowExceptions`
- `ActionDispatch::DebugExceptions`
- `ActionDispatch::ActionableExceptions`
- `ActionDispatch::Reloader`
- `ActionDispatch::Callbacks`
- `ActiveRecord::Migration::CheckPending`
- `Rack::Head`
- `Rack::ConditionalGet`
- `Rack::ETag`

---

## API Controllers

### Basic Structure
```ruby
# app/controllers/api/v1/articles_controller.rb
module Api
  module V1
    class ArticlesController < ApplicationController
      def index
        articles = Article.all
        render json: articles
      end

      def show
        article = Article.find(params[:id])
        render json: article
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Not found' }, status: :not_found
      end

      def create
        article = Article.new(article_params)
        if article.save
          render json: article, status: :created
        else
          render json: { errors: article.errors }, status: :unprocessable_entity
        end
      end

      def update
        article = Article.find(params[:id])
        if article.update(article_params)
          render json: article
        else
          render json: { errors: article.errors }, status: :unprocessable_entity
        end
      end

      def destroy
        Article.find(params[:id]).destroy
        head :no_content
      end

      private

      def article_params
        params.expect(article: [:title, :body, :status])
      end
    end
  end
end
```

### Base Controller Pattern
```ruby
# app/controllers/api/base_controller.rb
module Api
  class BaseController < ApplicationController
    # Common API functionality
    before_action :authenticate_request
    before_action :set_default_format

    private

    def authenticate_request
      # Authentication logic
    end

    def set_default_format
      request.format = :json
    end

    def render_error(message, status: :bad_request)
      render json: { error: message }, status: status
    end

    def render_errors(errors, status: :unprocessable_entity)
      render json: { errors: errors }, status: status
    end
  end
end

# app/controllers/api/v1/articles_controller.rb
module Api
  module V1
    class ArticlesController < Api::BaseController
      # Inherits common functionality
    end
  end
end
```

---

## Rendering JSON

### Basic JSON Rendering
```ruby
render json: @article
render json: @article, status: :created
render json: @articles
render json: { message: 'Success' }
```

### JSON Options
```ruby
# Include associations
render json: @article, include: [:comments, :author]

# Select fields
render json: @article, only: [:id, :title, :created_at]
render json: @article, except: [:internal_notes]

# Root key
render json: @article, root: 'article'

# Custom methods
render json: @article, methods: [:formatted_date]
```

### as_json Customization
```ruby
# In model
class Article < ApplicationRecord
  def as_json(options = {})
    super(options.merge(
      only: [:id, :title, :body, :created_at],
      include: {
        author: { only: [:id, :name] }
      }
    ))
  end
end

# Or with block
def as_json(options = {})
  {
    id: id,
    title: title,
    author_name: author.name,
    comments_count: comments.count
  }
end
```

---

## Versioning

### URL Path Versioning
```ruby
# config/routes.rb
namespace :api do
  namespace :v1 do
    resources :articles
  end

  namespace :v2 do
    resources :articles
  end
end

# /api/v1/articles
# /api/v2/articles
```

### Header Versioning
```ruby
# config/routes.rb
namespace :api do
  constraints ApiVersion.new('v1', header: { 'Accept' => /version=1/ }) do
    resources :articles
  end
end

# app/constraints/api_version.rb
class ApiVersion
  def initialize(version, header:)
    @version = version
    @header = header
  end

  def matches?(request)
    @header.all? { |key, pattern| request.headers[key] =~ pattern }
  end
end
```

### Parameter Versioning
```ruby
# GET /api/articles?version=1
constraints ->(req) { req.params[:version] == '1' } do
  resources :articles, module: 'api/v1'
end
```

---

## Authentication

### JWT Authentication
```ruby
# Gemfile
gem 'jwt'

# lib/json_web_token.rb
class JsonWebToken
  SECRET_KEY = Rails.application.credentials.secret_key_base

  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY)
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY)[0]
    HashWithIndifferentAccess.new(decoded)
  rescue JWT::DecodeError
    nil
  end
end

# app/controllers/api/base_controller.rb
module Api
  class BaseController < ApplicationController
    before_action :authenticate_request

    private

    def authenticate_request
      header = request.headers['Authorization']
      token = header.split(' ').last if header

      decoded = JsonWebToken.decode(token)
      if decoded
        @current_user = User.find(decoded[:user_id])
      else
        render json: { error: 'Not authorized' }, status: :unauthorized
      end
    end

    def current_user
      @current_user
    end
  end
end

# app/controllers/api/auth_controller.rb
module Api
  class AuthController < BaseController
    skip_before_action :authenticate_request, only: [:login, :register]

    def login
      user = User.find_by(email: params[:email])
      if user&.authenticate(params[:password])
        token = JsonWebToken.encode(user_id: user.id)
        render json: { token: token, user: user }
      else
        render json: { error: 'Invalid credentials' }, status: :unauthorized
      end
    end

    def register
      user = User.new(user_params)
      if user.save
        token = JsonWebToken.encode(user_id: user.id)
        render json: { token: token, user: user }, status: :created
      else
        render json: { errors: user.errors }, status: :unprocessable_entity
      end
    end
  end
end
```

### API Key Authentication
```ruby
class Api::BaseController < ApplicationController
  before_action :authenticate_api_key

  private

  def authenticate_api_key
    api_key = request.headers['X-API-Key']
    @current_client = Client.find_by(api_key: api_key)

    unless @current_client
      render json: { error: 'Invalid API key' }, status: :unauthorized
    end
  end
end
```

### Token Authentication (Devise)
```ruby
# Gemfile
gem 'devise'
gem 'simple_token_authentication'

# app/models/user.rb
class User < ApplicationRecord
  acts_as_token_authenticatable
end

# Request with header:
# X-User-Email: user@example.com
# X-User-Token: user_token
```

---

## Serialization

### ActiveModel::Serializer
```ruby
# Gemfile
gem 'active_model_serializers'

# app/serializers/article_serializer.rb
class ArticleSerializer < ActiveModel::Serializer
  attributes :id, :title, :body, :created_at, :updated_at

  belongs_to :author
  has_many :comments

  def created_at
    object.created_at.iso8601
  end
end

# In controller
render json: @article  # Uses serializer automatically
render json: @articles, each_serializer: ArticleSerializer
```

### Custom Serializer Options
```ruby
class ArticleSerializer < ActiveModel::Serializer
  attributes :id, :title, :summary

  def summary
    object.body.truncate(100)
  end

  # Conditional attribute
  attribute :secret_notes, if: :admin?

  def admin?
    current_user&.admin?
  end

  # Cache
  cache key: 'article', expires_in: 1.hour
end
```

### Blueprinter
```ruby
# Gemfile
gem 'blueprinter'

# app/blueprints/article_blueprint.rb
class ArticleBlueprint < Blueprinter::Base
  identifier :id
  fields :title, :body

  field :formatted_date do |article|
    article.created_at.strftime('%B %d, %Y')
  end

  association :author, blueprint: AuthorBlueprint
end

# In controller
render json: ArticleBlueprint.render(@article)
render json: ArticleBlueprint.render(@articles)
render json: ArticleBlueprint.render(@article, view: :extended)
```

---

## Error Handling

### Rescue From
```ruby
class Api::BaseController < ApplicationController
  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found
  rescue_from ActiveRecord::RecordInvalid, with: :record_invalid
  rescue_from ActionController::ParameterMissing, with: :parameter_missing
  rescue_from Pundit::NotAuthorizedError, with: :not_authorized

  private

  def record_not_found
    render json: { error: 'Resource not found' }, status: :not_found
  end

  def record_invalid(exception)
    render json: {
      error: 'Validation failed',
      details: exception.record.errors.full_messages
    }, status: :unprocessable_entity
  end

  def parameter_missing(exception)
    render json: {
      error: 'Parameter missing',
      parameter: exception.param
    }, status: :bad_request
  end

  def not_authorized
    render json: { error: 'Not authorized' }, status: :forbidden
  end
end
```

### Custom Error Format
```ruby
class Api::BaseController < ApplicationController
  private

  def render_api_error(message, status:, code: nil, details: nil)
    error_response = {
      error: {
        message: message,
        code: code || Rack::Utils.status_code(status)
      }
    }
    error_response[:error][:details] = details if details

    render json: error_response, status: status
  end
end
```

---

## CORS

### rack-cors Gem
```ruby
# Gemfile
gem 'rack-cors'

# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'example.com', /.*\.example\.com/

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      max_age: 600
  end

  # API-specific CORS
  allow do
    origins '*'
    resource '/api/*',
      headers: :any,
      methods: [:get, :post, :put, :delete, :options],
      expose: ['X-Total-Count']
  end
end
```

---

## Rate Limiting

### Rack::Attack
```ruby
# Gemfile
gem 'rack-attack'

# config/initializers/rack_attack.rb
class Rack::Attack
  # Throttle requests by IP
  throttle('req/ip', limit: 300, period: 5.minutes) do |req|
    req.ip unless req.path.start_with?('/assets')
  end

  # Throttle API requests by API key
  throttle('api/key', limit: 100, period: 1.minute) do |req|
    req.headers['X-API-Key'] if req.path.start_with?('/api')
  end

  # Block suspicious IPs
  blocklist('block bad ips') do |req|
    Rails.cache.fetch("blocked_ips/#{req.ip}") do
      BlockedIp.exists?(ip: req.ip)
    end
  end

  # Safelist localhost
  safelist('allow localhost') do |req|
    req.ip == '127.0.0.1' || req.ip == '::1'
  end
end

# config/application.rb
config.middleware.use Rack::Attack
```

---

## Pagination

### Kaminari
```ruby
# Gemfile
gem 'kaminari'

# In controller
def index
  articles = Article.page(params[:page]).per(20)
  render json: articles
end

# With headers
def index
  articles = Article.page(params[:page]).per(20)
  response.set_header('X-Total-Count', articles.total_count)
  response.set_header('X-Total-Pages', articles.total_pages)
  render json: articles
end
```

### will_paginate
```ruby
# Gemfile
gem 'will_paginate'

# In controller
def index
  articles = Article.paginate(page: params[:page], per_page: 20)
  render json: articles
end
```

---

## Testing API

### Integration Tests
```ruby
class Api::V1::ArticlesTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get api_v1_articles_url, as: :json
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal Article.count, json.length
  end

  test "should create article" do
    post api_v1_articles_url,
      params: { article: { title: 'Test', body: 'Content' } },
      as: :json,
      headers: { 'Authorization' => "Bearer #{token}" }

    assert_response :created
  end
end
```

### Request Specs (RSpec)
```ruby
RSpec.describe 'Api::V1::Articles', type: :request do
  describe 'GET /api/v1/articles' do
    it 'returns articles' do
      article = create(:article)

      get api_v1_articles_path, headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(json_response).to be_an(Array)
    end
  end

  def auth_headers
    token = JsonWebToken.encode(user_id: user.id)
    { 'Authorization' => "Bearer #{token}" }
  end

  def json_response
    JSON.parse(response.body)
  end
end
```

---

## Best Practices

1. **Version your API** — Plan for changes from the start
2. **Use proper HTTP status codes** — 200, 201, 400, 401, 403, 404, 422
3. **Consistent error format** — Structure errors consistently
4. **Pagination** — Never return unlimited results
5. **Rate limiting** — Protect against abuse
6. **Authentication** — JWT, API keys, or tokens
7. **Documentation** — Use Swagger/OpenAPI or similar
8. **Test thoroughly** — Integration tests for all endpoints
9. **CORS configuration** — Allow only necessary origins
10. **Serialization** — Don't expose internal models directly
