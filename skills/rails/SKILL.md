---
name: rails
description: "Ruby on Rails framework development covering MVC architecture, Active Record, migrations, routing, background jobs, and full-stack web applications. **PROACTIVE ACTIVATION**: Auto-invoke when editing Ruby files in a Rails project, running rails commands, or working with Rails-specific patterns. **DETECTION**: Check for Gemfile with 'rails' gem, config/application.rb, app/ directory (controllers, models, views), db/migrate/, config/routes.rb, bin/rails, or *.rb files with ActionController/ActiveRecord imports. **USE CASES**: Creating controllers/models/migrations, building REST APIs, background jobs with Active Job, real-time features with Action Cable, file uploads with Active Storage, email with Action Mailer, internationalization, authentication, and Rails configuration."
author: mguinada
version: 1.4.0
tags: [rails, ruby, web, mvc, activerecord, api, actioncable, activestorage, actionmailer]
---

# Ruby on Rails Development

Rails is a web application framework following MVC architecture. This skill covers core Rails development patterns with progressive disclosure — start here, then dive into reference files for details.

## Quick Reference

### Essential Commands
```bash
rails new myapp              # Create new app
rails new myapp --api        # API-only app
rails console                # Interactive REPL
rails server                 # Start dev server
rails generate               # List generators
rails db:migrate             # Run migrations
rails db:rollback            # Undo last migration
rails routes                 # List all routes
rails middleware             # List middleware stack
```

### Verification Commands
```bash
rails db:migrate:status      # Check migration status
rails db:version             # Current database version
rails runner "puts Rails.env" # Quick environment check
```

**Server verification:** After `rails server`, visit http://localhost:3000. You should see the Rails welcome page or your app root.

**Console verification:** After `rails console`, run `ActiveRecord::Base.connection.tables` to verify database connectivity.

### Conventions
| Concept | Convention |
|---------|-----------|
| Model class | `Article` (singular, CamelCase) |
| Table name | `articles` (plural, snake_case) |
| Controller | `ArticlesController` (plural) |
| Foreign key | `article_id` (singular_table_id) |
| Primary key | `id` (auto-generated bigint) |
| Timestamps | `created_at`, `updated_at` |

---

## Controllers

Controllers handle HTTP requests and coordinate between models and views.

### Basic Structure
```ruby
# app/controllers/articles_controller.rb
class ArticlesController < ApplicationController
  before_action :set_article, only: %i[show edit update destroy]

  def index
    @articles = Article.all
  end

  def show
    # @article set by before_action
  end

  def new
    @article = Article.new
  end

  def create
    @article = Article.new(article_params)

    if @article.save
      redirect_to @article, notice: "Article created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @article.update(article_params)
      redirect_to @article, notice: "Article updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @article.destroy
    redirect_to articles_url, notice: "Article deleted."
  end

  private

  def set_article
    @article = Article.find(params[:id])
  end

  def article_params
    params.expect(article: [:title, :body, :status])
  end
end
```

### Key Patterns

**Strong Parameters** — Always filter params:
```ruby
params.expect(user: [:name, :email])
params.require(:user).permit(:name, :email)  # Legacy syntax
```

**Before Actions** — Run code before actions:
```ruby
before_action :require_login, except: %i[index show]
before_action :set_article, only: %i[show edit update destroy]
```

**Respond Formats**:
```ruby
respond_to do |format|
  format.html
  format.json { render json: @article }
  format.xml  { render xml: @article }
end
```

**Flash Messages**:
```ruby
redirect_to @article, notice: "Success message"
redirect_to @article, alert: "Error message"
```

For detailed controller patterns (filters, streaming, authentication), see `references/controllers.md`.

---

## Models (Active Record)

Active Record provides ORM, mapping Ruby objects to database tables.

