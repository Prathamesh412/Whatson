woi.controller("ChannelController", ['$scope', '$rootScope' , '$routeParams', 'userAPI','$http','$filter', function($scope, $rootScope, $routeParams,  userAPI, $http,$filter){
  

  // Reset the searh boxes
  $('#mainSearch').css('background-color','transparent');
  if( !$('html').hasClass('ie9') ) {
    $('#mainSearch').val('');
    $('#searchBoxBottom').val('');
  }
  // get the id param specified in the route
  $scope.channelid = $rootScope.Channelid;
  $scope.isSearchFeed=false;

  // Highlight the respective item in the main navigation
  $rootScope.$broadcast('highlightChannel', []);

  // cancels if no channel id was passed
//  if(_.isUndefined($scope.channelid) || isNaN($scope.channelid))  --This is commented as it will give false each time
//    return false;

  var params = {
    userid    : $rootScope.getUser().userid,
    channelid : $rootScope.Channelid
  };
  
  userAPI.channelDetails(params, function(rs) {
      console.log("**********************response*************************");
      console.log(rs);
    // Wrong channel id passed
    if(_.isUndefined(rs.getsinglechanneldetail)){
      $scope.channelDetail = null;
      return false;
    }

    // Using this var in order to print stuff in view
    $scope.channelDetails = rs.getsinglechanneldetail.singlechanneldetail;
    $scope.twitterHandle  = rs.getsinglechanneldetail.singlechanneldetail.twitterhandle;
    $scope.facebookHandle = rs.getsinglechanneldetail.singlechanneldetail.facebookhandle;

    // console.log("Facebook Handle == "+$scope.facebookHandle);
    // console.log("Twitter Handle == "+$scope.twitterHandle);
    

    if($scope.facebookHandle == null || $scope.facebookHandle == 'null'){                  //changes to be made for facebook feed
      $scope.showFacebook = false; 
    }else{ 
      if($scope.facebookHandle.length>1){ 
        $scope.showFacebook = true;
        getFbFeed();
      }else{
        $scope.showFacebook = false;
      }
    }

    if($scope.twitterHandle == null || $scope.twitterHandle == 'null'){ 
      getTwitterSearchFeed();
    }else{ 
      if($scope.twitterHandle.length>1){ 
        $scope.showTwitter = true;
        getTwitterFeed();
      }else{
        $scope.showTwitter = false;
      }
    }
    // sets the text for affinityindex /affinityicon
    if($scope.affinityindex < 2 ){
      $scope.channelDetails.affinitytext = 'Poor';
      $scope.channelDetails.affinityicon = 'poor' ;
    } else if($scope.affinityindex > 4){
      $scope.channelDetails.affinitytext = 'Excellent';
      $scope.channelDetails.affinityicon = 'ex' ;
    }
    else{
      $scope.channelDetails.affinitytext = 'Good';
      $scope.channelDetails.affinityicon = 'ex' ;
    }

    
  });

  
  $scope.minTweets = 2;
  
  var getTwitterFeed = function(){
    //console.log("Twitter Handle ---->"+$scope.twitterHandle);
    $http({
      method: 'JSONP', 
      url: 'http://api.twitter.com/1/statuses/user_timeline.json', 
      params:{
        screen_name:$scope.twitterHandle, 
        count: '10', 
        callback:'JSON_CALLBACK'
      }
    }
    )
    .success(function(data, status) {

      if(data==null || data.length == 0){        
        getTwitterSearchFeed();
        return;
      } 
      $scope.twitterResponse = data; 
      $scope.paginateTwitter = $scope.twitterResponse.slice(0, $scope.minTweets);
    })
    .error(function(data, status) { 
      $scope.data = data || "Request failed";
      $scope.status = status;
    }); 

  }

  var getTwitterSearchFeed = function(){ 

   $http({
    method: 'JSONP', 
    url: 'http://search.twitter.com/search.json', 
    params:{
      rpp: '10', 
      lang:'en',
      q:$scope.channelDetails.channelname,
      callback:'JSON_CALLBACK'
    }
    })
     .success(function(data, status) {  
      $scope.isSearchFeed=true;
      $scope.twitterResponse = data.results;
      $scope.paginateTwitter = $scope.twitterResponse.slice(0, $scope.minTweets);
      if(data.results.length <= 0) 
        $scope.showTwitter = false; 
      else
        $scope.showTwitter = true; 
    })
     .error(function(data, status) { 
      $scope.showTwitter = false; 
      $scope.data = data || "Request failed";
      $scope.status = status;
  });            

 }

 var getFbFeed = function(){ 
  userAPI.getFBAccessToken({}, 
    function(rs) {

      var access_token = 'access_token=' + rs.access_token;

      $http({
        method: 'JSONP', 
        url: 'https://graph.facebook.com/'+$scope.facebookHandle+'/posts?'+access_token, 
        params:{
          limit:10,
          callback:'JSON_CALLBACK'
        }
      }
      )
      .success(function(data, status) { 
        $scope.facebookResponse = data.data;
        if(!$scope.facebookResponse){
          $scope.showFacebook = false;
          $scope.minTweets    = 4;
          return;
        }

        $scope.paginateFb = $scope.facebookResponse.slice(0, 2);

      })
      .error(function(data, status) {
          console.log("ERROR in fetching facebook feed");
        }); 
    });


    // fetch the profile pic
    $http({
      method: 'JSONP', 
      url: 'http://graph.facebook.com/'+$scope.facebookHandle+'/?fields=picture&type=small', 
      params:{
        callback:'JSON_CALLBACK'
      }
    })
    .success(function(data, status) {

      if(typeof(data.picture)=="undefined"){
        $scope.facebookProfilePic = "";   
        return;
      }

      $scope.facebookProfilePic = data.picture.data.url;  
    })
    .error(function(data, status) {
      //console.log("ERROR in fetching Profile Pic");
      $scope.facebookProfilePic = "";
    });
  }

  // TWITTER
  $scope.paginateTwitter = [];
  $scope.twitterText     = 'View More';
  

  $scope.loadMoreTweets = function(){

    if($scope.twitterText == 'View More'){
      $scope.twitterText = 'View Less';
      $scope.paginateTwitter = $scope.twitterResponse;
    }else{
      $scope.twitterText = 'View More';
      $scope.paginateTwitter = $scope.twitterResponse.slice(0, 2);
    }
  };

  // Facebook
  $scope.paginateFb = [];
  $scope.fbText     = 'View More';

  $scope.loadMoreFb = function(){ 

    if($scope.fbText == 'View More'){
      $scope.fbText = 'View Less';
      $scope.paginateFb = $scope.facebookResponse;
    }else{
      $scope.fbText = 'View More';
      $scope.paginateFb = $scope.facebookResponse.slice(0, 2);
    }    
  };
  
}]);

