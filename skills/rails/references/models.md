# Rails Models Reference

Detailed patterns for Active Record models.

## Table of Contents
- [Associations](#associations)
- [Validations](#validations)
- [Callbacks](#callbacks)
- [Querying](#querying)
- [Scopes](#scopes)
- [Single Table Inheritance](#single-table-inheritance)
- [Delegated Types](#delegated-types)

---

## Associations

Associations define relationships between models.

### belongs_to
```ruby
class Comment < ApplicationRecord
  belongs_to :article
  belongs_to :author, class_name: 'User'
  belongs_to :commentable, polymorphic: true
  belongs_to :user, optional: true  # Allow nil
end

# Creates methods:
comment.article
comment.build_article(attributes)
comment.create_article(attributes)
comment.reload_article
```

### has_one
```ruby
class User < ApplicationRecord
  has_one :profile
  has_one :account, dependent: :destroy
  has_one :latest_post, -> { order(created_at: :desc) }, class_name: 'Post'
end

# Creates methods:
user.profile
user.build_profile(attributes)
user.create_profile(attributes)
```

### has_many
```ruby
class Article < ApplicationRecord
  has_many :comments
  has_many :comments, -> { order(created_at: :desc) }
  has_many :comments, dependent: :destroy
  has_many :comments, dependent: :nullify
  has_many :published_comments, -> { published }, class_name: 'Comment'
  has_many :tags, through: :taggings
  has_many :authors, through: :contributions, source: :writer
end

# Creates methods:
article.comments
article.comments << Comment.new
article.comments.build(attributes)
article.comments.create(attributes)
article.comments.count
article.comments.destroy_all
article.comments.clear
```

### has_and_belongs_to_many (HABTM)
```ruby
class Article < ApplicationRecord
  has_and_belongs_to_many :tags
end

class Tag < ApplicationRecord
  has_and_belongs_to_many :articles
end

# Requires join table: articles_tags (no id column)
```

### Polymorphic Associations
```ruby
class Comment < ApplicationRecord
  belongs_to :commentable, polymorphic: true
end

class Article < ApplicationRecord
  has_many :comments, as: :commentable
end

class Photo < ApplicationRecord
  has_many :comments, as: :commentable
end

# comments table needs:
# commentable_id (integer)
# commentable_type (string, e.g., "Article")
```

### Self Joins
```ruby
class Employee < ApplicationRecord
  belongs_to :manager, class_name: 'Employee', optional: true
  has_many :subordinates, class_name: 'Employee', foreign_key: 'manager_id'
end
```

### Through Associations
```ruby
class Article < ApplicationRecord
  has_many :taggings
  has_many :tags, through: :taggings
  has_many :authors, through: :taggings, source: :author
end

class Tagging < ApplicationRecord
  belongs_to :article
  belongs_to :tag
  belongs_to :author
end

class Tag < ApplicationRecord
  has_many :taggings
  has_many :articles, through: :taggings
end
```

---

## Validations

Validations ensure data integrity before saving.

### Presence
```ruby
validates :title, presence: true
validates :title, :body, presence: true
validates :email, presence: { message: "must be provided" }
```

### Uniqueness
```ruby
validates :email, uniqueness: true
validates :email, uniqueness: { case_sensitive: false }
validates :title, uniqueness: { scope: :user_id }
validates :title, uniqueness: { scope: [:user_id, :category_id] }
```

### Length
```ruby
validates :title, length: { minimum: 5 }
validates :title, length: { maximum: 100 }
validates :title, length: { in: 5..100 }
validates :title, length: { is: 10 }
validates :bio, length: { maximum: 500, too_long: "%{count} characters is too long" }
```

### Format
```ruby
validates :email, format: { with: /\A[^@\s]+@[^@\s]+\z/ }
validates :slug, format: { with: /\A[a-z0-9-]+\z/, message: "only lowercase letters, numbers, and hyphens" }
```

### Numericality
```ruby
validates :age, numericality: true
validates :age, numericality: { only_integer: true }
validates :price, numericality: { greater_than: 0 }
validates :quantity, numericality: { greater_than_or_equal_to: 0 }
validates :rating, numericality: { less_than_or_equal_to: 5 }
validates :discount, numericality: { equal_to: 0 }, allow_nil: true
```

### Inclusion/Exclusion
```ruby
validates :status, inclusion: { in: %w[draft published archived] }
validates :status, inclusion: { in: %w[draft published], message: "%{value} is not a valid status" }
validates :subdomain, exclusion: { in: %w[www admin api] }
```

### Confirmation
```ruby
validates :email, confirmation: true
validates :password, confirmation: true

# Requires password_confirmation attribute in form
```

### Acceptance
```ruby
validates :terms, acceptance: true
validates :terms, acceptance: { accept: 'yes' }
```

### Conditional Validations
```ruby
validates :company_name, presence: true, if: :business_account?
validates :card_number, presence: true, unless: :paypal_payment?

# With lambda
validates :published_at, presence: true, if: -> { status == 'published' }
```

### Custom Validations
```ruby
validate :expiration_date_cannot_be_in_the_past

def expiration_date_cannot_be_in_the_past
  if expiration_date.present? && expiration_date < Date.today
    errors.add(:expiration_date, "can't be in the past")
  end
end

# Multiple attributes
validate :start_date_before_end_date

def start_date_before_end_date
  if start_date > end_date
    errors.add(:start_date, "must be before end date")
  end
end
```

### Custom Validators
```ruby
# app/validators/email_validator.rb
class EmailValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    unless value =~ /\A[^@\s]+@[^@\s]+\z/
      record.errors.add(attribute, (options[:message] || "is not an email"))
    end
  end
end

# Usage
validates :email, email: true
```

---

## Callbacks

Callbacks run code at specific points in a model's lifecycle.

### Available Callbacks
```ruby
# Creating
before_validation
after_validation
before_save
before_create
after_create
after_save
after_commit / after_rollback

# Updating
before_validation
after_validation
before_save
before_update
after_update
after_save
after_commit / after_rollback

# Destroying
before_destroy
after_destroy
after_commit / after_rollback
```

### Registering Callbacks
```ruby
class Article < ApplicationRecord
  before_save :normalize_title
  before_create :set_defaults
  after_create :notify_admin
  after_destroy :cleanup_files

  private

  def normalize_title
    self.title = title.strip.titleize
  end

  def set_defaults
    self.status ||= 'draft'
    self.views ||= 0
  end

  def notify_admin
    AdminMailer.new_article(self).deliver_later
  end

  def cleanup_files
    File.delete(filepath) if File.exist?(filepath)
  end
end
```

### Conditional Callbacks
```ruby
before_save :publish_notification, if: :published?
before_save :generate_slug, unless: :slug_present?

# With lambda
after_create :send_welcome_email, if: -> { user.newsletter_subscribed? }
```

### Skipping Callbacks
```ruby
# Use with caution - skips all callbacks
Article.insert(title: "Quick")
Article.insert_all([{ title: "One" }, { title: "Two" }])
Article.update_all(status: 'archived')
Article.delete_all
```

### Callback Classes
```ruby
class Article < ApplicationRecord
  before_create ArticleNotifier
end

class ArticleNotifier
  def self.before_create(article)
    # Send notification
  end
end
```

---

## Querying

### Finder Methods
```ruby
Article.find(1)                          # Find by ID (raises if not found)
Article.find([1, 2, 3])                  # Find multiple
Article.find_by(title: "Hello")          # Find first match (nil if not found)
Article.find_by!(title: "Hello")         # Raises if not found
Article.first                            # First record
Article.last                             # Last record
Article.take                             # Random record
Article.take(5)                          # Multiple random records
```

### Where Conditions
```ruby
Article.where(status: 'published')
Article.where(status: ['published', 'draft'])  # IN clause
Article.where(created_at: Date.today..1.week.from_now)  # Range
Article.where("title LIKE ?", "%rails%")       # SQL string
Article.where("title LIKE :query", query: "%rails%")  # Named bind
Article.where.not(status: 'archived')          # NOT condition
```

### Order, Limit, Offset
```ruby
Article.order(created_at: :desc)
Article.order(created_at: :desc, title: :asc)
Article.order("created_at DESC")
Article.limit(10)
Article.offset(20)
Article.limit(10).offset(20)  # Pagination
```

### Select, Pluck, IDs
```ruby
Article.select(:title, :body)
Article.select("title, LENGTH(body) as body_length")
Article.pluck(:title)              # Array of titles
Article.pluck(:title, :status)     # Array of arrays
Article.ids                        # Array of IDs
Article.distinct.pluck(:status)    # Unique values
```

### Joins and Includes
```ruby
Article.joins(:comments)           # INNER JOIN
Article.joins(:comments, :author)
Article.left_joins(:comments)      # LEFT OUTER JOIN
Article.left_outer_joins(:comments)

# Eager loading (avoid N+1)
Article.includes(:comments).all
Article.includes(:comments, :author).all
Article.preload(:comments)         # Separate queries
Article.eager_load(:comments)      # LEFT OUTER JOIN
```

### Group and Having
```ruby
Article.group(:status).count
Article.group(:status).sum(:views)
Article.select("status, COUNT(*) as count").group(:status)
Article.group(:status).having("COUNT(*) > ?", 5)
```

### Scopes
```ruby
class Article < ApplicationRecord
  scope :published, -> { where(status: 'published') }
  scope :recent, -> { order(created_at: :desc) }
  scope :by_author, ->(author) { where(author: author) }
  scope :since, ->(date) { where("created_at >= ?", date) }
end

# Usage
Article.published.recent
Article.by_author(user).since(1.week.ago)
```

### Merging Scopes
```ruby
Article.where(status: 'published').merge(Comment.public)
```

---

## Single Table Inheritance

STI stores multiple types in one table with a `type` column.

```ruby
# Migration
create_table :vehicles do |t|
  t.string :type        # Required for STI
  t.string :color
  t.integer :wheel_count
end

# Models
class Vehicle < ApplicationRecord
end

class Car < Vehicle
end

class Motorcycle < Vehicle
end

# Usage
Car.create(color: "red", wheel_count: 4)
Motorcycle.create(color: "black", wheel_count: 2)

Vehicle.all  # Returns both Cars and Motorcycles
Car.all      # Returns only Cars
```

---

## Delegated Types

Alternative to STI for shared behavior with separate tables.

```ruby
# Migration
create_table :entries do |t|
  t.string :entryable_type
  t.bigint :entryable_id
  t.timestamps
end

create_table :messages do |t|
  t.string :subject
  t.text :body
  t.timestamps
end

create_table :comments do |t|
  t.string :content
  t.timestamps
end

# Models
class Entry < ApplicationRecord
  delegated_type :entryable, types: %w[ Message Comment ]
  delegate :subject, to: :entryable
end

class Message < ApplicationRecord
  has_one :entry, as: :entryable
end

class Comment < ApplicationRecord
  has_one :entry, as: :entryable
end

# Usage
Entry.create(entryable: Message.new(subject: "Hello", body: "World"))
Entry.create(entryable: Comment.new(content: "Great post!"))
```