### Basic Model
```ruby
# app/models/article.rb
class Article < ApplicationRecord
  # Associations
  belongs_to :user
  has_many :comments, dependent: :destroy
  has_and_belongs_to_many :tags

  # Validations
  validates :title, presence: true, length: { minimum: 5 }
  validates :body, presence: true
  validates :status, inclusion: { in: %w[draft published archived] }

  # Scopes
  scope :published, -> { where(status: 'published') }
  scope :recent, -> { order(created_at: :desc) }

  # Callbacks
  before_save :sanitize_content

  private

  def sanitize_content
    self.body = body.strip if body.present?
  end
end
```

### CRUD Operations
```ruby
# Create
article = Article.create(title: "Title", body: "Body")
article = Article.new(title: "Title")
article.save

# Read
Article.all
Article.first
Article.find(1)
Article.find_by(title: "Title")
Article.where(status: 'published').order(created_at: :desc)
Article.joins(:comments).where(comments: { spam: false })

# Update
article.update(title: "New Title")
article.title = "New Title"; article.save
Article.update_all(status: 'archived')  # Skip callbacks

# Delete
article.destroy
Article.destroy_all
Article.delete_all  # Skip callbacks
```

### Common Validations
```ruby
validates :email, presence: true, uniqueness: true
validates :age, numericality: { greater_than: 0 }
validates :username, format: { with: /\A[a-zA-Z0-9]+\z/ }
validates :password, length: { minimum: 8 }, confirmation: true
validates :terms, acceptance: true
validates :subdomain, exclusion: { in: %w[www admin] }
```

### Associations
```ruby
belongs_to :user                           # Foreign key in this table
has_many :comments, dependent: :destroy    # One-to-many
has_one :profile, dependent: :destroy      # One-to-one
has_many :tags, through: :taggings         # Many-to-many via join
has_and_belongs_to_many :categories        # Simple many-to-many
```

For detailed model patterns (complex associations, callbacks, validations), see `references/models.md`.

---

## Migrations

Migrations evolve your database schema over time.

### Creating Migrations
```bash
rails generate migration CreateArticles title:string body:text
rails generate migration AddUserToArticles user:references
rails generate migration AddStatusToArticles status:string
```

### Migration Structure
```ruby
class CreateArticles < ActiveRecord::Migration[8.1]
  def change
    create_table :articles do |t|
      t.string :title, null: false
      t.text :body
      t.references :user, foreign_key: true
      t.string :status, default: 'draft'

      t.timestamps
    end

    add_index :articles, :title
    add_index :articles, [:user_id, :status]
  end
end
```

### Common Column Types
```ruby
t.string :name
t.text :description
t.integer :count
t.bigint :views
t.float :rating
t.decimal :price, precision: 10, scale: 2
t.boolean :active, default: false
t.date :published_on
t.datetime :published_at
t.json :metadata
t.binary :data
t.references :user  # Adds user_id column
```

### Reversible Migrations
```ruby
def change
  add_column :articles, :views, :integer, default: 0
  # Automatically reversible
end

# For complex changes:
def up
  add_column :articles, :status, :string
  Article.update_all(status: 'draft')
end

def down
  remove_column :articles, :status
end
```

### Migration Workflow with Validation

**Step 1: Create and review**
```bash
rails generate migration AddStatusToArticles status:string
# Review the generated file in db/migrate/
```

**Step 2: Run and verify**
```bash
rails db:migrate
rails db:migrate:status     # Confirm migration ran
git diff db/schema.rb       # Verify schema changes
```

**Step 3: If something goes wrong**
```bash
rails db:rollback           # Undo last migration
# Fix the migration file
rails db:migrate            # Re-run
```

**Recovery from failed migration:**
```bash
# If migration failed partway through
rails db:migrate:status     # Identify failed migration
rails db:rollback STEP=1    # Roll back specific step
# Or manually fix data/issues, then:
rails db:migrate:redo      # Re-run the last migration
```

For detailed migration patterns (indexes, foreign keys, data migrations), see `references/migrations.md`.

---

## Routes

Routes map HTTP requests to controller actions.

