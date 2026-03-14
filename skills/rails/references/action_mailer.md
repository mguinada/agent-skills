# Rails Action Mailer Reference

Action Mailer handles sending emails from Rails applications.

## Table of Contents
- [Creating Mailers](#creating-mailers)
- [Mailer Actions](#mailer-actions)
- [Views and Layouts](#views-and-layouts)
- [Sending Email](#sending-email)
- [Attachments](#attachments)
- [Callbacks](#callbacks)
- [Configuration](#configuration)
- [Testing](#testing)

---

## Creating Mailers

### Generate Mailer
```bash
rails generate mailer UserMailer welcome_email
```

### Mailer Structure
```ruby
# app/mailers/application_mailer.rb
class ApplicationMailer < ActionMailer::Base
  default from: "noreply@example.com"
  layout "mailer"
end

# app/mailers/user_mailer.rb
class UserMailer < ApplicationMailer
  def welcome_email
    @user = params[:user]
    @url = "https://example.com/login"
    mail(to: @user.email, subject: "Welcome!")
  end
end
```

---

## Mailer Actions

### Basic Action
```ruby
class UserMailer < ApplicationMailer
  default from: "notifications@example.com"

  def welcome_email
    @user = params[:user]
    mail(to: @user.email, subject: "Welcome!")
  end

  def account_activation(user)
    @user = user
    @activation_link = edit_account_activation_url(@user.activation_token)
    mail(to: @user.email, subject: "Activate your account")
  end
end
```

### Multiple Recipients
```ruby
def newsletter
  @subscribers = Subscriber.all
  mail(
    to: @subscribers.pluck(:email),
    subject: "Weekly Newsletter"
  )
end

# Or with CC/BCC
def announcement
  mail(
    to: "team@example.com",
    cc: "managers@example.com",
    bcc: "archive@example.com",
    subject: "Important Update"
  )
end
```

### With Name
```ruby
def welcome_email
  mail(
    to: email_address_with_name(@user.email, @user.name),
    from: email_address_with_name("noreply@example.com", "My App"),
    subject: "Welcome!"
  )
end
```

---

## Views and Layouts

### Mailer Views
```
app/views/user_mailer/
├── welcome_email.html.erb
├── welcome_email.text.erb
└── layout/
    └── mailer.html.erb
```

### HTML View
```erb
<!-- app/views/user_mailer/welcome_email.html.erb -->
<h1>Welcome, <%= @user.name %>!</h1>

<p>
  Thanks for signing up! Click below to get started:
</p>

<p>
  <%= link_to "Log in", @url %>
</p>

<p>Thanks!</p>
```

### Text View
```erb
<!-- app/views/user_mailer/welcome_email.text.erb -->
Welcome, <%= @user.name %>!

Thanks for signing up! Visit the link below to get started:

<%= @url %>

Thanks!
```

### Layout
```erb
<!-- app/views/layouts/mailer.html.erb -->
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <style>
      body { font-family: sans-serif; }
    </style>
  </head>
  <body>
    <%= yield %>
  </body>
</html>
```

### Custom View Path
```ruby
def welcome_email
  mail(
    to: @user.email,
    template_path: "notifications",  # app/views/notifications/
    template_name: "hello"            # hello.html.erb
  )
end
```

### Inline Rendering
```ruby
def welcome_email
  mail(to: @user.email, subject: "Welcome") do |format|
    format.html { render plain: "Hello!" }
    format.text { render plain: "Hello!" }
  end
end

# Without template
def simple_email
  mail(
    to: @user.email,
    body: "Plain text body",
    content_type: "text/html",
    subject: "Simple"
  )
end
```

---

## Sending Email

### deliver_later (Recommended)
```ruby
# Enqueues email for background sending via Active Job
UserMailer.with(user: @user).welcome_email.deliver_later

# With wait time
UserMailer.with(user: @user).welcome_email.deliver_later(wait: 1.hour)

# With queue
UserMailer.with(user: @user).welcome_email.deliver_later(queue: "mailers")
```

### deliver_now
```ruby
# Sends immediately (blocks)
UserMailer.with(user: @user).welcome_email.deliver_now
```

### In Controller
```ruby
class UsersController < ApplicationController
  def create
    @user = User.new(user_params)

    if @user.save
      UserMailer.with(user: @user).welcome_email.deliver_later
      redirect_to @user, notice: "Account created!"
    else
      render :new, status: :unprocessable_entity
    end
  end
end
```

### From Console
```ruby
UserMailer.with(user: User.first).welcome_email.deliver_now
```

---

## Attachments

### Regular Attachments
```ruby
def invoice_email
  @order = params[:order]

  attachments["invoice.pdf"] = File.read("/path/to/invoice.pdf")

  mail(to: @order.user.email, subject: "Your Invoice")
end
```

### With MIME Type
```ruby
def document_email
  attachments["report.pdf"] = {
    mime_type: "application/pdf",
    content: File.read("/path/to/report.pdf")
  }

  mail(to: params[:user].email, subject: "Report")
end
```

### Inline Images
```ruby
def welcome_email
  @user = params[:user]
  attachments.inline["logo.png"] = File.read("/path/to/logo.png")

  mail(to: @user.email, subject: "Welcome!")
end
```

```erb
<!-- In view -->
<%= image_tag attachments['logo.png'].url %>
```

---

## Callbacks

### Action Callbacks
```ruby
class UserMailer < ApplicationMailer
  before_action :set_user
  after_action :log_delivery

  def welcome_email
    mail(to: @user.email, subject: "Welcome!")
  end

  private

  def set_user
    @user = params[:user]
  end

  def log_delivery
    Rails.logger.info "Email sent to #{@user.email}"
  end
end
```

### Delivery Callbacks
```ruby
class UserMailer < ApplicationMailer
  after_deliver :record_delivery

  def welcome_email
    @user = params[:user]
    mail(to: @user.email, subject: "Welcome!")
  end

  private

  def record_delivery
    EmailLog.create!(
      user: @user,
      mailer: self.class.name,
      action: action_name,
      sent_at: Time.current
    )
  end
end
```

### Available Callbacks
```ruby
before_action   # Before rendering
after_action    # After rendering
around_action   # Around rendering
before_deliver  # Before delivery
after_deliver   # After delivery
around_deliver  # Around delivery
```

---

## Configuration

### SMTP Configuration
```ruby
# config/environments/production.rb
config.action_mailer.delivery_method = :smtp
config.action_mailer.smtp_settings = {
  address: "smtp.gmail.com",
  port: 587,
  domain: "example.com",
  user_name: Rails.application.credentials.smtp[:username],
  password: Rails.application.credentials.smtp[:password],
  authentication: "plain",
  enable_starttls: true,
  open_timeout: 5,
  read_timeout: 5
}
```

### Default Options
```ruby
# config/environments/production.rb
config.action_mailer.default_options = {
  from: "noreply@example.com",
  reply_to: "support@example.com"
}

config.action_mailer.default_url_options = { host: "example.com" }
```

### Sendmail
```ruby
config.action_mailer.delivery_method = :sendmail
config.action_mailer.sendmail_settings = {
  location: "/usr/sbin/sendmail",
  arguments: ["-i"]
}
```

### Test Mode
```ruby
# config/environments/test.rb
config.action_mailer.delivery_method = :test
```

---

## Generating URLs

### URL Helpers in Mailers
```ruby
# Must use *_url helpers (not *_path) since no request context
class UserMailer < ApplicationMailer
  def welcome_email
    @user = params[:user]
    @login_url = login_url   # Full URL required
    @profile_url = profile_url(@user)

    mail(to: @user.email, subject: "Welcome!")
  end
end
```

### Configure Default Host
```ruby
# config/application.rb
config.action_mailer.default_url_options = { host: "example.com", protocol: "https" }
```

### Named Routes in Views
```erb
<%= link_to "Activate", edit_account_activation_url(@user.activation_token) %>
<%= link_to "Profile", user_url(@user) %>
```

---

## Interceptors and Observers

### Interceptor (Modify before sending)
```ruby
# app/interceptors/sandbox_email_interceptor.rb
class SandboxEmailInterceptor
  def self.delivering_email(message)
    message.to = ["sandbox@example.com"]
  end
end

# config/initializers/mail_interceptors.rb
if Rails.env.staging?
  Rails.application.configure do
    config.action_mailer.interceptors = %w[SandboxEmailInterceptor]
  end
end
```

### Observer (After sending)
```ruby
# app/observers/email_delivery_observer.rb
class EmailDeliveryObserver
  def self.delivered_email(message)
    EmailLog.create!(
      to: message.to,
      subject: message.subject,
      sent_at: Time.current
    )
  end
end

# config/initializers/mail_observers.rb
Rails.application.configure do
  config.action_mailer.observers = %w[EmailDeliveryObserver]
end
```

---

## Testing

### Test Case
```ruby
class UserMailerTest < ActionMailer::TestCase
  test "welcome_email" do
    user = users(:one)

    email = UserMailer.with(user: user).welcome_email

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal [user.email], email.to
    assert_equal "Welcome!", email.subject
  end
end
```

### Preview
```ruby
# test/mailers/previews/user_mailer_preview.rb
class UserMailerPreview < ActionMailer::Preview
  def welcome_email
    UserMailer.with(user: User.first).welcome_email
  end
end
```

Visit: `http://localhost:3000/rails/mailers/user_mailer/welcome_email`

---

## Best Practices

1. **Use deliver_later** - Always enqueue emails for background delivery
2. **Use _url helpers** - Full URLs required in emails (no request context)
3. **Send multipart** - Include both HTML and text versions
4. **Configure host** - Set default_url_options for link generation
5. **Test previews** - Use mailer previews for visual testing
6. **Handle attachments carefully** - Consider file size limits
7. **Use interceptors** - Redirect emails in staging/sandbox
