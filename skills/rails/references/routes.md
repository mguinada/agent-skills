# Rails Routes Reference

Detailed patterns for Rails routing.

## Table of Contents
- [Resource Routing](#resource-routing)
- [Nested Resources](#nested-resources)
- [Namespaces](#namespaces)
- [Non-Resource Routes](#non-resource-routes)
- [Constraints](#constraints)
- [Route Concerns](#route-concerns)
- [Path Helpers](#path-helpers)
- [Redirection](#redirection)
- [Rack Mounting](#rack-mounting)

---

## Resource Routing

### Basic Resources
```ruby
# config/routes.rb
Rails.application.routes.draw do
  resources :articles
end

# Creates 7 routes:
# GET    /articles          articles#index
# GET    /articles/new      articles#new
# POST   /articles          articles#create
# GET    /articles/:id      articles#show
# GET    /articles/:id/edit articles#edit
# PATCH  /articles/:id      articles#update
# DELETE /articles/:id      articles#destroy
```

### Singular Resources
```ruby
# For resources without ID (profile, settings)
resource :profile
# Only creates: show, new, create, edit, update, destroy (no index)
# No :id in URLs
```

### Limiting Actions
```ruby
resources :articles, only: %i[index show]
resources :articles, except: %i[destroy]
resources :comments, only: %i[create destroy]
```

### Custom Actions
```ruby
resources :articles do
  member do
    get :preview      # GET /articles/:id/preview
    post :publish     # POST /articles/:id/publish
  end

  collection do
    get :search       # GET /articles/search
    get :export       # GET /articles/export
  end
end
```

---

## Nested Resources

### Basic Nesting
```ruby
resources :articles do
  resources :comments
end

# Creates routes like:
# GET /articles/:article_id/comments
# GET /articles/:article_id/comments/:id
```

### Shallow Nesting
Avoids deep URL nesting while maintaining relationship.

```ruby
resources :articles do
  resources :comments, shallow: true
end

# Creates:
# POST   /articles/:article_id/comments     comments#create
# GET    /comments/:id                      comments#show
# DELETE /comments/:id                      comments#destroy

# Alternative syntax:
shallow do
  resources :articles do
    resources :comments
  end
end
```

### Deep Nesting (Avoid)
```ruby
# Avoid more than 1 level of nesting
resources :articles do
  resources :comments do
    resources :replies  # Too deep!
  end
end
```

---

## Namespaces

### Controller Namespacing
```ruby
namespace :admin do
  resources :articles
  resources :users
end

# Routes to Admin::ArticlesController
# URLs: /admin/articles
```

### Path Without Module
```ruby
# URLs like /admin/articles but controllers not namespaced
scope '/admin' do
  resources :articles
end
```

### Module Without Path Prefix
```ruby
# Controllers namespaced but URLs not
scope module: 'admin' do
  resources :articles
end
# Admin::ArticlesController handles /articles
```

### API Versioning
```ruby
namespace :api do
  namespace :v1 do
    resources :articles
  end

  namespace :v2 do
    resources :articles
  end
end

# /api/v1/articles -> Api::V1::ArticlesController
# /api/v2/articles -> Api::V2::ArticlesController
```

---

## Non-Resource Routes

### Basic Matching
```ruby
get 'about', to: 'pages#about'
get 'contact', to: 'pages#contact'
post 'search', to: 'search#index'
```

### Root Route
```ruby
root 'articles#index'
root to: 'articles#index'

# Only one root route allowed
# Place at top of routes.rb
```

### Dynamic Segments
```ruby
get 'users/:id', to: 'users#show'
get 'posts/:year/:month', to: 'posts#archive'

# In controller:
params[:id]
params[:year]
params[:month]
```

### Optional Segments
```ruby
get 'books(/:category)', to: 'books#index'
# Matches /books and /books/fiction
```

### Wildcard Segments
```ruby
# Globbing (matches multiple segments)
get 'pages/*path', to: 'pages#show'
# /pages/foo/bar/baz -> params[:path] = "foo/bar/baz"

# With format
get 'files/*path', to: 'files#show', format: false
```

---

## Constraints

### Regular Expressions
```ruby
get 'users/:id', to: 'users#show', constraints: { id: /\d+/ }
get 'posts/:slug', to: 'posts#show', constraints: { slug: /[a-z-]+/ }
```

### Advanced Constraints
```ruby
# Constraint class
class ApiConstraint
  def initialize(version:)
    @version = version
  end

  def matches?(request)
    request.headers['Accept']&.include?("version=#{@version}")
  end
end

# Usage
constraints(ApiConstraint.new(version: 1)) do
  resources :articles
end
```

### Subdomain Constraints
```ruby
constraints subdomain: 'api' do
  resources :articles
end

constraints subdomain: 'admin' do
  resources :dashboard
end

# Dynamic subdomain
constraints subdomain: %r{^[a-z]+} do
  resources :tenants
end
```

### IP Constraints
```ruby
constraints ip: '192.168.1.0/24' do
  resources :admin
end

constraints ip: /192\.168\..*/ do
  resources :internal
end
```

### Request-Based Constraints
```ruby
constraints(lambda { |req| req.env['HTTP_X_CUSTOM_HEADER'] }) do
  resources :special
end

constraints(lambda { |req| req.session[:admin] }) do
  resources :admin
end
```

---

## Route Concerns

Share common routes between resources.

```ruby
concern :commentable do
  resources :comments, only: %i[index create]
end

concern :image_attachable do
  resources :images, only: %i[index create]
end

resources :articles, concerns: %i[commentable image_attachable]
resources :posts, concerns: :commentable

# Same as:
resources :articles do
  resources :comments, only: %i[index create]
  resources :images, only: %i[index create]
end
```

---

## Path Helpers

### Named Route Helpers
```ruby
resources :articles

# Helpers generated:
articles_path              # /articles
articles_url               # http://example.com/articles
new_article_path           # /articles/new
edit_article_path(@article) # /articles/1/edit
article_path(@article)     # /articles/1
article_url(@article)      # http://example.com/articles/1

# With options:
article_path(@article, anchor: 'comments')
article_path(@article, format: :json)
articles_path(status: 'published')
```

### Custom Named Routes
```ruby
get 'about', to: 'pages#about', as: :about

about_path  # /about
about_url   # http://example.com/about
```

### Path/URL Difference
```ruby
# Path: Relative URL
articles_path   # /articles

# URL: Absolute URL
articles_url    # http://example.com/articles

# URL uses config.default_url_options
```

### Polymorphic Routes
```ruby
# Works with any model
polymorphic_path(@article)        # /articles/1
polymorphic_path([:admin, @user]) # /admin/users/1
polymorphic_url(@article)         # http://example.com/articles/1
```

---

## Redirection

### Simple Redirect
```ruby
get '/blog', to: redirect('/articles')
get '/old-path', to: redirect('https://example.com/new-path')
```

### Dynamic Redirect
```ruby
get '/users/:name', to: redirect { |params, request|
  "/profiles/#{params[:name].downcase}"
}
```

### Status Code
```ruby
get '/blog', to: redirect('/articles'), status: 301
```

---

## Rack Mounting

### Mounting Engines
```ruby
Rails.application.routes.draw do
  mount Sidekiq::Web => '/sidekiq'
  mount GrapeSwaggerRails::Engine => '/swagger'
  mount Blazer::Engine => '/blazer'
end
```

### Mount with Constraints
```ruby
constraints(lambda { |req| req.env['warden'].user&.admin? }) do
  mount Sidekiq::Web => '/sidekiq'
end
```

---

## Route Helpers in Console

```ruby
# In rails console:
app.articles_path
app.article_path(1)
app.get app.articles_path

# Include helpers:
include Rails.application.routes.url_helpers
articles_path
```

---

## Inspecting Routes

```bash
# List all routes
rails routes

# Filter by controller
rails routes -c articles

# Filter by path
rails routes -g users

# Expanded format
rails routes -E

# grep for specific pattern
rails routes | grep articles
```

---

## Best Practices

1. **Use resource routing** — More conventions, less code
2. **Avoid deep nesting** — Max 1 level, use shallow
3. **Use path helpers** — Don't hardcode paths
4. **Namespace for organization** — Admin, API, etc.
5. **Version APIs** — Namespace by version number
6. **Use constraints** — For security and routing logic
7. **Document with comments** — Complex routes need explanation
