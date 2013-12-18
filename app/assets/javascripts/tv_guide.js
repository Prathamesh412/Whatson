woi.controller("TVGuide_GridController", ['$scope','$location', '$rootScope', '$filter', '$location', '$routeParams', '$timeout', 'userAPI',function($scope,$location, $rootScope, $filter, $location, $routeParams, $timeout, userAPI){

    $scope.changeurl= function(url,element){

        var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");
        $location.path("programme/" + str);

        element.stopPropagation();
        element.preventDefault();

    };

    $scope.changechannelurl= function(url,element){

       var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");
        $location.path("programme/" + str);

        element.stopPropagation();
        element.preventDefault();

    };

  //Date selected from Channel details page
  if(!_.isUndefined($rootScope.dateParamInChannel) && !_.isNull($rootScope.dateParamInChannel)) {
    $scope.channelSelectedDate = $rootScope.dateParamInChannel;
    $rootScope.dateParamInChannel = null;
  }
  // Set thisPage from URL in case it's not set
  if(!$scope.thisPage) {
    $scope.thisPage = ( $location.path().split('/')[1] ).toLowerCase();
  }

  // Highlight in main menu
  if($scope.thisPage === 'tvGuide' || $scope.thisPage === 'tv-guide' || $scope.thisPage === 'tv-listings') {
    $rootScope.$broadcast('highlightTvGuide', []);
  }

  // Rootscope code for description popover
  $rootScope.showinfo = {};

  // Code to show the loading indicator before the TVGuide loads
  var loading       = $filter('loading');
  var $loaderTarget = $('.emptyGuideLoader');
  loading('show', {element: $loaderTarget});

  // Set the firstload flag
  var firstLoad = true;

  // Set the currentDate flag
  $scope.currentDate = true;

    $scope.phoneSidebar = 'off';

    $scope.toggleSidebar= function(status){
      $scope.phoneSidebar = status;
    };
  
  $scope.initTimeline = function(){
    for(var t = 0; t < 24; t++){
      var d = new Date();

      $scope.timeline.push({
        hour:t+':00',
        time:t+'00'+d.getDate()+d.getMonth(),
        // active:(t == d.getHours() && d.getMinutes() < 30)
        active:(t == d.getHours())
      });
    }

    for(var t = 0; t < 24; t++){
      var d = new Date();

      $scope.halfTimeline.push({
        hour:t+':30',
        time:t+'30'+d.getDate()+d.getMonth(),
        active:(t == d.getHours() && d.getMinutes() >= 30)
      });
    }
  };

  // Total hours of data to be loaded.
  var _DIFF;
  
  if($rootScope.device.isMobile) {
    _DIFF = 24;
  } else {
    _DIFF = 24;
  }

  var reset = function(){
    $scope._MODEL       = [];
    $scope._SAVED_DATA  = {};
    $scope._MAPPING     = {};
    $scope.timeline     = [];
    $scope.halfTimeline = [];  
    $scope.hourWidth    = 250;
  
    $scope.scrollValue   = 300;
    $scope.allowRequests = true;    
    $scope.pageNo        = 1;
    $scope.isEmpty       = true;
    $rootScope.loadingBelow  = true;
    $rootScope.emptyResult = false;
    $rootScope.tvGuideVisibleRows = 0;
    $scope.loadingContent= false;
    $scope.notEnoughFavorites = false;
    $scope.channelLimitReached = false;

    $scope.initTimeline();

    // API fingerprint
    var apiKey = (new Date()).getTime();

    // Stash the description popover in a safe place, it'll run away otherwise
    var $slider    = $("#tv_guide_container .slider");
    var $descriptionPopover = $slider.find('#description-popover');
    
    $timeout(function() {
      $slider.prepend($descriptionPopover);
      $descriptionPopover.hide();
    });

    $timeElapsed.height('100%');
  };
  
  $rootScope._currentDayParam   = ( $rootScope.loadNextDay ? 1 : 0 );
  $rootScope._currentTvOperator = 0;  
  $rootScope._currentGenre      = 'all';
  $rootScope._hourValue         = (new Date()).getHours();

  var addTOModel = function(apiResults, _channelResults){
    
    var counter = 0;
    var cIDs = Object.keys($scope._MAPPING);
    var cIDsLength = cIDs.length;    
    var channelResults = {};

    _.each(_channelResults, function(item) {      
      channelResults[item.ChannelID] = item;  

      if(!$scope._MAPPING[item.ChannelID] && $scope._MAPPING[item.ChannelID] != 0){
        $scope._MAPPING[item.ChannelID] = cIDsLength + counter;    
        counter++;  
      }      
    });
    
    // console.log("MAPPING === ",$scope._MAPPING);

    _.each(apiResults, function(item) {

      if(!$scope._MODEL[$scope._MAPPING[item.channelid]]) {
        $scope._MODEL[$scope._MAPPING[item.channelid]] = {
          channel_info: channelResults[item.channelid],
          programs: []
        };        
      }

      var thisArray = $scope._MODEL[$scope._MAPPING[item.channelid]]['programs'],
          arrayLength = thisArray.length;

      for(var i = 0; i < arrayLength; i++) {
        if( thisArray[i].starttime == item.starttime ) {
          // Programme is a replica
          return false;
        }
      }

      $scope._MODEL[$scope._MAPPING[item.channelid]]['programs'].push(item);
    });
    $rootScope.loadingBelow = false; 
  };

  $scope.$on('tvGuide:notEnoughFavorites', function(e, a){
    // console.log('tvGuide:notEnoughFavorites', $rootScope.tvGuideVisibleRows);
    var visibleChannels = $rootScope.tvGuideVisibleRows,
        timeElapsedHeight = visibleChannels * 70 + 'px',
        messageMargin = (visibleChannels < 7 ? (visibleChannels * 70) - 500 + 'px' : '0px');

    if( $scope._currentGenre == 'favorite' && (visibleChannels < 7 || $scope.notEnoughFavorites) ) {
      // console.log('Making adjustments', visibleChannels)
      $timeElapsed.height(timeElapsedHeight);
      // $scope.notEnoughFavorites = true;
      $notEnoughFavorites.css('margin-top', messageMargin);
    } else {
      $timeElapsed.height('100%');
      // $scope.notEnoughFavorites = false;
      $notEnoughFavorites.css('margin-top', 0);
    }

    if(a.adjust && $scope._currentGenre == 'favorite') {
      $scope.adjustHeight();
      $rootScope.emptyResult = false;
    }
  });

  $scope.currentNavButton = 'now';
  $scope.currentPosition  = 0;

  var $container          = $("#tv_guide_container");
  var $slider             = $container.find(".slider");
  var $tvGuide            = $(".tv_guide");
  var $channels           = $(".tv_guide .channels");
  var $arrows             = $tvGuide.find(".arrow");
  var $sidebar            = $('.main-section > .sidebar');
  var $timeElapsed        = $('.time-elapsed');
  var $notEnoughFavorites = $('#notEnoughFavorites');

  // Initialize everything.
  reset();

  $scope.disableArrow = function(selector){
    $arrows.removeClass('disabled');
    if(selector == 'prev' || selector == 'next'){
      $arrows.filter('.' + selector).addClass("disabled");  
    }
  };

  $scope.slideToNow = function(){
    // Enable the arrow buttons
    $scope.disableArrow();

    var hour = (new Date()).getHours(),
        sliderWidth = $slider.width(),
        containerWidth = $tvGuide.width(),
        maxOffset = -(sliderWidth - containerWidth + 86);
    $scope.currentPosition = -(hour * $scope.hourWidth);

    // Make sure the animation doesn't overshoot
    if( $scope.currentPosition < maxOffset ) {
      $scope.currentPosition = maxOffset;
    }

    $slider.stop().animate({left: $scope.currentPosition + "px"},750);
    $scope.currentNavButton = 'now';
  };

  $scope.moveNext = function(){
    $scope.slideToNow();
    $scope.moveSlider(true);
    
    $scope.currentNavButton = 'next';
  };

  $scope.moveSlider = function(forward){
    var sliderPosition = Math.floor(Math.abs($slider.position().left)) + ( forward ? 10 : -10 ),
        sliderWidth = $tvGuide.width(),
        calculatedPage = Math.floor(sliderPosition / hourWidth),
        remainder = sliderPosition % hourWidth;

    $scope.currentNavButton = '';

    if(forward) {
      if(calculatedPage > 23) {
        calculatedPage = 23;
      }
      calculatedPage++;
    } else {
      if(!remainder) {
        calculatedPage--;
      }

      if(calculatedPage <= 0) {
        calculatedPage = 0;
      }
    }
  
    // Basically this is (Total width of slider content - width of parent + width covered by the channel icons on the left)
    var maxLeft = ( 24 * $scope.hourWidth ) - sliderWidth + 86,
        newLeft = -(calculatedPage * $scope.hourWidth);

    $scope.disableArrow();

    if(newLeft < - (maxLeft + 4) ){
      newLeft = - maxLeft;
      $scope.disableArrow('next');
    }

    if(newLeft >= 0) {
      newLeft = 0;
      $scope.disableArrow('prev');
    }

    $slider.stop().animate({left: newLeft + "px"}, 250);
    $scope.currentPosition = newLeft;
    if($rootScope.device.isMobile) {
      $scope.horizontalPageScrolled($scope.currentPosition, forward);
    }
  };

  $scope.moveTo = function(index, forward) {
    var sliderWidth = $tvGuide.width();
    var maxLeft = ( 24 * $scope.hourWidth ) - sliderWidth + 86,
        newLeft = -(index * $scope.hourWidth);

    if(newLeft < - (maxLeft + 4) ){
      newLeft = - maxLeft;
      $scope.disableArrow('next');
    }

    if(newLeft > 0) {
      newLeft = 0;
      $scope.disableArrow('prev');
    }

    // $slider.stop().queue('fx', []).animate({left: newLeft + "px"}, 250);
    $slider.stop().animate({left: newLeft + "px"}, 250);
    $scope.currentPosition = newLeft;
    $scope.horizontalPageScrolled($scope.currentPosition, forward);
  }

  $scope.expandNowNext = function(){


    var $content = $('.main-section > .content');
    var $expandBtn = $('.expand-btn');
    var $nowAndNext = $sidebar.find('.now-and-next');
    var $descriptionPopover = $('#description-popover');
    var $recommendations = $('.recommendations');
    var $tvGuideSlider = $sidebar.find('.slider');
    var $featured = $(".featured");
    var featVideoID = $featured.find('.active .player iframe').attr('id');
    var featHTML5VideoID = $featured.find('.active .player > div').attr('id');
    var _v_control = $featured.find('.active .vjs-play-control');

    //toggle expand
    if(!$sidebar.hasClass('expand')){
      $recommendations.addClass('fade');
      $content.addClass('fade')
      .delay(600)
      .show(function(){
        $(this).addClass('shrink');
        $sidebar.addClass('expand'); 
        $expandBtn.addClass('expanded').text('Collapse');
        $nowAndNext.removeClass('sidebar');
        if($tvGuideSlider.position().left < -5000) {
          $scope.moveTo(20);
        }

        // Stop the playback of any featured YouTube videos
        if(featVideoID){
          callPlayer(featVideoID, function() {
              callPlayer(featVideoID, "stopVideo");
          });
        }

        // Stop the playback of any feature non-YT videos
        if(featHTML5VideoID){
          $featured.find('.active .play').show().click(function(){
             if(_v_control.hasClass('vjs-paused')){
                _v_control.eq(0).click();
                $featured.find(".player > div:gt(0)").remove();
                return false;
             }
          });
          _V_(featHTML5VideoID).pause();
        }
      });
    } else {
      $sidebar.find('.slider .active').removeClass('active');

      // In case there are still expanded items in the tvGuide, let's collapse those
      var expandedElements = $tvGuideSlider.find('.expanded'),
          elementCount = expandedElements.length;
      for(var i = 0; i < elementCount; i++) {
        var thisElement = expandedElements[i],
            originalWidth = thisElement.getAttribute('data-originalWidth'),
            wasInfo = thisElement.getAttribute('data-wasInfo'),
            oldLeft = thisElement.getAttribute('data-oldLeft');

        if(originalWidth) {
          thisElement.removeAttribute('data-originalWidth');
          $(thisElement).width(originalWidth + 'px');
        }

        if(oldLeft) {
          thisElement.removeAttribute('data-oldLeft');
          $(thisElement).css({left: oldLeft + 'px'});
        }

        if(wasInfo) {
          $(thisElement).addClass('info');
          thisElement.removeAttribute('data-wasInfo');
        }
      }

      $descriptionPopover.hide();
      $tvGuideSlider.prepend($descriptionPopover);
      $sidebar.removeClass('expand')
      .delay(500)
      .show(function(){
        $content
        .removeClass('shrink')
        .removeClass('fade');
        $expandBtn.removeClass('expanded').text('Expand');
        $recommendations.removeClass('fade');
      });

      $nowAndNext.addClass('sidebar');
    }
  };

  $scope.horizontalPageScrolled = function (negValue, forward){
    // console.log(' UPDATED negValue ----->>>>  === '+negValue); 
    if( !$rootScope.device.isMobile ) {
      // console.log('Not a mobile, return false');
      return false;
    }
    // Disable the Now button
    // $scope.$apply(function(){
      $scope.currentNavButton = '';
    // });

    var inView = Math.floor((negValue * (-1)) / ($scope.hourWidth * 2));
    // console.log('inView === '+inView);
    // console.log('visible screen == '+inView + '  -------->   ' +(inView + 1));

    // check what is loaded...
    var windowScroll = $(document).scrollTop();
    // console.log('windowScroll  === '+ windowScroll);
  
    var windowHeight = $(window).height();
    // console.log('window height ======= '+ windowHeight);

    var _OFFSET = (windowHeight / 2) + windowScroll;// + 245;

    // console.log('_OFFSET --- '+ _OFFSET);

    // get the page no.
    var _PAGE = 0;

    do {
      _OFFSET = _OFFSET - 490;
      _PAGE ++;
    } while ( _OFFSET > 245 ); 

    $scope.pageNo = _PAGE;
    // console.log('after computation == _OFFSET == '+_OFFSET);
    // console.log('after computation == _PAGE == '+_PAGE);
    // console.log('saved data $scope._SAVED_DATA[_PAGE] == ' , $scope._SAVED_DATA[_PAGE]);

    // console.log('inView == '+inView);
    // console.log('check == ', $scope._SAVED_DATA[_PAGE].indexOf(inView));

    // console.log('forward... ===== '+forward ); 
    // console.log('Before checking state:', $scope._SAVED_DATA, _PAGE, inView + 1, inView - 2);
    if(forward){
      // console.log('forward... ');

      // Check if we already have the data      
      if($scope._SAVED_DATA[_PAGE].indexOf(inView + 1) != -1){
          // console.log('yippe we have the data');  
      } else {
        // get the MAX
        var _from = ($scope._SAVED_DATA[_PAGE].sort(function(a,b){return b - a}))[0];
        _from = _from + 1;  
        // console.log('_from === ',_from);
                      
        // Desktop
        if(_from > 22){
          _from = 22;
        }
        $scope.currentPosition = _from;
        $rootScope._hourValue = _from;

        // console.log('$rootScope._hourValue == '+$rootScope._hourValue);
        // console.log('$scope.pageNo == '+$scope.pageNo);
        // console.log('Loading data from hour', _from);
        $scope.$broadcast('FILTER:tv-gude', 'hours', $rootScope._hourValue);        
      }
    } else {
      // Scrolled in Reverse Direction.
      // console.log('backward');

      // Check if we already have the data 
      if($scope._SAVED_DATA[_PAGE] && $scope._SAVED_DATA[_PAGE].indexOf(inView - 1) != -1){
        // console.log('yippe we have the data');  
      } else {
        // get the minimum 
        var _from = ( $scope._SAVED_DATA[_PAGE] ? ($scope._SAVED_DATA[_PAGE].sort(function(a,b){return a - b}))[0] : 0);
        _from = _from - 1 ;  
        // console.log('_from === ',_from);
               
        // Desktop
        if(_from < 0){
          _from = 0;
        }
        $scope.currentPosition = _from;
        $rootScope._hourValue = _from;

        // console.log('$rootScope._hourValue == '+$rootScope._hourValue);
        // console.log('$scope.pageNo == '+$scope.pageNo);
        // console.log('Loading data from hour', _from);
        $scope.$broadcast('FILTER:tv-gude', 'hours', $rootScope._hourValue);  
      }
    }
  };

  $scope.adjustHeight = function() {
    // console.log('inside adjustHeight()....');
    channelCount = $rootScope.tvGuideVisibleRows;

    var height = (channelCount * 70) + 37 +"px";

    // $container.css("height", height).closest(".tv_guide").css("height", height);
    $container.height(height).closest(".tv_guide").height(height);
    //fix for white space issue
    // $channels.css({"height":  70 * channelCount});
    $channels.height(70 * channelCount + 'px');
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

  $scope.$on('FILTER:tv-gude', function(event, key, value) {
    if(key=='calendar' && value != $scope.channelSelectedDate && !firstLoad){
      $scope.channelSelectedDate = null;
    }
    $scope.safeApply(function() {
      $rootScope.loadingBelow = true;
    });

    // If we have to load next page, don't reset
    if(key != 'pageno' && key != 'hours'){      
      reset();
    }

    var params = {
      userid       : $rootScope.getUser().userid,            
      totalhrdata  : _DIFF      
    };

    // Tv Operator
    if( key == 'tv_operator') {  
      params.context = 'applicationname=sourcebits;headendid='+value;
    } else {
      params.context = 'applicationname=sourcebits;headendid='+$rootScope._currentTvOperator;
    }

    // Top Filters
    if ( key == 'nav') {      
      params.channelgenre = value;
    } else {
      params.channelgenre = $scope._currentGenre;
    }

    // Calendar
    if ( key == 'calendar') {
      params.dateselected = value;
      $timeout(function() {
        if(value > 0) {
          $scope.moveTo(0);
          $scope.currentDate = false;
          $timeElapsed.hide();
        } else {
          $timeElapsed.show();
          $scope.slideToNow();
        }
      });
    } else {
      params.dateselected = $rootScope._currentDayParam;
      if(!_.isUndefined($scope.channelSelectedDate) && !_.isNull($scope.channelSelectedDate)) {
        params.dateselected = $scope.channelSelectedDate;
      }
      $scope.currentDate = true;
    }

    if( key == 'pageno') {
      params.pageno = value;
    } else {
      params.pageno = $scope.pageNo;
    }

    if ( key == 'hours') {
      params.starthour = value;
    } 
    else {
      params.starthour = $rootScope._hourValue;
    }

    // For desktop, force loading of 24 hours of data
    // if(!$rootScope.device.isMobile) {
      params.starthour = 0;
    // }
    // console.log('Loading hour', params.starthour, 'of page', params.pageno);
    // Check if a channel ID is passed on the first load
    if(firstLoad) {
      if(angular.isDefined($routeParams.channelid)){
        // extends the params with channel id key  
        params.channelid = $routeParams.channelid;
        $rootScope.highlightedChannel = $routeParams.channelid;
      }
      firstLoad = false;
    }

    if(!_.isUndefined($scope.channelSelectedDate) && !_.isNull($scope.channelSelectedDate)) {
      params.dateselected = $scope.channelSelectedDate;
    }

    // console.log('>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< ********************* THE PARAMS ARE === ');
    // console.log(params);

    apiKey = (new Date()).getTime();

    (function(params, requestKey){
      $rootScope.emptyResult = false;
      userAPI.getTVGuideInfo(params, function(rs){


        if( requestKey != apiKey ) return false;

        // console.log('got the new detils ..... ',rs);
        $scope.allowRequests = true;

        if(!rs.gettvguidewithgenre){
          if( $scope._currentGenre == 'favorite' ) {
            $scope.notEnoughFavorites = true;
            $scope.channelLimitReached = true;
            $rootScope.$broadcast('tvGuide:notEnoughFavorites', {counter: $rootScope.tvGuideVisibleRows, adjust: true});
          } else {
            $rootScope.emptyResult = true;
          }
          $rootScope.loadingBelow  = false;
          return false
        }

        if(params.channelgenre != $rootScope._currentGenre){
          return false;
        }
        
        var modelSize = Object.keys( $scope._MODEL ).length;
        if(modelSize == 0 && $scope.currentDate) {
          $scope.slideToNow();
        } else if(modelSize == 0) {
          $scope.moveTo(0);
        }

        $scope.isEmpty = false;

        rs.gettvguidewithgenre.tvguideprogrammewithgenrelist = addData(rs.gettvguidewithgenre.tvguideprogrammewithgenrelist);
        rs.gettvguidewithgenre.channelinfo                   = addData(rs.gettvguidewithgenre.channelinfo);

        var channelCount = rs.gettvguidewithgenre.channelinfo.length;
        $rootScope.tvGuideVisibleRows += channelCount;
        // console.log('Adding', channelCount, 'new channels.', $rootScope.tvGuideVisibleRows);
        if( (!channelCount || channelCount < 7) && $scope._currentGenre == 'favorite' ) {
          $scope.notEnoughFavorites = true;
          $scope.channelLimitReached = true;
          // Special case in for $scope._currentGenre == favorite
          // The number of channels may be less than 7, so we need to change the height of the 
          // time-elapsed indicator and the position of the error message. 
          $rootScope.$broadcast('tvGuide:notEnoughFavorites', {counter: $rootScope.tvGuideVisibleRows, adjust: true});
        }

        addTOModel(rs.gettvguidewithgenre.tvguideprogrammewithgenrelist, rs.gettvguidewithgenre.channelinfo);
        if( $scope.thisPage === 'home' && $scope.pageNo == 1 && !$rootScope.device.isMobile && !$rootScope.device.isTablet && !$rootScope.device.isTouch ) {
          $scope.pageNo++;
          $scope.$broadcast('FILTER:tv-gude', 'pageno', $scope.pageNo);
        }
        
        // console.log("FINAL MODEL === ", $scope._MODEL);

        for(var i=params.starthour; i < (params.starthour + _DIFF); i++){
          if(!$scope._SAVED_DATA[params.pageno]) {       
            $scope._SAVED_DATA[params.pageno] = [];       
          }
          $scope._SAVED_DATA[params.pageno].push(i);
        }
        // console.log('After saving state:', $scope._SAVED_DATA);

        $scope.scrollValue = $scope.scrollValue - 1000;

        $scope.adjustHeight();

        var $channels = $('.channels');
        $timeout(function() {
          $channels = $channels.find('> ul > li');
          $rootScope.tvGuideVisibleRows = $channels.length;
        });
      });
    })(params, apiKey);
  });

  $(function() {
    //
    // Extend jQuery feature detection
    //
    $.extend($.support, {
      touch: "ontouchend" in document
    });
    
    //
    // Hook up touch events
    //
    if ($.support.touch) {
      var tvGuide = $('.tv_guide .slider').get(0);
      if(tvGuide) {
        tvGuide.addEventListener("touchstart", iPadTouchHandler, false);
        tvGuide.addEventListener("touchmove", iPadTouchHandler, false);
        tvGuide.addEventListener("touchend", iPadTouchHandler, false);
        tvGuide.addEventListener("touchcancel", iPadTouchHandler, false);
      }
    }
  });

  if($scope.thisPage === 'home') {
    $scope.$broadcast('FILTER:tv-gude', 'hours', $rootScope._hourValue);
  }

  $scope.loadOnScrollTop = function(){
    if( $scope.thisPage === 'home' || $scope.channelLimitReached ) return false;
    
    var windowScroll = $(document).scrollTop();  
    var windowHeight = $(window).height();
    var _OFFSET = (windowHeight / 2) + windowScroll;// + 245;

    var _PAGE = 0;

    do {
      _OFFSET = _OFFSET - 490;
      _PAGE ++;
    } while ( _OFFSET > 245); 

    //console.log('Calculated ..... pageno == ', _PAGE);
    // console.log('loadOnScrollTop $scope.allowRequests  ..... == ', $scope.allowRequests);
    
    if(_PAGE == $scope.pageNo){
      $scope.allowRequests = true;
    } else {
      $scope.pageNo = _PAGE;  
       
      if(!$scope._SAVED_DATA[$scope.pageNo]) {
        // console.log('we dont have data');
        // console.log('will call with page no.   === ' + $scope.pageNo);

        if($scope.allowRequests){
          $scope.allowRequests = false;
          $scope.$broadcast('FILTER:tv-gude', 'pageno', $scope.pageNo);
        }
      } else {
        // console.log('i guess we have the data $rootScope._hourValue === '+$rootScope._hourValue);

        var inView = Math.floor(($scope.currentPosition * (-1)) / ($scope.hourWidth * 2));

        // console.log('inView == '+inView);
        // console.log('$scope._SAVED_DATA[$scope.pageNo] === ', $scope._SAVED_DATA[$scope.pageNo]);
        // console.log('_SAVED_DATA' ,$scope._SAVED_DATA[$scope.pageNo].indexOf($rootScope._hourValue));

        if($scope._SAVED_DATA[$scope.pageNo].indexOf($rootScope._hourValue) == -1){
          if($scope.allowRequests){

            // console.log('will make a request .....');
            $scope.allowRequests = false;
            $scope.$broadcast('FILTER:tv-gude', 'hours', $rootScope._hourValue);
          }
        }
      }
    }
  };

  // $('#heartImage').live('mouseout',function(){
  //   $(this).removeClass('grayscale');
  // });

  // $('#heartImage').live('mouseover',function(){
  //   $(this).addClass('grayscale');
  // });
  
  $scope.$on('tvGuide:updateIndent', function(e, a) {
    $scope.$apply(function(){
      $scope.currentPosition = a.position;
    });
  });

}]);

woi.controller("GenreController", ['$scope', '$rootScope', '$filter', 'userAPI', 'tsmAPI',  function($scope, $rootScope, $filter,  userAPI, tsmAPI){
  $scope.setGenre = function(genreName) { 
    
    $rootScope._currentGenre = genreName;

    $rootScope.$broadcast('FILTER:tv-gude', 'nav', genreName);

  };
}]);

woi.controller("TVGuide_OperatorsController", ['$scope', '$rootScope', '$filter', 'userAPI', 'tsmAPI',  function($scope, $rootScope, $filter,  userAPI, tsmAPI){


  $scope.allOperators = [];
  $scope.paginateOps  = [];

  $scope.selectedOperator;

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
  
  $scope.breakIt = false;
  $scope.preSelectedOperator = {};

  $scope.update = function(){

    if($scope.allOperators.length > 0){
      // console.log('already have the list');
      return false;
    }

    $scope.safeApply(function() {
      $scope.noTvOperators = false;
    });
    
    var params = {
      userid: $rootScope.getUser().userid
    };

    if(angular.isDefined($rootScope.userInfo.areaid)){
      params.areaid = $rootScope.userInfo.areaid;
    }

    if(angular.isDefined($rootScope.userInfo.cityid)){
      params.cityid = $rootScope.userInfo.cityid;
    }

    if(angular.isDefined($rootScope.userInfo.stateid)){
      params.stateid = $rootScope.userInfo.stateid;
    }

    // console.log(' the params for the tv-operators are .... ', params);

    tsmAPI.getOperatorList(params, function(rs) {

      if(!rs.getoperators){
        
        var obj = {
          operator_name : 'TV Operator',
          operator_id   : 0
        };        
        $scope.selectOperator(obj); 

        $scope.noTvOperators = true;
        return false;
      }
       
      
      $scope.allOperators = addData(rs.getoperators.operatorslist);
      $scope.paginateOps = $scope.allOperators.slice(0, 8);

      for(var i=0; i<$scope.allOperators.length; i++){
        
        if($scope.breakIt){
          $scope.allOperators[i].isoperatoradded = "0";
        }

        if($scope.allOperators[i].isoperatoradded == "1"){
                  
          $scope.breakIt = true;
          $scope.preSelectedOperator = $scope.allOperators[i];          
        }
      }

      if(angular.isDefined($scope.preSelectedOperator.operator_id)){
        // console.log('.................. YES  ');
        $scope.selectOperator($scope.preSelectedOperator);
      }else{
        // console.log('.................. NO  ');
        var obj = {
          operator_name : 'TV Operator',
          operator_id   : 0
        };
        $scope.selectOperator(obj);        
      }
      
      
    });
  }

  
  $scope.update();
  
  
  $scope.clickIt = function(op){
    
    if(op.isoperatoradded == "1"){
      return true;
    }
  };
  $scope.viewAllOperators = function(){
  
    $scope.paginateOps = $scope.allOperators;
  };
  

  $scope.selectOperator = function(operatorObj){
    $('div.qtip:visible').qtip('hide');
    $scope.selectedOperator = operatorObj.operator_name;
    
    // Update the operator name in the UI
    var operatorUI = $('.operator-name');
    operatorUI.html(operatorObj.operator_name)
    
    $rootScope._currentTvOperator = operatorObj.operator_id;
    
    $rootScope.$broadcast('FILTER:tv-gude', 'tv_operator', operatorObj.operator_id);
  };

  $scope.$on('update:location', function(event, locationObj) {   
    
    // console.log('update:location TV _GUIDE . JS', locationObj);

    $scope.allOperators = [];
    $scope.paginateOps  = [];

    if($scope.allOperators.length == 0){
    
      setTimeout(function(){      
        $('.tvop:first').attr('checked', 'checked');
      },5);  
    }

    $scope.locationString    = locationObj.cityname;
    
    $('.location-string').html(locationObj.cityname);


    var userDetails = $rootScope.getUser();

    if(userDetails.userid == -1 || !$rootScope.isUserLogged()){      
      return false;
    }

    $rootScope.userInfo.City      = locationObj.cityname;
    $rootScope.userInfo.areaid    = locationObj.areaid;
    $rootScope.userInfo.areatype  = locationObj.areatype;
    $rootScope.userInfo.cityid    = locationObj.cityid;
    $rootScope.userInfo.cityname  = locationObj.cityname;
    $rootScope.userInfo.placename = locationObj.placename;
    $rootScope.userInfo.stateid   = locationObj.stateid;
    $rootScope.userInfo.statename = locationObj.statename;
    $rootScope.userInfo.countryid = locationObj.countryid;
    // console.log('callFilter..... >>>><<< updated $rootScope.userInfo.cityid  == '+$rootScope.userInfo.cityid  );
    // Update the cookie as well 
    $.cookie('userInfo', JSON.stringify(userDetails), {expires:365});

  }); 

}]);

woi.controller("CalendarController", ['$scope', '$rootScope', '$filter', 'userAPI', 'tsmAPI',  function($scope, $rootScope, $filter,  userAPI, tsmAPI){

  //////////////////////////
  // $filters Declaration //
  //////////////////////////

  var addZero   = $filter('addZero');
  var dayName   = $filter('getNameDay');
  var monthName = $filter('getNameMonth');
  var toOrdinal = $filter('toOrdinal');
  var firstLoad = true;

  ////////////////////////
  // Calendar filter    //
  ////////////////////////

  $scope.calendar = [];
  $scope.ndays = 7;
  var D = new Date();

  if($rootScope.loadNextDay) {
    D.setDate( D.getDate() + 1 );
  }
  $scope.selected_date = {  
    date_string : toOrdinal(D.getDate()) + " " + monthName(D.getMonth()).substr(0,3) ,
    day_name    : dayName(D.getDay(), true),
    day_value   : addZero(D.getDate()),
    day_ordinal : toOrdinal(D.getDate()),
    value       : ( $rootScope.loadNextDay ? 1 : 0 )
  };

  $rootScope.loadNextDay = false;

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
    $rootScope._currentDayParam = obj.value;
    $scope.channelSelectedDate = null;
    $rootScope.$broadcast('FILTER:tv-gude', 'calendar', obj.value) ;
  };

  // For WR-802 //
  if(firstLoad && !_.isUndefined($scope.channelSelectedDate) && !_.isNull($scope.channelSelectedDate)){   
    $scope.setCalendar();   
    $scope.selected_date = _.select($scope.calendar,function(day){if(day.value == $scope.channelSelectedDate) return day;});
    $scope.selected_date = $scope.selected_date[0];
    if($scope.selected_date.value > 0){
      $scope.moveTo(0);
      $scope.currentDate = false;
      var $timeElapsed  = $('.time-elapsed');
      $timeElapsed.hide();
    }
    firstLoad = false;
  }


  // -- END Calendar
}]);

