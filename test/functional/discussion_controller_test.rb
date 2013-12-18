require 'test_helper'

class DiscussionControllerTest < ActionController::TestCase
  test "should get home" do
    get :home
    assert_response :success
  end

  test "should get newdiscussion" do
    get :newdiscussion
    assert_response :success
  end

end
