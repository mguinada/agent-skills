# Rails Action Cable Reference

Action Cable integrates WebSockets for real-time features in Rails applications.

## Table of Contents
- [Terminology](#terminology)
- [Server-Side Setup](#server-side-setup)
- [Client-Side Setup](#client-side-setup)
- [Broadcasting](#broadcasting)
- [Channel Examples](#channel-examples)
- [Configuration](#configuration)
- [Deployment](#deployment)

---

## Terminology

| Term | Description |
|------|-------------|
| Connection | WebSocket connection between client and server |
| Consumer | Client-side JavaScript connection |
| Channel | Encapsulates a unit of work (like a controller) |
| Subscriber | Consumer subscribed to a channel |
| Broadcasting | Pub/sub link between publisher and subscribers |
| Stream | Routes broadcasts to channel subscribers |

---

## Server-Side Setup

### Connection
```ruby
# app/channels/application_cable/connection.rb
module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      if user = User.find_by(id: cookies.encrypted[:user_id])
        user
      else
        reject_unauthorized_connection
      end
    end
  end
end
```

### Base Channel
```ruby
# app/channels/application_cable/channel.rb
module ApplicationCable
  class Channel < ActionCable::Channel::Base
  end
end
```

### Create Channel
```bash
rails generate channel Chat
```

```ruby
# app/channels/chat_channel.rb
class ChatChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chat_#{params[:room]}"
  end

  def unsubscribed
    # Cleanup when channel is unsubscribed
  end

  def speak(data)
    ActionCable.server.broadcast(
      "chat_#{params[:room]}",
      message: data["message"],
      user: current_user.name
    )
  end
end
```

---

## Client-Side Setup

### Consumer
```javascript
// app/javascript/channels/consumer.js
import { createConsumer } from "@rails/actioncable"

export default createConsumer()

// Custom URL
// export default createConsumer("wss://example.com/cable")

// Dynamic URL
// export default createConsumer(() => {
//   return `wss://example.com/cable?token=${localStorage.token}`
// })
```

### Subscription
```javascript
// app/javascript/channels/chat_channel.js
import consumer from "./consumer"

const chatChannel = consumer.subscriptions.create(
  { channel: "ChatChannel", room: "best_room" },
  {
    connected() {
      console.log("Connected to chat")
    },

    disconnected() {
      console.log("Disconnected from chat")
    },

    rejected() {
      console.log("Subscription rejected")
    },

    received(data) {
      // Called when broadcast received
      const messages = document.getElementById("messages")
      messages.insertAdjacentHTML("beforeend", `<p>${data.message}</p>`)
    },

    speak(message) {
      this.perform("speak", { message: message })
    }
  }
)

// Usage
chatChannel.speak("Hello!")
```

### Stimulus Controller Integration
```javascript
// app/javascript/controllers/chat_controller.js
import { Controller } from "@hotwired/stimulus"
import consumer from "../channels/consumer"

export default class extends Controller {
  static targets = ["messages", "input"]
  static values = { roomId: String }

  connect() {
    this.channel = consumer.subscriptions.create(
      { channel: "ChatChannel", room: this.roomIdValue },
      {
        received: (data) => this.appendMessage(data)
      }
    )
  }

  disconnect() {
    this.channel.unsubscribe()
  }

  send(event) {
    event.preventDefault()
    this.channel.perform("speak", {
      message: this.inputTarget.value
    })
    this.inputTarget.value = ""
  }

  appendMessage(data) {
    this.messagesTarget.insertAdjacentHTML(
      "beforeend",
      `<p><strong>${data.user}:</strong> ${data.message}</p>`
    )
  }
}
```

---

## Broadcasting

### Server-Side Broadcast
```ruby
# Broadcast to all subscribers of a stream
ActionCable.server.broadcast("chat_best_room", {
  message: "Hello everyone!",
  user: "System"
})

# Broadcast to specific model's stream
PostsChannel.broadcast_to(@post, comment: @comment)

# Broadcast from anywhere (controller, model, job)
class CommentsController < ApplicationController
  def create
    @comment = @post.comments.create!(comment_params)
    CommentsChannel.broadcast_to(@post, @comment)
  end
end

# Broadcast from background job
class NotificationJob < ApplicationJob
  def perform(user, notification)
    NotificationsChannel.broadcast_to(user, notification)
  end
end
```

### Broadcasting to Model
```ruby
# app/channels/posts_channel.rb
class PostsChannel < ApplicationCable::Channel
  def subscribed
    post = Post.find(params[:id])
    stream_for post
  end
end

# Broadcast to this specific post
PostsChannel.broadcast_to(@post, @comment)
```

### Custom Broadcasting
```ruby
# Broadcast with custom rendering
ActionCable.server.broadcast(
  "chat_#{room}",
  html: ApplicationController.render(partial: "messages/message", locals: { message: @message })
)
```

---

## Channel Examples

### Chat Room
```ruby
# app/channels/chat_channel.rb
class ChatChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chat_#{params[:room]}"
  end

  def speak(data)
    message = Message.create!(
      room: params[:room],
      user: current_user,
      content: data["message"]
    )

    ActionCable.server.broadcast("chat_#{params[:room]}", {
      id: message.id,
      content: message.content,
      user: message.user.name,
      created_at: message.created_at.iso8601
    })
  end

  def typing(data)
    ActionCable.server.broadcast("chat_#{params[:room]}_typing", {
      user: current_user.name,
      typing: data["typing"]
    })
  end
end
```

### Notifications
```ruby
# app/channels/notifications_channel.rb
class NotificationsChannel < ApplicationCable::Channel
  def subscribed
    stream_for current_user
  end
end

# Broadcast notification
NotificationsChannel.broadcast_to(current_user, {
  title: "New comment",
  body: "Someone commented on your post",
  url: post_url(@post)
})
```

### User Appearances
```ruby
# app/channels/appearance_channel.rb
class AppearanceChannel < ApplicationCable::Channel
  def subscribed
    current_user.appear(on: params[:appearing_on])
    stream_from "appearances"
  end

  def unsubscribed
    current_user.disappear
  end

  def away
    current_user.away
  end
end
```

### Rebroadcasting Messages
```ruby
# Echo all received messages to all subscribers
class ChatChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chat_#{params[:room]}"
  end

  def receive(data)
    ActionCable.server.broadcast("chat_#{params[:room]}", data)
  end
end
```

---

## Configuration

### Cable.yml
```yaml
# config/cable.yml
development:
  adapter: async

test:
  adapter: test

production:
  adapter: redis
  url: redis://localhost:6379/1
  channel_prefix: myapp_production
```

### Solid Cable (Rails 8+)
```yaml
# config/cable.yml
production:
  adapter: solid_cable
  connects_to:
    database:
      writing: cable
```

### Environment Config
```ruby
# config/environments/production.rb
# Allowed origins
config.action_cable.allowed_request_origins = [
  "https://example.com",
  %r{https://.*\.example\.com}
]

# Disable forgery protection (not recommended)
config.action_cable.disable_request_forgery_protection = true

# Worker pool size
config.action_cable.worker_pool_size = 4

# Mount path
config.action_cable.mount_path = "/cable"

# URL for standalone
config.action_cable.url = "wss://example.com/cable"
```

### Standalone Server
```ruby
# cable/config.ru
require_relative "../config/environment"
Rails.application.eager_load!

run ActionCable.server
```

```bash
# Start standalone server
bundle exec puma -p 28080 cable/config.ru
```

---

## Callbacks

### Connection Callbacks
```ruby
module ApplicationCable
  class Connection < ActionCable::Connection::Base
    before_command :authenticate
    after_command :log_command

    def authenticate
      reject_unauthorized_connection unless current_user
    end

    def log_command
      Rails.logger.info "Command received from #{current_user.id}"
    end
  end
end
```

### Channel Callbacks
```ruby
class ChatChannel < ApplicationCable::Channel
  before_subscribe :check_access
  after_subscribe :send_welcome
  before_unsubscribe :cleanup

  private

  def check_access
    reject unless current_user.can_access?(params[:room])
  end

  def send_welcome
    transmit({ system: "Welcome to the chat!" })
  end

  def cleanup
    current_user.leave_room(params[:room])
  end
end
```

---

## Exception Handling

```ruby
# Connection level
module ApplicationCable
  class Connection < ActionCable::Connection::Base
    rescue_from StandardError, with: :report_error

    private

    def report_error(exception)
      Rails.logger.error "Action Cable error: #{exception.message}"
      Sentry.capture_exception(exception)
    end
  end
end

# Channel level
class ChatChannel < ApplicationCable::Channel
  rescue_from "User::Blocked" do
    reject
  end

  rescue_from ActiveRecord::RecordNotFound do
    transmit({ error: "Record not found" })
  end
end
```

---

## Testing

### Test Helper
```ruby
class ChatChannelTest < ActionCable::Channel::TestCase
  test "subscribes and streams from chat room" do
    subscribe(room: "best_room")

    assert subscription.confirmed?
    assert_has_stream "chat_best_room"
  end

  test "speak broadcasts message" do
    subscribe(room: "best_room")

    assert_broadcast_on("chat_best_room", { message: "Hello!" }) do
      perform :speak, message: "Hello!"
    end
  end
end
```

### Connection Test
```ruby
class ApplicationCable::ConnectionTest < ActionCable::Connection::TestCase
  test "connects with valid user" do
    cookies.encrypted[:user_id] = users(:one).id

    connect

    assert_equal users(:one).id, connection.current_user.id
  end

  test "rejects without user" do
    connect

    assert connection.rejected?
  end
end
```

---

## Deployment

### With Redis
1. Ensure Redis is available
2. Configure `config/cable.yml` for production
3. Ensure worker pool has enough DB connections

### Nginx Configuration
```nginx
location /cable {
  proxy_pass http://backend;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
  proxy_read_timeout 86400;
}
```

### Puma Configuration
```ruby
# config/puma.rb
# Ensure enough threads for Action Cable
threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }
threads threads_count, threads_count
```
