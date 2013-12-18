require "openssl"
require 'digest/sha2'
require 'base64'

class IndexController < ApplicationController
	def index()
		@alg = "AES-256-CBC"

		aes = OpenSSL::Cipher::Cipher.new(@alg)
	  	aes.encrypt
		key = aes.random_key
		@pki = Base64.encode64(key).gsub(/\n/, '')

		session[:key] = key
	end
end
