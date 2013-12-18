require 'test_helper'

class CorporateControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
  end

end
