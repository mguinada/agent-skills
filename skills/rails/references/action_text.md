# Rails Action Text Reference

Action Text handles rich text content with the Trix WYSIWYG editor.

## Table of Contents
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Rendering Content](#rendering-content)
- [Attachments](#attachments)
- [Customization](#customization)
- [API Integration](#api-integration)

---

## Installation

```bash
rails action_text:install
rails db:migrate
```

This creates:
- `action_text_rich_texts` table
- `actiontext.css` stylesheet
- Trix editor JavaScript

### Requirements
```bash
# For image processing (Active Storage dependency)
brew install libvips  # macOS
# or
sudo apt-get install libvips  # Ubuntu
```

---

## Basic Usage

### Model Setup
```ruby
# app/models/article.rb
class Article < ApplicationRecord
  has_rich_text :content
  has_rich_text :summary
end
```

### Form Helper
```erb
<%# app/views/articles/_form.html.erb %>
<%= form_with model: @article do |form| %>
  <div>
    <%= form.label :title %>
    <%= form.text_field :title %>
  </div>

  <div>
    <%= form.label :content %>
    <%= form.rich_textarea :content %>
  </div>

  <%= form.submit %>
<% end %>
```

### Controller
```ruby
class ArticlesController < ApplicationController
  def create
    @article = Article.create!(article_params)
    redirect_to @article
  end

  private

  def article_params
    params.expect(article: [:title, :content])
  end
end
```

---

## Rendering Content

### Basic Rendering
```erb
<%= @article.content %>
```

### Safe Output
```ruby
# to_s returns sanitized HTML safe string
@article.content.to_s

# to_plain_text returns plain text (not HTML safe)
@article.content.to_plain_text
```

### Preloading (Avoid N+1)
```ruby
# Load rich text without attachments
Article.all.with_rich_text_content

# Load with attachments
Article.all.with_rich_text_content_and_embeds
```

---

## Attachments

### Image Uploads (Active Storage)
Images dragged into the editor are automatically uploaded via Active Storage.

```ruby
# Ensure model has Active Storage configured
class Article < ApplicationRecord
  has_rich_text :content
end

# Images are stored in action_text_rich_texts automatically
```

### Signed GlobalID Attachments
Embed any Active Record model:

```ruby
# app/models/comment.rb
class Comment < ApplicationRecord
  include ActionText::Attachable

  belongs_to :article
end
```

```erb
<%# In Trix editor, embed as: %>
<action-text-attachment sgid="<%= comment.attachable_sgid %>"></action-text-attachment>
```

### Custom Partial for Attachments
```ruby
# app/models/user.rb
class User < ApplicationRecord
  def to_attachable_partial_path
    "users/attachable"
  end
end
```

```erb
<%# app/views/users/_attachable.html.erb %>
<span class="user-mention">
  <%= image_tag user.avatar, width: 20 %>
  <%= user.name %>
</span>
```

### Missing Record Handling
```ruby
class User < ApplicationRecord
  def self.to_missing_attachable_partial_path
    "users/missing_attachable"
  end
end
```

```erb
<%# app/views/users/_missing_attachable.html.erb %>
<span class="deleted-user">[Deleted user]</span>
```

---

## Customization

### Editor Styles
```css
/* app/assets/stylesheets/actiontext.css */
.trix-content {
  font-family: system-ui, sans-serif;
  line-height: 1.6;
}

.trix-content h1 {
  font-size: 2em;
  font-weight: bold;
}

.attachment {
  max-width: 100%;
}
```

### Content Container Layout
```erb
<%# app/views/layouts/action_text/contents/_content.html.erb %>
<div class="trix-content prose">
  <%= yield %>
</div>
```

### Attachment Rendering
```erb
<%# app/views/active_storage/blobs/_blob.html.erb %>
<figure class="attachment attachment--<%= blob.representable? ? 'preview' : 'file' %>">
  <% if blob.representable? %>
    <%= image_tag blob.representation(resize_to_limit: [1024, 768]) %>
  <% end %>

  <figcaption class="attachment__caption">
    <% if caption = blob.try(:caption) %>
      <%= caption %>
    <% else %>
      <span class="attachment__name"><%= blob.filename %></span>
      <span class="attachment__size"><%= number_to_human_size(blob.byte_size) %></span>
    <% end %>
  </figcaption>
</figure>
```

### Remove Default Trix Styles
```ruby
# Remove Trix defaults if using custom styles
# In application.js, don't require trix/dist/trix.css
```

---

## API Integration

### Upload Endpoint
```ruby
# app/controllers/api/direct_uploads_controller.rb
class Api::DirectUploadsController < ApplicationController
  def create
    blob = ActiveStorage::Blob.create_and_upload!(
      io: params[:file],
      filename: params[:file].original_filename,
      content_type: params[:file].content_type
    )

    render json: {
      sgid: blob.attachable_sgid,
      url: url_for(blob)
    }
  end
end
```

### Frontend Integration
```javascript
// After upload, insert attachment in Trix
const attachment = new Trix.Attachment({
  sgid: response.sgid,
  url: response.url
});

editor.insertAttachment(attachment);
```

### Embedding in Content
```html
<action-text-attachment sgid="BAh7CEkiCG..."></action-text-attachment>
```

---

## JavaScript Events

### Direct Upload Events
```javascript
document.addEventListener('direct-upload:start', (event) => {
  console.log('Upload started:', event.detail.id);
});

document.addEventListener('direct-upload:progress', (event) => {
  console.log('Progress:', event.detail.progress);
});

document.addEventListener('direct-upload:error', (event) => {
  console.error('Upload error:', event.detail.error);
});

document.addEventListener('direct-upload:end', (event) => {
  console.log('Upload complete');
});
```

---

## Trix Editor API

### Get Editor Instance
```javascript
const element = document.querySelector('trix-editor');
const editor = element.editor;
```

### Common Operations
```javascript
// Insert text
editor.insertString('Hello');

// Insert HTML
editor.insertHTML('<strong>Bold</strong>');

// Insert attachment
const attachment = new Trix.Attachment({ content: '<span>Custom</span>' });
editor.insertAttachment(attachment);

// Get content
const html = editor.getDocument().toString();

// Set content
editor.loadHTML('<p>New content</p>');

// Focus
element.focus();
```

---

## Best Practices

1. **Preload rich text** - Use `with_rich_text_content_and_embeds` to avoid N+1
2. **Install libvips** - Required for image processing
3. **Sanitize output** - Action Text sanitizes by default, but be aware
4. **Handle missing records** - Define `to_missing_attachable_partial_path`
5. **Purge unattached uploads** - Regularly clean up orphaned Active Storage blobs
6. **UUID support** - Update migration if models use UUID primary keys

---

## Troubleshooting

### Images Not Displaying
```bash
# Ensure libvips is installed
brew install libvips

# Or ImageMagick
brew install imagemagick
```

### UUID Primary Keys
```ruby
# Update migration for UUID support
create_table :action_text_rich_texts do |t|
  t.references :record, null: false, polymorphic: true, index: false, type: :uuid
  t.string :name, null: false
  t.text :body

  t.timestamps
end
```
