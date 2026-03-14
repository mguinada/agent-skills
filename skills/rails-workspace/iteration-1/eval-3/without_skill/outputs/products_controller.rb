# frozen_string_literal: true

# API Controller for listing products with pagination and token authentication
# Inherits from ActionController::API for API-only controller pattern
class Api::V1::ProductsController < ActionController::API
  before_action :authenticate_request

  # GET /api/v1/products
  # Returns a paginated list of products as JSON
  #
  # Parameters:
  #   page     - Page number (default: 1)
  #   per_page - Items per page (default: 20, max: 100)
  #
  # Headers:
  #   X-API-Key - API token for authentication
  #
  # Response:
  #   {
  #     "products": [...],
  #     "meta": {
  #       "current_page": 1,
  #       "per_page": 20,
  #       "total_pages": 5,
  #       "total_count": 100
  #     }
  #   }
  def index
    products = Product.page(page).per(per_page)

    render json: {
      products: products.map { |product| product_json(product) },
      meta: pagination_meta(products)
    }
  end

  private

  # Authenticates the request using X-API-Key header
  # Returns 401 Unauthorized if the API key is missing or invalid
  def authenticate_request
    api_key = request.headers['X-API-Key']

    if api_key.blank?
      render json: { error: 'API key is required' }, status: :unauthorized
      return
    end

    unless valid_api_key?(api_key)
      render json: { error: 'Invalid API key' }, status: :unauthorized
    end
  end

  # Validates the provided API key
  # In a real application, this would check against a database or cache
  #
  # @param api_key [String] The API key from the request header
  # @return [Boolean] true if the API key is valid
  def valid_api_key?(api_key)
    # Compare against configured valid API keys
    # Using ActiveSupport::SecurityUtils.secure_compare to prevent timing attacks
    valid_keys = Rails.application.config.api_keys || [ENV.fetch('API_KEY', nil)]

    valid_keys.any? do |valid_key|
      ActiveSupport::SecurityUtils.secure_compare(api_key, valid_key)
    end
  end

  # Returns the requested page number
  # Defaults to 1 if not provided
  #
  # @return [Integer] The page number
  def page
    @page ||= [params[:page].to_i, 1].max
  end

  # Returns the requested items per page
  # Defaults to 20, maximum of 100
  #
  # @return [Integer] The number of items per page
  def per_page
    @per_page ||= [[params[:per_page].to_i, 100].min, 1].max
    @per_page = 20 if @per_page.zero?
    @per_page
  end

  # Serializes a single product to JSON-compatible hash
  #
  # @param product [Product] The product to serialize
  # @return [Hash] The serialized product
  def product_json(product)
    {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.to_s, # Convert Decimal to String for JSON
      sku: product.sku,
      stock_quantity: product.stock_quantity,
      active: product.active,
      created_at: product.created_at.iso8601,
      updated_at: product.updated_at.iso8601
    }
  end

  # Builds pagination metadata
  #
  # @param collection [Pagy::Collection, Kaminari::Page] The paginated collection
  # @return [Hash] Pagination metadata
  def pagination_meta(collection)
    {
      current_page: collection.current_page,
      per_page: per_page,
      total_pages: collection.total_pages,
      total_count: collection.total_count
    }
  end
end
