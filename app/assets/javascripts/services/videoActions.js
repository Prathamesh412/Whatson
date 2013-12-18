woi.service('videoActions',['$rootScope', 'userAPI' , 'recoAPI', function($rootScope, userAPI, recoAPI){

  this.toggleWatchList = function(video, callback){
    // check if user is logged
    if(!$rootScope.isUserLogged()){
      // call login window

      return false;
    }
    var params = {
      userid: $rootScope.getUser().userid,
      contenttype: 'video', 
      contented: 0, 
      videoid: video.videoid
    };

    //toggles add/remove in watchlist
    params.watchliststatus = (video.iswatchlist =='0') ? true : false;
    userAPI.toggleWatchlist(params, function(rs){
      if (callback && typeof(callback) === "function") {
        callback(rs);
      }
    });
  };


  this.toggleFavoriteProgramme = function(video, callback) {
    if(!$rootScope.isUserLogged()){
      //should also calls login window
      return false;
    }
    var params = {
      userid: $rootScope.getUser().userid, 
      programmeid: video.programmeid
    };
    //toggles add/remove from favorite
    params.like = (video.isfavorite =='0') ? true : false;
    userAPI.toggleFavoriteProgramme(params, function(rs){
      if (callback && typeof(callback) === "function") {
        callback(rs);
      }
    });
  };

  this.toggleReminder = function(video, callback) {
    if(!$rootScope.isUserLogged()){
      //should also calls login window
      return false;
    }

    var params = {
      userid: $rootScope.getUser().userid, 
      channelid: video.channelid, 
      programmeid: video.programmeid, 
      //starttime: video.starttime,  //(Format: yyyymmddhhmm ; hhmm in 24 hrs format)
      starttime: 201212141230,  //(Format: yyyymmddhhmm ; hhmm in 24 hrs format)
      priortimeinminutes: 5, //(possible values – 5,15,30, 60, 120) 
      ismailreminder: true,  //if email available or provided
      issmsreminder: true, 
      isdevicereminder:false,  //false for devices like tablet/phones
      isrecurring: false
    };
    userAPI.addReminder(params, function(rs) {
      if (callback && typeof(callback) === "function") {
        callback(rs);
      }
    });
  };

}]);
