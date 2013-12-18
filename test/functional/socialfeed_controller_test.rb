require 'test_helper'

class SocialfeedControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
  end

end
