# config/routes.rb
Rails.application.routes.draw do
  # API version 1 namespace
  namespace :api do
    namespace :v1 do
      # Products endpoint - only index action for listing products
      resources :products, only: [:index]
    end
  end
end
