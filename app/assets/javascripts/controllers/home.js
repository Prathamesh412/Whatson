woi.controller('Home_FeaturedController', ['$rootScope', '$scope', '$location', 'recoAPI', 'userAPI', 'videoActions', function($rootScope, $scope, $location, recoAPI, userAPI, videoActions){

    $scope.changeurl= function(url,element){
       var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");           //Prathamesh Changes for
        $location.path("programme/" + str);
        element.stopPropagation();
        element.preventDefault();

    };

    $scope.changechannelurl= function(url,element){
        var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");            //Prathamesh Changes for
        $location.path("channel/" + str);
        element.stopPropagation();
        element.preventDefault();

    };
  // Highlight home in the menu
  if ($location.path().replace(/\//g, '') === 'home' || $location.path().replace(/\//g, '') === 'Home') {
    $rootScope.$broadcast('highlightHome', []);
  }


  // Reset the searh boxes
  $('#mainSearch').css('background-color','transparent');
  if( !$('html').hasClass('ie9') ) {
    $('#mainSearch').val('');
    $('#searchBoxBottom').val('');
  }

  if($.browser.msie && ($.browser.version == '9.0')){
    $('#mainSearch').val($('#mainSearch').attr('placeholder'));
    $('#searchBoxBottom').val($('#searchBoxBottom').attr('placeholder'));
  }

  var maxItems = 10;

  var $featured = $(".featured").hide();

  $('#baseFeatured').live('mouseenter',function(){
    // $(this).css('z-index',10000);
    $('.channels').css('z-index',1);
  });

  $('#baseFeatured').live('mouseleave',function(){    
    // setTimeout(function(){
      // $(this).css('z-index',1);
      $('.channels').css('z-index',1000);
    //},100);
  });


  $scope.featuredVideos = [];

  // load featured videos list
  // remove rando page after API adjusts
  // userAPI.featuredProgramme({pageno:(Math.floor(Math.random() * 4) + 1)},function(r){
  userAPI.featuredProgramme({pageno:1}, function(r){
    
    if(!r.getfeaturedprogramme){
      return false;
    }

    var videos = [];
    if(_.isArray(r.getfeaturedprogramme.featuredprogrammelist))
      videos = r.getfeaturedprogramme.featuredprogrammelist;
    else
      videos.push(r.getfeaturedprogramme.featuredprogrammelist);

    var count = 0;
    $scope.featuredVideos = (videos.length > maxItems) ? videos.slice(0,maxItems) : videos;

    // sets Id's for the slides in order to control their user Action menu
    _.each($scope.featuredVideos, function(v) {
      v.slideid = count++;
    });

    // called with timeout for dom creation
    setTimeout(function(){
      $featured.show();
      $featured.find(".item:eq(0)").addClass("active");
      $featured.find(".item-content:eq(0)").addClass("active");


      var thisPlayer = '';
      var isYoutubePlayer;

      $featured.find('.carousel').carousel({
        interval:false
      }).on("slide",function(e){
        var hasVideo = parseInt($featured.find('.carousel-inner .active').attr('data-isvideo'));
        var isYoutubePlayer = $featured.find('.carousel-inner .active .player').attr('data-isyoutube') == "true";
        thisPlayer = $featured.find('.carousel-inner .active .player');
        var iframeId = $featured.find('.active .player iframe').attr('id');

        if(isYoutubePlayer){
          if(($.browser.msie))
            {
              callPlayer(iframeId, function() {
                  callPlayer(iframeId, "stopVideo");
                  thisPlayer.html('');
                  injectYT($featured.find('.carousel-inner .active'), $featured.find('.carousel-inner .active').attr('video-id'));
              });                    
            }
            else
            {
              callPlayer(iframeId, function() {
                  callPlayer(iframeId, "stopVideo");
              });  
            }
        }
        else 
        {
          $featured.find('.carousel-inner .active .player').empty();
        }

        if(hasVideo) {
          if(!isYoutubePlayer) {
            $featured.find('.carousel-inner .active span.play').show();
          }
        } else {
          $featured.find('.carousel-inner .active span.play').hide();
        }
      })
    
      $featured.find('.carousel').carousel({
        interval:false
      }).on("slid", function(e){
        // on slid clear players
        var hasVideo = parseInt($featured.find('.carousel-inner .active').attr('data-isvideo'));
        var hasYoutube = parseInt($featured.find('.carousel-inner .active').attr('data-isyoutube'));
        // var youtubeURL = $featured.find('.carousel-inner .active').attr('data-youtubeurl');
        // var isYoutubePlayer = $featured.find('.carousel-inner .active .player').attr('data-isyoutube') == "true";

        // if(!isYoutubePlayer) {
        //   $featured.find('.carousel-inner .active .player').empty();
        // }

        // if(hasVideo) {
        //   if(!isYoutubePlayer) {
        //     $featured.find('.carousel-inner .active span.play').show();
        //   }
        // } else {
        //   $featured.find('.carousel-inner .active span.play').hide();
        // }

        //on slide gets the current slide and matches with the userActions menu
        var currentSlideId =  $featured.find('.carousel-inner .active').attr('data-slideid');
        $('.item-content').removeClass('active');
        // 
        $('.item-content[data-actionsid='+currentSlideId+']').addClass('active');
        
      });
    },5);
  });

  $scope.toggleFavoriteProgramme = function(video, e){
    e.preventDefault();
    videoActions.toggleFavoriteProgramme(video, function(r){
      if(r.response.responsestatus === 'true'){
        video.isfavorite = (video.isfavorite == "0") ? "1" : "0";
        $scope.$emit("user:addfavorite", video);
      }

    });
  };

  $scope.toggleReminder = function(video, e){
    e.preventDefault();
    videoActions.toggleReminder(video, function(r){
      //console.log(r.response.responsestatus);
    });
  };

  $scope.toggleWatchlist = function(video, e){
    e.preventDefault();
    videoActions.toggleWatchList(video, function(r){
      //console.log(r.response.responsestatus);
    });
  };

}]);

woi.controller('Home_ProgramsTabController', ['$scope', '$rootScope', '$timeout', '$filter', 'recoAPI', 'userAPI','$location', function($scope, $rootScope, $timeout, $filter, recoAPI, userAPI, $location){
  $scope.changeurl= function(url,element){

      var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");            //Prathamesh Changes for
      $location.path("programme/" + str);
      element.stopPropagation();
      element.preventDefault();

  };
    $scope.changechannelurl= function(url,element){

       var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");            //Prathamesh Changes for
        $location.path("channel/" + str);
        element.stopPropagation();
        element.preventDefault();

    };


  var loading = $filter('loading');
  var $channelTabs = $(".channel-tabs").hide();
  var $tabButtons;
  var $tabs;
  var $moreButtons;
  var openTabIndex;

  // escope filter methods
  var addZero = $filter('addZero');
  var isoToDate = $filter('isoToDate');

  $scope.elements = function() {
    $tabButtons = $channelTabs.find(".tab-btn");
    $tabs = $channelTabs.find(".tab");
    $moreButtons = $channelTabs.find(".more");
  };

  $scope.elements();

  $scope.programs = {
    yourrecs:[], 
    premiers:[],
    exclusives:[],
    rated:[] 
  };

  $scope.loadYourRecs = function(){
    if($rootScope.isUserLogged())
      var $recSpinner = $('.recs-spin');
      loading('show',{element: $recSpinner});
      userAPI.yourRecs( {userid:$rootScope.getUser().userid}, function(r) {
        $scope.recsLoaded = true;

        loading('hide',{element: $recSpinner});

        if(!r.getrecommendationpreferences){
          
          $timeout(function(){
            showTab(0);
          });
          
          return false;
        }

        /* Changed in order to cope with server isssue. */
        // $scope.programs.yourrecs = r.getrecommendationpreferences.recommendationlist;
        $scope.programs.yourrecs = _.map(r.getrecommendationpreferences.recommendationlist,function(item){
          if (_.isUndefined(item.programmeid) && !_.isUndefined(item.programid)) {
            item.programmeid = item.programid;
          }
          return item;
        });

        for(i=0; i<$scope.programs.yourrecs.length; i++){
          //abbreviates the month
          $scope.programs.yourrecs[i].timestring = abbrMonth($scope.programs.yourrecs[i].timestring) ;
        }
        // called with timeout for dom creation
        setTimeout(function(){ 
          if(openTabIndex === 0) {
            showTab(openTabIndex);
          }
          showMoreOnTab(0); 
        }, 5);
      });
  };
  $scope.loadPremiers = function(){

    // call api
    var $premiersSpinner = $('.premiers-spin');
    loading('show',{element: $premiersSpinner});
    userAPI.premiers(function(r)
    {
      $scope.premiersLoaded = true;

      loading('hide',{element: $premiersSpinner});
      $scope.programs.premiers = r.getpremiers.premierslist;
      //console.log($scope.programs.premiers.length);

      for(i=0; i<$scope.programs.premiers.length; i++){
        //abbreviates the month
        $scope.programs.premiers[i].timestring = abbrMonth($scope.programs.premiers[i].timestring) ;
      }

      // called with timeout for dom creation
      setTimeout(function(){ 
        if(openTabIndex === 1) {
          showTab(openTabIndex);
        }
        showMoreOnTab(1); 
      }, 5);
    });
  };

  $scope.loadExclusives = function(){
    // call api
    var $exclusivesSpinner = $('.exclusives-spin');
    loading('show',{element: $exclusivesSpinner});
    userAPI.exclusiveList(function(r){ 

      $scope.exclusivesLoaded = true;

      loading('hide',{element: $exclusivesSpinner});
      if(!r.getExclusiveList)
        return false;

      if(_.isArray(r.getExclusiveList.ExclusiveList)) {
        $scope.programs.exclusives = r.getExclusiveList.ExclusiveList;
      } else {
        $scope.programs.exclusives = [r.getExclusiveList.ExclusiveList];
      }

      for(i=0; i<$scope.programs.exclusives.length; i++){
        //abbreviates the month
        // $scope.programs.exclusives[i].timestring = abbrMonth($scope.programs.exclusives[i].timestring) ;
        $rootScope.exclusives.push($scope.programs.exclusives[i].programmeid);
      }

      // called with timeout for dom creation
      setTimeout(function(){ 
        if(openTabIndex === 2) {
          showTab(openTabIndex);
        }
        showMoreOnTab(2); 
      }, 5);
    });
  };

  $scope.loadRated = function(){
    // call api
    var $ratedSpinner = $('.rated-spin');
    loading('show',{element: $ratedSpinner});
    userAPI.topRated({userid: $rootScope.getUser().userid}, function(r){ 
      
      $scope.ratedLoaded = true;

      loading('hide',{element: $ratedSpinner});
      $scope.programs.rated = r.gettopratedhomepage.topratedprogrammelist;

      for(i=0; i<$scope.programs.rated.length; i++){
        //abbreviates the month
        $scope.programs.rated[i].timestring = abbrMonth($scope.programs.rated[i].timestring) ;
      }
      // called with timeout for dom creation
      setTimeout(function(){ 
        if(openTabIndex === 3) {
          showTab(openTabIndex);
        }
        showMoreOnTab(3); 
      }, 5);
    });
  };



  $scope.init = function(){

    $scope.recsLoaded       = false;
    $scope.exclusivesLoaded = false;
    $scope.ratedLoaded      = false;
    $scope.premiersLoaded   = false;

    $scope.loadPremiers();
    $scope.loadExclusives();
    $scope.loadRated();

    // hide all but first tab
    if($rootScope.isUserLogged()){      
      $scope.loadYourRecs();
      showTab(0);
    } else {
      showTab(1);
    }
  };

  // $scope.$on("user:signin", function (event, args){
  //   showTab(0);
  //   //console.log("signed in");
  //   $timeout(function(){
  //     // $rootScope.$broadcast("watchlist::fetch",1);
  //     $scope.loadYourRecs()
  //   });
  // });

  $scope.$on("user:signout", function (event, args){
    showTab(1);
  });


  // show current tab
  function showTab(index, newindex){
    // highlight corret button
    $tabButtons.removeClass('active');
    $tabButtons.eq(index).addClass('active');
    // $moreButtons.css('background-position','0 -542px'); // default image is +
    $moreButtons.removeClass('less');
    $tabs.hide().eq(index).show();
    openTabIndex = index;

    checkIfItemsAreDisplayed(index);
  };

  /*
    Function to check if all items are displayed, if yes, then hide +/- icon.
  */
  function checkIfItemsAreDisplayed(index){
    var $tab = $tabs.eq(index);
    var $items = $tab.find(".item");
    var totalItems = $items.length;
    var visibleItems = $items.filter(":visible").length;
    var displayLimit = (Modernizr.mq("screen and (min-width:768px) and (max-width:1024px)"))? 4:6;

    if(totalItems > 0 && totalItems > displayLimit) {
    // if(totalItems == visibleItems || !totalItems || totalItems <= displayLimit){
      if(totalItems == visibleItems) {
        $moreButtons.addClass('less');
      }
      $moreButtons.show();
    }else{
      $moreButtons.hide();
    }
  }

  function showMoreOnTab(index){
    // display container
    $scope.elements();
    $channelTabs.show();
    // Show loading indicator
    var visibleMoreButtons = $moreButtons.filter(':visible').length;
    if(visibleMoreButtons) {
      $moreButtons.addClass('loading');
      loading('show', {element: $moreButtons});
    }

    var $tab = $tabs.eq(index);
    var numberOfItems = (Modernizr.mq("screen and (min-width:768px) and (max-width:1024px)"))? 4:6;

    var $items = $tab.find(".item");
    // retrive current page based in the amount of items displayed
    var currentPage = Math.ceil($items.filter(":visible").length / numberOfItems);
    var currentPageLength = (currentPage * numberOfItems);
    var nextPageLength = ((currentPage+1) * numberOfItems);

    // hide to original state
    if($items.filter(":visible").length == $items.length){
      // $moreButtons.css('background-position','0 -542px');
      $moreButtons.removeClass('less');
      $items.hide().filter(':lt(' + numberOfItems + ')').show();  
      // Hide loading indicator
      loading('hide', {element: $moreButtons});
      $moreButtons.removeClass('loading');

      if(Modernizr.mq("screen and (min-width:768px) and (max-width:1024px)")) {
        $('body, window').animate({scrollTop: $moreButtons.position().top - 1250 + 'px'});
      }else{
        $('body, window').animate({scrollTop: $moreButtons.position().top - 500 + 'px'});
      }
      
      return false;
    }
    // display next page
    $items.filter(':lt(' + nextPageLength + ')').show();

    // Hide loading indicator
    loading('hide', {element: $moreButtons});
    $moreButtons.removeClass('loading');
    // All items are shown
    if(nextPageLength >= $items.length){  
      // change the pic
      if($items.filter(":visible").length == $items.length){
        // $moreButtons.css('background-position','-154px -542px');
        $moreButtons.addClass('less');
      }
    }
  };



  // bind buttons events
  $tabButtons.live('click', function(e){
    e.preventDefault();
    $scope.elements();
    
    var openTabIndex = $tabButtons.index(this);
    $scope.currentActiveTab = '';

    // Recommended
    if(openTabIndex == 0){
      $scope.loadYourRecs();      
      $scope.currentActiveTab = 'recs';
    }

    else if(openTabIndex == 1){
      $scope.currentActiveTab = 'premiers';
    }

    else if(openTabIndex == 2){
      $scope.currentActiveTab = 'exclusives';
    }

    else if(openTabIndex == 3){
      $scope.currentActiveTab = 'rated';
    }

    showTab(openTabIndex);
  });

  $moreButtons.click(function(e){
    $scope.elements();
    showMoreOnTab($moreButtons.index(this));
    e.preventDefault();
  });

  $scope.addToFavorite = function(p){

    userAPI.toggleFavoriteProgramme({like:(p.isfavorite == "0"), programmeid:p.programmeid}, function(rs){
      // if it fails, display error message
      if(!rs.response.responsestatus){
        alert(rs.response.message);
      } else {
        // change the flag
        p.isfavorite = (p.isfavorite == "0") ? "1" : "0";
      }
    });
  };

  $scope.addToReminder = function(p){
    // alert("Not yet"); 
    // return false;
    
    // can't apply code due to API error
    if(p.isreminder == "0"){
      var d = isoToDate(p.starttime);
      userAPI.addReminder({
        channelid: p.channelid,
        programmeid: p.programmeid,
        starttime: "" + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes())
      },function(rs){
        // if it fails, display error message
        if(!rs.response.responsestatus){
          alert(rs.response.message);
        } 
      });
    } else {
      removeReminder.addReminder({reminderid:p.reminderid},function(rs){
        
      });
    }
    
  };

  $scope.addToWatchlist = function(p){
    if ($rootScope.isUserLogged()) 
      var data = {watchliststatus: (p.iswatchlist == "0")};

      if (_.isUndefined(p.videoid)) {
        data.contenttype = "program";
        data.contentid = p.programmeid;
        data.videoid = 0;
      } else{
        data.contenttype = "video";
        data.contentid = p.programmeid;
        data.videoid = p.videoid;
      };
      userAPI.toggleWatchlist(data, function(rs){
        if(!rs.response.responsestatus){
          alert(rs.response.message);
        } else {
          // change the flag
          p.iswatchlist = (p.iswatchlist == "0") ? "1" : "0";
        }
      });
  };

}]);

