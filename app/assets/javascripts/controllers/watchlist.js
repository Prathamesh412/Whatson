woi.controller("WatchlistController",["$rootScope","$scope","userAPI","$location","$filter","$timeout","$http",function($rootScope,$scope,userAPI,$location,$filter,$timeout,$http){

    $scope.changeurl= function(url,element){
        var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");            //Prathamesh Changes for programme
        $location.path("programme/" + str);
        element.stopPropagation();
        element.preventDefault();

    };

    $scope.changechannelurl= function(url,element){
        var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");            //Prathamesh Changes for  channel
        $location.path("channel/" + str);
        element.stopPropagation();
        element.preventDefault();

    };



    $scope.watchlist  = [];
    $scope.end  = false;
    $scope.watchlistPage = 1;
    $scope.showHideButton = true;
    $scope.editMode = false;
    $rootScope.apiCalled = false;
    $rootScope.editMode = false;
    $rootScope.watchlistCount = 0;
    $scope.isLoading;
    var loading = $filter('loading');

    // Sorts given array based on the starttime
    var sortByDate = function(list){
      return _.sortBy(list,function(item){
          return Date.parse(item.starttime);
      });
    }

    // Generates the loading indicator for watchlist 
    var imageLoadingIndicator = function(){
      var loading = $filter('loading');
      var $element = $('.watchlist-spinner');
      var $watchlistText = $('span.mywatchlist');
      var $watchlistBtn = $('#watchList');
      var watchlistValue = $watchlistText.text();
      console.log('imageLoadingIndicator');
      console.log(watchlistValue);
      $watchlistText.text('MY WATCHLIST');
      loading('hide',{element: $element});
      $watchlistBtn.removeClass('active');
    }

    // Function to fetch watchlist data based on pageno and populate the slider.
    $scope.fetchUserWatchlist = function(pageno){
      $scope.isLoading = true;
        userAPI.myWatchlist({userid:$rootScope.getUser().userid,pageno:pageno}, function(r) {
          $scope.isLoading = true;
          if (_.isNull(r.watchlistdata)) {
            if(pageno == 1){
             $scope.watchlist = [];
             $scope.watchlistCount = 0;
            }
            if (!$rootScope.apiCalled && pageno == 1){
                if(!_.isUndefined($rootScope.watchlistClicked) && $rootScope.watchlistClicked){
                  $rootScope.$broadcast("watchlist::click");
                  imageLoadingIndicator();
                }
                $rootScope.apiCalled = true;
              }
            return false;
          }
          if (!_.isUndefined(r.watchlistdata.watchlist)){
            var rawData = [];
            var tempWatchlist = $scope.watchlist;

            if (_.isArray(r.watchlistdata.watchlist))
              rawData = r.watchlistdata.watchlist;
            else
              rawData = [r.watchlistdata.watchlist];

            if (pageno == 1) {
              $scope.watchlistCount = parseInt(rawData[0].totalcount);
            }

            if ($scope.watchlist.length == 0 || ($scope.watchlist.length > 0 && pageno == 1))
              $scope.watchlist = rawData;
            else
              _.each(sortByDate(rawData),function(item){
                if (! _.some(tempWatchlist,function(existingItem){ return existingItem.programmeid == item.programmeid; }))
                  $scope.watchlist.push(item);
              });
            $scope.watchlistPage += 1;

          $timeout(function(){

            if (!$rootScope.apiCalled && pageno == 1){
              if(!_.isUndefined($rootScope.watchlistClicked) && $rootScope.watchlistClicked){
                $rootScope.$broadcast("watchlist::click");
                imageLoadingIndicator();
              }
              $rootScope.apiCalled = true;
            }

          },1);

          }else
            $scope.end = true;
        });
        
    }

    
    // Event listener calling fetchUserWatchlist method
    $scope.$on("watchlist::fetch", function(event,pageno){
      $scope.fetchUserWatchlist(pageno);
    });

    // Event listener to add a programme to watchlist slider and to watchlist page.
    $scope.$on("watchlist::add",function(event,item,programmeList){
      $scope.addItemToWatchlist(item);
      $scope.syncFavRemState(item,programmeList);
      if ($location.path() == "/Watchlist") 
        $rootScope.$broadcast("watchlistpage::add",item);
    });

  // Event listener to remove a programme from watchlist slider and watchlist page. 
  $scope.$on("watchlist::remove",function(event,programmeid,fromIcon){
    $scope.removeProgrammeFromWatchlist(programmeid);
    if (!_.isUndefined(fromIcon) && fromIcon) 
      if ($location.path() == "/Watchlist" || $location.path() == "/Watchlistsocial" ) 
        $rootScope.$broadcast("watchlistPage::Programme::remove",programmeid);
  });

  // Event listener to remove items from watchlist based on reminder ans favourites
  $scope.$on("watchlist::FavRem::Remove",function(event,programme,programmeList){

      var multipleReminderSet = false; 
      if (!_.isUndefined(programmeList)) 
        _.each(programmeList,function(item){
          if (item.isreminder == "1") {
            multipleReminderSet = true;
          };
        });

      if (multipleReminderSet)
        return false;

      $scope.syncFavRemState(programme,programmeList);
      if ($location.path() == "/reminders") {
        if (programme.isreminder == 0) {
          $rootScope.$broadcast("watchlistPage::Programme::remove",programme.programmeid);
        }
      }else if ($location.path() == "/favourites") {
        if (programme.isfavorite == 0) {
          $rootScope.$broadcast("watchlistPage::Programme::remove",programme.programmeid);
        }
      }
      if (programme.iswatchlist != 1 && programme.isfavorite == 0 && programme.isreminder == 0){
            $rootScope.$broadcast("watchlistPage::Programme::remove",programme.programmeid);
            $scope.removeProgrammeFromWatchlist(programme.programmeid);
      }
    
  });


  // Function to synchronise the favourite and reminder for a programme.
  $scope.syncFavRemState = function(programme,programmeList){
    _.map($scope.watchlist,function(item){
      if (item.programmeid == programme.programmeid) {
        if (_.isUndefined(programmeList)) 
          item.isfavorite = programme.isfavorite;
        item.isreminder = programme.isreminder;
      }
    });
  };

  // Function to remove a programme from watchlist slider.
  $scope.removeProgrammeFromWatchlist = function(programmeid){
    $scope.watchlist = _.reject($scope.watchlist,function(item){
      return item.programmeid == programmeid;
    });
    $scope.watchlistCount = parseInt($scope.watchlistCount) - 1;


    if ($rootScope.isUserLogged() && $scope.watchlist.length == 0) {
        if ($(".watchlist-excoll").is(":visible") && $location.path() != ("/Watchlist")) {
            $(".watchlist-excoll").slideUp();
            $("#watchList").removeClass("watchlistactive")
        }
    }    
  };


    // Function to add a programme to watchlist
    $scope.addItemToWatchlist = function(item){
      if (!_.some($scope.watchlist,function(listitem){ return listitem.programmeid == item.programmeid})) {
        $scope.watchlist.push(item);
        $scope.watchlistCount = parseInt($scope.watchlistCount) + 1;
        $scope.watchlist = sortByDate($scope.watchlist);
      }
    };

    // Watching the url to watchlist specific changes for watchlist pages
    $scope.$watch(function(){
      return $location.path();
    },function(){
      if ($location.path() == "/Watchlist") {
        if(!$rootScope.isUserLogged()){
          $location.path("/home");
          return false
        }
        // $scope.calendar = buildCalendar();
        if (!$(".watchlist-excoll").hasClass("watchlist-mini")) 
          $(".watchlist-excoll").addClass("watchlist-mini");
        if (!$(".watchlist-excoll").is(":visible")) 
          $(".watchlist-excoll").show();
        if ($("#watchlistSlider").is(":visible")) 
          $("#watchlistSlider").hide();
        if ($(".view-more-watchlist").is(":visible")) 
          $(".view-more-watchlist").hide();  
        if (!$("#watchList").hasClass("watchlistactive")) 
          $("#watchList").addClass("watchlistactive")
        $scope.showHideButton = false;
        $rootScope.$emit("handleResetEmit");

      }else{
        if ($rootScope.watchlistDeleted) {
          $scope.end = false;
          $scope.fetchUserWatchlist(1);
          $rootScope.watchlistDeleted = false;
        }
        if ($(".watchlist-excoll").is(":visible")) {
          $(".watchlist-excoll").hide();
          if ($("#watchList").hasClass("watchlistactive")) {
            $("#watchList").removeClass("watchlistactive")
          }
        }
        if (!$("#watchlistSlider").is(":visible")) 
          $("#watchlistSlider").show();
        if ($(".watchlist-excoll").hasClass("watchlist-mini")) 
          $(".watchlist-excoll").removeClass("watchlist-mini");
        if (!$(".view-more-watchlist").is(":visible")) 
          $(".view-more-watchlist").show();  
        $scope.showHideButton = true;
        $rootScope.editMode = false;
        $scope.editMode = false;
      }

      if ($location.path() == "/Watchlistinfo" && $rootScope.isUserLogged()) {
        $location.path("/Watchlist");
      }

    });


    // Watching watchlist count and synchronising the count between slider and watchlist page. 
    $scope.$watch(function(){
      return $scope.watchlistCount;
    },function(){
      if ($scope.watchlistCount < 0) {
        $scope.watchlistCount = 0;
      }else if($scope.watchlistCount < $scope.watchlist.length){
        $scope.watchlistCount = $scope.watchlist.length;
      }
      $rootScope.watchlistCount = $scope.watchlistCount;
      $rootScope.$broadcast("watchlist::changed");
    });

    // url for watchlist page.
    $scope.getWatchlistUrl = function(){
      return "#!/watchlist/";
    }

    // local function to initiate the population of watchlist slider.
    var populate = function(){
      if ($rootScope.isUserLogged()) {
        $rootScope.$emit("watchlist::fetch", $scope.watchlistPage);
      };
    }

    populate();

    // Watchlist slider sliding functionality
    var $element =   $(".watchlist_slider_list"),
    $slide =     $element.find(".mywatchlist_list");

    var totalWidth = $("body").width();
    $scope.currentSlide = 3;
    var compWidth = 3;
    if (totalWidth < 500) 
      compWidth = 1;
    else if (totalWidth < 800)
      compWidth = 2;

    $scope.currentSlide = compWidth;
    

    $scope.slide = function(forward){
      var newSlide = forward ? $scope.currentSlide + 1 : $scope.currentSlide - 1;
      

      var slideWidth = $slide.find('.list-item').outerWidth() + parseInt($slide.find('.list-item:nth-child(2)').css('margin-left'));

      // check if current slide can be displayed
      // if(newSlide > $scope.watchlist.length || newSlide < 3){
      if(newSlide > $scope.watchlist.length || newSlide < compWidth){
        return false;
       } 
       
      if (forward && newSlide >= ($scope.watchlist.length - 2) && !$scope.end) {
        $rootScope.$emit("watchlist::fetch", $scope.watchlistPage);
      }

      // update current slide
      newSlide == $scope.watchlist.length;
      $scope.currentSlide = newSlide;
      // $slide.animate({left:-((newSlide - 3) * slideWidth) + "px"}, 500);
      if (totalWidth < 500) 
        $slide.animate({left:-(((newSlide - compWidth) * slideWidth) + 10) + "px"}, 500);
      else  
        $slide.animate({left:-((newSlide - compWidth) * slideWidth) + "px"}, 500);
    };



  $scope.openEditMode = function(){
    if ($location.path() == "/Watchlist") {
      $scope.editMode = !$scope.editMode;
      $rootScope.$broadcast("toggleEditMode");
    }else{
      $scope.editMode = true;
      $rootScope.editMode = true;
      $location.path("/Watchlist");
    }

  }

  $scope.shareWatchlist = function(){
    if ($rootScope.getUser().SocialSharing == "true") {
      if ($scope.watchlist.length > 0) {
        FB.login(function(response) {
          if (response.authResponse) {
            // console.log('Welcome!  Fetching your information.... ');
            FB.api('/me', function(response) {
              // console.log('Good to see you, ' + response.name + '.');

                var url = "http://"+ $location.host()+"/#!";
                var shareObj = $scope.watchlist.slice(0,5);
                var content = "Watchout for my customized watchlist at Whats On : \n ";
                _.each(shareObj,function(item,index){
                  content += (index + 1) + ". ";
                    content += "<a href= '" + url + "/program/"+item.programmename.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$")+"'>"+ item.programmename +"</a>  on ";
                    content += "<a href= '" + url + "/channel/"+item.channelname.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$") +"'> "+ item.channelname +"</a> \n";
                });

                 var sharingData = {
                  "subject" : "My Watchlist on What's-On-India",
                  "message" : content,
                  "privary" : "EVERYONE"
                 }           
              FB.api("/me/notes",'post',sharingData,function(response){});
            });
          } else {
            console.log('User cancelled login or did not fully authorize.');
          }
        }, {scope: 'create_note'});
      }
    }else{
      alert("Social Sharing is disabled. Please enable Social Sharing in Myaccounts to share the watchlist");
    }
  }

  $scope.showVideoButton = function(item){
    return !_.isUndefined(item.videoid);
  }
$scope.toggleFavorite = function(p, e, forceRefresh){
    e.preventDefault();
    e.stopPropagation();
    var element = $(e.currentTarget);
    var my = 'top center'

    if(element.attr('data-popover-position'))
      my = element.attr('data-popover-position');

    // verifies if user is logged
    if(!$rootScope.isUserLogged()){
      $rootScope.beforeaction.title = "Login to Favorite";
      $rootScope.beforeaction.subtitle = "Please login to favorite";
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus',
          },
          position:{
            my: my,
            at: 'bottom center',
            adjust:{
              y:5
            }
          },
          style:{
            classes:'popover reminder-popover cside-popover'
          } , 
          events:{
            show:function(){
              element.parent().parent('.thumb').addClass('active');
              element.parent().parent('.minor-details').addClass('active');
              element.addClass('active');
            } ,
            hide:function(){
              element.parent().parent('.thumb').removeClass('active');
              element.parent().parent('.minor-details').removeClass('active');
              element.removeClass('active');
            } 
          }, 
          content: {
            text: '<div class="top left popover-loader signin-loader"></div>',
            ajax: {
              url: "/user/beforeaction",
              type: 'GET',
              data: {},
              success:function(data, status ) {
                var _this = this;
                // Set the content manually (required!)
                $timeout(function(){
                  _this.set('content.text', $compile(data)($scope));
                  $timeout(function(){
                    _this.reposition();
                  });
                });
                $scope.actionObj = {
                  element: element, 
                  popconfig: qtipConfig, 
                  // after log in display the reminde popover
                  success: function(){
                    $scope.toggleFavorite(p, e, true);
                    element.qtip('hide').qtip('destroy');
                  },
                  failure: function() {
                    alert('oopss');
                  }
                };
              }
            }
          }, 
        };
      };
      var qtipConfig = resetQtip();
      element.qtip(qtipConfig).qtip('show');

      return false;

    }
    element.qtip('destroy');


    // API fix for parameters now are camelCase - Using a temp var to send the API request
    var inconsistentApiFix = JSON.stringify(p).toLowerCase();
    var temp = JSON.parse(inconsistentApiFix);

    // shows loading spinner
    element.parent().parent('.thumb').addClass('active');
    element.addClass("loading");
    loading('show', {element: element});

    // API fix for parameter programmeid changed to programid
    if(_.isUndefined( temp.programmeid ))
      temp.programmeid = temp.programid;

    userAPI.toggleFavoriteProgramme({like:(temp.isfavorite == "0"), programmeid:temp.programmeid, userid:$rootScope.getUser().userid}, function(rs){

      if(forceRefresh) {
        location.reload();
        return false;
      }

      // hides loading spinner
      element.removeClass('loading');
      window.setTimeout(function() {
        element.parent().parent('.thumb').removeClass('active');
      }, 1500);
      loading('hide', {element:element});

      // if it fails, display error message
      if(!rs.response.responsestatus){
        alert(rs.response.message);
      } else {
        // change the flag
        p.isfavorite = (p.isfavorite == "0") ? "1" : "0";
    
   
      }
    });

  };  

  $rootScope.$on("watchlist::click",function(event,params){
    $rootScope.watchlistClicked = false;
    if ($scope.watchlist.length > 0) {
      $(".watchlist-excoll").slideDown();
      $("#watchList").addClass("watchlistactive")
    }
    else{
      $location.path("/Watchlist");
      if(!$scope.$$phase) {
        $scope.$apply();
      }
      // $scope.$apply();
    }

  });

  $scope.hideEditButton = function(){
    if ($scope.watchlistCount == 0) {
      if ($scope.editMode) {
        $scope.editMode = false;
        $rootScope.$broadcast("toggleEditMode");
      }
      return true;
    }

    return false;
  }

  $scope.playVideo = function(p){

    $rootScope.playThisVideo = p.videourl;
    $rootScope.playThisVideoObj = p;
    if (_.isUndefined($rootScope.playThisVideo) && !_.isUndefined(p.videoUrl))
      $rootScope.playThisVideo = p.videoUrl;

    $rootScope.playThisVideoObj.videourl = $rootScope.playThisVideo;
    $rootScope.EncodeUrlWithDash(p.programmename,$scope.element,'programme', p.channelid, p.programmeid, p.starttime);
//    $location.path("/programme/"+ p.programmeid +"/channel/"+p.channelid);
  }

}]);

