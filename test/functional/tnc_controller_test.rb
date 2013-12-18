require 'test_helper'

class TncControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
  end

end
