# config/routes.rb
Rails.application.routes.draw do
  # Registration routes for user sign up and account management
  # Generates:
  #   GET    /registrations/new    => registrations#new
  #   POST   /registrations        => registrations#create
  #   PATCH  /registrations/:id    => registrations#update
  #   PUT    /registrations/:id    => registrations#update
  resources :registrations, only: %i[new create update]
end
