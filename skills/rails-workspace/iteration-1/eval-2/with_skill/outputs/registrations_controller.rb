# app/controllers/registrations_controller.rb
class RegistrationsController < ApplicationController
  before_action :set_user, only: [:update]

  # GET /registrations/new
  def new
    @user = User.new
  end

  # POST /registrations
  def create
    @user = User.new(user_params)

    if @user.save
      redirect_to @user, notice: "Registration successful. Welcome!"
    else
      render :new, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /registrations/:id
  def update
    if @user.update(user_params)
      redirect_to @user, notice: "Account updated successfully."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  # Strong parameters for user registration
  def user_params
    params.expect(user: [:email, :password, :password_confirmation, :name])
  end
end
