# frozen_string_literal: true

class RegistrationsController < ApplicationController
  # GET /registrations/new
  def new
    @user = User.new
  end

  # POST /registrations
  def create
    @user = User.new(user_params)

    if @user.save
      redirect_to @user, notice: 'Registration successful. Welcome!'
    else
      render :new, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /registrations/:id
  def update
    @user = User.find(params[:id])

    if @user.update(user_params)
      redirect_to @user, notice: 'Registration updated successfully.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  private

  # Strong parameters for user registration
  def user_params
    params.require(:user).permit(
      :email,
      :password,
      :password_confirmation,
      :first_name,
      :last_name,
      :username
    )
  end
end