### Resource Routing
```ruby
# config/routes.rb
Rails.application.routes.draw do
  # RESTful resource
  resources :articles

  # With nested resources
  resources :articles do
    resources :comments
  end

  # Only specific actions
  resources :articles, only: %i[index show]

  # Except specific actions
  resources :articles, except: %i[destroy]

  # Shallow nesting (avoids deep URLs)
  resources :articles do
    resources :comments, shallow: true
  end
end
```

### RESTful Routes Generated by `resources :articles`
| HTTP | Path | Action | Helper |
|------|------|--------|--------|
| GET | /articles | index | articles_path |
| GET | /articles/new | new | new_article_path |
| POST | /articles | create | articles_path |
| GET | /articles/:id | show | article_path(:id) |
| GET | /articles/:id/edit | edit | edit_article_path(:id) |
| PATCH/PUT | /articles/:id | update | article_path(:id) |
| DELETE | /articles/:id | destroy | article_path(:id) |

### Non-Resource Routes
```ruby
# Simple match
get 'about', to: 'pages#about'

# Root route
root 'articles#index'

# With constraints
get 'users/:id', to: 'users#show', constraints: { id: /\d+/ }

# Redirect
get '/blog', to: redirect('/articles')

# Mount engine
mount Sidekiq::Web => '/sidekiq'
```

For detailed routing patterns (namespaces, concerns, constraints), see `references/routes.md`.

---

## Active Job (Background Jobs)

Active Job handles background tasks like email sending, data processing.

### Creating Jobs
```bash
rails generate job process_image
```

### Job Structure
```ruby
# app/jobs/process_image_job.rb
class ProcessImageJob < ApplicationJob
  queue_as :default

  def perform(image_id)
    image = Image.find(image_id)
    # Process the image
  end
end
```

### Enqueuing Jobs
```ruby
# Execute async
ProcessImageJob.perform_later(image.id)

# Execute at specific time
ProcessImageJob.set(wait_until: Date.tomorrow.noon).perform_later(image.id)

# Execute after delay
ProcessImageJob.set(wait: 1.hour).perform_later(image.id)

# Execute immediately (blocks)
ProcessImageJob.perform_now(image.id)

# Bulk enqueue
jobs = users.map { |u| CleanupJob.new(u.id) }
ActiveJob.perform_all_later(jobs)
```

### Job Configuration
```ruby
class ProcessImageJob < ApplicationJob
  queue_as :high_priority
  retry_on StandardError, wait: 5.seconds, attempts: 3
  discard_on ImageNotFoundError

  def perform(image_id)
    # ...
  end
end
```

For detailed job patterns (queues, callbacks, retries), see `references/active_job.md`.

---

## API-Only Applications

Rails can serve JSON APIs without view rendering.

### Creating API Apps
```bash
rails new myapi --api
```

### API Controller
```ruby
# app/controllers/api/v1/articles_controller.rb
class Api::V1::ArticlesController < ApplicationController
  def index
    @articles = Article.all
    render json: @articles
  end

  def create
    @article = Article.new(article_params)
    if @article.save
      render json: @article, status: :created
    else
      render json: { errors: @article.errors }, status: :unprocessable_entity
    end
  end

  private

  def article_params
    params.expect(article: [:title, :body])
  end
end
```

### API Routes
```ruby
# config/routes.rb
namespace :api do
  namespace :v1 do
    resources :articles
  end
end
```

### Converting Existing App
```ruby
# config/application.rb
config.api_only = true

# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
end
```

For detailed API patterns (authentication, versioning, serialization), see `references/api.md`.

---

## Active Model

Active Model provides model-like behavior without database backing, useful for form objects, service objects, and APIs.

### Basic Usage
```ruby
# app/models/contact_form.rb
class ContactForm
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :name, :string
  attribute :email, :string
  attribute :message, :string

  validates :name, presence: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :message, length: { minimum: 10 }

  def submit
    return false unless valid?
    ContactMailer.with(form: self).contact_email.deliver_later
    true
  end
end
```

