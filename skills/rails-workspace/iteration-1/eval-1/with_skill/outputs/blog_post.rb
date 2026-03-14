# app/models/blog_post.rb
class BlogPost < ApplicationRecord
  # Validations
  validates :title, presence: true, length: { minimum: 5 }
  validates :body, presence: true

  # Scopes
  scope :published, -> { where.not(published_at: nil) }
end