woi.controller("UserLocationController", ['$scope', '$rootScope','$routeParams','autoAPI','userAPI', function($scope, $rootScope, $routeParams,autoAPI,userAPI){
   
  if(angular.isDefined($rootScope.getUser().City)){
    // we have the city name already
    $scope.locationString = $rootScope.getUser().City;
  }else{

    // find the city state using the Auto location    
    var city = geoip_city();
    //var state = geoip_region_name();

    $scope.locationString = city;
  }

  // autoCompleteFunction
  $scope.triggerAutoComplete = function( string, callback){
    
    if(string.length < 2)
      return false;

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

    autoAPI.autoCompleteLocation( {placename:string}, function(rs){

      // if(rs.response.docs == undefined) 
      // return false;
      $scope.safeApply(function() {
        $scope.autoComplete.data = rs.response.docs;
        // Updates the model on DOM to submit the correct url
      });

      if (callback && typeof(callback) === "function") {
        callback($scope.autoComplete.data);
      }
    });
  };

  $scope.callFilter = function(locationObj){
    
    // console.log('callFilter..... >>>><<<');

    var params = {
      city    : locationObj.cityname, 
      state   : locationObj.statename, 
      area    : locationObj.areaid, 
      userid  : $rootScope.getUser().userid
    };
    // console.log('updating params ');
    // console.log(params);
    userAPI.updateUserLocationDetails(params, function(rs){

      if(rs.response.responsestatus){
        // console.log('callFilter..... >>>><<< will call');
        $rootScope.$broadcast('update:location', locationObj);
      }
    });
    

    //$rootScope.$broadcast('update:filter-operators',locationObj);
  };
  
}]);