woi.controller('Home_WhatsOnController', ['$scope', 'userAPI', 'recoAPI', function($scope, userAPI, recoAPI){

  $scope.channels = {};
  $scope.hourList = [];

  var firstDate ;

  // ngClick now()
  $scope.now = function(e){
    var v = ($('.sidebar').hasClass('expand'))?'expand':'minified';
    e.preventDefault();
    slide('reset', 0, v);

  };
  // ngClick next()
  $scope.next = function(e){
    e.preventDefault();
    slide('next', 129,v);

  };  

  //expand now&next
  var $sidebar = $('.main-section > .sidebar');
  var $content = $('.main-section > .content');
  var $expandBtn = $('.expand-btn');
  var $nowAndNext = $sidebar.find('.now-and-next');

  $scope.expandNowNext = function(e){
    e.preventDefault();

    //toggle expand
    if(!$sidebar.hasClass('expand')){
      $content.addClass('fade')
      .delay(600)
      .show(function(){
        $(this).addClass('shrink');
        $sidebar.addClass('expand'); 
        $expandBtn.html('<b class="expand-close">x</b>Close&nbsp;&nbsp;&nbsp;');
        $nowAndNext.removeClass('sidebar');
      });

      this.setTimeline(firstDate, 60, 5);
      this.setTvShowTimeline('expanded');

    } else {

      $sidebar.removeClass('expand')
      .delay(500)
      .show(function(){
        $content
        .removeClass('shrink')
        .removeClass('fade');
        $expandBtn.html('<b>+</b> Expand&nbsp;&nbsp;&nbsp;');
      });

      $nowAndNext.addClass('sidebar');

      this.setTimeline(firstDate, 30, 9);
      this.setTvShowTimeline('minified');
    }

  };
  //Sets Now&Next Timeline
  $scope.setTimeline = function(firstDate, incTime, numberOfMarks){
    //pattern to increment time (minutes) in the timeline now&next widget
    $scope.hourList=[];

    var d = new Date(firstDate);
    d.setMinutes((d.getMinutes() < 30 ) ? 0 : 30);

    for(i = 0; i<numberOfMarks; i++){
      $scope.hourList.push(dateFormat(d, "hh:MM TT"));
      d.setMinutes(d.getMinutes()+incTime);
    }
  };

  // loads especific timeline (collapsed/expanded)
  $scope.setTvShowTimeline= function(type) {

    //switch(type) {
    //case 'expanded':
    //doze = userAPI.nowNextMinus4(function(r){
    //console.log(r);
    //});

    //break;

    //default:
    //userAPI.nowNext(function(r){
    //// list of programs
    //var programs = r.gettvguide.tvguideprogrammelist;

    //// loop trough channels
    //_.chain(programs).uniq(false, function(obj){
    //return obj.channelname;
    //})
    //.first(14)
    //.each(function(c){
    //// create an object with necessary info
    //$scope.channels[c.channelid] = {
    //id:   c.channelid,
    //name: c.channelname,
    //logo: c.logofileurl,
    //programs:[]
    //};
    //});

    //// loop trough programs to add to their respective channel
    //_.each(programs, function(p){
    //if($scope.channels[p.channelid]){
    //p.showDurationMinutes =(function(end, start){
    ////console.log('here: '+(new Date(end))+"-"+(new Date(start))+"\n="+Math.floor( (Math.abs(new Date(end) - new Date())/1000/60) ));
    //var diff = Math.abs(new Date(end) - new Date());
    ////return show's duration in minutes
    //return Math.floor((diff/1000)/60);
    //})(p.endtime, p.starttime);
    //// add program to its channel
    //$scope.channels[p.channelid].programs.push(p);
    //}

    //// compare date to get the earliest
    //var d = new Date([>p.starttime<]);
    //p.starttime =(dateFormat( p.starttime ,'hh:MM TT'));
    //p.endtime =(dateFormat( p.endtime ,'hh:MM TT'));

    //if(!firstDate || d < firstDate){
    //firstDate = d;
    //}

    //});

    ////sort correctly
    //_.each(programs, function(p){
    //if($scope.channels[p.channelid]){
    //// sort shows by time
    //$scope.channels[p.channelid].programs = $scope.channels[p.channelid].programs.reverse();
    //}
    //});                          

    //// format the early date
    //if(firstDate){
    //$scope.setTimeline(firstDate, 30, 9); //30 minutes interval & 10 markers
    //}
    //});
    ////end case default: 
    //}

  };

  // call api
  $scope.setTvShowTimeline('default');
  $scope.favoriteChannels = [];

  //ngClick add favorite
  $scope.toggleAddFavorite = function(obj, $event){
    $event.preventDefault();
    if($.inArray(obj, $scope.favoriteChannels) != -1){
      $scope.favoriteChannels.pop(obj);
    } else {
      $scope.favoriteChannels.push(obj);
    }
  };

  $scope.isFavorite = function(channel){ 
    return $.inArray(channel, $scope.favoriteChannels)!=-1;
  };

  var slide = function(direction, width, version){

    //hour grid
    var $top = $sidebar.find('.clock-top li');
    //tvshow grid
    var $lis = $sidebar.find('.timeline ul li').not('.channel-logo');

    //prev button
    var $prevBtn =  $sidebar.find('.clock-top .prev');

    //fix left:auto
    if($top.css('left') == 'auto'){
      $top.css('left', 0);
    }

    if($lis.css('left') == 'auto'){
      $lis.css('left', 0);
    }

    //Unables preview earlier tv-show's than "now" if minified version 
    if(version == "minified" && (direction == "prev") && parseInt($top.css('left')) == 0){
      return false;
    }


    //prevent issues when clicking before the animation finish
    if($top.is(':animated') || $lis.is(':animated')){
      return false;
    }


    if($prevBtn.hasClass('disable')){
      $prevBtn.removeClass('disable');
    }


    switch(direction) {
      case 'prev':
        $top.animate({'left':(parseInt($top.css('left')) + width )+'px' }, 200);
      $lis.animate({'left':(parseInt($lis.css('left')) + width )+'px' }, 200);

      //disable prev before the time "now"
      if((parseInt($top.css('left'))+width)==0 && version == "minified"){
        $prevBtn.addClass('disable');
      }
      break;
      case 'next': //next
        $top.animate({'left':(parseInt($top.css('left')) - width )+'px' }, 200);
      $lis.animate({'left':(parseInt($lis.css('left')) - width )+'px' }, 200);
      break;
      case 'reset':  //now
        $top.animate({'left':(parseInt(0))+'px' }, 200);
      $lis.animate({'left':(parseInt(0))+'px' }, 200);

      $prevBtn.addClass('disable');
      default: //next
        $top.animate({'left':(parseInt(0)+width)+'px' }, 200);
      $lis.animate({'left':(parseInt(0)+width)+'px' }, 200);
    }
  };

  $scope.next = function(e){
    var version = ($sidebar.hasClass('expand')) ? 'expanded' : 'minified';

    e.preventDefault();
    slide('next', 129, version);
  };

  $scope.prev = function(e){
    var version = ($sidebar.hasClass('expand')) ? 'expanded' : 'minified';

    e.preventDefault();
    slide('prev', 129, version);
  };

  //fix for IE on timeline-overlay now&next
  if(!Modernizr.pointerevents){
    $('.now-playing-slide').addClass('ie');
  }

  //initializes prev btn disabled in minified version
  if(!$sidebar.hasClass('expand')){
    $sidebar.find('.clock-top .prev').addClass('disable');
  }

}]);


