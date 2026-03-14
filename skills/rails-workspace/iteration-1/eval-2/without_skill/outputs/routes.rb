# frozen_string_literal: true

Rails.application.routes.draw do
  # Registration routes
  resource  :registration, only: %i[new create]
  resources :registrations, only: %i[update]

  # Or alternatively, as a singular resource for the current user's registration:
  # resource :registration, only: %i[new create update]
end
