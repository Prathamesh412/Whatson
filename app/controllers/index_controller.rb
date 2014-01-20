require "openssl"
require 'digest/sha2'
require 'base64'

class IndexController < ApplicationController
  def index()
    if params['_escape_fragment_'] == '/Home'
      redirect_to :controller=>'crawler', :action => 'crawlhome'
    elsif params['_escape_fragment_'] == '/Tv-Listings'
      redirect_to :controller=>'crawler', :action => 'crawltvlistings'
    elsif params['_escape_fragment_'] == '/Movies'
      redirect_to :controller=>'crawler', :action => 'crawlmovies'
    elsif params['_escape_fragment_'] == '/Videos'
      redirect_to :controller=>'crawler', :action => 'crawlvideos'
    elsif params['_escape_fragment_'] == '/Channels'
      redirect_to :controller=>'crawler', :action => 'crawlchannels'
    elsif params['_escape_fragment_'] == '/Mobile-Apps'
      redirect_to :controller=>'crawler', :action => 'crawlmobileapps'
    elsif params['_escape_fragment_'] =~ /\/actor(.*)/
      redirect_to :controller=>'crawler', :action => 'crawlactor' , :actorname => params['_escape_fragment_'].split("/").last
    elsif params['_escape_fragment_'] =~ /\/program(.*)/
      redirect_to :controller=>'crawler', :action => 'crawlprogram' , :programename => params['_escape_fragment_'].split("/").last
    elsif params['_escape_fragment_'] =~ /\/channel(.*)/
      redirect_to :controller=>'crawler', :action => 'crawlchannel', :channelname => params['_escape_fragment_'].split("/").last
    end
    @alg = "AES-256-CBC"

    aes = OpenSSL::Cipher::Cipher.new(@alg)
    aes.encrypt
    key = aes.random_key
    @pki = Base64.encode64(key).gsub(/\n/, '')
    session[:key] = key
  end
end