woi.controller('Home_TrendingController', ['$scope','$rootScope', '$timeout','$compile','$location', 'userAPI',  function($scope, $rootScope, $timeout, $compile,$location,userAPI){

  $scope.trendings = [];
  $scope.currentSlide = 0;

  var $element =   $(".trending"),
  $container = $element.find(".container"),
  $slide =     $element.find(".slider");


  function setActive(index){
    $element.find(".item").removeClass('active').eq(index+1).addClass('active');
  }

  $scope.slide = function(forward){
    var newSlide = forward ? $scope.currentSlide + 1 : $scope.currentSlide - 1;
    var slideWidth = $slide.find('.item').outerWidth();


    // check if current slide can be displayed
    if(newSlide == $scope.trendings.length || newSlide < 0){
      return false;
    }
    // update current slide
    $scope.currentSlide = newSlide;

    // setActive($scope.currentSlide);
    $slide.animate({left:-(newSlide * slideWidth) + "px"}, 500);
  };
  
  userAPI.homeTrendingDiscussion({userid: $rootScope.getUser().userid},function(rs){

    _.each(rs.getlatestdiscussion.latestdiscussion, function(rs){
      rs.time = (moment(rs.lastupdated).isValid())? moment(rs.lastupdated).fromNow(): "Time is not available" ;
    });
    $scope.trendings = rs.getlatestdiscussion.latestdiscussion;
  });

  $scope.lessThanOne = function(){
    if($scope.trendings.length <=1){
      return true;
    }
  }

  $scope.showSlider = true;
  $scope.viewStatus = 'View All';

  $scope.toggleSlider = function(){ 
    $scope.showSlider = !$scope.showSlider;
    $scope.viewStatus = $scope.showSlider == true ? 'View All' : 'Hide';

    var $container = $('.containerWrapper');
    var $elementName = $container.children().first();

    if( !$scope.showSlider ) {
      $elementName.removeClass('slider');
      $container.children('a').hide();
      $container.removeClass('container');
      $container.addClass('containerBox');
    } else {
      $elementName.addClass('slider');
      $container.children('a').show();
      $container.addClass('container');
      $container.removeClass('containerBox');
    }
  }

  $rootScope.$on('layout:resetSocial', function() {
    $scope.showSlider = false;
    $scope.toggleSlider();
  });

  $scope.like = function(event, activity, forceRefresh){
    // change the element before sent the like
    // event.target.innerHTML = "Liked!";

    var shareURL = $location.host();
    if(activity.forumtype == "program"){
      shareURL = shareURL+'/#!/program/'+activity.contentid ;                     // facebook changes
    }else if(activity.forumtype == "channel" || activity.forumtype == "channels"){
      shareURL = shareURL+'/#!/channel/'+activity.contentid;
    }
    
    var element = $(event.target);
    var my = 'top center'

    if(element.attr('data-popover-position'))
      my = element.attr('data-popover-position');
    // verifies if user is logged
    if(!$rootScope.isUserLogged()){
      $rootScope.beforeaction.title = "Login to Like";
      $rootScope.beforeaction.subtitle = "Please login to Like";
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus',
          },
          position:{
            my: (Modernizr.mq("screen and (max-width:640px)")) ? 'bottom left' : 'bottom center',
            at: (Modernizr.mq("screen and (max-width:640px)")) ? 'top left' : 'top center',
            adjust:{
              y: (Modernizr.mq("screen and (max-width:640px)")) ? -15 : -5
            }
          },
          style:{
            classes:'popover reminder-popover cside-popover like-popover'
          } , 
          events:{
            show:function(){
            } ,
            hide:function(){
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
                    $scope.like(event, activity, true);
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
    if(event.target.innerHTML=='Like'){

      FB.ui({
          method              : 'stream.publish',
          link                : shareURL,
          user_message_prompt : 'Post this to your wall?',
          picture             : activity.profileimage,
          name                : activity.forumtitle,
          caption             : activity.forumtype,
          description         : activity.feeddescription            
      });

      var videoid = (activity.forumtype == 'video')?activity.forumtypeid : 0;
      var contentid = (videoid == 0)?activity.forumtypeid: 0;
      userAPI.addRemoveLike({
        contenttype: activity.forumtype,
        contentid: contentid,
        contentname:contentname,
        removelike: true,
        videoid: videoid,
        userid: $rootScope.getUser().userid
      }, function(rs){

        if(forceRefresh) {
          location.reload();
          return false;
        }

        if(!rs.response.responsestatus){
          alert("Error sending request");
        }
        else{

          event.target.innerHTML = "Liked!";          
          activity.likecount++;

         // FB.ui({
         //      method: 'stream.publish',
         //      link: shareURL,
         //      user_message_prompt: 'Post this to your wall?'            
         //  });
        }
        
      });
    }
    else{
      var videoid = (activity.forumtype == 'video')?activity.forumtypeid : 0;
      var contentid = (videoid == 0)?activity.forumtypeid: 0;
        userAPI.addRemoveLike({
          contenttype: activity.forumtype,
          contentid: contentid,
          contentname:contentname,
          removelike: false,
          videoid: videoid,
          userid: $rootScope.getUser().userid
        }, function(rs){

          if(forceRefresh) {
            location.reload();
            return false;
          }
          
          if(!rs.response.responsestatus){
            alert("Error sending request");
          }
          else{

            event.target.innerHTML = "Like";          
            activity.likecount--;
            //var redirectURL = '\''+$location.host()+'\'';
          }
      });
    }
  };


}]);
woi.controller("Home_FBActivityController", ['$rootScope','$location','$scope','$timeout', '$compile','$location', 'userAPI',  function($rootScope,$location, $scope,  $timeout, $compile, $location, userAPI){

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

  $scope.activities = [];
  $scope.currentSlide = 0;
  var $element =   $(".fb-activity"),
  $container = $element.find(".container"),
  $slide =     $element.find(".slider");

  function setActive(index){
    $element.find(".item").removeClass('active').eq(index+1).addClass('active');
  }

  $scope.setWidthFb = function (ngRepeatFinishedEvent) {
      var thisWid = $('#FBwrapperLinkWidth').width() - 30;
    if( $rootScope.device.isMobile ){
      $('#FBwrapperLinkWidth .slider > div').css('width', thisWid + "px");
    }
  };

  $scope.slide = function(forward){
    var newSlide = forward ? $scope.currentSlide + 1 : $scope.currentSlide - 1;
    var slideWidth = $slide.find('.item').outerWidth();

    // check if current slide can be displayed
    if(newSlide == $scope.activities.length || newSlide < 0){
      return false;
    }
    // update current slide
    $scope.currentSlide = newSlide;
    setActive(newSlide);
    $slide.animate({left:-(newSlide * slideWidth) + "px"}, 500);
  };

  $scope.like = function(event, activity, forceRefresh){
    // change the element before sent the like
    // event.target.innerHTML = "Liked!";
    $('body').focus();
    var shareURL = $location.host();
    if(activity.contenttype == "Program"){

      shareURL = shareURL + '/#!/program/'+activity.contentname;       //sanjay  - Facebook changes-Pratha
    }
    else if(activity.contenttype == "Channel" || activity.contenttype == "Channels"){

      shareURL = shareURL + '/#!/channel/'+activity.contentname;
    }
    
    var element = $(event.target);
    var my = 'top center'

    if(element.attr('data-popover-position'))
      my = element.attr('data-popover-position');
    // verifies if user is logged
    if(!$rootScope.isUserLogged()){
      $rootScope.beforeaction.title = "Login to Like";
      $rootScope.beforeaction.subtitle = "Please login to Like";
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus',
          },
          position:{
            my: 'bottom center',
            at: 'top center',
            adjust:{
              y:-5
            }
          },
          style:{
            classes:'popover reminder-popover cside-popover like-popover'
          } , 
          events:{
            show:function(){
            } ,
            hide:function(){
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
                    $scope.like(event, activity, true);
                    element.qtip('hide').qtip('destroy');
                  },
                  failure: function() {
                    alert('oopss');
                  }
                };
              }
            }
          }
        };
      };
      var qtipConfig = resetQtip();
      element.qtip(qtipConfig).qtip('show');

      return false;

    }
    element.qtip('destroy');
    if(event.target.innerHTML=="Like"){
      FB.ui({
          method              : 'stream.publish',
          link                : shareURL,
          user_message_prompt : 'Post this to your wall?',
          picture             : activity.imageurl,
          name                : activity.contentname,
          caption             : activity.contenttype,
          description         : activity.feeddescription
          // redirect_uri: redirectURL
      });
      var videoid = (activity.contenttype == 'video')?activity.contentid : 0;
      var contentid = (videoid == 0)?activity.contentid: 0;
      userAPI.addRemoveLike({
        contenttype: activity.contenttype,
        contentid: contentid,
        removelike: true,
        videoid: videoid,
        userid: $rootScope.getUser().userid
      }, function(rs){

        if(forceRefresh) {
          location.reload();
          return false;
        }

        if(!rs.response.responsestatus){
          alert("Error sending request");
        }
        else{

          event.target.innerHTML = "Liked!";          
          activity.totallikes++;
        }
        
      }); 
    }
    else{
      var videoid = (activity.contenttype == 'video')?activity.contentid : 0;
      var contentid = (videoid == 0)?activity.contentid: 0;
        userAPI.addRemoveLike({
          contenttype: activity.contenttype,
          contentid: contentid,
          removelike: false,
          videoid: videoid,
          userid: $rootScope.getUser().userid
        }, function(rs){

          if(forceRefresh) {
            location.reload();
            return false;
          }
          
          if(!rs.response.responsestatus){
            alert("Error sending request");
          }
          else{

            event.target.innerHTML = "Like";
            activity.totallikes--;           
          }
      });
    }
  };

  userAPI.facebookActivity({userid: $rootScope.getUser().userid},function(rs){ 

    $scope.activities = rs.getfacebookactivity.facebookactivitylist;
    $timeout(function(){ setActive($scope.currentSlide); });
  });

  // $scope.lessThanOne = function(){
  //   if($scope.activities <= 1){
  //     return true;
  //   }
  // }

  $scope.showSlider = true;
  $scope.viewStatus = 'View All';

  $scope.toggleSlider = function(){ 
    $scope.showSlider = !$scope.showSlider;
    $scope.viewStatus = $scope.showSlider == true ? 'View All' : 'Hide';

    var $container = $('.fb-activity').find('.FBcontainerWrapper').first();
    var $elementName = $container.children('div').first();

    if( !$scope.showSlider ) {
      $elementName.removeClass('slider');
      $('.FBwrapper').children('a').hide();
      $container.removeClass('container');
      $container.addClass('containerBox');
    } else {
      $elementName.addClass('slider');
      $('.FBwrapper').children('a').show();
      $container.addClass('container');
      $container.removeClass('containerBox');
    }
  }

  $rootScope.$on('layout:resetSocial', function() {
    $scope.showSlider = false;
    $scope.toggleSlider();
  });

}]);

