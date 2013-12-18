class MyaccountController < ApplicationController
	def index
	end

    def create
	    name = params[:upload][:file].original_filename
	    name = Time.new.strftime('%s') + params[:userid] + "." + name.match(/\S*\.(\w*)/)[1]
	    directory = "public/images/upload/"
	    path = File.join(directory, name)
	    File.open(path, "wb") { |f| f.write(params[:upload][:file].read) }
	    # render :json => {:imageName => name}, :content_type => "text/html"
	    render :json => {:imageName => name}, :content_type => "text/html"
  	end
end