### Using in Controllers
```ruby
def create
  @form = ContactForm.new(contact_params)
  if @form.submit
    redirect_to root_path, notice: "Message sent!"
  else
    render :new, status: :unprocessable_entity
  end
end
```

For detailed Active Model patterns (callbacks, dirty tracking, serialization), see `references/active_model.md`.

---

## Action Mailer

Action Mailer sends emails from your Rails application.

### Creating Mailers
```bash
rails generate mailer UserMailer
```

### Mailer Structure
```ruby
# app/mailers/user_mailer.rb
class UserMailer < ApplicationMailer
  default from: "noreply@example.com"

  def welcome_email(user)
    @user = user
    mail(to: @user.email, subject: "Welcome to MyApp!")
  end
end
```

### Sending Email
```ruby
# Deliver immediately
UserMailer.welcome_email(@user).deliver_now

# Deliver via background job (recommended)
UserMailer.welcome_email(@user).deliver_later
```

### Mailer View
```erb
<!-- app/views/user_mailer/welcome_email.html.erb -->
<h1>Welcome, <%= @user.name %>!</h1>
<p>Thanks for joining MyApp.</p>
```

For detailed mailer patterns (attachments, layouts, previews, multiple formats), see `references/action_mailer.md`.

---

## Action Mailbox

Action Mailbox routes incoming emails to controller-like mailboxes for processing.

### Setup
```bash
rails action_mailbox:install
```

### Creating a Mailbox
```ruby
# app/mailboxes/replies_mailbox.rb
class RepliesMailbox < ApplicationMailbox
  def process
    # Access email data
    subject = mail.subject
    sender = mail.from
    body = mail.body.decoded

    # Create record from email
    Comment.create!(
      user: User.find_by(email: sender),
      body: body
    )
  end
end
```

### Routing Configuration
```ruby
# config/routes.rb
Rails.application.routes.draw do
  mount ActionMailbox::Engine => "/rails/action_mailbox"
end

# app/mailboxes/application_mailbox.rb
class ApplicationMailbox < ActionMailbox::Base
  routing /^replies\+/i => :replies
  routing all: :inbox
end
```

For detailed mailbox patterns (ingress configuration, Exim, Postfix, Sendgrid), see `references/action_mailbox.md`.

---

## Action Text

Action Text provides rich text editing and storage using the Trix editor.

### Setup
```bash
rails action_text:install
```

### Adding to Model
```ruby
# app/models/article.rb
class Article < ApplicationRecord
  has_rich_text :content
end
```

### Form Field
```erb
<!-- app/views/articles/_form.html.erb -->
<%= form_with model: @article do |form| %>
  <%= form.label :content %>
  <%= form.rich_text_area :content %>
<% end %>
```

### Displaying Content
```erb
<!-- app/views/articles/show.html.erb -->
<%= @article.content %>
```

### Attaching Images
```ruby
# Images are automatically handled via Active Storage
# Attachments embed directly in rich text
```

For detailed Action Text patterns (custom attachments, styling, embeds), see `references/action_text.md`.

---

## Active Storage

Active Storage handles file uploads with cloud storage support.

### Setup
```bash
rails active_storage:install
rails db:migrate
```

### Adding Attachments
```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_one_attached :avatar
  has_many_attached :documents
end
```

### Uploading Files
```ruby
# Direct assignment
user.avatar.attach(params[:avatar])

# From uploaded file
user.avatar.attach(io: File.open("path/to/file.jpg"), filename: "avatar.jpg")

# From URL
user.avatar.attach(url: "https://example.com/image.jpg")
```

### Displaying Files
```erb
<!-- Original -->
<%= image_tag user.avatar %>

<!-- Variant (resized) -->
<%= image_tag user.avatar.variant(resize_to_limit: [100, 100]) %>

<!-- Download link -->
<%= link_to "Download", rails_blob_path(user.document, disposition: "attachment") %>
```

For detailed Active Storage patterns (direct uploads, variants, cloud providers), see `references/active_storage.md`.

---

## Action Cable

Action Cable adds real-time WebSockets to your Rails application.

