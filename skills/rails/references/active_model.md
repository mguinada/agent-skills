# Rails Active Model Reference

Active Model provides model-like features for Ruby objects that don't need database persistence.

## Table of Contents
- [Active Model API](#active-model-api)
- [Attribute Methods](#attribute-methods)
- [Callbacks](#callbacks)
- [Conversion](#conversion)
- [Dirty Tracking](#dirty-tracking)
- [Naming](#naming)
- [Validations](#validations)
- [Serialization](#serialization)

---

## Active Model API

Include `ActiveModel::API` to make any Ruby class work with Action Pack (forms, routing).

```ruby
class Contact
  include ActiveModel::API

  attr_accessor :name, :email, :message

  validates :name, :email, :message, presence: true
end

# Now works with form_for, routes, etc.
contact = Contact.new(name: "John", email: "john@example.com")
contact.valid?  # => true
contact.to_param  # => nil (unless you implement to_key)
```

---

## Attribute Methods

Include `ActiveModel::AttributeMethods` to add custom attributes with prefixes/suffixes.

```ruby
class Person
  include ActiveModel::AttributeMethods

  attribute_method_prefix 'clear_'
  attribute_method_suffix '_present?'

  define_attribute_methods :name, :age

  attr_accessor :name, :age

  private

  def clear_attribute(attribute)
    send("#{attribute}=", nil)
  end

  def attribute_present?(attribute)
    send(attribute).present?
  end
end

person = Person.new(name: "John")
person.clear_name       # => sets name to nil
person.name_present?    # => false
```

---

## Callbacks

Use callbacks for non-Active Record models.

```ruby
class Event
  include ActiveModel::Callbacks

  define_model_callbacks :publish

  before_publish :notify_subscribers

  def publish
    run_callbacks :publish do
      # Publishing logic
    end
  end

  private

  def notify_subscribers
    # Send notifications
  end
end
```

### Available Callbacks
```ruby
define_model_callbacks :create, :update, :destroy

before_create :do_something
after_create :do_something_else
around_create :wrap_in_transaction
```

---

## Conversion

Include `ActiveModel::Conversion` for compatibility with Action View helpers.

```ruby
class Comment
  include ActiveModel::Conversion

  attr_accessor :id

  def initialize(id)
    @id = id
  end

  def persisted?
    id.present?
  end
end

comment = Comment.new(1)
comment.to_key       # => [1]
comment.to_param     # => "1"
comment.model_name   # => "Comment"
```

---

## Dirty Tracking

Track changes to attributes.

```ruby
class Article
  include ActiveModel::Dirty

  define_attribute_methods :title, :status

  def title
    @title
  end

  def title=(value)
    title_will_change! unless value == @title
    @title = value
  end

  def status
    @status
  end

  def status=(value)
    status_will_change! unless value == @status
    @status = value
  end

  def save
    changes_applied  # Marks changes as saved
  end
end

article = Article.new
article.title = "New Title"
article.title_changed?      # => true
article.title_was           # => nil
article.title_change        # => [nil, "New Title"]
article.changes             # => {"title" => [nil, "New Title"]}

article.save
article.title_changed?      # => false
article.previous_changes    # => {"title" => [nil, "New Title"]}
```

### Dirty Methods
```ruby
attribute_changed?           # Has attribute changed?
attribute_was                # Previous value
attribute_change             # [old, new] array
changes                      # All changes
changed_attributes           # Hash of changed attrs with old values
changes_applied              # Mark as saved
restore_attribute!           # Restore to original value
clear_changes_information    # Reset all tracking
```

---

## Naming

Include `ActiveModel::Naming` for name-related methods.

```ruby
class Person
  include ActiveModel::Naming
end

Person.model_name.name       # => "Person"
Person.model_name.singular   # => "person"
Person.model_name.plural     # => "people"
Person.model_name.element    # => "person"
Person.model_name.human      # => "Person"
Person.model_name.collection # => "people"
Person.model_name.param_key  # => "person"
Person.model_name.route_key  # => "people"
```

### With Namespacing
```ruby
module Admin
  class User
    include ActiveModel::Naming
  end
end

Admin::User.model_name.name       # => "Admin::User"
Admin::User.model_name.singular   # => "admin_user"
Admin::User.model_name.route_key  # => "admin_users"
```

---

## Validations

Include `ActiveModel::Validations` for full validation support.

```ruby
class Contact
  include ActiveModel::Validations

  attr_accessor :name, :email, :phone

  validates :name, presence: true, length: { minimum: 2 }
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, numericality: { only_integer: true }, allow_blank: true

  validate :custom_validation

  private

  def custom_validation
    if name == "Forbidden"
      errors.add(:name, "cannot be 'Forbidden'")
    end
  end
end

contact = Contact.new(name: "J")
contact.valid?                    # => false
contact.errors.full_messages      # => ["Name is too short (minimum is 2 characters)"]
contact.errors[:name]             # => ["is too short (minimum is 2 characters)"]
```

### Custom Validators
```ruby
class EmailValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    unless value =~ /\A[^@\s]+@[^@\s]+\z/
      record.errors.add(attribute, (options[:message] || "is not an email"))
    end
  end
end

class User
  include ActiveModel::Validations
  attr_accessor :email
  validates :email, email: true
end
```

---

## Serialization

Include `ActiveModel::Serialization` for JSON serialization.

```ruby
class Person
  include ActiveModel::Serialization

  attr_accessor :name, :email, :created_at

  def attributes
    { 'name' => name, 'email' => email, 'created_at' => created_at }
  end
end

person = Person.new
person.name = "John"
person.email = "john@example.com"
person.created_at = Time.current

person.to_json  # => {"name":"John","email":"john@example.com","created_at":"2024-01-01T00:00:00Z"}
```

### Serializers
```ruby
class PersonSerializer < ActiveModel::Serializer
  attributes :id, :name, :email

  def name
    "#{object.first_name} #{object.last_name}"
  end
end
```

---

## Secure Password

Include `ActiveModel::SecurePassword` for password hashing with bcrypt.

```ruby
class User
  include ActiveModel::SecurePassword

  attr_accessor :password_digest

  has_secure_password

  # Optional: validations
  has_secure_password validations: false
end

user = User.new
user.password = "secret"
user.password_digest  # => "$2a$10$..."
user.authenticate("secret")  # => user
user.authenticate("wrong")   # => false
```

### With Confirmations
```ruby
user.password = "secret"
user.password_confirmation = "secret"
user.valid?  # => true
```

---

## Full Example: Form Object

```ruby
class RegistrationForm
  include ActiveModel::API
  include ActiveModel::Validations

  attr_accessor :name, :email, :password, :password_confirmation

  validates :name, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, presence: true, confirmation: true, length: { minimum: 8 }

  def save
    return false unless valid?

    User.create!(
      name: name,
      email: email,
      password: password
    )
  end
end

# In controller
def create
  @form = RegistrationForm.new(form_params)

  if @form.save
    redirect_to root_path, notice: "Registration successful"
  else
    render :new, status: :unprocessable_entity
  end
end
```
