class ApiDemoController < ApplicationController
  def index
    render :json => {:name => "foo", :foo => "bar"}
  end
end
