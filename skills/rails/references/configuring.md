# Rails Configuration Reference

Comprehensive guide to configuring Rails applications.

## Table of Contents
- [Application Configuration](#application-configuration)
- [Database Configuration](#database-configuration)
- [Asset Configuration](#asset-configuration)
- [Action Controller](#action-controller)
- [Action Mailer](#action-mailer)
- [Active Record](#active-record)
- [Active Storage](#active-storage)
- [Action Cable](#action-cable)
- [Security Configuration](#security-configuration)
- [Environment-Specific Config](#environment-specific-config)

---

## Application Configuration

### config/application.rb
```ruby
module MyApp
  class Application < Rails::Application
    # Initialize configuration defaults
    config.load_defaults 8.0

    # Time zone
    config.time_zone = "Central Time (US & Canada)"

    # Default locale
    config.i18n.default_locale = :en
    config.i18n.available_locales = [:en, :es, :fr]

    # Autoload paths
    config.autoload_paths << Rails.root.join("lib")

    # Eager load paths
    config.eager_load_paths << Rails.root.join("app/services")

    # Generators
    config.generators do |g|
      g.orm :active_record
      g.test_framework :test_unit
      g.stylesheets false
      g.javascripts false
      g.helper false
    end

    # Logger
    config.log_level = :info
    config.log_tags = [:request_id]

    # Middlewares
    config.middleware.use MyCustomMiddleware
    config.middleware.delete Rack::Runtime
  end
end
```

---

## Database Configuration

### config/database.yml
```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  timeout: 5000

development:
  <<: *default
  database: myapp_development

test:
  <<: *default
  database: myapp_test

production:
  <<: *default
  url: <%= ENV["DATABASE_URL"] %>
  pool: <%= ENV.fetch("RAILS_DB_POOL") { 5 } %>
  prepared_statements: false
```

### SQLite Configuration
```yaml
default: &default
  adapter: sqlite3
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  timeout: 5000
```

### MySQL Configuration
```yaml
production:
  adapter: mysql2
  encoding: utf8mb4
  collation: utf8mb4_unicode_ci
  database: myapp_production
  username: myapp
  password: <%= ENV["MYSQL_PASSWORD"] %>
  host: <%= ENV["MYSQL_HOST"] %>
  port: 3306
```

### Multiple Databases
```yaml
development:
  primary:
    <<: *default
    database: myapp_development
  replica:
    <<: *default
    database: myapp_development_replica
    replica: true
```

```ruby
# app/models/application_record.rb
class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
  connects_to database: { writing: :primary, reading: :replica }
end
```

---

## Asset Configuration

### CSS and JavaScript
```ruby
# config/environments/production.rb
config.assets.compile = false
config.assets.digest = true
config.assets.version = "1.0"

# Asset host
config.asset_host = "https://assets.example.com"
```

### Propshaft (Default in Rails 8)
```ruby
# Gemfile
gem "propshaft"

# config/initializers/assets.rb
Rails.application.config.assets.paths << Rails.root.join("app/assets/fonts")
```

### Importmap
```ruby
# config/importmap.rb
pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin_all_from "app/javascript/controllers", under: "controllers"
```

### Sprockets (Legacy)
```ruby
# config/initializers/assets.rb
Rails.application.config.assets.precompile += %w[admin.css admin.js]
Rails.application.config.assets.paths << Rails.root.join("node_modules")
```

---

## Action Controller

### Basic Configuration
```ruby
# config/environments/production.rb
config.action_controller.perform_caching = true
config.action_controller.cache_store = :mem_cache_store
config.action_controller.default_url_options = { host: "example.com" }
```

### Strong Parameters
```ruby
# config/initializers/action_controller.rb
ActionController::Parameters.permit_all_parameters = false
ActionController::Parameters.action_on_unpermitted_parameters = :raise
```

### Asset Host
```ruby
config.action_controller.asset_host = "https://assets.example.com"
```

### Allow Browser
```ruby
# config/initializers/allow_browser.rb
Rails.application.config.action_controller.allow_browser_versions = {
  chrome: 90,
  firefox: 85,
  safari: 14,
  ie: false
}
```

---

## Action Mailer

### Basic Configuration
```ruby
# config/environments/production.rb
config.action_mailer.default_url_options = { host: "example.com" }
config.action_mailer.delivery_method = :smtp
config.action_mailer.perform_deliveries = true
config.action_mailer.raise_delivery_errors = true
config.action_mailer.default_options = {
  from: "noreply@example.com"
}
```

### SMTP Configuration
```ruby
config.action_mailer.smtp_settings = {
  address: "smtp.gmail.com",
  port: 587,
  domain: "example.com",
  user_name: Rails.application.credentials.smtp[:username],
  password: Rails.application.credentials.smtp[:password],
  authentication: "plain",
  enable_starttls: true
}
```

### Sendmail Configuration
```ruby
config.action_mailer.delivery_method = :sendmail
config.action_mailer.sendmail_settings = {
  location: "/usr/sbin/sendmail",
  arguments: ["-i"]
}
```

### Preview Paths
```ruby
config.action_mailer.preview_path = Rails.root.join("test/mailers/previews")
```

---

## Active Record

### Query Logging
```ruby
# config/environments/development.rb
config.active_record.verbose_query_logs = true
config.active_record.query_log_tags = [:controller, :action, :job]
```

### Migration Settings
```ruby
# config/application.rb
config.active_record.timestamped_migrations = true
config.active_record.dump_schema_after_migration = true
```

### Schema Format
```ruby
# config/application.rb
config.active_record.schema_format = :ruby  # or :sql
```

### Pluralization Table Names
```ruby
ActiveRecord::Base.pluralize_table_names = true
```

### Default Timezone
```ruby
config.active_record.default_timezone = :utc
config.active_record.time_zone_aware_attributes = true
```

### Encryption
```ruby
# config/initializers/active_record_encryption.rb
Rails.application.config.active_record.encryption = {
  primary_key: Rails.application.credentials.active_record_encryption[:primary_key],
  deterministic_key: Rails.application.credentials.active_record_encryption[:deterministic_key],
  key_derivation_salt: Rails.application.credentials.active_record_encryption[:key_derivation_salt]
}
```

---

## Active Storage

### Service Configuration
```ruby
# config/environments/production.rb
config.active_storage.service = :amazon
config.active_storage.variant_processor = :vips
config.active_storage.content_types_to_serve_as_binary -= ["image/svg+xml"]
```

### Purge Attachments
```ruby
config.active_storage.service_urls_expire_in = 5.minutes
config.active_storage.track_variants = true
```

---

## Action Cable

### Basic Configuration
```ruby
# config/environments/production.rb
config.action_cable.mount_path = "/cable"
config.action_cable.allowed_request_origins = ["https://example.com"]
config.action_cable.worker_pool_size = 4
config.action_cable.disable_request_forgery_protection = false
```

### Standalone Configuration
```ruby
config.action_cable.mount_path = nil
config.action_cable.url = "wss://cable.example.com"
```

---

## Security Configuration

### Credentials
```bash
# Edit credentials
rails credentials:edit
rails credentials:edit --environment production
```

```ruby
# Access credentials
Rails.application.credentials.secret_key_base
Rails.application.credentials.aws[:access_key_id]
```

### Secret Key Base
```ruby
# config/secrets.yml (legacy)
# or use credentials (recommended)
config.secret_key_base = Rails.application.credentials.secret_key_base
```

### Force SSL
```ruby
# config/environments/production.rb
config.force_ssl = true
config.ssl_options = {
  hsts: { subdomains: true, preload: true, expires: 1.year }
}
```

### Content Security Policy
```ruby
# config/initializers/content_security_policy.rb
Rails.application.config.content_security_policy do |policy|
  policy.default_src :self
  policy.font_src    :self, "https://fonts.gstatic.com"
  policy.img_src     :self, "https:", "data:"
  policy.object_src  :none
  policy.script_src  :self
  policy.style_src   :self, "https://fonts.googleapis.com"
  policy.connect_src :self, "wss://example.com/cable"
end
```

### Permissions Policy
```ruby
# config/initializers/permissions_policy.rb
Rails.application.config.permissions_policy do |policy|
  policy.camera      :none
  policy.gyroscope   :none
  policy.microphone  :none
  policy.geolocation :self
end
```

### Filter Parameters
```ruby
# config/initializers/filter_parameter_logging.rb
Rails.application.config.filter_parameters += [
  :password,
  :password_confirmation,
  :token,
  :secret,
  /credit_card/
]
```

---

## Environment-Specific Config

### Development
```ruby
# config/environments/development.rb
Rails.application.configure do
  config.cache_classes = false
  config.eager_load = false
  config.consider_all_requests_local = true
  config.server_timing = true
  config.action_controller.perform_caching = false
  config.active_storage.service = :local
  config.action_mailer.raise_delivery_errors = false
  config.active_support.deprecation = :log
  config.active_record.migration_error = :page_load
  config.assets.debug = true
  config.assets.raise_runtime_errors = true
end
```

### Test
```ruby
# config/environments/test.rb
Rails.application.configure do
  config.cache_classes = true
  config.eager_load = false
  config.public_file_server.enabled = true
  config.public_file_server.headers = { "Cache-Control" => "public, max-age=3600" }
  config.consider_all_requests_local = true
  config.action_controller.perform_caching = false
  config.action_dispatch.show_exceptions = :rescuable
  config.action_controller.allow_forgery_protection = false
  config.active_storage.service = :test
  config.action_mailer.delivery_method = :test
  config.active_support.deprecation = :stderr
end
```

### Production
```ruby
# config/environments/production.rb
Rails.application.configure do
  config.cache_classes = true
  config.eager_load = true
  config.consider_all_requests_local = false
  config.action_controller.perform_caching = true
  config.public_file_server.enabled = ENV["RAILS_SERVE_STATIC_FILES"].present?
  config.assets.compile = false
  config.log_level = :info
  config.log_tags = [:request_id]
  config.action_mailer.perform_caching = false
  config.active_support.deprecation = :notify
  config.log_formatter = ::Logger::Formatter.new
  config.active_record.dump_schema_after_migration = false
end
```

---

## Custom Configuration

### Application Configuration
```ruby
# config/application.rb
module MyApp
  class Application < Rails::Application
    config.x.payment_gateway = :stripe
    config.x.support_email = "support@example.com"
  end
end

# Access anywhere
Rails.configuration.x.payment_gateway
Rails.configuration.x.support_email
```

### Initializers
```ruby
# config/initializers/my_gem.rb
MyGem.configure do |config|
  config.api_key = Rails.application.credentials.my_gem[:api_key]
  config.timeout = 30
end
```

---

## Debugging Configuration

### View Current Config
```ruby
# In console
Rails.application.config
Rails.configuration.time_zone
ActiveRecord::Base.configurations

# List middlewares
Rails.application.middleware
```

### Check Environment
```ruby
Rails.env.development?
Rails.env.production?
Rails.env.test?
```