woi.controller("Channel_ProgramsTabController", ['$scope', '$rootScope', '$routeParams', '$filter', 'userAPI','$location', function($scope, $rootScope, $routeParams, $filter,   userAPI,$location){


  // get the id param specified in the route
  $scope.channelid = $rootScope.Channelid;

  var loading = $filter('loading');
  var $channelTabs = $(".channel-tabs").hide();
  var $tabButtons;
  var $tabs;
  var $moreButtons;
  var $popularFilter;
  var $spinChannels;
  var openTabIndex;

  // escope filter methods
  var addZero = $filter('addZero');
  var isoToDate = $filter('isoToDate');

  $scope.genreSelected = false;
  
  var elements = function() {
    $tabButtons     = $channelTabs.find(".tab-btn");
    $tabs           = $channelTabs.find(".tab");
    $moreButtons    = $channelTabs.find(".more");
    $popularFilter  = $channelTabs.find('li.category');
    $spinChannels   = $('.spin_channels');
  };

  elements();

  // $scope.noResults = false;
  $scope.programs = {
  	yourrecs: [],
    popular:[], 
    premiers:[],
    exclusives:[],
    rated:[],
    browse:[]
  };

  $scope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };


  $scope.loadYourRecs = function(){

      var params = {hybridgenre:$scope.currentFilter};

      var defaultParams = {userid:$rootScope.getUser().userid, channelid:$scope.channelid};

      userAPI.yourChannelRecs( $.extend(defaultParams, params), function(r) {

        $scope.spinnerOn = false;
        loading('hide', {element: $spinChannels});

        if(!r.getsimilarchannelprogramme){
          $scope.programs.yourrecs = [];
          
          showTab(0);
          return false;  
        }

        $scope.programs.yourrecs = addData(r.getsimilarchannelprogramme.similarchannelprogrammelist);

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

  $scope.loadPopular = function(){
    // $scope.programs = {
    //   yourrecs: [],
    //   popular:[], 
    //   premiers:[],
    //   exclusives:[],
    //   rated:[],
    //   browse:[]
    // };
    $scope.programs.popular = [];
    // $scope.noResults = false;
    var params = {hybridgenre:$scope.currentFilter};
    var defaultParams = {userid:$rootScope.getUser().userid, channelid: $scope.channelid};
    userAPI.channelPopularPrograms( $.extend(defaultParams, params), function(r) {

      $scope.spinnerOn = false;
      loading('hide', {element: $spinChannels});

      if(!r.gettopprogrammeforchannel) {
        // $scope.noResults = true;
        $scope.programs.popular = [];
        return false;
      }

      $scope.programs.popular = addData(r.gettopprogrammeforchannel.topprogrammeforchannel);

      // if(_.isArray(r.gettopprogrammeforchannel.topprogrammeforchannel))
      //   $scope.programs.popular = r.gettopprogrammeforchannel.topprogrammeforchannel;
      // else
      //   $scope.programs.popular[0] = r.gettopprogrammeforchannel.topprogrammeforchannel;


      for(i=0; i<$scope.programs.popular.length; i++){
        //abbreviates the month
        $scope.programs.popular[i].timestring = abbrMonth($scope.programs.popular[i].timestring) ;
      }
      // called with timeout for dom creation.
      setTimeout(function(){ 
        if(openTabIndex === 1) {
          showTab(openTabIndex);
        }
        showMoreOnTab(1); 
      }, 5);
    });
  };

  $scope.loadBrowse = function() {
    
    var params = {hybridgenre:$scope.currentFilter};
    var defaultParams = {channelid: $rootScope.Channelid};

    userAPI.getBrowseForChannel($.extend(defaultParams, params), function(r) {

      $scope.spinnerOn = false;
      loading('hide', {element: $spinChannels});

      if(!r.channelbrowsedprogramme) {
        $scope.programs.browse = 0;
        $scope.programs.browse = [];
        return false;
      }

      $scope.programs.browse = addData(r.channelbrowsedprogramme.channelbrowsedprogrammelist);

      setTimeout(function(){ 
        if(openTabIndex === 2) {
          showTab(openTabIndex);
        }
        showMoreOnTab(2); 
      }, 5);
    });
  }

  $scope.init = function(){
  	  // Load the content
      $scope.loadPopular();
      $scope.loadBrowse();
      
      /*
       * Check if user is logged in, if so load Recommended and show first tab
       * Otherwise, show second tab
       */
       if($rootScope.isUserLogged()) {
         $scope.loadYourRecs();
         showTab(0);
       } else {
         showTab(1);
       }
     };


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
    elements();
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
    elements();

    var openTabIndex = $tabButtons.index(this);
    $scope.currentActiveTab = '';

    // Recommended
    if(openTabIndex == 0){

      $scope.currentActiveTab = 'recs';

      $scope.safeApply(function(){
        $scope.programs.yourrecs = [];
        $scope.spinnerOn = true;
        loading('show', {element: $spinChannels});
      });

      $scope.loadYourRecs(); 
    }
    // Popular
    else if(openTabIndex == 1){
      
      $scope.currentActiveTab = 'popular';

      $scope.safeApply(function(){
        $scope.programs.popular = [];
        $scope.spinnerOn = true;
        loading('show', {element: $spinChannels});
      });
      
      $scope.loadPopular(); 
    }
    // Browse
    else{
      
      $scope.currentActiveTab = 'browse';

      $scope.safeApply(function(){
        $scope.programs.browse = [];
        $scope.spinnerOn = true;
        loading('show', {element: $spinChannels});
      });

      $scope.loadBrowse(); 
    }

    showTab(openTabIndex);
  });

  $moreButtons.click(function(e){
    elements();
    showMoreOnTab($moreButtons.index(this));
    e.preventDefault();
  });


  // $scope.genresFilter = [
  // { label: 'All'                   , value: 'all' },
  // { label: 'Action & Thriller'       , value:'Action & Thriller' },
  // { label: 'Business & Finance'      , value:'Business & Finance'  },
  // { label: 'Comedy'                  , value:'Comedy' },
  // { label: 'Drama'                   , value: 'Drama'},
  // { label: 'Family'                  , value:'Family'},
  // { label: 'Food & Lifestyle'        , value:'Food & Lifestyle'},
  // { label: 'Horror & Suspense'       , value:'Horror & Suspense'},
  // { label: 'Infotainment'            , value: 'Infotainment'},
  // { label: 'Kids'                    , value:'Kids'},
  // { label: 'Movies'                  , value:'Movies'},
  // { label: 'Music'                   , value: 'Music'},
  // { label: 'News'                    , value:'News' },
  // { label: 'Reality & Game Shows'    , value:'Reality & Game Shows' },
  // { label: 'Sports'                  , value:'Sports' },
  // { label: 'Talk Shows & Interviews' , value:'Talk Shows & Interviews' }
  // ];
  
  // $scope.currentFilter = $scope.genresFilter[0].label;
  $scope.currentFilter = "All";
  $scope.allGenres     = [];

  $scope.constructObject = function(){

    if ($scope.allGenres.length > 0){
      return false;
    }
    
    userAPI.getGenreList({channelid:$scope.channelid}, function(rs){
      console.log('got response....',rs);

      if(!rs.gethybridgenreforchannel){
        return false;
      }
      $scope.allGenres = rs.gethybridgenreforchannel.hybridgenreforchannel;
      $scope.paginateGenres = $scope.allGenres.slice(0, 8);
    });

    // $scope.allGenres = $scope.genresFilter;
    // $scope.paginateGenres = $scope.allGenres.slice(0, 8);
  };


  $scope.viewAllOperators = function(){
    $scope.paginateGenres = $scope.allGenres;
  };

  $scope.selectedGenre = function(genreObj){

    $('div.qtip:visible').qtip('hide');

    $scope.genreSelected = true;

    // $moreButtons.css('background-position','0 -542px');
    $moreButtons.removeClass('less');
    $scope.currentFilter = genreObj.groupname;

    // Recommended
    if(openTabIndex == 0){
      
      $scope.safeApply(function(){
        $scope.programs.yourrecs = [];
        $scope.spinnerOn = true;
        loading('show', {element: $spinChannels});
      }); 

      $scope.loadYourRecs();
    }
    // Popular
    else if(openTabIndex == 1){

      $scope.safeApply(function(){
        $scope.programs.popular = [];
        $scope.spinnerOn = true;
        loading('show', {element: $spinChannels});
      });

      $scope.loadPopular(); 
    }
    // Browse
    else{

      $scope.safeApply(function(){
        $scope.programs.browse = [];
        $scope.spinnerOn = true;
        loading('show', {element: $spinChannels});
      });


      $scope.loadBrowse(); 
    }
    
  };
  $scope.playVideo = function(p){
      $rootScope.playThisVideo = p.videourl;
      $rootScope.playThisVideoObj = p;
      if (_.isUndefined($rootScope.playThisVideo) && !_.isUndefined(p.videoUrl)) 
        $rootScope.playThisVideo = p.videoUrl;

      $rootScope.playThisVideoObj.videourl = $rootScope.playThisVideo;

      // $rootScope.$apply();
//      $location.path("/programme/"+test);
      $rootScope.EncodeUrlWithDash(p.programmename,$scope.element,'programme',p.channelid,p.programmeid, p.starttime);
      // return false;
  };
  $scope.hasVideo = function(item){
      return !_.isUndefined(item.videoid);
  }
}]);             

