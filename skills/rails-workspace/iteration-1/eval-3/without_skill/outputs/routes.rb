# frozen_string_literal: true

# Rails API Routes Configuration
# Add these routes to your config/routes.rb file

Rails.application.routes.draw do
  # API Version 1 Routes
  namespace :api do
    namespace :v1 do
      # Products API endpoint
      # GET /api/v1/products - List all products with pagination
      resources :products, only: [:index]
    end
  end
end

# Alternative: If using versioned API with constraints
#
# Rails.application.routes.draw do
#   namespace :api do
#     namespace :v1, constraints: { format: 'json' } do
#       resources :products, only: [:index]
#     end
#   end
# end

# Alternative: If using API-only mode with subdomain constraints
#
# Rails.application.routes.draw do
#   constraints subdomain: 'api' do
#     scope module: 'api' do
#       namespace :v1 do
#         resources :products, only: [:index]
#       end
#     end
#   end
# end