woi.controller("SocialSharingController", ['$scope','$http' ,'userAPI',  function($scope,  $http, userAPI){

    $scope.fbLikeCount = 0;
    $scope.tweetsCount = 0;

    $http({
      method: 'JSONP', 
      url: "https://graph.facebook.com/fql?q=SELECT like_count,total_count FROM link_stat WHERE url='http://www.facebook.com/whatsonindiachannelguide'", 
      params:{
        callback:'JSON_CALLBACK'
      }
    })
    .success(function(data, status) {  

      $scope.fbLikeCount = data.data[0].like_count;

     })
    .error(function(data, status) { 
      //console.log("FB COUNT error");
    });   


    $http({
        method: 'JSONP', 
        url: 'https://api.twitter.com/1/users/show/WhatsOnIndia.json', 
        params:{
          callback:'JSON_CALLBACK'
        }
      }
    )
    .success(function(data, status) {

      $scope.twitterResponse = data; 

      $scope.tweetsCount = data.followers_count;
    })
    .error(function(data, status) { 
      
    });



    $('#fbButton').live('click',function(){

      FB.ui({
          method: 'stream.publish',
          link: 'http://www.WhatsOnIndia.com/',
          user_message_prompt: 'post this to your wall?',
          redirect_uri: 'http://www.WhatsOnIndia.com/'
      }); 
    });

    $('#twitterButton').live('click',function(){
      var twtTitle  = "Hi guys, check out What's on India... ";
      var twtUrl    = "http://WhatsOnIndia.com";

      var maxLength = 140 - (twtUrl.length + 1);

      if (twtTitle.length > maxLength) {
        twtTitle = twtTitle.substr(0, (maxLength - 3))+'...';
      }

      var twtLink = 'http://twitter.com/home?status='+encodeURIComponent(twtTitle + ' ' + twtUrl);
      window.open(twtLink);
      
    });

    $('#gplusButton').live('click',function(){
     
      var woiLink = "WhatsOnIndia.com";
      var link = "https://plus.google.com/share?url="+woiLink;
      window.open(link);  
    });

}]);
