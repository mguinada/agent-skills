# Rails Migrations Reference

Detailed patterns for database migrations.

## Table of Contents
- [Creating Migrations](#creating-migrations)
- [Writing Migrations](#writing-migrations)
- [Column Types](#column-types)
- [Indexes](#indexes)
- [Foreign Keys](#foreign-keys)
- [Reversible Migrations](#reversible-migrations)
- [Running Migrations](#running-migrations)
- [Schema Files](#schema-files)

---

## Creating Migrations

### Generator Commands
```bash
# Create table
rails generate migration CreateArticles title:string body:text

# Add column
rails generate migration AddStatusToArticles status:string

# Remove column
rails generate migration RemoveStatusFromArticles status:string

# Add reference (foreign key)
rails generate migration AddUserToArticles user:references

# Add multiple columns
rails generate migration AddDetailsToArticles author:string published_at:datetime

# Create join table
rails generate migration CreateJoinTableArticlesTags article tag
```

### Naming Conventions
- `CreateXXX` — Creates a new table
- `AddXXXToYYY` — Adds columns to table YYY
- `RemoveXXXFromYYY` — Removes columns from table YYY
- Migration filename: `YYYYMMDDHHMMSS_description.rb`

---

## Writing Migrations

### create_table
```ruby
def change
  create_table :articles do |t|
    t.string :title, null: false
    t.text :body
    t.string :status, default: 'draft'
    t.integer :views, default: 0
    t.boolean :featured, default: false
    t.references :user, foreign_key: true
    t.timestamps
  end
end

# With custom primary key
create_table :articles, primary_key: :article_id do |t|
  t.string :title
end

# Without primary key (for join tables)
create_table :articles_tags, id: false do |t|
  t.references :article, foreign_key: true
  t.references :tag, foreign_key: true
end
```

### change_table
```ruby
def change
  change_table :articles do |t|
    t.string :author          # Add column
    t.remove :views           # Remove column
    t.change :status, :string # Change type
    t.rename :title, :headline  # Rename column
  end
end
```

### add_column
```ruby
def change
  add_column :articles, :status, :string
  add_column :articles, :views, :integer, default: 0, null: false
  add_column :articles, :metadata, :json
end
```

### remove_column
```ruby
def change
  remove_column :articles, :status
  remove_column :articles, :status, :string  # Specify type for rollback
end
```

### change_column
```ruby
def change
  change_column :articles, :views, :bigint
  change_column :articles, :status, :string, default: 'draft'
  change_column_null :articles, :title, false  # NOT NULL
  change_column_default :articles, :status, 'draft'
end
```

### rename_column
```ruby
def change
  rename_column :articles, :title, :headline
end
```

### drop_table
```ruby
def change
  drop_table :articles
end

# With block for rollback
def change
  drop_table :articles do |t|
    t.string :title
    t.text :body
    t.timestamps
  end
end
```

---

## Column Types

### Available Types
```ruby
t.string :name                     # varchar(255)
t.text :description                # text
t.integer :count                   # integer
t.bigint :views                    # bigint
t.float :rating                    # float
t.decimal :price, precision: 10, scale: 2  # decimal
t.boolean :active, default: false  # boolean
t.date :published_on               # date
t.datetime :published_at           # datetime
t.timestamp :created               # timestamp
t.time :start_time                 # time
t.binary :data                     # blob
t.json :metadata                   # json
t.jsonb :settings                  # jsonb (PostgreSQL)
t.hstore :properties               # hstore (PostgreSQL)
t.uuid :identifier                 # uuid (PostgreSQL)
t.cidr :network                    # cidr (PostgreSQL)
t.inet :ip_address                 # inet (PostgreSQL)
t.macaddr :mac                     # macaddr (PostgreSQL)
t.point :location                  # point (PostgreSQL)
t.geometry :shape                  # geometry (PostgreSQL)
t.array :tags                      # array (PostgreSQL)
```

### Column Options
```ruby
t.string :title,
  limit: 100,           # Maximum length
  default: 'Untitled',  # Default value
  null: false,          # NOT NULL constraint
  collation: 'utf8mb4', # Character set
  comment: 'Article title'  # Column comment (MySQL, PostgreSQL)
```

### References
```ruby
t.references :user                    # user_id (bigint)
t.references :user, foreign_key: true # With FK constraint
t.references :user, type: :integer    # Use integer instead of bigint
t.references :commentable, polymorphic: true  # For polymorphic
```

---

## Indexes

### add_index
```ruby
def change
  # Single column
  add_index :articles, :title

  # Multiple columns
  add_index :articles, [:user_id, :status]

  # Unique index
  add_index :users, :email, unique: true

  # Named index
  add_index :articles, :title, name: 'idx_articles_title'

  # Index with conditions (PostgreSQL, MySQL)
  add_index :articles, :title, where: "status = 'published'"

  # Index with length (MySQL)
  add_index :articles, :title, length: 50

  # Index order
  add_index :articles, [:user_id, :created_at], order: { created_at: :desc }
end
```

### In create_table
```ruby
create_table :articles do |t|
  t.string :title
  t.index :title
  t.index [:user_id, :status], unique: true
end
```

### remove_index
```ruby
def change
  remove_index :articles, :title
  remove_index :articles, column: [:user_id, :status]
  remove_index :articles, name: 'idx_articles_title'
end
```

---

## Foreign Keys

### add_foreign_key
```ruby
def change
  add_foreign_key :articles, :users

  # With options
  add_foreign_key :articles, :users,
    column: :author_id,           # Custom column name
    primary_key: :user_id,        # Custom PK
    name: :fk_articles_author,    # Named constraint
    on_delete: :cascade,          # Delete articles when user deleted
    on_update: :cascade           # Update FK when user PK changes
end
```

### In create_table
```ruby
create_table :articles do |t|
  t.references :user, foreign_key: true
  t.references :category, foreign_key: { on_delete: :nullify }
end
```

### remove_foreign_key
```ruby
def change
  remove_foreign_key :articles, :users
  remove_foreign_key :articles, column: :author_id
  remove_foreign_key :articles, name: :fk_articles_author
end
```

---

## Reversible Migrations

### Using change
```ruby
# Most methods auto-reverse
def change
  add_column :articles, :status, :string  # Reversible
  create_table :articles do |t| ... end   # Reversible
end
```

### Using up/down
```ruby
# For complex changes that can't auto-reverse
def up
  add_column :articles, :status, :string
  Article.update_all(status: 'draft')
end

def down
  remove_column :articles, :status
end
```

### revert
```ruby
def change
  revert do
    add_column :articles, :status, :string
  end
end

# Revert a previous migration
def change
  revert CreateArticlesMigration
end
```

### reversible
```ruby
def change
  reversible do |dir|
    dir.up do
      # Code for migrating up
      Article.find_each { |a| a.update!(slug: a.title.parameterize) }
    end
    dir.down do
      # Code for migrating down
      Article.update_all(slug: nil)
    end
  end
end
```

---

## Running Migrations

### Commands
```bash
# Run pending migrations
rails db:migrate

# Run for specific environment
rails db:migrate RAILS_ENV=production

# Run up to specific version
rails db:migrate VERSION=20240101000000

# Rollback last migration
rails db:rollback

# Rollback multiple
rails db:rollback STEP=3

# Rollback to specific version
rails db:migrate:down VERSION=20240101000000

# Redo last migration (rollback + migrate)
rails db:migrate:redo

# Reset database
rails db:drop db:create db:migrate

# Check migration status
rails db:migrate:status

# Prepare database (create + migrate)
rails db:prepare
```

### Migration Status
```bash
$ rails db:migrate:status

database: db/development.sqlite3

 Status   Migration ID    Migration Name
--------------------------------------------------
   up     20240101000001  Create articles
   up     20240102000001  Add status to articles
  down    20240103000001  Add index to articles
```

---

## Schema Files

### schema.rb
- Default, database-agnostic representation
- Updated automatically after migrations
- Used for tests and new developers
- `config.active_record.schema_format = :ruby` (default)

### structure.sql
- Raw SQL dump of database
- Preserves database-specific features
- Use when: views, stored procedures, triggers, partial indexes
- `config.active_record.schema_format = :sql`

### Load Schema
```bash
rails db:schema:load    # Load schema.rb
rails db:structure:load # Load structure.sql
```

---

## Data Migrations

Best practice: Keep schema migrations separate from data migrations.

### In Migration File
```ruby
class PopulateDefaultCategories < ActiveRecord::Migration[8.1]
  def up
    Category.create!([
      { name: 'Technology' },
      { name: 'Business' },
      { name: 'Lifestyle' }
    ])
  end

  def down
    Category.where(name: ['Technology', 'Business', 'Lifestyle']).delete_all
  end
end
```

### Using rake task (Alternative)
```ruby
# lib/tasks/data.rake
namespace :data do
  desc "Populate default categories"
  task populate_categories: :environment do
    Category.create!([
      { name: 'Technology' },
      { name: 'Business' }
    ])
  end
end

# Run with: rails data:populate_categories
```

---

## Best Practices

1. **Keep migrations small and focused** — One change per migration
2. **Always test rollback** — Ensure `down` works
3. **Use reversible methods when possible** — `change` over `up/down`
4. **Avoid model classes in migrations** — Use raw SQL if needed
5. **Don't modify existing migrations** — Create new ones
6. **Include data migrations carefully** — Can slow down deployment
7. **Use indexes for foreign keys** — Speed up joins
8. **Consider null constraints** — Before adding NOT NULL with default
