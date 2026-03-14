---
name: rails
description: Ruby on Rails framework development. Use when: building Rails applications, working with controllers, models, migrations, routes, Active Job, Active Record, validations, associations, or API-only apps. Triggers on: Rails generators, scaffold, migrate, ActiveRecord queries, controller actions, routing config, background jobs, or any Rails-specific development task.
author: mguinada
version: 1.0.0
tags: [rails, ruby, web, mvc, activerecord, api]
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

## Reference Files

For deep dives into specific topics, read these files:

- `references/controllers.md` — Filters, streaming, strong parameters, authentication
- `references/models.md` — Associations, callbacks, validations, querying
- `references/migrations.md` — Indexes, foreign keys, data migrations, rollback
- `references/routes.md` — Namespaces, concerns, constraints, mounting
- `references/active_job.md` — Queues, retries, callbacks, Solid Queue
- `references/api.md` — Versioning, serialization, JWT, CORS

---

## Official Documentation

- Rails Guides: https://guides.rubyonrails.org/
- API Docs: https://api.rubyonrails.org/
- Ruby on Rails: https://rubyonrails.org/
