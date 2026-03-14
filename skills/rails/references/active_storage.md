# Rails Active Storage Reference

Active Storage handles file uploads to cloud storage services and attachments to Active Record models.

## Table of Contents
- [Setup](#setup)
- [Attaching Files](#attaching-files)
- [Viewing Files](#viewing-files)
- [Transforming Images](#transforming-images)
- [Direct Uploads](#direct-uploads)
- [Configuration](#configuration)
- [Testing](#testing)

---

## Setup

### Installation
```bash
rails active_storage:install
rails db:migrate
```

### Requirements
```bash
# For image processing
brew install libvips      # macOS (recommended)
# or
brew install imagemagick  # Alternative

# For video processing
brew install ffmpeg

# For PDF previews
brew install poppler
```

### Model Setup
```ruby
class User < ApplicationRecord
  has_one_attached :avatar
end

class Article < ApplicationRecord
  has_many_attached :photos
end
```

---

## Attaching Files

### Single Attachment
```ruby
user = User.new

# Attach from file
user.avatar.attach(io: File.open("/path/to/image.jpg"), filename: "avatar.jpg")

# Attach from uploaded file (controller)
user.avatar.attach(params[:avatar])

# Attach from URL
user.avatar.attach(
  io: URI.open("https://example.com/image.jpg"),
  filename: "downloaded.jpg"
)

# Check attachment
user.avatar.attached?  # => true

# Detach (keep blob)
user.avatar.detach

# Purge (delete blob)
user.avatar.purge
user.avatar.purge_later  # Background job
```

### Multiple Attachments
```ruby
article = Article.new

# Attach multiple files
article.photos.attach(params[:photos])

# Add individual files
article.photos.attach(
  io: File.open("/path/to/photo1.jpg"),
  filename: "photo1.jpg"
)

# Iterate attachments
article.photos.each do |photo|
  puts photo.filename
end

# Check attachments
article.photos.attached?  # => true

# Count
article.photos.count

# Purge all
article.photos.purge
```

### Creating Blobs Directly
```ruby
blob = ActiveStorage::Blob.create_and_upload!(
  io: File.open("/path/to/file.pdf"),
  filename: "document.pdf",
  content_type: "application/pdf"
)

user.avatar.attach(blob)
```

---

## Viewing Files

### URL Helpers
```erb
<!-- Full URL -->
<%= url_for(user.avatar) %>

<!-- Path for serving -->
<%= rails_blob_path(user.avatar) %>

<!-- Full URL -->
<%= rails_blob_url(user.avatar) %>
```

### Link to Download
```erb
<%= link_to user.avatar.filename, rails_blob_path(user.avatar, disposition: "attachment") %>
```

### Image Tag
```erb
<%= image_tag user.avatar %>

<!-- With options -->
<%= image_tag user.avatar, class: "avatar", width: 100 %>
```

### Check Variants
```ruby
user.avatar.image?      # => true for images
user.avatar.video?      # => true for videos
user.avatar.audio?      # => true for audio
user.avatar.text?       # => true for text files
user.avatar.representable?  # => can generate preview
```

---

## Transforming Images

### Basic Variants
```erb
<!-- Resize -->
<%= image_tag user.avatar.variant(resize_to_limit: [100, 100]) %>

<!-- Resize and crop -->
<%= image_tag user.avatar.variant(resize_to_fill: [100, 100]) %>

<!-- Resize to fit -->
<%= image_tag user.avatar.variant(resize_to_fit: [200, 200]) %>
```

### Common Transformations
```ruby
# Resize limiting dimensions
variant(resize_to_limit: [800, 600])

# Resize filling dimensions (crops excess)
variant(resize_to_fill: [200, 200])

# Resize fitting within dimensions
variant(resize_to_fit: [400, 300])

# Custom processing
variant(
  resize_to_limit: [800, 600],
  crop: [100, 100, 400, 300],  # x, y, width, height
  rotate: 90,
  quality: 85
)

# Format conversion
variant(resize_to_limit: [800, 600], format: :webp)
variant(resize_to_limit: [800, 600], format: :avif)
```

### Predefined Variants
```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_one_attached :avatar do |attachable|
    attachable.variant :thumb, resize_to_limit: [100, 100]
    attachable.variant :medium, resize_to_limit: [300, 300]
    attachable.variant :large, resize_to_limit: [800, 800]
  end
end

# In views
<%= image_tag user.avatar.variant(:thumb) %>
<%= image_tag user.avatar.variant(:medium) %>
```

### Processing in Background
```ruby
# config/application.rb
config.active_storage.variant_processor = :vips  # or :image_magick

# Variants are processed on-demand by default
# For eager processing, use after_commit callbacks
```

---

## Previews

### PDF and Video Previews
```erb
<!-- PDF preview (first page) -->
<%= image_tag document.preview(resize_to_limit: [800, 600]) %>

<!-- Video preview (first frame) -->
<%= image_tag video.preview(resize_to_limit: [400, 300]) %>
```

### Custom Previewers
```ruby
# app/previews/document_previewer.rb
class DocumentPreviewer < ActiveStorage::Previewer
  def self.accept?(blob)
    blob.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  end

  def preview(**options)
    download_blob_to_tempfile do |input|
      # Generate preview image
      preview_path = generate_preview(input.path)
      io: File.open(preview_path),
      filename: "#{blob.filename.base}.png",
      content_type: "image/png"
    end
  end
end

# config/initializers/active_storage.rb
Rails.application.config.active_storage.previewers.insert(0, DocumentPreviewer)
```

---

## Direct Uploads

### Form Setup
```erb
<%= form.file_field :avatar, direct_upload: true %>

<!-- With JavaScript -->
<%= form.file_field :photos, multiple: true, direct_upload: true %>
```

### JavaScript Integration
```javascript
// app/javascript/controllers/direct_upload_controller.js
import { DirectUpload } from "@rails/activestorage"
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  upload(file) {
    const url = this.element.dataset.directUploadUrl
    const upload = new DirectUpload(file, url, this)

    upload.create((error, blob) => {
      if (error) {
        console.error(error)
      } else {
        // Add hidden field with blob signed_id
        this.addHiddenField(blob.signed_id)
      }
    })
  }

  addHiddenField(signedId) {
    const field = document.createElement('input')
    field.type = 'hidden'
    field.name = 'user[avatar]'
    field.value = signedId
    this.element.appendChild(field)
  }
}
```

### Direct Upload Events
```javascript
document.addEventListener('direct-upload:start', (event) => {
  console.log('Started:', event.detail.id)
})

document.addEventListener('direct-upload:progress', (event) => {
  const { id, progress } = event.detail
  console.log(`Upload ${id}: ${progress}%`)
})

document.addEventListener('direct-upload:error', (event) => {
  event.preventDefault()  // Prevent default alert
  console.error('Error:', event.detail.error)
})

document.addEventListener('direct-upload:end', (event) => {
  console.log('Completed:', event.detail.id)
})
```

---

## Configuration

### Service Configuration
```yaml
# config/storage.yml
test:
  service: Disk
  root: <%= Rails.root.join("tmp/storage") %>

local:
  service: Disk
  root: <%= Rails.root.join("storage") %>

amazon:
  service: S3
  access_key_id: <%= Rails.application.credentials.dig(:aws, :access_key_id) %>
  secret_access_key: <%= Rails.application.credentials.dig(:aws, :secret_access_key) %>
  region: us-east-1
  bucket: my-app-bucket

google:
  service: GCS
  project: my-project
  credentials: <%= Rails.root.join("path/to/keyfile.json") %>
  bucket: my-app-bucket

azure:
  service: AzureStorage
  storage_account_name: myaccount
  storage_access_key: <%= Rails.application.credentials.dig(:azure, :storage_access_key) %>
  container: my-container
```

### Environment Configuration
```ruby
# config/environments/production.rb
config.active_storage.service = :amazon

# config/environments/development.rb
config.active_storage.service = :local

# config/environments/test.rb
config.active_storage.service = :test
```

### Mirroring
```yaml
# config/storage.yml
production:
  service: Mirror
  primary: amazon
  mirrors:
    - google
    - azure
```

---

## Model Methods

### Validation
```ruby
class User < ApplicationRecord
  has_one_attached :avatar

  validate :avatar_format

  private

  def avatar_format
    return unless avatar.attached?

    unless avatar.blob.content_type.start_with?("image/")
      errors.add(:avatar, "must be an image")
    end

    if avatar.blob.byte_size > 5.megabytes
      errors.add(:avatar, "must be less than 5MB")
    end
  end
end
```

### File Analysis
```ruby
user.avatar.filename       # => "avatar.jpg"
user.avatar.content_type   # => "image/jpeg"
user.avatar.byte_size      # => 12345
user.avatar.metadata       # => {"width"=>800, "height"=>600, "identified"=>true}
```

### Signed IDs
```ruby
# Generate signed ID for secure references
signed_id = user.avatar.signed_id

# Find blob by signed ID
blob = ActiveStorage::Blob.find_signed(signed_id)
```

---

## Testing

### Test Helper
```ruby
class UserTest < ActiveSupport::TestCase
  test "avatar must be an image" do
    user = users(:one)
    user.avatar.attach(
      io: File.open(Rails.root.join("test/fixtures/files/document.pdf")),
      filename: "document.pdf",
      content_type: "application/pdf"
    )

    assert_not user.valid?
    assert_includes user.errors[:avatar], "must be an image"
  end
end
```

### Integration Test
```ruby
class UsersIntegrationTest < ActionDispatch::IntegrationTest
  test "can upload avatar" do
    file = fixture_file_upload(Rails.root.join("test/fixtures/files/avatar.jpg"), "image/jpeg")

    post users_url, params: { user: { avatar: file } }

    assert_response :redirect
    user = User.last
    assert user.avatar.attached?
  end
end
```

---

## Purging Unattached Uploads

```ruby
# lib/tasks/active_storage.rake
namespace :active_storage do
  desc "Purge unattached blobs created more than 24 hours ago"
  task purge_unattached: :environment do
    ActiveStorage::Blob.unattached
      .where("active_storage_blobs.created_at < ?", 24.hours.ago)
      .find_each(&:purge_later)
  end
end

# Schedule with cron or recurring job
```

---

## Best Practices

1. **Use libvips** - Faster and more memory-efficient than ImageMagick
2. **Set size limits** - Validate file sizes before accepting
3. **Validate content types** - Check actual content, not just extension
4. **Use direct uploads** - Upload files directly to cloud storage
5. **Purge orphaned blobs** - Regularly clean up unattached uploads
6. **Use variants** - Don't serve full-size images for thumbnails
7. **Consider CDN** - Use CloudFront or similar for serving files