// Controller used in watchlist, watchlistsocial, favourites and reminder page
woi.controller("WatchlistPageController",["$rootScope","$scope","$location","userAPI","$timeout",function($rootScope,$scope,$location,userAPI,$timeout){
  //Initializations

    $scope.changeurl= function(url,element){

       var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");

        $location.path("programme/" + str);

        element.stopPropagation();
        element.preventDefault();

    };

    $scope.changechannelurl= function(url,element){


        var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");

        $location.path("channel/" + str);
        element.stopPropagation();
        element.preventDefault();

    };

  $scope.watchlistCount = $rootScope.watchlistCount;
  $scope.editMode = $rootScope.editMode;
  $scope.today = [];
  $scope.tomo = [];
  $scope.thisWeek = [];
  $scope.nextWeek = [];
  $scope.nextMonth = [];
  $scope.calendar = [];  
  $scope.filterType = 'all';
  if (moment().day() < 5) 
    $scope.weekSelection = 'thisWeek';
  else
    $scope.weekSelection = 'nextWeek';
  $scope.calendarIcon = moment().format("D");
  $scope.displayNextMonth = false;
  $scope.showHelper = false;
  $scope.selectedDate = [];
  $scope.allComponents = ["today","tomo","thisWeek","nextWeek","selectedDate","nextMonth"];
  $scope.show = {today: true};
  $scope.filterTypes = {
    all: "",
    reminders: "isreminder",
    favourites: "isfavorite"
  };
  
  // initializing feed tab
  if (!_.isUndefined($rootScope.feedTab)) 
    $scope.feedTab = $rootScope.feedTab;
  else
    $scope.feedTab = "feed";

  // sycnchronising local and rootScope's feedTab
  $scope.$watch(function(){
    return $rootScope.feedTab;
  },function(){
      $scope.feedTab = $rootScope.feedTab;
      $scope.populateWatchlistPage();
  });

  $scope.$on("toggleEditMode",function(){
    $scope.editMode = !$scope.editMode;
  });

  $scope.$on("watchlist::changed",function(){
    $scope.watchlistCount = $rootScope.watchlistCount;
  });

  // Function to redirect videos to programme page.
  $scope.playVideo = function(p){
   $rootScope.playThisVideo = p.videourl;
    $rootScope.playThisVideoObj = p;
    if (_.isUndefined($rootScope.playThisVideo) && !_.isUndefined(p.videoUrl)) 
      $rootScope.playThisVideo = p.videoUrl;

    $rootScope.playThisVideoObj.videourl = $rootScope.playThisVideo;
    $location.path("/programme/"+ p.programmename);
      $rootScope.EncodeUrlWithDash(p.programmename,$scope.element,'programme', p.channelid, p.programmeid, p.starttime);
//    return false;
  } ;

  $scope.showVideoButton = function(item){
    return !_.isUndefined(item.videoid);
  }

  // Function to determine whether to display empty watchlist page or weekly split
  $scope.hideMainContent = function(){
    return ($scope.watchlistCount == 0 && $location.path() == "/Watchlist");
  }

    $scope.showNoResult = function(item){

        if (_.isEmpty($scope[item])) 
          return true;

        if ($scope.filterType == "all") {
          return _.isEmpty($scope[item]);
        }else{        
          return  !_.some($scope[item],function(elem){
            return elem[$scope.filterTypes[$scope.filterType]] == 1;
          });
        }
        return false;
    }

    // Function to fetch watchlist, favourites or reminders based on date.
    $scope.getWatchlistByDate = function(startDateTime, endDateTime, callback){
      startDateTime = startDateTime +" 00:00";
      endDateTime = endDateTime + " 23:59"; 
      var requestParam = {userid: $rootScope.getUser().userid, fromdatetime:startDateTime, todatetime: endDateTime};
      userAPI[$scope.getAPIMethod()](requestParam,$scope.callbackForAPIs(callback)[$scope.getAPIMethod()]);
    }

    /*
     *  Feed Page methods
     *
     */

    // Function to determine which API method to call.
     $scope.getAPIMethod = function(){
      if ($location.path() == "/Watchlist") {
        return "getWatchlistByDate";
      } else if($location.path() == "/reminders" || $location.path() == "/favourites" || $location.path() == "/Watchlistsocial"){
        switch($scope.feedTab){
          case "watchlist":
            return "getWatchlistByDate";
            break;
          case "reminder":
            return "getReminderByDate";
            break;
          case "favourite":
            return "getFavouriteByDate";
            break;
          default:
            return "getWatchlistByDate";
        }
      }
     }

     // Factory function for API callbacks.
     $scope.callbackForAPIs = function(callback){
      return {
        "getWatchlistByDate" : function(r){
          if (_.isNull(r.watchlistdata)) {
            callback([]);
            return false;
          }
          if (!_.isUndefined(r.watchlistdata.watchlist)) 
            callback(r.watchlistdata.watchlist);
          else
            callback([]);
        },
        "getReminderByDate" : function(r){
          if (_.isNull(r.getalluserreminders)) {
            callback([]);
            return false;
          }
          if (!_.isUndefined(r.getalluserreminders.alluserreminderslist)) 
            callback(r.getalluserreminders.alluserreminderslist);
          else
            callback([]);
        },
        "getFavouriteByDate" : function(r){
          if (_.isNull(r.getfavoriteprogrammes)) {
            callback([]);
            return false;
          }
          if (!_.isUndefined(r.getfavoriteprogrammes.favoriteprogrammeslist)) 
            callback(r.getfavoriteprogrammes.favoriteprogrammeslist);
          else
            callback([]);
        }
      }
     }


     // Callback method to populate the local variables with appropriate programmes
    var callbackForWatchlist = function(variable){
      return function(data){
        if (_.isArray(data))
          $scope[variable] = data;
        else{
          $scope[variable] = [];
          $scope[variable].push(data);
        }
      }
    }

    // The following methods fetches the watchlist, reminder or favourites 
    $scope.fetchWatchlistForToday = function(){
      $scope.getWatchlistByDate(moment().format("YYYY-MM-DD"),moment().format("YYYY-MM-DD"),callbackForWatchlist("today"));
    }

    $scope.fetchWatchlistForTomorrow = function(){
      $scope.getWatchlistByDate(moment().add('days', 1).format("YYYY-MM-DD"),moment().add('days', 1).format("YYYY-MM-DD"),callbackForWatchlist("tomo"));
    }

    $scope.fetchWatchlistForThisWeek = function(){
      $scope.getWatchlistByDate(moment().add('days', 2).format("YYYY-MM-DD"),moment().add('days', (6-moment().day())).format("YYYY-MM-DD"), callbackForWatchlist("thisWeek"));
    }

    $scope.fetchWatchlistForNextWeek = function(){
      $scope.getWatchlistByDate(moment().day(7).format("YYYY-MM-DD"),moment().day(13).format("YYYY-MM-DD"), callbackForWatchlist("nextWeek"));
    }        

    $scope.fetchWatchlistForNextMonth = function(){
      $scope.getWatchlistByDate(moment().month(moment().month() + 1).startOf('month').format("YYYY-MM-DD"),moment().month(moment().month() + 1).endOf('month').format("YYYY-MM-DD"), callbackForWatchlist("nextMonth"));
    }       


    // Function to populate watchlist pages
    $scope.populateWatchlistPage = function(){
      $scope.fetchWatchlistForToday();
      $scope.fetchWatchlistForTomorrow();
      var dayoftheweek = moment().format("d") + 1;
      if (moment().day() >= 6) 
        $scope.thisWeek = [];
      else
      $scope.fetchWatchlistForThisWeek();
      $scope.fetchWatchlistForNextWeek();
    }

    if ($location.path() == "/Watchlist" ) {
      $scope.populateWatchlistPage();
    }

    // Function to build calendar 
   var buildCalendar = function(){
      return {
        thisMonth: calendarFactory(moment().month()),
        nextMonth: calendarFactory(moment().add("month",1).month())
      };
    }

   // Factory function to build calendar dates.
    var calendarFactory = function(calMonth){
      var calendar = [],
          monthMoment = moment().month(calMonth).startOf('month');
      _.each(_.range(moment().month(calMonth).startOf('month').day()),function(item){
        calendar.push("");
      });

      _.each(_.range(1,moment().month(calMonth).startOf('month').daysInMonth() + 1), function(item){
        var day = {
          day_value:item, 
          day_name: moment().month(calMonth).startOf('month').add('days',(item - 1)).format("ddd").toUpperCase(), 
          api_date: moment().month(calMonth).startOf('month').add('days',(item - 1)).format("YYYY-MM-DD"), 
          clickable: ( calMonth > moment().month() ? true : item >= moment().format('D'))
        }
        calendar.push(day);
      });

       _.each(_.range(7 - (moment().month(calMonth).startOf('month').endOf('month').day() + 1)),function(item){
        calendar.push("");
      });

       return calendar;
    }
    

   $scope.calendar = buildCalendar();

   // Filter function for favourites and reminders in watchlist page.
   $scope.canItBeShown = function(item){
    var decider = false;
    switch($scope.filterType){
      case 'reminders':
        if (item.isreminder == 1) {
          decider = true;
        };
        break;
      case 'favourites':
        if (item.isfavorite == 1) {
          decider = true;
        };
        break;
      default: 
        decider = true;
    }
    return decider;
   }

   // Filter function for thisweek and nextweek
   $scope.changeWeek = function(week){
    $scope.weekSelection = week;
    $scope.displayDate();
   }

   // Displaying date next to calendar icon
   $scope.displayDate = function(){
      switch($scope.weekSelection){
        case 'thisWeek':
          if (moment().day() >= 5 )
            $scope.calendarDate = moment().format("Do MMM");
          else
            $scope.calendarDate = moment().add('days', 2).format("Do MMM");
          if (moment().day(6).format("Do MMM") != moment().add('days', 2).format("Do MMM")) {
            $scope.calendarDate += " to ";
            $scope.calendarDate += moment().day(6).format("Do MMM");
          }
          break;
        case 'nextWeek':
          $scope.calendarDate = moment().day(7).format("Do MMM");
          $scope.calendarDate += " to ";
          $scope.calendarDate += moment().day(13).format("Do MMM");
          break;
      }
   }
  $scope.displayDate();

  $scope.isItFriday = function(){
    return moment().day() == 5  || moment().day() == 6;
  }

  $scope.hideHelper = function(){
      $scope.showHelper = false;
  }

  $timeout(function(){
    if ($scope.watchlistCount > 0) 
      $scope.showHelper = true;
  });

    setTimeout(function(){
      if ($scope.showHelper){
       $scope.hideHelper();
       $scope.$apply();
     }
    },30000);
  

  // Event listener to remove programme from watchlist through API
  $scope.$on("watchlistPage::remove",function(event,attrs){
    var programmeid = attrs.programmeid;
    var container = attrs.container;

    console.log("remove" + programmeid);

    $scope[container] = _.reject($scope[container],function(item){
      return item.programmeid == programmeid;
    });
    var contenttype, contentid, videoid;

    $scope.$apply();
    if (_.isUndefined(attrs.video) || attrs.video=="" || _.isNull(attrs.video)) {
      contenttype = "program";
      contentid = programmeid;
      videoid = 0;
    } else{
      contenttype = "video";
      contentid = programmeid;
      videoid = attrs.video;
    };
    userAPI.toggleWatchlist({
      contenttype: contenttype,
      contentid: programmeid,
      videoid: videoid,
      watchliststatus: false
    }, function(rs){
        // console.log(rs);
    });

    $rootScope.$broadcast("watchlist::remove",programmeid);

  });

  // Event listener to remove programme from watchlist cache
  $scope.$on("watchlistPage::Programme::remove",function(event,programmeid){
    console.log(programmeid);
    _.each($scope.allComponents,function(individual){
      $scope[individual] = _.reject($scope[individual],function(item){
        return item.programmeid == programmeid;
      });
    });
  });

  $scope.showNextMonth = function(){
    $scope.fetchWatchlistForNextMonth();
    $scope.displayNextMonth = true;
  }

  // Function to display content based on calendar selection.
  $scope.changeViewForDate = function(fromtodate,presentDate){
    if (!presentDate) 
      return false;
    $scope.selectedDate = [];
    $scope.weekSelection ='';
    $scope.getWatchlistByDate(fromtodate,fromtodate,callbackForWatchlist("selectedDate"));
    $scope.calendarDate = moment(fromtodate,"YYYY-MM-DD").format("Do MMM");
    $('div.qtip:visible').qtip('hide');
  };

  var appendToWatchlist = function(type,item){
    if (!_.some($scope[type],function(elem){return elem.programmeid == item.programmeid})) 
      $scope[type].push(item);
  };

  // Add an item to watchlist page.
  $scope.$on("watchlistpage::add",function(event,item){
    var programmetime = moment(item.starttime);
    var diff = programmetime.format("D") - moment().format("D");
    if (moment().format('M') == programmetime.format('M')) {
      if (diff == 0) 
        appendToWatchlist("today",item);
      else if(diff == 1)
        appendToWatchlist("tomo",item);
      else if(programmetime.format("X") <= moment().day(6).endOf("day").format('X')){
        appendToWatchlist("thisWeek",item);}
      else if(programmetime.format('X') >= moment().day(7).startOf("day").format('X') && programmetime.format('X') <= moment().day(13).endOf("day").format('X'))
        appendToWatchlist("nextWeek",item);
      else if(!_.isEmpty($scope.selectedDate) && $scope.calendarDate == programmetime.format("Do MMM"))
        appendToWatchlist("selectedDate",item);
    }else if((programmetime.format('M') - moment().format('M')) == 1){
      appendToWatchlist("nextMonth",item);
    }

  });

$scope.apiCalled = $rootScope.apiCalled;

$scope.$watch(function(){
  return $rootScope.apiCalled;
},function(){
  $scope.apiCalled = $rootScope.apiCalled;
});

$scope.initialLoad = function(){
  if ($scope.watchlistCount > 0) {
    return false;
  }
  else if(!$scope.apiCalled && $scope.watchlistCount == 0){
    return false;
  }
return true;  
}

$scope.changeFeedTab = function(path){
  $location.path("/"+path);
}
      $scope.nextmonth = function(){
          $('.thismonth').hide();
          $('.nextmonth').show();
      };

     $scope.prevmonth = function(){
        $('.thismonth').show();
        $('.nextmonth').hide();
      };

}]);
