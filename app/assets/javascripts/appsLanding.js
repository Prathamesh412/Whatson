woi.controller("AppsLandingPageController", ['$scope', '$rootScope', '$filter', '$timeout', '$location', '$routeParams','userAPI', function($scope, $rootScope, $filter, $timeout, $location, $routeParams, userAPI){

  // Highlight menu item
  $rootScope.$broadcast('highlightApps', []);

  // Controller variables
  $scope.appDetails = [], // We'll be accumulating all the appDetails in this object array
  $rootScope.selectedApp; // We'll be assigning the selected app to this, to show in the view

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

  // DOM references
  var $sliderWrap = $('.swiper-container'),
      $sliderSlides = $sliderWrap.find('.swiper-wrapper'),
      $descriptionWrap = $('.content .bodyText'),
      $testimonialWrap = $('.testimonials .content-wrapper'),
      $tabsWrap = $('.as_control'),
      $pagination = $('#devicePagination'),

      // External helpers
      loading = $filter('loading'),

      // Slider
      appSwiper;
      $scope.isSliding = false; 


  // Bind swipteTo() to the swiper, to enable slide on click
  $('.pagination1 .swiper-pagination-switch').live('click', function(){
    appSwiper.swipeTo($(this).index());
      $scope.safeApply(function(){
        $scope.showRight = true;
        $scope.showLeft  = true;
      });
        
    if(appSwiper.currentSlide() == appSwiper.getFirstSlide()){  
      $scope.safeApply(function(){
        $scope.showLeft = false;  
      });
    }
    else if(appSwiper.currentSlide() == appSwiper.getLastSlide()){
      $scope.safeApply(function(){
        $scope.showRight = false;  
      });
    }

  })

  $scope.showRight = true;
  $scope.showLeft  = false;

    // Initializes the swiper plugin
  var initSwiper = function() {
    appSwiper = new Swiper('#swiper-container1', { 
      speed: 750,   // duration of animation between slides(in ms).
      pagination: '#devicePagination',  // CSS selector of the container with pagination.
      onSlideChangeEnd:function(){    //Callback function, will be executed after animation to other slide (next or previous).
        // alert(1);
        $scope.safeApply(function(){
        $scope.isSliding = false;
          $scope.showRight = true;
          $scope.showLeft = true;
      });
        
        if ((appSwiper.activeIndex ) == appSwiper.getLastSlide().index()) {
            $scope.showRight = false;
            if(!$scope.$$phase)
              $scope.$apply();
        }
        if ((appSwiper.activeIndex ) == appSwiper.getFirstSlide().index()) {
            $scope.showLeft = false;
            if(!$scope.$$phase)
              $scope.$apply();
        }
      }
    });
      // if(appSwiper){
      //   appSwiper.swipeTo(0, 1);
      // }
  }

//when user click left arrow
  $scope.moveLeft = function(e){
    if(!$scope.isSliding){
      $scope.showRight = true;
      $scope.isSliding = true;
      appSwiper.swipePrev();
    }
  };
  
  //when user click right arrow
  $scope.moveRight = function(e){
    if(!$scope.isSliding){
      $scope.showLeft  = true;
      $scope.isSliding = true;
      appSwiper.swipeNext();
    }
  };


  /*
   *  Controller main action, functionality & debugging starts from here
   */

  // Update loading status in UI
  loading('show', {element: $tabsWrap});
  loading('show', {element: $sliderWrap});
  if($rootScope.device.isMobile) {
    $tabsWrap.hide();
  }

  // Get the app details
  userAPI.getAppDetails({}, function(r){
    loading('hide', {element: $tabsWrap});
    if(!r.getallapps.appslist) { return false; }

    // Assign the response to the scope
    $scope.appDetails = r.getallapps.appslist;

    // Generate the CSS classnames
    generateClasses();

    // Generate the flags
    generateFlags();

    // Assign the store names associated with each device
    generateStores();

    // Load the selected app, or the first one if there is no selection, and we're off!
    if($routeParams.appid) {
      $scope.loadApp($routeParams.appid - 1);
    } else {
      if($rootScope.device.isMobile) {
        $scope.loadApp(2);
      } else {
        $scope.loadApp(0);
      }
    }
  });


  /*
   *  Controller helper functions
   */

  // This function generates the CSS classes to be assigned to each device.
  // Class format is 'tab_' + deviceName.removeSpaces.toLowerCase
  var generateClasses = function() {
    if(!$scope.appDetails) { return false; }

    var totalDevices = $scope.appDetails.length;

    for(var i = 0; i < totalDevices; i++) {
      $scope.appDetails[i].classname = 'tab_' + $scope.appDetails[i].appname.replace(' ', '').toLowerCase();
    }
  }


  // Reinitializes the swiper plugin, use this after getting data from the
  // API
  var reinitSwiper = function() {
    $timeout(function() {
      appSwiper.reInit();
    }, 5);
  }

  // Hides/shows the pagination, fix for cases where no images are returned
  var switchPagination = function(action) {
    switch(action) {
      case 'show': 
      $pagination.show();
      break;

      case 'hide': 
      $pagination.hide();
      break;

      default: break;
    }
  }

  // This function generates the flags used for showing/hiding the loading indicator
  // For each section, there is a separate flag:
  //    App Images:       $scope.appDetails[i].sliderLoaded
  //    App Features:     $scope.appDetails[i].featuresLoaded
  //    App Testimonials: $scope.appDetails[i].testimonialsLoaded
  //    App Active:       $scope.appDetails[i].active
  var generateFlags = function() {
    if(!$scope.appDetails) { return false; }

    var totalDevices = $scope.appDetails.length;

    for(var i = 0; i < totalDevices; i++) {
      $scope.appDetails[i].sliderLoaded = false;
      $scope.appDetails[i].featuresLoaded = false;
      $scope.appDetails[i].testimonialsLoaded = false;
      $scope.appDetails[i].active = false;
    }
  }

  // Generates the store names for each device
  // View refers to this in order to update the appropriate store name
  var generateStores = function() {
    if(!$scope.appDetails) { return false; }

    var totalDevices = $scope.appDetails.length,
        storesMap = {
          'Android': 'Google Play Store',
          'iPad': 'App Store',
          'iPhone': 'App Store',
          'Android Tablet': 'Google Play Store',
          'Windows': 'Windows Marketplace',
          'Blackberry': 'Blackberry World',
          'Symbian': 'OVI Store',
          'Intel': ''
        };

    for(var i = 0; i < totalDevices; i++) {
      $scope.appDetails[i].storeName = storesMap[ $scope.appDetails[i].appname ];
    }
  }

  // This function loads the slider images, and should only be called after the devices
  // list is populated.
  var loadAppImages = function(index) {
    // Check if the app data has already been loaded. If so, don't do anything
    if( $scope.appDetails[index].appgallery ) { 
      loading('hide', {element: $sliderWrap});
      $scope.showRight = true;
      $scope.showLeft = false;
      return true; 
    }

    // If it hasn't already been loaded, then continue with the API call
    userAPI.getAppImages({appid: $scope.appDetails[index].appid}, function(r){
      var thisIndex;

      loading('hide', {element: $sliderWrap});

      if(!r.getappgallery) {
        $scope.showRight = false;
        $scope.showLeft = false;
        return false;
      } else {
        $scope.appDetails[index].appgallery = r.getappgallery.appgallery;
        $scope.appDetails[index].sliderLoaded = true;

        if($scope.appDetails[index].appgallery.length > 0) {
          switchPagination('show');
          $scope.showRight = true;
          $scope.showLeft = false;
          // Bind slider to the new images
          if(!appSwiper) {
            $timeout(function() {
              initSwiper();

            }, 5);
          } else {
            $timeout(function(){
              reinitSwiper();
            }, 5);
          }
        } else {
          $scope.showRight = false;
          $scope.showLeft = false;
        }
      }
    });
  }

  // This function loads the features for the selected app. Should only be called after
  // the devices list is populated.
  var loadAppFeatures = function(index) {
    // Check if the app data has already been loaded. If so, don't do anything
    if( $scope.appDetails[index].features ) { 
      loading('hide', {element: $descriptionWrap});
      return true; 
    }

    // If it hasn't already been loaded, then continue with the API call
    userAPI.getAppFeatures({appid: $scope.appDetails[index].appid}, function(r){
      var thisIndex;

      loading('hide', {element: $descriptionWrap});

      if(!r.getappfeatures) {
        return false;
      } else {
        $scope.appDetails[index].features = r.getappfeatures.appfeatures;
        $scope.appDetails[index].featuresLoaded = true;
      }
    });
  }

  // This function loads the testimonials for the selected app. Should only be called after
  // the devices list is populated.
  var loadAppTestimonials = function(index) {
    // Check if the app data has already been loaded. If so, don't do anything
    if( $scope.appDetails[index].testimonials ) { 
      loading('hide', {element: $testimonialWrap});
      return true; 
    }

    // If it hasn't already been loaded, then continue with the API call
    userAPI.getAppTestimonials({appid: $scope.appDetails[index].appid}, function(r){
      var thisIndex;

      loading('hide', {element: $testimonialWrap});

      if(!r.getapptestimonials) {
        return false;
      } else {
        $scope.appDetails[index].allTestimonials = r.getapptestimonials.apptestimonials;
        $scope.appDetails[index].testimonials = $scope.appDetails[index].allTestimonials.slice(0, 3);
        $scope.appDetails[index].testimonialsLoaded = true;
      }
    });
  }

  $scope.showAllTestimonials = function() {
    $scope.appDetails[index].testimonials = $scope.appDetails[index].allTestimonials;
  }

  // Wrapper function which calls the functions to load the slider images, features and testimonials
  $scope.loadApp = function(index, e) {
    // Check if it's a valid index
    if( !$scope.appDetails[index] ) { return false; }

    $scope.showRight = false;
    $scope.showLeft = false;

    var thisApp = $scope.appDetails[index];

    // Hide previous instances of the spinner
    loading('hide', {element: $sliderWrap});
    loading('hide', {element: $descriptionWrap});
    loading('hide', {element: $testimonialWrap});

    // Create fresh instances of the spinner
    loading('show', {element: $sliderWrap});
    loading('show', {element: $descriptionWrap});
    loading('show', {element: $testimonialWrap});
    switchPagination('hide');

    // Unbind the slider actions
    if(appSwiper) {
      appSwiper.swipeTo(0, 1);
    }

    /*
     * It looks like the default android browser hates me, so I have no choice.
     * I tried 5 other methods first :( Anyway, found a hack that fixed this.
     *
     * This is so sad. Bad android native browser. Bad.
     *
     * Apparently if I set the css each time, the rendering issue is fixed.
     * .
     * .
     * .
     * .
     * lol
     * .
     * .
     * .
     */
    if( $rootScope.device.isAndroid ) {
      $('body').css('margin-top', '0px');
    }

    // Do the necessary checks and load anything if necessary
    if(!thisApp.sliderLoaded) {
      loadAppImages(index);
    }

    if(!thisApp.featuresLoaded) { 
      loadAppFeatures(index);
    } else {
      loading('hide', {element: $descriptionWrap});
    }

    if(!thisApp.testimonialsLoaded) { 
      loadAppTestimonials(index);
    } else {
      loading('hide', {element: $testimonialWrap});
    }

    cleanObject($scope.appDetails, 'active', false);
    $scope.appDetails[index].active = true;

    if(e && $rootScope.device.isMobile) {
      setTimeout(hideMenu, 200);
    }
    
    $rootScope.selectedApp = $scope.appDetails[index];

    // In case the data was already here, we need to reinitialize the slider & show pagination
    if(thisApp.sliderLoaded) {
      $timeout(function() {
        reinitSwiper();
      });

      // Remove the loading indicator that was added before
      loading('hide', {element: $sliderWrap});
      switchPagination('show');
      $scope.showRight = true;
      $scope.showLeft = false;
    }

  }

  // Use this function to set a common value to a parameter of all objects in an object array
  var cleanObject = function(arr, param, value) {
    var len = arr.length;
    for(var i = 0; i < len; i++) {
      arr[i][param] = value;
    }
  }

// controlling the display of  Menu in the Mobile

  if($rootScope.device.isMobile) {
    $tabsWrap.hide();

    var elem = $('ul.as_control');
    var wp = elem.parent().width();
    var cp = elem.width();
    var moveToLeft = (wp-cp)/2;
    var pawi = $('div.phone-filters').width();
    var hori = $('div.phone-filters h6.subtitle').width();
    elem.css({left:wp});

    $("button.btn-filter").live('click', function(){
      if(elem.is(':visible')){
        hideMenu();
      }else{
        showMenu();
      }
    });


    //showing the menu
    function showMenu(){
      $('div.as_container').animate({left:'-'+(wp+20)},500);
      elem.show().animate({ left: moveToLeft}, 500);
      $("div.phone-filters").fadeOut(500, function(){
        $("div.phone-filters div span").hide();
        $("div.phone-filters h6").css('float','right').fadeIn(500);
        $("div.phone-filters div").css('float','left').fadeIn(500);
      })
      $("div.content, div.yourrecs, div.trending, div.fb-activity, footer").hide();
    }

    // hiding the menu
    function hideMenu(){
      $('div.as_container').animate({left:'0'},500);
      var newLeft = parseInt(elem.css('left'))
      elem.animate({ left: wp+newLeft}, 500, function(){$(this).hide();});

      $("div.phone-filters").fadeOut(500, function(){
        $("div.phone-filters h6").css('float','left').fadeIn(500);
        $("div.phone-filters div").css('float','right').fadeIn(500);
        $("div.phone-filters div span").show();
      })
      $("div.content, div.yourrecs, div.trending, div.fb-activity, footer").show();
    }
  }
}]);