woi.controller("ChannelDiscussionController", ['$scope', '$rootScope', '$routeParams', '$timeout','$compile', '$filter',  'userAPI', function($scope, $rootScope, $routeParams, $timeout, $compile, $filter, userAPI){
  // get the id param specified in the route
  $scope.channelid = $rootScope.Channelid;
  $scope.programmeid = $rootScope.Programmeid;
  
  var loading = $filter('loading');

  $scope.post = {
    title: '', 
    message:''
  };

  var toggleError = function(element, open) {
    if(open) {
      element.slideDown();
      element.prev().addClass('error');
    } else {
      element.slideUp();
      element.prev().removeClass('error');
    }
  }

  var toggleSuccess = function(element, open) {
    if(open) {
      element.stop().queue('fx', []).slideDown();
    } else {
      element.stop().queue('fx', []).slideUp();
    }
  }

  $scope.postDiscussion = function(e, type, forceRefresh){
    if(e){
      e.preventDefault();
      var element = $(e.currentTarget);
    }

    var errorMessages = {
      'emptyFields': "Discussion message and title are required.",
      'creationFailed': "Discussion creation failed"
    };

    var errorReferences = $('.errorMessage'),
        emError = $('#discussion_post_error');

    toggleError(emError, false);

    if($.trim( $scope.post.title ) == "" || $.trim( $scope.post.message ) == "") {


      emError.html(errorMessages.emptyFields);
      toggleError(emError, true);
      return false;
    }

    if(!$rootScope.isUserLogged()){

      $rootScope.beforeaction.title = "Login to Create a Discussion"
      $rootScope.beforeaction.subtitle = "Please login to Create a Discussion";
      // adjustments for popover for tvguide channels
      var yoffset = (element.attr("data-popover"))? (-15) : 5;
      var popover_position = ($('.sidebar').hasClass('expand') || $('.tv_guide').hasClass('tv'))? {my:'top left', at:'bottom center'} : {my: 'top center', at: 'bottom center'};
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus'
          },
          position:{
            my: popover_position.my, 
            at: popover_position.at,
            adjust:{
              y: yoffset
            }
          },
          style:{
            classes:'popover reminder-popover cside-popover'
          } , 
          events:{
            show:function(){
              element.parent().parent('.thumb').addClass('active');
              element.addClass('active');
            } ,
            hide:function(){
              element.parent().parent('.thumb').removeClass('active');
              element.removeClass('active');
            } 
          }, 
          content: {
            text: '<div class="popover-loader signin-loader"></div>',
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
                    $scope.postDiscussion(e, type, true);
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

    element.addClass("loading");
    loading('show', {element: element});

    var params = {
      forumtype: 'channel' , 
      forumtypeid:$scope.channelid,
      forumtitle: $scope.post.title ,
      forumimage: ( $scope.channelDetails ? $scope.channelDetails.logofileurl : '' ),
      comments:$scope.post.message,
      userid: $rootScope.getUser().userid
    };

    if(type =='program'){//programme case
      params = $.extend(params, {
        forumtype: 'program', 
        forumtypeid: $scope.programmeid,
        forumimage: ( $scope.fullProgrammeDetail ? $scope.fullProgrammeDetail.imagefilepath : '' )
      });
    }

    userAPI.createDiscussion(params, function(rs) {
      console.log("Here is the response") ;
        console.log(rs) ;
        console.log(params);
      if(!rs || !rs.response || rs.response.responsestatus === 'false') {
        emError.html(errorMessages.creationFailed);

        toggleError(emError, true);
        element.removeClass("loading");
        loading('hide', {element: element});
        return false;
      }

      if(forceRefresh) {
        location.reload();
        return false;
      }

      $scope.post.title = '';
      $scope.post.message = '';
      element.removeClass("loading");
      loading('hide', {element: element});
      element.parent().children('input, textarea').val('').focus().blur();
      var forumid = "";
      if(rs.response.forumid)
        forumid = rs.response.forumid;

      var feedback = {forumid: forumid};

      $scope.openNotification('newDiscussionConfirmation');
      $rootScope.$broadcast('discussionPosted', feedback);
    });

  };  

  $scope.openNotification = function(selector_id) {
    var parentElement = ( selector_id ? $('#' + selector_id) : $('.discussionConfirmation') ),
    adjustElements = parentElement.children('li').children('.dc_check, .dc_close'),
    totalHeight = parentElement.outerHeight();

    adjustElements.height( totalHeight );
    parentElement.fadeIn().slideDown();
    setTimeout( function() {
      $scope.closeNotification(null, parentElement);
    }, 3000);
  }

  $scope.closeNotification = function(e, element) {
    if(e) {
      e.preventDefault();
      var thisElement = $(e.currentTarget),
      parentElement = thisElement.parent().parent();
    } else {
      parentElement = element;
    }

    parentElement.slideUp().fadeOut();
  } 
}]);     

woi.controller("ChannelFeaturedVideoController", ['$scope', '$rootScope', '$routeParams', 'userAPI', function($scope, $rootScope, $routeParams,  userAPI){

  // get the id param specified in the route
  $scope.channelid = $rootScope.Channelid;
  var maxItems = 10;

  var $featured = $(".featured").hide();

  $scope.featuredVideo = [];

  // load featured videos list
  userAPI.featuredChannelVideos({pageno:1, channelid:$scope.channelid},function(r){
    var videos = [],
    count = 0;

    if(!r.getfeaturedvideosforchannel) 
      return false;

    videos = addData(r.getfeaturedvideosforchannel.featuredvideosforchannellist);

	// Maximum number of featured videos to show in carousel
  maxItems = 10;
  $scope.featuredVideo = (videos.length > maxItems) ? videos.slice(0,maxItems) : videos;

    // prepares the footer videos and send them through $emit
    $scope.footerVideos = _.shuffle(videos);  
    $rootScope.$emit('channel:videoloaded', $scope.footerVideos);

    // sets Id's for the slides in order to control their user Action menu
    _.each($scope.featuredVideo, function(v) {
      v.slideid = count++;
    });

    // called with timeout for dom creation
    setTimeout(function(){
      $featured.show();
      $featured.find(".item:eq(0)").addClass("active");
      $featured.find(".item-content:eq(0)").addClass("active");
      $featured.find('.carousel').carousel({
        interval:false
      }).on("slid", function(e){
        // on slid clear players
        $featured.find('.player').empty();
         // $featured.find(".play").css({'display':'block'});
         var hasVideo = parseInt($featured.find('.carousel-inner .active').attr('data-isvideo'))
          if(hasVideo){
              $featured.find('.carousel-inner .active span.play').show();
          }else{
              $featured.find('.carousel-inner .active span.play').hide();
          }
        //on slide gets the current slide and matches with the userActions menu
        var currentSlideId =  $featured.find('.carousel-inner .active').attr('data-slideid');
        $('.item-content').removeClass('active');
        $('.item-content[data-actionsid='+currentSlideId+']').addClass('active');
        
      });
    },5);
  });
}]);             

woi.controller("ChannelFooterVideosController", ['$scope', '$rootScope' , '$routeParams', 'userAPI','$filter','$location', function($scope, $rootScope, $routeParams, userAPI,$filter,$location){

  $scope.footerVideos = [];

  $rootScope.$on('channel:videoloaded', function(event, attr) {
    // sets 2 videos to display
    $scope.footerVideos = attr.slice(0, 2);
  });


  // check if programm has video to show
  $scope.hasVideo = function(p){
    return (typeof p.videourl != 'undefined' && p.videourl != '');
  };

  $scope.playVideo = function(e, p){

    var element = $(e.currentTarget).parent();
    var playerID = 'footer-' + p.videoid;

    if (element.outerWidth() < 550) {
      $rootScope.playThisVideo = p.videourl;
      $rootScope.playThisVideoObj = p;
      $rootScope.EncodeUrlWithDash(p.programmename,$scope.element,'programme',p.channelid,p.programmeid, p.starttime);
      return false;
    }
    if(p.isyoutube == "1"){
      // extract youtube id
      var urlMatches = p.videourl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
      // add youtube player
      element.find('.player').html('<iframe width="278" height="160" src="http://www.youtube.com/embed/'+ urlMatches[1] + '?autoplay=1&rel=0&modestbranding=1&showinfo=0" frameborder="0" allowfullscreen style="backgground-color=\'#000\'"></iframe>');
    } else {
      // check if player if built
      if($("#"+playerID).length){
        // show the player and start playback
        element.find('.player').show();
        _V_(playerID).play();
        return false;
      }

      // create html player structure
      var $playerHTML = $('<video>')
      .attr({id:playerID, width:278, height:160})
      .addClass('video-js vjs-default-skin');

      var $playerSource = $("<source></source>")
      .attr("src", p.videourl)
      .attr("type", "video/mp4");

      $playerHTML.append($playerSource);
      element.find('.player').append($playerHTML);
      var videoJS = _V_(playerID, {
        "controls": true,
        "autoplay": true,
        "preload": "auto"
      }).addEvent("ended", function(){
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        }
        else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
        // hide the player
        element.find('.player').hide();

      });
    }
  };
}]);             

