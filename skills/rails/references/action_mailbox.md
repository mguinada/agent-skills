# Rails Action Mailbox Reference

Action Mailbox routes incoming emails to controller-like mailboxes for processing.

## Table of Contents
- [Setup](#setup)
- [Routing](#routing)
- [Creating Mailboxes](#creating-mailboxes)
- [Processing Email](#processing-email)
- [Ingress Configuration](#ingress-configuration)
- [Testing](#testing)

---

## Setup

### Installation
```bash
rails action_mailbox:install
rails db:migrate
```

This creates:
- `app/mailboxes/application_mailbox.rb`
- `action_mailbox_inbound_emails` table

### Conductor (Development)
Visit `/rails/conductor/action_mailbox/inbound_emails` to test incoming emails locally.

---

## Routing

### Basic Routing
```ruby
# app/mailboxes/application_mailbox.rb
class ApplicationMailbox < ActionMailbox::Base
  routing(/^support@/i     => :support)
  routing(/^replies@/i     => :replies)
  routing(/@example\.com/i => :default)
end
```

### Routing Patterns
```ruby
# Regular expressions
routing(/^help@/i => :help)

# String matching
routing("support@example.com" => :support)

# All incoming
routing(all: true) => :catch_all
```

---

## Creating Mailboxes

### Generate Mailbox
```bash
rails generate mailbox support
```

### Mailbox Structure
```ruby
# app/mailboxes/support_mailbox.rb
class SupportMailbox < ApplicationMailbox
  before_processing :require_sender

  def process
    ticket = Ticket.create!(
      subject: mail.subject,
      content: mail.decoded,
      sender: mail.from.first,
      status: "open"
    )

    SupportMailer.confirmation(ticket).deliver_later
  end

  private

  def require_sender
    if mail.from.blank?
      bounce_with SupportMailer.missing_sender
    end
  end
end
```

---

## Processing Email

### Accessing Email Content
```ruby
def process
  # Basic fields
  mail.to          # => ["support@example.com"]
  mail.from        # => ["user@example.com"]
  mail.cc          # => ["manager@example.com"]
  mail.subject     # => "Help needed"
  mail.date        # => Wed, 01 Jan 2024 12:00:00 -0600

  # Body content
  mail.decoded     # => "Plain text body"
  mail.body.decoded # => Same as above

  # Raw source
  mail.source      # => Raw email source

  # Attachments
  mail.attachments.each do |attachment|
    # Process each attachment
  end
end
```

### Handling Multipart
```ruby
def process
  if mail.multipart?
    text_part = mail.text_part
    html_part = mail.html_part

    # Use text version for storage
    content = text_part&.decoded || mail.decoded
  else
    content = mail.decoded
  end
end
```

### Bouncing Emails
```ruby
class SupportMailbox < ApplicationMailbox
  before_processing :verify_sender

  private

  def verify_sender
    unless valid_sender?
      bounce_with SupportMailer.invalid_sender(mail)
    end
  end

  def valid_sender?
    User.exists?(email: mail.from)
  end
end
```

### Status Tracking
InboundEmail status values:
- `pending` - Received, waiting to be routed
- `processing` - Being processed by mailbox
- `delivered` - Successfully processed
- `failed` - Exception during processing
- `bounced` - Rejected by mailbox

---

## Ingress Configuration

### SendGrid
```ruby
# config/environments/production.rb
config.action_mailbox.ingress = :sendgrid
```

```bash
# Configure SendGrid Inbound Parse:
# URL: https://actionmailbox:PASSWORD@example.com/rails/action_mailbox/sendgrid/inbound_emails
# Check: "Post the raw, full MIME message"
```

### Postmark
```ruby
# config/environments/production.rb
config.action_mailbox.ingress = :postmark
```

```bash
# Configure Postmark inbound webhook:
# URL: https://actionmailbox:PASSWORD@example.com/rails/action_mailbox/postmark/inbound_emails
# Check: "Include raw email content in JSON payload"
```

### Mailgun
```ruby
# config/environments/production.rb
config.action_mailbox.ingress = :mailgun

# Add signing key to credentials
# action_mailbox.mailgun_signing_key: YOUR_KEY
```

```bash
# Configure Mailgun route:
# Forward to: https://example.com/rails/action_mailbox/mailgun/inbound_emails/mime
```

### Mandrill
```ruby
# config/environments/production.rb
config.action_mailbox.ingress = :mandrill

# Add API key to credentials
# action_mailbox.mandrill_api_key: YOUR_KEY
```

### Relay (Postfix, Exim, Qmail)
```ruby
# config/environments/production.rb
config.action_mailbox.ingress = :relay

# Add ingress password to credentials
# action_mailbox.ingress_password: YOUR_PASSWORD
```

```bash
# Postfix configuration
bin/rails action_mailbox:ingress:postfix \
  URL=https://example.com/rails/action_mailbox/relay/inbound_emails \
  INGRESS_PASSWORD=...
```

---

## Full Example

```ruby
# app/mailboxes/application_mailbox.rb
class ApplicationMailbox < ActionMailbox::Base
  routing(/^support@/i     => :support)
  routing(/^replies@/i     => :replies)
  routing(/^bounces@/i     => :bounces)
end

# app/mailboxes/support_mailbox.rb
class SupportMailbox < ApplicationMailbox
  before_processing :identify_sender
  before_processing :ensure_active_account

  def process
    create_support_ticket

    process_attachments

    send_confirmation_email
  end

  private

  def identify_sender
    @sender = User.find_by(email: mail.from.first)
  end

  def ensure_active_account
    if @sender.nil? || !@sender.active?
      bounce_with SupportMailer.account_not_found(mail)
    end
  end

  def create_support_ticket
    @ticket = Ticket.create!(
      user: @sender,
      subject: mail.subject,
      body: mail.decoded,
      status: "open",
      received_at: mail.date
    )
  end

  def process_attachments
    mail.attachments.each do |attachment|
      @ticket.attachments.create!(
        filename: attachment.filename,
        content_type: attachment.mime_type,
        data: attachment.body.decoded
      )
    end
  end

  def send_confirmation_email
    SupportMailer.ticket_received(@ticket).deliver_later
  end
end
```

---

## Testing

### Test Helper
```ruby
class SupportMailboxTest < ActionMailbox::TestCase
  test "creates ticket from email" do
    assert_difference "Ticket.count", 1 do
      receive_inbound_email_from_mail(
        to: "support@example.com",
        from: "user@example.com",
        subject: "Help needed",
        body: "I need assistance with my account."
      )
    end

    ticket = Ticket.last
    assert_equal "Help needed", ticket.subject
    assert_equal "user@example.com", ticket.sender_email
  end

  test "bounces invalid sender" do
    email = receive_inbound_email_from_mail(
      to: "support@example.com",
      from: "unknown@example.com",
      subject: "Test",
      body: "Test"
    )

    assert email.bounced?
  end
end
```

### Test with Attachments
```ruby
test "processes attachments" do
  receive_inbound_email_from_mail(
    to: "support@example.com",
    from: "user@example.com",
    subject: "Bug report",
    body: "See attached screenshot"
  ) do |mail|
    mail.add_file(filename: "screenshot.png", content: File.read("/path/to/file.png"))
  end

  assert_equal 1, Ticket.last.attachments.count
end
```

---

## Incineration

By default, processed emails are deleted after 30 days.

```ruby
# config/environments/production.rb
config.action_mailbox.incinerate_after = 14.days
```

This automatic cleanup ensures you don't retain user data longer than necessary.
