class CrawlerController < ApplicationController
  layout false
  require 'net/http'
  require 'uri'
  def crawlhome
    @data = JSON.parse(Net::HTTP.get('services.whatsonindia.com', "/UserStar/UserStarHost.svc/ExclusiveList?call=ExclusiveList&apikey=a01a0380ca3c61428c26a231f0e49a09&programmeimagesize=xlarge&channelimagesize=xlarge&imagesize=xlarge&context=custid%3D1%3Bmsisdn%3D222%3Bheadendid%3D0%3Bapplicationname%3Dwebsite&mode=exclusiveList&pageno=1&responseformat=json&responselanguage=English&userid=-1"))
  end

  def crawltvlistings
   @data = JSON.parse(Net::HTTP.get('services.whatsonindia.com',"/UserStar/UserStarHost.svc/TVGuideDetailed?call=TVGuideDetailed&apikey=8a1e808b55fde9455cb3d8857ed88389&context=applicationname%3Dsourcebits%3Bheadendid%3D0&programmeimagesize=Large&channelimagesize=Large&Imagesize=Large&channelgenre=all&dateselected=0&mode=getTVGuideInfo&pageno=1&responseformat=json&responselanguage=English&starthour=0&totalhrdata=24"))
  end

  def crawlmovies
    fromdatetime = Time.now.year.to_s + "-" + Time.now.month.to_s + "-" + Time.now.day.to_s
    todatetime =  Time.now.year.to_s + "-" + Time.now.month.to_s + "-" + (Time.now.day + 4).to_s
    @data = JSON.parse(Net::HTTP.get('services.whatsonindia.com',"/UserStar/UserStarHost.svc/AllMovies?call=AllMovies&apikey=dd45045f8c68db9f54e70c67048d32e8&pageno=1&context=applicationname%3Dwebsite%3Bheadendid%3D0&fromdatetime=#{fromdatetime}&todatetime=#{todatetime}&productionstartyear=2004&productionendyear=2015&programmeimagesize=xxlarge&castname=&isfavMovies=false&mode=getAllMovies&noCache=1389683687038&responseformat=json&responselanguage=English"))
  end

  def crawlvideos
    @data = JSON.parse(Net::HTTP.get('services.whatsonindia.com',"/UserStar/UserStarHost.svc/VideosByFilter?call=VideosByFilter&apikey=53adaf494dc89ef7196d73636eb2451b&pageno=1&context=custid%3D1%3Bmsisdn%3D222%3Bheadendid%3D0%3Bapplicationname%3Dwebsite&filtertype=popular&channelname=&videogenre=&programmeImageSize=xxlarge&mode=getAllVideos&noCache=1389685706035&responseformat=json&responselanguage=English"))
  end

  def crawlchannels
    @data = JSON.parse(Net::HTTP.get('services.whatsonindia.com',"/UserStar/UserStarHost.svc/FeaturedProgramme?call=FeaturedProgramme&apikey=06138bc5af6023646ede0e1f7c1eac75&programmeimagesize=xxlarge&channelimagesize=xxlarge&imagesize=xxlarge&applicationname=website&operatorid=0&context=custid%3D1%3Bmsisdn%3D222%3Bheadendid%3D0%3Bapplicationname%3Dwebsite&mode=featuredProgramme&pageno=1&responseformat=json&responselanguage=English"))
  end

  def crawlmobileapps

  end

  def crawlprogram
    programename = URI.encode(params[:programename].gsub("-", " ").gsub("~", "-").gsub("$", "/"))
    result = JSON.parse(Net::HTTP.get('services.whatsonindia.com',"/UserStar/UserStarHost.svc/ProgrammeIDByName?call=SingleChannelIDByName&apikey=a4d2f0d23dcc84ce983ff9157f8b7f88&responseformat=json&responselanguage=English&context=custid%3D1%3Bmsisdn%3D222%3Bheadendid%3D0%3Bapplicationname%3Dwebsite&programmename=#{programename}&mode=getProgrammeid&pageno=1"))
    result = result["getprogrammeidbyname"]["programmeidbyname"]["programmeid"]
    @data = JSON.parse(Net::HTTP.get('services.whatsonindia.com', "/userstar/userstarHost.svc/FullProgrammeDetail?call=FullProgrammeDetail&apikey=74071a673307ca7459bcf75fbd024e09&responseformat=json&responselanguage=English&context=custid%3D1%3Bmsisdn%3D222%3Bheadendid%3D0%3Bapplicationname%3Dwebsite&pageno=1&programmeimagesize=large&channelimagesize=large&imagesize=large&programmeid=#{result}&starttime=&mode=fullProgrammeDetail"))
    @has_actor = false
    if !@data["getfullprogrammedetails"]["fullprogrammedetails"]["actor"].nil?
      @has_actor = true
      @actors=@data["getfullprogrammedetails"]["fullprogrammedetails"]["actor"].split(",")
    end
    @similarprogrames = JSON.parse(Net::HTTP.get('services.whatsonindia.com', "/UserStar/UserStarHost.svc/SimilarProgramme?call=SimilarProgramme&apikey=950a4152c2b4aa3ad78bdd6b366cc179&responseformat=json&responselanguage=English&pageno=1&context=custid%3D1%3Bmsisdn%3D222%3Bheadendid%3D0%3Bapplicationname%3Dwebsite&programmeimagesize=large&channelimagesize=large&imagesize=large&programmeid=#{result}&mode=similarProgrammes"))
  end

  def crawlchannel
    channelname = URI.encode(params[:channelname].gsub("-", " ").gsub("~", "-").gsub("$", "/"))
    result = JSON.parse(Net::HTTP.get('services.whatsonindia.com', "/UserStar/UserStarHost.svc/SingleChannelIDByName?call=SingleChannelIDByName&apikey=6a61d423d02a1c56250dc23ae7ff12f3&responseformat=json&responselanguage=English&context=custid%3D1%3Bmsisdn%3D222%3Bheadendid%3D0%3Bapplicationname%3Dwebsite&channelname=#{channelname}&mode=getChannelid&pageno=1"))
    result = result["getsinglechannelidbyname"]["singlechannelidbyname"]["channelid"]
    @data = JSON.parse(Net::HTTP.get('services.whatsonindia.com', "/UserStar/UserStarHost.svc/SingleChannelDetail?call=SingleChannelDetail&apikey=352fe25daf686bdb4edca223c921acea&responseformat=json&responselanguage=English&pageno=1&channelimagesize=large&channelid=#{result}&context=custid%3D1%3Bmsisdn%3D222%3Bheadendid%3D0%3Bapplicationname%3Dwebsite%3Bipaddress%3D127.0.0.1%3Buseragent%3DMozilla%2F5.0+%28X11%2C+Linux+i686%29+AppleWebKit%2F537.36+%28KHTML%2C+like+Gecko%29+Chrome%2F28.0.1500.95+Safari%2F537.36&mode=channelDetails"))
    @similarchannels = JSON.parse(Net::HTTP.get('services.whatsonindia.com', "/UserStar/UserStarHost.svc/SimilarChannels?call=SimilarChannels&apikey=839ab46820b524afda05122893c2fe8e&responseformat=json&responselanguage=English&pageno=1&context=custid%3D1%3Bmsisdn%3D222%3Bheadendid%3D0%3Bapplicationname%3Dwebsite&channelimagesize=large&imagesize=large&channelid=#{result}&mode=similarChannels"))
    @popularprogrammes = JSON.parse(Net::HTTP.get('services.whatsonindia.com', "/UserStar/UserStarHost.svc/TopProgrammeForChannel?call=TopProgrammeForChannel&apikey=f90f2aca5c640289d0a29417bcb63a37&responseformat=json&responselanguage=English&context=custid%3D1%3Bmsisdn%3D222%3Bheadendid%3D0%3Bapplicationname%3Dwebsite&pageno=1&programmeimagesize=large&channelimagesize=large&imagesize=large&channelid=#{result}&languagename=English&hybridgenre=All&mode=channelPopularPrograms"))
  end

  def crawlactor
    actorname = URI.encode(params[:actorname].gsub("-", " ").gsub("~", "-").gsub("$", "/"))
    result = JSON.parse(Net::HTTP.get('services.whatsonindia.com', "/UserStar/UserStarHost.svc/CastIDByName?call=CastIDByName&apikey=bdf3f54642b2d80f8e87b6474eaaad11ece8058a&responseformat=json&responselanguage=English&context=custid%3D1%3Bmsisdn%3D222%3Bheadendid%3D0%3Bapplicationname%3Dwebsite&castname=#{actorname}&mode=getActorId&pageno=1"))
    result = result["getcastid"]["castidbyname"]["castid"]
    @data = JSON.parse(Net::HTTP.get('services.whatsonindia.com', "/UserStar/UserStarHost.svc/CastDetails?apikey=375f9609c9962cce0ad6ccaaabd80362ecd2b07f&responseformat=json&responselanguage=english&context=custid=1;msisdn=222;headendid=0;applicationname=website&castid=#{result}"))
    @similaractors = JSON.parse(Net::HTTP.get('services.whatsonindia.com', "/UserStar/UserStarHost.svc/SimilarCasts?call=SimilarCasts&apikey=731df0fc93417f72fcb56f09cd754f9382ae6373&context=custid%3D1%3Bmsisdn%3D222%3Bheadendid%3D0%3Bapplicationname%3Dwebsite&userid=1&responseformat=json&responselanguage=English&castid=#{result}&mode=SimilarActor&pageno=1"))
    @acotsmovie = JSON.parse(Net::HTTP.get('services.whatsonindia.com', "/UserStar/UserStarHost.svc/CastProgrammesByGenre?call=CastProgrammesByGenre&apikey=0ad54e429b2b6238550f24701541130b978e4640&context=custid%3D1%3Bmsisdn%3D222%3Bheadendid%3D0%3Bapplicationname%3Dwebsite&genre=film&imagesize=medium&pageno=1&userid=1&castid=#{result}&mode=MoviesByActor&responseformat=json&responselanguage=English"))
  end

end