woi.controller("TodayTomorrowController", ['$scope','$location', '$rootScope' , '$routeParams', 'userAPI','$filter', function($scope,$location, $rootScope, $routeParams,  userAPI,$filter){

    $scope.changeurl= function(url,element){
       var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");
        $location.path("programme/" + str);

        element.stopPropagation();
        element.preventDefault();

    };

    userAPI.ChannelScheduleTodayTomorrow({dayparam: 1, channelid: $rootScope.Channelid}, function(rs) {
    $scope.todayPrograms = addData(rs.getchannelscheduletodaytomorrow.channelscheduletodaytomorrow);
    $scope.todayPrograms.channelid = $rootScope.Channelid;
  });

  userAPI.ChannelScheduleTodayTomorrow({dayparam: 2, channelid: $rootScope.Channelid}, function(rs) {
    $scope.tomorrowPrograms = addData(rs.getchannelscheduletodaytomorrow.channelscheduletodaytomorrow);
    $scope.tomorrowPrograms.channelid = $rootScope.Channelid;
  });

  $scope.dayparam = 1;

  $scope.todayFunction = function(){
    $scope.dayparam = 1;
    var current = new Date();
    $scope.selected_date.day_value= addZero(current.getDate());
    $scope.selected_date.day_name= dayName((new Date().getDay()), true);
    $scope.selected_date.date_string= toOrdinal(current.getDate()) + " " + monthName(current.getMonth()).substr(0,3);
    $scope.selected_date.value =0;
  }

  $scope.tomorrowFunction = function(){   
    $scope.dayparam = 2;
    var current = new Date();
    current.setDate(current.getDate()+1); 
    $scope.selected_date.day_value= addZero(current.getDate());
    $scope.selected_date.day_name= dayName((new Date().getDay()+1), true); 
    $scope.selected_date.date_string= toOrdinal(current.getDate()) + " " + monthName(current.getMonth()).substr(0,3);
    $scope.selected_date.value =1;
  }


  //////////////////////////
  // $filters Declaration //
  //////////////////////////

  var addZero = $filter('addZero');
  var dayName = $filter('getNameDay');
  var monthName = $filter('getNameMonth');
  var toOrdinal = $filter('toOrdinal');




  ////////////////////////
  // Calendar filter    //
  ////////////////////////

  $scope.calendar = [];
  $scope.ndays = 7;
  $scope.selected_date = {  
    date_string : toOrdinal(new Date().getDate()) + " " + monthName(new Date().getMonth()).substr(0,3) ,
    day_name    : dayName(new Date().getDay(),true),
    day_value   : addZero(new Date().getDate()),
    day_ordinal : toOrdinal((new Date()).getDate()),
    value       : 0
  };

  $scope.setCalendar = function() {
    var days = [];
    var current = new Date();

    for (var i = 0; i < $scope.ndays ; i++) {
      days.push({
        date_string : toOrdinal(current.getDate()) + " " + monthName(current.getMonth()).substr(0,3) ,
        day_name    : dayName((new Date().getDay()+i)%7, true),
        day_value   : addZero(current.getDate()),
        month_name  : monthName(current.getMonth()).substr(0,3),
        day_ordinal : toOrdinal(current.getDate()),
        value       : i
      });
      current.setDate(current.getDate()+1); 

    };
    $scope.calendar = days;
  };

  $scope.isDateSelected =  function(date) {
    return date.value === $scope.selected_date.value;
  };

  $scope.selectDate = function(obj, e) { 
    var clicked = e.target;

    $scope.selected_date = obj;
    //closes the popover
    $('div.qtip:visible').qtip('hide');
    $rootScope.dateParamInChannel = obj.value;
    loadNewContents(obj.value);    
  };

  // -- END Calendar

  loadNewContents = function(index){

    if(index == 0){
      $scope.dayparam = 1;   
      return;
    }

    if(index == 1){
      $scope.dayparam = 2;   
      return;
    }

    $scope.dayparam = index+1;   

    userAPI.ChannelScheduleTodayTomorrow({dayparam: $scope.dayparam, channelid: $rootScope.Channelid}, function(rs) {
      $scope.futurePrograms = addData(rs.getchannelscheduletodaytomorrow.channelscheduletodaytomorrow);
    });
  }

  $scope.checkDate = function(key){
    var dateKey = key - 1;
    if(dateKey == 1) {
      $rootScope.loadNextDay = true;
    }
  };

  $scope.showCategory = function(categoryName){
    if( categoryName && ( categoryName.toLowerCase() == 'film' || categoryName.toLowerCase() == 'movie' )){
      return 'Movie,';
    }else{
      return;
    }
  }
}]);

woi.controller("SimilarChannels", ['$scope', '$rootScope', '$filter', '$routeParams','userAPI', function($scope, $rootScope, $filter, $routeParams, userAPI){

  $scope.recommended     = [];
  $scope.paginate        = [];
  $scope.similarChannels = [];

  $scope.amount  = 0;
  $scope.step    = 5;

  $scope.showMore = true;

  $scope.loadMore = function(){
    if(!$scope.similarChannels.length)
      return false;
    $scope.amount= $scope.amount + $scope.step;

    if($scope.amount >= $scope.similarChannels.length){ 
      $scope.showMore = false;
      $scope.amount = $scope.similarChannels.length;
    }

    $scope.paginate = $scope.similarChannels.slice(0, $scope.amount);
  };

  userAPI.similarChannels({channelid: $rootScope.Channelid},function(rs){

    if(!rs.getsimilarchannels)
      return false;

    $scope.similarChannels = rs.getsimilarchannels.similarchannelslist;
    $scope.loadMore();
  });
}]);
