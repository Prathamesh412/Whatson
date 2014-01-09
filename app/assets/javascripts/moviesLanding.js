// we will write all controllers in this file.

woi.controller("MoviesLandingPageController", ['$scope', '$rootScope', '$filter', '$routeParams','userAPI', function($scope, $rootScope, $filter, $routeParams, userAPI){
  
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
  
  // Highlight the respective item in the main navigation
  $rootScope.$broadcast('highlightMovies', []);
  $rootScope.movieActiveTab = '';
  $scope.phoneSidebar = 'off';

  $scope.toggleSidebar = function(status){
    $scope.phoneSidebar = status;
  };
  
}]);



woi.controller("MoviesListController", ['$scope','$location','$rootScope', '$filter', '$routeParams','$timeout', '$compile', 'userAPI', function($scope, $location, $rootScope, $filter, $routeParams, $timeout,  $compile, userAPI){

    $scope.showvideo = function(p,element){
        $rootScope.playThisVideo = p.videourl;
        $rootScope.playThisVideoObj = p;
        if (_.isUndefined($rootScope.playThisVideo) && !_.isUndefined(p.videoUrl))
            $rootScope.playThisVideo = p.videoUrl;

        $rootScope.playThisVideoObj.videourl = $rootScope.playThisVideo;

        // $rootScope.$apply();
//      $location.path("/programme/"+test);
        console.log("*************************************************************");
        console.log(p.programmename);
        $rootScope.EncodeUrlWithDash(p.programmename,element,'programme',p.channelid,p.programmeid, p.starttime);
        return false;
    };

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

    var loading = $filter('loading');
	$spinnerDiv =  $('.spin');
	loading('show', {element: $spinnerDiv});

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

  var reset = function(){

    $scope.moviesList      = [];
    $scope.paginateMovies  = [];
    $scope.pageNo          = 1;
    $scope.allowRequests   = true;
    $scope.scrollValue     = 300;
    $scope.amount          = 0;
    $scope.step            = 7;
    $scope.finishedLoading = false;
  };

  reset();
  
  // Initialization 
  $scope.currentOperatorId = 0;
  var currentYear          = new Date().getFullYear();
  $scope.startYear         = currentYear - 10;
  $scope.endYear           = currentYear;
  $scope.isFavorite        = false; 
  $scope.castName          = ''; // Actor name
  $scope.currentGenre      = ''; // Current genre
  $scope.filterMenuList    = []; // all filter genres

  // For any change of the filters, today/tomorrow, tv-operator, genre etc
  // this is the function which will be called
  // the logic is to set all the filter changes in the scope
  // and then make the API call based on it.
  $scope.$on('new-filter-init', function(event, key, value) {
    
    // Reset the old filters
    $timeout(function(){
      $rootScope.$broadcast('update-filters:reset');
    });

    if (key == 'operator'){
      $scope.currentOperatorId = value;
    }

    else if (key == 'range_slider'){
      $scope.startYear = value.start;
      $scope.endYear = value.end;
    }

    else if (key == 'nav'){

      $scope.startTime =  value.finalStartDate;
      $scope.endTime = value.finalEndDate;
    }
   
    else if (key == 'all_day'){
      // handeled in the nav controller
      return false;
    }

    else if (key == 'filter'){

      if(value == 'Favorite'){
        $scope.currentGenre = '';
        $scope.isFavorite   = true; 
      }else{
        $scope.isFavorite   = false; 

        if(value == 'All'){
          $scope.currentGenre = '';  
        }else{
          $scope.currentGenre = value;
        }        
      }
    }

    if (key == 'actors'){
      $scope.castName = value;
    }
    // else{
    //   $scope.castName = '';
    // }

    $scope.safeApply(function(){
      reset();
    });
    

    $timeout(function(){  
      $scope.filterResults();
    });
    

  });
	
  $scope.loadMoreDetails = function(){

    $scope.scrollValue = $scope.scrollValue + 500;

    if($scope.paginateMovies.length >= $scope.moviesList.length){
      
      if($scope.allowRequests){
        $scope.allowRequests = false;

        $scope.pageNo += 1;

        $scope.filterResults();  
      }
      return false;
   }
      
    $scope.amount= $scope.amount + $scope.step;

    if($scope.amount >= $scope.moviesList.length){ 
      $scope.amount = $scope.moviesList.length;
    }

    $scope.paginateMovies = $scope.moviesList.slice(0, $scope.amount);
  };

  $scope.filterResults = function(){
  
    var contextParam ='applicationname=website;headendid=' + $scope.currentOperatorId;

    var params = {
                    pageno   : $scope.pageNo,
                    context  : contextParam,
                    productionstartyear : $scope.startYear,
                    productionendyear   : $scope.endYear,
                    fromdatetime        : $scope.startTime,
                    todatetime          : $scope.endTime,
                    isfavMovies         : $scope.isFavorite, 
                    castname            : $scope.castName,
                    subgenre            : $scope.currentGenre,
                    userid              : $rootScope.getUser().userid,
                    noCache             : $.now()
                };

    // console.log('params === --->');
    // console.log(params);

    (function(params){
      // call the api   
      userAPI.getAllMovies(params,function(rs){
        $scope.allowRequests = true;

        if(params.todatetime  !=  $scope.endTime){         
          return false;
        }

        if(params.fromdatetime != $scope.startTime){
          return false;
        }

        if(params.productionstartyear != $scope.startYear || params.productionendyear != $scope.endYear){          
          return false;
        }

        if(params.castname != $scope.castName){
          return false;
        }

        var contextParam ='applicationname=website;headendid=' + $scope.currentOperatorId;
        if(params.context != contextParam){
          return false;
        }

        if(params.isfavMovies != $scope.isFavorite){
          return false;
        }
        
        if(params.subgenre != $scope.currentGenre){
          return false;
        }
        
        if(params.pageno != $scope.pageNo){
          return false;
        }
        
        if(params.pageno == 1){
          $scope.safeApply(function(){            
            reset();
          });  
        }

        if($scope.pageNo == 1){
          if(!rs.allmovies){            
            $rootScope.$broadcast('reset:top-filter'); // reset the top genre filter
            $scope.finishedLoading = true;
            return false;
          }
          if(!angular.isArray(rs.allmovies.genremoviescount)){
            if(angular.isObject(rs.allmovies.genremoviescount)){
              rs.allmovies.genremoviescount = [rs.allmovies.genremoviescount];
            }else{
              return false;
            }      
          }
            
          $timeout(function(){
            // We have new filters, so update
            $rootScope.$emit('update-filters',rs.allmovies.genremoviescount);
          });        
        }

        if(!rs.allmovies){      

          $scope.finishedLoading = true;
          
          return false;
        }

        if(angular.isUndefined(rs.allmovies.movieslist)){

          // call all
          if($scope.currentGenre != 'All'){
            // Bug fix - 1207
            if($scope.isFavorite){
              
              $scope.moviesList      = [];    
              $scope.paginateMovies  = [];   
              $scope.finishedLoading = true;       
              
              return false;
            }
            $rootScope.$broadcast('reset:top-filter');
            $rootScope.$broadcast('new-filter-init', 'filter', 'All');
          }        
        }

        if(!angular.isArray(rs.allmovies.movieslist)){
          if(angular.isObject(rs.allmovies.movieslist)){
            rs.allmovies.movieslist = [rs.allmovies.movieslist];
          }else{
            $scope.finishedLoading = true;
            return false;  
          }
        }
          
        $scope.finishedLoading = false;
                   
        for(var x=0; x < rs.allmovies.movieslist.length ;x++){
          $scope.moviesList.push(rs.allmovies.movieslist[x]);
        }
        $scope.scrollValue = $scope.scrollValue - 1000;
        $scope.loadMoreDetails();
      });
    })(params);
  };

  $scope.toggleFavoriteMovie = function(p, e, forceRefresh){
    e.preventDefault();
    e.stopPropagation();

    var element = $(e.currentTarget);
    var my = 'top center'

    // if(element.attr('data-popover-position'))
    //   my = element.attr('data-popover-position');
    var my = ($rootScope.device.isTouch && element.offset().left < 125) ? 'top left' : 'top center';

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
                    $scope.toggleFavoriteMovie(p, e, true);
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

    // shows loading spinner
    element.parent().parent('.thumb').addClass('active');
    element.addClass("loading");
    loading('show', {element: element});

    var params = {
      like        : (p.isfavorite == "0"), 
      programmeid : p.programmeid, 
      userid      : $rootScope.getUser().userid
    };

    userAPI.toggleFavoriteProgramme(params, function(rs){
      if(forceRefresh) {
        location.reload();
        return false;
      }

      // hides loading spinner
      element.removeClass('loading');
      $timeout(function() {
        element.parent().parent('.thumb').removeClass('active');
      }, 1500);
      loading('hide', {element:element});

      // if it fails, display error message
      if(!rs.response.responsestatus){
        alert(rs.response.message);
      } else {
        
        // change the flag
        p.isfavorite = (p.isfavorite == "0") ? "1" : "0";
        
        
        // filter out 
        if($scope.isFavorite){
          $scope.paginateMovies = _.reject($scope.paginateMovies, function(obj){ 
            return obj.isfavorite == '0'; 
          });
          $scope.moviesList = _.reject($scope.moviesList, function(obj){ 
            return obj.isfavorite == '0'; 
          });  
          
          // if($scope.paginateMovies.length == 0){
          //   console.log('shifting to all');
          //   $rootScope.$broadcast('reset:top-filter');
          //   $rootScope.$broadcast('new-filter-init', 'filter', 'All');
          // }
        }

        if(p.isfavorite == "1"){
          $rootScope.$broadcast("watchlist::add",p);         
        }else{
          $rootScope.$broadcast("watchlist::FavRem::Remove",p);         
        }        
      }
    });
  };
}]);

