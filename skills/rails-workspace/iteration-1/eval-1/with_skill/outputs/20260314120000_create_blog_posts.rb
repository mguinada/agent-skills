class CreateBlogPosts < ActiveRecord::Migration[8.1]
  def change
    create_table :blog_posts do |t|
      t.string :title, null: false
      t.text :body, null: false
      t.datetime :published_at

      t.timestamps
    end
  end
end
