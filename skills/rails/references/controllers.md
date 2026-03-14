# Rails Controllers Reference

Detailed patterns for Action Controller.

## Table of Contents
- [Filters](#filters)
- [Strong Parameters](#strong-parameters)
- [Rendering](#rendering)
- [Redirecting](#redirecting)
- [Streaming](#streaming)
- [Authentication](#authentication)
- [Exception Handling](#exception-handling)
- [Request/Response Objects](#requestresponse-objects)

---

## Filters

Filters run code before, after, or around controller actions.

### Before Filters
```ruby
class ArticlesController < ApplicationController
  before_action :require_login
  before_action :set_article, only: %i[show edit update destroy]
  before_action :check_ownership, only: %i[edit update destroy]

  private

  def require_login
    unless logged_in?
      flash[:alert] = "You must be logged in"
      redirect_to login_path
    end
  end

  def set_article
    @article = Article.find(params[:id])
  end

  def check_ownership
    redirect_to root_path unless @article.user == current_user
  end
end
```

### After Filters
```ruby
after_action :log_access, only: :show

private

def log_access
  Rails.logger.info "Article #{@article.id} viewed by #{current_user&.id}"
end
```

### Around Filters
```ruby
around_action :wrap_in_transaction

private

def wrap_in_transaction
  ActiveRecord::Base.transaction do
    begin
      yield
    rescue => e
      raise ActiveRecord::Rollback
    end
  end
end
```

### Skipping Filters
```ruby
class UsersController < ApplicationController
  skip_before_action :require_login, only: %i[new create]
end
```

---

## Strong Parameters

Protect against mass assignment vulnerabilities.

### Basic Usage
```ruby
# New syntax (Rails 8+)
params.expect(user: [:name, :email, :age])

# Legacy syntax
params.require(:user).permit(:name, :email, :age)
```

### Nested Parameters
```ruby
# Nested attributes
params.expect(user: [:name, :email, profile: [:bio, :location]])

# Legacy
params.require(:user).permit(:name, :email, profile: [:bio, :location])
```

### Arrays
```ruby
# Array of scalars
params.expect(user: [:name, tags: []])

# Array of objects (require each element)
params.expect(user: [:name, addresses: [[:street, :city, :zip]]])
```

### Conditional Requirements
```ruby
def article_params
  params.expect(article: [:title, :body, :status])
end
```

---

## Rendering

### Render Options
```ruby
# Render view (default: action_name)
render :show
render template: "articles/detail"

# Render nothing (head response)
head :no_content
head :created

# Render JSON
render json: @article
render json: @article, status: :created
render json: @article.errors, status: :unprocessable_entity

# Render XML
render xml: @article

# Render plain text
render plain: "OK"
render plain: "Error", status: 500

# Render inline
render inline: "<%= @article.title %>"
render inline: "<%= @article.title %>", locals: { article: @article }

# Render with status
render :edit, status: :unprocessable_entity
```

### HTTP Status Codes
```ruby
:ok                    # 200
:created               # 201
:no_content            # 204
:bad_request           # 400
:unauthorized          # 401
:forbidden             # 403
:not_found             # 404
:unprocessable_entity  # 422
:internal_server_error # 500
```

### Layouts
```ruby
render layout: false           # No layout
render layout: "admin"         # Specific layout
render layout: "special", status: 201
```

---

## Redirecting

### Basic Redirects
```ruby
redirect_to articles_path
redirect_to @article              # article_path(@article)
redirect_to article_path(@article, anchor: 'comments')
redirect_to root_url(subdomain: 'admin')
```

### Redirect with Status
```ruby
redirect_to articles_path, status: :moved_permanently  # 301
redirect_to articles_path, status: :found              # 302 (default)
```

### Redirect with Flash
```ruby
redirect_to @article, notice: "Article created successfully"
redirect_to @article, alert: "Something went wrong"
redirect_to articles_path, flash: { success: "All done!" }
```

### Redirect Back
```ruby
redirect_back fallback_location: articles_path
redirect_back_or_to articles_path  # Same as above
```

---

## Streaming

### Streaming Responses
```ruby
def download
  response.headers['Content-Type'] = 'text/csv'
  response.headers['Content-Disposition'] = 'attachment; filename="data.csv"'

  stream = Enumerator.new do |yielder|
    yielder << CSV.generate_line(['Name', 'Email'])
    User.find_each do |user|
      yielder << CSV.generate_line([user.name, user.email])
    end
  end

  render plain: stream.join
end
```

### Live Streaming (SSE)
```ruby
class EventsController < ApplicationController
  include ActionController::Live

  def stream
    response.headers['Content-Type'] = 'text/event-stream'

    10.times do |i|
      response.stream.write "data: #{i}\n\n"
      sleep 1
    end
  ensure
    response.stream.close
  end
end
```

### Send File
```ruby
send_file '/path/to/file.pdf'
send_file '/path/to/file.pdf', type: 'application/pdf', disposition: 'inline'
send_data pdf_content, filename: 'report.pdf', type: 'application/pdf'
```

---

## Authentication

### HTTP Basic Auth
```ruby
class ApplicationController < ActionController::Base
  http_basic_authenticate_with name: "admin", password: "secret", except: :index
end

# Or in action:
def index
  authenticate_or_request_with_http_basic do |username, password|
    username == "admin" && password == "secret"
  end
end
```

### HTTP Digest Auth
```ruby
class AdminController < ApplicationController
  USERS = { "admin" => "secret" }

  before_action :authenticate

  private

  def authenticate
    authenticate_or_request_with_http_digest("Admin Area") do |username|
      USERS[username]
    end
  end
end
```

### Token Auth
```ruby
class Api::BaseController < ApplicationController
  before_action :authenticate_token

  private

  def authenticate_token
    authenticate_or_request_with_http_token do |token, options|
      token == Rails.application.credentials.api_token
    end
  end
end
```

---

## Exception Handling

### Rescue From
```ruby
class ApplicationController < ActionController::Base
  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found
  rescue_from ActiveRecord::RecordInvalid, with: :record_invalid
  rescue_from StandardError, with: :handle_error

  private

  def record_not_found
    render plain: "Not found", status: :not_found
  end

  def record_invalid(exception)
    render json: { errors: exception.record.errors }, status: :unprocessable_entity
  end

  def handle_error(exception)
    Rails.logger.error exception.message
    Rails.logger.error exception.backtrace.join("\n")
    render plain: "Internal error", status: :internal_server_error
  end
end
```

---

## Request/Response Objects

### Request Object
```ruby
request.method          # "GET", "POST", etc.
request.path            # "/articles/1"
request.fullpath        # "/articles/1?foo=bar"
request.url             # "http://example.com/articles/1?foo=bar"
request.host            # "example.com"
request.port            # 80
request.format          # :html, :json, etc.
request.remote_ip       # Client IP
request.user_agent      # Browser user agent
request.headers['X-Custom-Header']
request.cookies         # Cookie hash
request.session         # Session hash
```

### Response Object
```ruby
response.status         # HTTP status code
response.headers        # Response headers hash
response.content_type   # Content type
response.body           # Response body
response.set_header('X-Custom', 'value')
```

---

## Cookies

### Setting Cookies
```ruby
cookies[:user_name] = "david"
cookies[:login] = { value: "XJ-122", expires: 1.hour.from_now }
cookies.permanent[:remember_me] = "true"
cookies.signed[:user_id] = current_user.id
cookies.encrypted[:secret] = "sensitive_data"
```

### Deleting Cookies
```ruby
cookies.delete :user_name
cookies.delete :login, domain: :all
```

---

## Sessions

### Using Sessions
```ruby
# Set session value
session[:user_id] = @user.id

# Get session value
current_user = User.find(session[:user_id])

# Delete session value
session.delete(:user_id)

# Reset entire session
reset_session
```

### Session Configuration
```ruby
# config/initializers/session_store.rb
Rails.application.config.session_store :cookie_store, key: '_myapp_session', expire_after: 30.days
```

---

## Flash Messages

### Setting Flash
```ruby
flash[:notice] = "Successfully created"
flash[:alert] = "Something went wrong"
flash.now[:notice] = "This appears on current request"
flash.keep(:notice)  # Keep for next request
flash.discard(:alert)  # Remove without displaying
```

### Displaying in Views
```erb
<% if flash[:notice] %>
  <div class="notice"><%= flash[:notice] %></div>
<% end %>

<% flash.each do |type, message| %>
  <div class="<%= type %>"><%= message %></div>
<% end %>
```
