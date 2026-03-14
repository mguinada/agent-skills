# app/controllers/api/v1/products_controller.rb
module Api
  module V1
    class ProductsController < ApplicationController
      # API-only controller pattern - inherit from ActionController::API if available
      # If ApplicationController inherits from ActionController::API, this works automatically

      before_action :authenticate_api_key

      # GET /api/v1/products
      # GET /api/v1/products?page=1&per_page=20
      def index
        products = Product.page(page_param).per(per_page_param)

        # Set pagination headers for API clients
        response.set_header('X-Total-Count', products.total_count)
        response.set_header('X-Total-Pages', products.total_pages)
        response.set_header('X-Current-Page', products.current_page)
        response.set_header('X-Per-Page', products.limit_value)

        render json: products
      end

      private

      # Basic token authentication via X-API-Key header
      def authenticate_api_key
        api_key = request.headers['X-API-Key']

        # Find client/application by API key
        # Adjust the model and attribute names based on your authentication setup
        @current_client = Client.find_by(api_key: api_key, active: true)

        unless @current_client
          render json: { error: 'Invalid or missing API key' }, status: :unauthorized
        end
      end

      # Pagination parameters with defaults
      def page_param
        params.fetch(:page, 1).to_i
      end

      def per_page_param
        per_page = params.fetch(:per_page, 20).to_i
        # Limit maximum per_page to prevent abuse
        [per_page, 100].min
      end
    end
  end
end