### Creating a Channel
```bash
rails generate channel Chat
```

### Server-Side Channel
```ruby
# app/channels/chat_channel.rb
class ChatChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chat_#{params[:room]}"
  end

  def speak(data)
    ActionCable.server.broadcast(
      "chat_#{params[:room]}",
      message: data["message"]
    )
  end
end
```

### Client-Side Subscription
```javascript
// app/javascript/channels/chat_channel.js
import consumer from "./consumer"

consumer.subscriptions.create(
  { channel: "ChatChannel", room: "general" },
  {
    received(data) {
      // Handle incoming broadcast
      console.log(data.message)
    }
  }
)
```

### Broadcasting from Controller/Job
```ruby
ActionCable.server.broadcast("chat_general", { message: "Hello!" })
```

For detailed Action Cable patterns (authentication, deployment, Redis), see `references/action_cable.md`.

---

## Internationalization (I18n)

Rails I18n provides translations and localization for multiple languages.

### Translation Files
```yaml
# config/locales/en.yml
en:
  hello: "Hello world"
  users:
    welcome: "Welcome, %{name}!"
```

### Using Translations
```erb
<%= t("hello") %>
<%= t("users.welcome", name: @user.name) %>
```

### Setting Locale
```ruby
# app/controllers/application_controller.rb
around_action :switch_locale

def switch_locale(&action)
  I18n.with_locale(locale_from_params, &action)
end

def locale_from_params
  params[:locale] || I18n.default_locale
end
```

### Localizing Dates/Numbers
```erb
<%= l(Date.today, format: :long) %>
<%= number_to_currency(1234.56) %>
```

For detailed I18n patterns (pluralization, model translations, date formats), see `references/i18n.md`.

---

## Configuration

Rails configuration spans application settings, database, security, and environment-specific options.

### Application Configuration
```ruby
# config/application.rb
module MyApp
  class Application < Rails::Application
    config.time_zone = "Central Time (US & Canada)"
    config.i18n.default_locale = :en
    config.autoload_paths << Rails.root.join("lib")
  end
end
```

### Environment-Specific
```ruby
# config/environments/production.rb
Rails.application.configure do
  config.cache_classes = true
  config.eager_load = true
  config.force_ssl = true
  config.log_level = :info
end
```

### Database Configuration
```yaml
# config/database.yml
production:
  adapter: postgresql
  url: <%= ENV["DATABASE_URL"] %>
  pool: 5
```

### Credentials
```bash
rails credentials:edit
```

```ruby
# Access credentials
Rails.application.credentials.secret_key_base
Rails.application.credentials.aws[:access_key_id]
```

For detailed configuration patterns (security, middleware, multiple databases), see `references/configuring.md`.

---

## Reference Files

For deep dives into specific topics, read these files:

### Core Components
- `references/controllers.md` — Filters, streaming, strong parameters, authentication
- `references/models.md` — Associations, callbacks, validations, querying
- `references/migrations.md` — Indexes, foreign keys, data migrations, rollback
- `references/routes.md` — Namespaces, concerns, constraints, mounting
- `references/active_job.md` — Queues, retries, callbacks, Solid Queue
- `references/api.md` — Versioning, serialization, JWT, CORS

### Additional Components
- `references/active_model.md` — Active Model API, validations, callbacks, dirty tracking
- `references/action_mailer.md` — Creating mailers, views, sending email, attachments
- `references/action_mailbox.md` — Routing incoming email, ingress configuration
- `references/action_text.md` — Rich text content, Trix editor, attachments
- `references/active_storage.md` — File uploads, variants, direct uploads, cloud storage
- `references/action_cable.md` — WebSockets, channels, broadcasting, real-time features
- `references/i18n.md` — Internationalization, translations, pluralization, locale management
- `references/configuring.md` — Application, database, security, environment-specific config

---

## Official Documentation

- Rails Guides: https://guides.rubyonrails.org/
- API Docs: https://api.rubyonrails.org/
- Ruby on Rails: https://rubyonrails.org/