woi.controller("MoviesFilterController", ['$scope', '$rootScope', '$filter', '$routeParams','userAPI', function($scope, $rootScope, $filter, $routeParams, userAPI){
 
 
	var loading = $filter('loading');
	$spinnerDiv =  $('.spin');
	loading('show', {element: $spinnerDiv});

  $scope.currentFilter = 'All';
	$scope.filterMenuList = [];
	

	$scope.setFilter = function(filterKey){

		$scope.currentFilter = filterKey;
		
    $rootScope.$broadcast('new-filter-init', 'filter', filterKey);
	};

  $scope.$on('reset:top-filter', function(event) {    
    $scope.currentFilter = 'All';       
  });

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

  $rootScope.$on('update-filters', function(event, newFilters) {
        
    $scope.safeApply(function() {
      $scope.filterMenuList = newFilters;
    });

  });

  $scope.$on('update-filters:reset', function(event) {
    
    $scope.safeApply(function() {
     $scope.filterMenuList = [];
    });    
  });
  

}]);

woi.controller("MoviesTvOperatorController", ['$scope', '$rootScope', '$filter', 'userAPI', 'tsmAPI', function($scope, $rootScope, $filter,  userAPI, tsmAPI){

  $scope.allOperators = [];
  $scope.selectedOperator ;

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
  
  $scope.update = function(){
        
    if($scope.allOperators.length > 0){
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
        
    tsmAPI.getOperatorList(params, function(rs) {

      if(!rs.getoperators){
        $scope.noTvOperators = true;
        return false;
      }
      
      $scope.allOperators = rs.getoperators.operatorslist;
      $scope.paginateOps = $scope.allOperators.slice(0, 8);
    });
  }


  $scope.viewAllOperators = function(){
  
    $scope.paginateOps = $scope.allOperators;
  };
  

  $scope.selectOperator = function(operatorObj){
    $('div.qtip:visible').qtip('hide');
    $scope.selectedOperator = operatorObj.operator_name;
    
    // Update the operator name in the UI
    var operatorUI = $('#operator-name');
    var mobOperatorUI = $('#mob-operator-name');
    operatorUI.html(operatorObj.operator_name);
    mobOperatorUI.html(operatorObj.operator_name);
    
    $rootScope.$broadcast('new-filter-init', 'operator', operatorObj.operator_id);
  };



  $scope.$on('update:location', function(event, locationObj) {   
    
    $scope.allOperators = [];
    $scope.paginateOps  = [];

    var userDetails = $rootScope.getUser();

    if(userDetails.userid == -1){
      return false;
    }
    
    // Update the cookie as well
    $rootScope.userInfo.City      = userDetails.City      = locationObj.cityname;
    $rootScope.userInfo.areaid    = userDetails.areaid    = locationObj.areaid;
    $rootScope.userInfo.areatype  = userDetails.areatype  = locationObj.areatype;
    $rootScope.userInfo.cityid    = userDetails.cityid    = locationObj.cityid;
    $rootScope.userInfo.cityname  = userDetails.cityname  = locationObj.cityname;
    $rootScope.userInfo.placename = userDetails.placename = locationObj.placename;
    $rootScope.userInfo.stateid   = userDetails.stateid   = locationObj.stateid;
    $rootScope.userInfo.statename = userDetails.statename = locationObj.statename;
    $rootScope.userInfo.countryid = userDetails.countryid = locationObj.countryid;
     
    $.cookie('userInfo', JSON.stringify(userDetails), {expires:365});
  }); 

}]);




woi.controller("AllDayMoviesController", ['$scope', '$rootScope', '$filter', 'userAPI', 'tsmAPI',  function($scope, $rootScope, $filter,  userAPI, tsmAPI){

  $scope.allGenres = []; // will have all the genres

  $scope.genresFilter = [
    { label: 'All Day'      , value: 'allDay' },
    { label: 'Playing Now'  , value: 'playingNow' },
    { label: 'Morning'      , value: 'morning'  },
    { label: 'Afternoon'    , value: 'afternoon' },
    { label: 'Prime Time'   , value: 'primeTime'},
    { label: 'Late Night'   , value: 'lateNight'}
  ];
  
  $scope.currentFilter = $scope.genresFilter[0].label;
  

  $scope.update = function(){    
    if($scope.allGenres.length > 0){
      return false;
    }
    $scope.allGenres = $scope.genresFilter;
    $scope.paginateGenres = $scope.allGenres.slice(0, 8);
  }


  $scope.viewAllCategories = function(){
  
    $scope.paginateGenres = $scope.allGenres;
  };
  

  $scope.selectCategory = function(selectedObj){
    $('div.qtip:visible').qtip('hide');
    $scope.selectedCategory = selectedObj.label;
    
    // Update the operator name in the UI
    var operatorUI = $('#allDayName');
    var mobOperatorUI = $('#mobAllDayName');
    operatorUI.html(selectedObj.label);
    mobOperatorUI.html(selectedObj.label);
    
    $rootScope.currentTimeFilter = selectedObj.value;
    // we will api here to fileter the results
    $rootScope.$broadcast('new-filter-init', 'all_day', selectedObj);
  };

  $scope.$on('reset:all-day', function(event) {
    
    if($scope.currentTimeFilter == "playingNow"){
    
      $scope.selectCategory({label: 'All Day',value: 'allDay'});

      $('input:radio[name=genreFilter]:nth(0)').attr('checked',true);
    }
  });

}]);


woi.controller("ActorAutoCompleteController", ['$scope', '$rootScope', '$filter', 'userAPI', 'autoAPI',  function($scope, $rootScope, $filter,  userAPI, autoAPI){

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

    autoAPI.autoCompleteActors( {autocompleteword:string}, function(rs){

      if(rs.response.docs == undefined) 
        return false;
      $scope.safeApply(function() {
        $scope.autoComplete.data = rs.response.docs;
      });

      if (callback && typeof(callback) === "function") {
        callback($scope.autoComplete.data);
      }
    });
  };

  $scope.callFilter = function(keyText){
    
    $rootScope.$broadcast('new-filter-init', 'actors', keyText);
  };

  $scope.clickSearch = function(event){

    var $elm = $(event.currentTarget),
        $targetInput = $elm.parent().find('input');
  
    if($targetInput.val() == ''){
      alert('Please enter the keyword');
      return false;
    }
    $rootScope.$broadcast('new-filter-init', 'actors', $targetInput.val());
  };

}]);


