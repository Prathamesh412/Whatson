class IpController < ApplicationController

	def index
		render :json => request.remote_ip
	end
end