woi.controller("RangeSliderController", ['$scope', '$rootScope', '$filter', '$routeParams','userAPI', function($scope, $rootScope, $filter, $routeParams, userAPI){
    
	$scope.yearsFilter = function(obj){
    $rootScope.$broadcast('new-filter-init', 'range_slider', obj);
	};
}]);


woi.controller("MoviesNavController", ['$scope', '$rootScope', '$filter', '$routeParams','$timeout', 'userAPI', function($scope, $rootScope, $filter, $routeParams, $timeout, userAPI){
    
  
  
  $scope.toggleTab = function(tabName, allDay){
    
    allDay = $rootScope.currentTimeFilter;
    
    $scope.currentTab = tabName;
    $rootScope.$broadcast("movieLanding::tabChanged",tabName);
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1; // starts from 0
    var day = date.getDate();
    var hours = date.getHours();
    var mins = date.getMinutes();


    if(tabName == 'this_week'){
      var finalStartDate = year + '-' + month + '-' + day + ' ' + hours + ':' + mins;

      var now  = moment();
      
      // var temp = now.add('days',7);
      var temp = now.day(6);
      
      var temp_year  = temp.year();
      var temp_month = temp.month()+1;
      var temp_day   = temp.date();
      var temp_hours = temp.hours();
      var temp_mins  = temp.minutes();

      var finalEndDate = temp_year + '-' + temp_month + '-' + temp_day + ' ' + temp_hours + ':' + temp_mins;

      if(angular.isDefined(allDay)){
        
        if(allDay == 'allDay'){

          finalStartDate = year      + '-' + month      + '-' + day      + ' ' + 0  + ':' + 0;
          finalEndDate   = temp_year + '-' + temp_month + '-' + temp_day + ' ' + 23 + ':' + 59;

        }else if(allDay == 'playingNow'){

          finalStartDate = year      + '-' + month      + '-' + day      + ' ' + hours          + ':' + mins;
          finalEndDate   = temp_year + '-' + temp_month + '-' + temp_day + ' ' + (temp_hours+1) + ':' + 59;

        }else if(allDay == 'morning'){

          finalStartDate = year      + '-' + month      + '-' + day      + ' ' + 6  + ':' + 0;
          finalEndDate   = temp_year + '-' + temp_month + '-' + temp_day + ' ' + 12 + ':' + 0;

        }else if(allDay == 'afternoon'){
    
          finalStartDate = year      + '-' + month      + '-' + day      + ' ' + 12 + ':' + 0;
          finalEndDate   = temp_year + '-' + temp_month + '-' + temp_day + ' ' + 19 + ':' + 59;

        }else if(allDay == 'primeTime'){

          finalStartDate = year      + '-' + month      + '-' + day      + ' ' + 20 + ':' + 0;
          finalEndDate   = temp_year + '-' + temp_month + '-' + temp_day + ' ' + 23 + ':' + 59;

        }else if(allDay == 'lateNight'){

          finalStartDate = year      + '-' + month      + '-' + day      + ' ' + 0 + ':' + 0;
          finalEndDate   = temp_year + '-' + temp_month + '-' + temp_day + ' ' + 5 + ':' + 59;

        }
        
      }else{
        finalEndDate = temp_year + '-' + temp_month + '-' + temp_day + ' ' + 23 + ':' + 59;
      }

      $scope.startTime =  finalStartDate;
      $scope.endTime = finalEndDate;


    }else if(tabName == 'today'){

      var finalStartDate = year + '-' + month + '-' + day + ' ' + hours + ':' + mins;
      var finalEndDate   = year + '-' + month + '-' + day + ' ' + 23 + ':' + 59;

      if(angular.isDefined(allDay)){

        if(allDay == 'allDay'){

          finalStartDate = year + '-' + month + '-' + day + ' ' + 0 + ':' + 0;
          finalEndDate   = year + '-' + month + '-' + day + ' ' + 23 + ':' + 59;

        }else if(allDay == 'playingNow'){

          finalStartDate = year + '-' + month + '-' + day + ' ' + hours + ':' + mins;
          finalEndDate   = year + '-' + month + '-' + day + ' ' + (hours+1) + ':' + 59;

        }else if(allDay == 'morning'){

          finalStartDate = year + '-' + month + '-' + day + ' ' + 6 + ':' + 0;
          finalEndDate   = year + '-' + month + '-' + day + ' ' + 12 + ':' + 0;

        }else if(allDay == 'afternoon'){
    
          finalStartDate = year + '-' + month + '-' + day + ' ' + 12 + ':' + 0;
          finalEndDate   = year + '-' + month + '-' + day + ' ' + 19 + ':' + 59;

        }else if(allDay == 'primeTime'){

          finalStartDate = year + '-' + month + '-' + day + ' ' + 20 + ':' + 0;
          finalEndDate   = year + '-' + month + '-' + day + ' ' + 23 + ':' + 59;

        }else if(allDay == 'lateNight'){

          finalStartDate = year + '-' + month + '-' + day + ' ' + 0 + ':' + 0;
          finalEndDate   = year + '-' + month + '-' + day + ' ' + 5 + ':' + 59;

        }

      }
        
      $scope.startTime =  finalStartDate;
      $scope.endTime   = finalEndDate;  
      
    }else{ // tomorrow
      
      $scope.$broadcast('reset:all-day');

      var now  = moment();
      var temp = now.add('days',1);
      
      var temp_year  = temp.year();
      var temp_month = temp.month()+1;
      var temp_day   = temp.date();
      var temp_hours = temp.hours();
      var temp_mins  = temp.minutes();

      var finalStartDate = temp_year + '-' + temp_month + '-' + temp_day + ' ' + 0  + ':' + 0;
      var finalEndDate   = temp_year + '-' + temp_month + '-' + temp_day + ' ' + 23 + ':' + 59;

      if(angular.isDefined(allDay)){
        
        if(allDay == 'allDay'){

          finalStartDate = temp_year + '-' + temp_month + '-' + temp_day + ' ' + 0  + ':' + 0;
          finalEndDate   = temp_year + '-' + temp_month + '-' + temp_day + ' ' + 23 + ':' + 59;

        }else if(allDay == 'playingNow'){

          finalStartDate = temp_year + '-' + temp_month + '-' + temp_day + ' ' + temp_hours     + ':' + temp_mins;
          finalEndDate   = temp_year + '-' + temp_month + '-' + temp_day + ' ' + (temp_hours+1) + ':' + 59;

        }else if(allDay == 'morning'){

          finalStartDate = temp_year + '-' + temp_month + '-' + temp_day      + ' ' + 6  + ':' + 0;
          finalEndDate   = temp_year + '-' + temp_month + '-' + temp_day + ' ' + 12 + ':' + 0;

        }else if(allDay == 'afternoon'){
    
          finalStartDate = temp_year + '-' + temp_month + '-' + temp_day + ' ' + 12 + ':' + 0;
          finalEndDate   = temp_year + '-' + temp_month + '-' + temp_day + ' ' + 19 + ':' + 59;

        }else if(allDay == 'primeTime'){

          finalStartDate = temp_year + '-' + temp_month + '-' + temp_day + ' ' + 20 + ':' + 0;
          finalEndDate   = temp_year + '-' + temp_month + '-' + temp_day + ' ' + 23 + ':' + 59;

        }else if(allDay == 'lateNight'){

          finalStartDate = temp_year + '-' + temp_month + '-' + temp_day + ' ' + 0 + ':' + 0;
          finalEndDate   = temp_year + '-' + temp_month + '-' + temp_day + ' ' + 5 + ':' + 59;

        }
      }

      $scope.startTime =  finalStartDate;
      $scope.endTime   = finalEndDate;

    }

    var dateObj = {
      finalStartDate : $scope.startTime,
      finalEndDate   : $scope.endTime
    };

    $rootScope.$broadcast('new-filter-init', 'nav', dateObj);
  };

  $timeout(function(){
    $scope.toggleTab('this_week');  
  });

  $scope.$on('new-filter-init', function(event, key, valueObj) {

    if(key == 'all_day'){   
      $timeout(function(){
        $scope.toggleTab($scope.currentTab, valueObj.value);  
      });     
    }
    
  });

  $scope.$on('movieLanding::tabChanged',function(event,key){
    $rootScope.movieActiveTab = key;
  });
}]);