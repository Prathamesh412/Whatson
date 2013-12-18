// we will write all controllers in this file.

woi.controller("VideosLandingPageController", ['$scope', '$rootScope', '$filter', '$routeParams','userAPI', function($scope, $rootScope, $filter, $routeParams, userAPI){
    
    // Highlight the respective item in the main navigation
    $rootScope.$broadcast('highlightVideos', []);

    $scope.phoneSidebar = 'off';

    $scope.toggleSidebar= function(status){
      $scope.phoneSidebar = status;
    };    
}]);



woi.controller("VideosListController", ['$scope','$location', '$rootScope', '$filter', '$routeParams','$timeout', 'userAPI','$compile', function($scope,$location, $rootScope, $filter, $routeParams, $timeout, userAPI,$compile){

  //////////////////////
    $scope.changeurl= function(url,element){
        var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");
        $location.path("programme/" + str);

        element.stopPropagation();
        element.preventDefault();

    };

    $scope.changechannelurl= function(url,element){

       var  str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");

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

    //alert("inside RESET()");

    $scope.videosList      = [];
    $scope.paginateVideos  = [];
    $scope.pageNo          = 1;
    $scope.allowRequests   = true;
    $scope.scrollValue     = 300;
    $scope.amount          = 0;
    $scope.step            = 7;
    $scope.finishedLoading = false;
  };

  reset();
  
  // Initialization 
  $scope.filterType     = 'popular';
  $scope.filterChannel  = '';
  $scope.filterGenre    = '';



  $scope.$on('new-filter-init:videos', function(event, key, value) {
    // set all the filters / passed in filters.
    console.log('key === '+key);
    console.log(value);
    

    if (key == 'genre'){
      $scope.filterGenre = value;
    }

    else if (key == 'nav'){
      $scope.filterType = value;
    }
   
    if (key == 'channel'){
      $scope.filterChannel = value;
    }
    else{
      $scope.filterChannel = '';
            
      if(!$('html').hasClass('ie9')) {
        $rootScope.$broadcast('resetPlaceholder'); 
      }else{
        $rootScope.$broadcast('inputs:reset');  
      }
    }

    $scope.safeApply(function(){
      reset();
    });
    

    $timeout(function(){  
      $scope.filterResults();
    },5);
  });
  
  // we will call api here and save the response in videosList


  

  $scope.loadMoreDetails = function(){

    console.log('load more --------->>>>> VIDEOS <<<<<<<<-----------');

    $scope.scrollValue = $scope.scrollValue + 500;
    console.log('$scope.paginateVideos.length  == '+$scope.paginateVideos.length);
    console.log('$scope.videosList.length  == '+$scope.videosList.length);

    if($scope.paginateVideos.length >= $scope.videosList.length){
      console.log('all done');
      
      console.log('scrollValue == '+$scope.scrollValue);
      console.log('pageYOffset == '+window.pageYOffset);
      
      if($scope.allowRequests){
        $scope.allowRequests = false;

        $scope.pageNo += 1;
        
        console.log('making request....');
        $scope.filterResults();  
      }
      return false;
   }
      
    console.log('show more in view');

    $scope.amount= $scope.amount + $scope.step;

    if($scope.amount >= $scope.videosList.length){ 
      $scope.amount = $scope.videosList.length;
    }

    $scope.paginateVideos = $scope.videosList.slice(0, $scope.amount);
  };

  $scope.filterResults = function(){

    var params = {
                    pageno          : $scope.pageNo,                  
                    filtertype      : $scope.filterType, 
                    channelname     : $scope.filterChannel,
                    videogenre      : $scope.filterGenre,
                    userid          : $rootScope.getUser().userid,
                    noCache         : $.now()
                };

    console.log('params === --->');
    console.log(params);

    (function(params){
        // call the api   
        userAPI.getAllVideos(params,function(rs){
          
          $scope.allowRequests = true;

          console.log('requested filtertype  === ', params.filtertype);
          console.log('current filtertype ', $scope.filterType);


          $scope.allowRequests = true;

          if(params.filtertype  !=  $scope.filterType){
            console.log('DISCARDING THE RESPONSE....');          
            return false;
          }

          if(!rs.video){
            $scope.finishedLoading = true;
            return false;
          }
            

          if(!angular.isArray(rs.video.videolist)){
            if(angular.isObject(rs.video.videolist)){
              rs.video.videolist = [rs.video.videolist];
            }else{
              $scope.finishedLoading = true;
              return false;
            }
          }
            
          
          $scope.finishedLoading = false;

           
          if(params.pageno == 1){
            $scope.safeApply(function(){
              console.log('calling reset again..................... PAGE = 1');
              reset();
            });  
          }
          
          console.log('Before == '+$scope.videosList.length);

          for(var x=0; x < rs.video.videolist.length; x++){
            $scope.videosList.push(rs.video.videolist[x]);
          }
          console.log('After == '+$scope.videosList.length);
          
          $scope.scrollValue = $scope.scrollValue - 1000;
          $scope.loadMoreDetails();
        });
    })(params);    
  };


  //////////////////////

  $scope.toggleFavoriteVideo = function(p, e, forceRefresh){
    e.preventDefault();
    e.stopPropagation();

    console.log('toggleFavoriteVideo()...');

    var element = $(e.currentTarget);
    // var my = 'top center'

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
                    $scope.toggleFavoriteVideo(p, e, true);
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

      console.log("toggleFavoriteProgramme");
      // if it fails, display error message
      if(!rs.response.responsestatus){
        alert(rs.response.message);
      } else {
        console.log('$scope.paginateVideos == ',$scope.paginateVideos);
        // change the flag
        p.isfavorite = (p.isfavorite == "0") ? "1" : "0";

        
        // filter out 
        if($scope.filterType == 'favorites'){
          $scope.paginateVideos = _.reject($scope.paginateVideos, function(obj){ 
            return obj.isfavorite == '0'; 
          });  

          $scope.videosList = _.reject($scope.videosList, function(obj){ 
            return obj.isfavorite == '0'; 
          });

          if($scope.paginateVideos.length == 0){

            // Make a request
            if($scope.allowRequests){

              $scope.allowRequests = false;

              $scope.pageNo += 1;
              
              $scope.filterResults();  
            }
          }
        }
                

        console.log('$scope.paginateVideos == will have 1 ',$scope.paginateVideos);
        
        if(p.isfavorite == "0") {

          $rootScope.videosVisibleItems--;
        }

        console.log("toggleFavoriteProgramme => Else");
        if(p.isfavorite == "1"){
          $rootScope.$broadcast("watchlist::add",p);         
        }else{
          $rootScope.$broadcast("watchlist::FavRem::Remove",p);         
        }

        
      }
    });
  };
}]);


woi.controller("VideosNavController", ['$scope', '$rootScope', '$filter', '$routeParams','userAPI', function($scope, $rootScope, $filter, $routeParams, userAPI){
    
  $scope.toggleTab = function(day){
    
    console.log(day);

    $scope.currentTab = day;

    $rootScope.$broadcast('new-filter-init:videos', 'nav', day);
  };

  setTimeout(function(){
    $scope.toggleTab('popular');  
  },5);
  
}]);


woi.controller("VideosGenreController", ['$scope', '$rootScope', '$filter', '$routeParams','userAPI', function($scope, $rootScope, $filter, $routeParams, userAPI){
   

  $scope.allGenres = [];
  $scope.constructObject = function(){
    if($scope.allGenres.length > 0){
      return false;
    }
    userAPI.getVideosGenre({},function(rs){
      if(!rs.videogenre)
        return false;

      if(!angular.isArray(rs.videogenre.videogenrelist))
        return false

      $scope.allGenres = rs.videogenre.videogenrelist;
      $scope.currentFilter = $scope.allGenres[0].genre;
      $scope.paginateGenres = $scope.allGenres.slice(0, ($scope.allGenres.length/2));
    });
     
    
  };


  $scope.viewAllGenre = function(){
    $scope.paginateGenres = $scope.allGenres;
  };

  $scope.selectedGenre = function(genreObj){
  
    $('div.qtip:visible').qtip('hide');
    
    $scope.currentFilter = genreObj.genre;
    $('#selectedGenre').html($scope.currentFilter);
    $('#selectedGenrePhone').html($scope.currentFilter);
  
    console.log('we will call api later === '+$scope.currentFilter);
    $rootScope.$broadcast('new-filter-init:videos', 'genre', $scope.currentFilter);
  };

}]);

woi.controller("ChannelAutoCompleteControllerVideos", ['$scope', '$rootScope', '$filter', 'userAPI', 'autoAPI',  function($scope, $rootScope, $filter,  userAPI, autoAPI){

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

    autoAPI.autoCompleteChannel({autocompleteword:string}, function(rs){

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

   $scope.callFilter = function(channelName){
      console.log('call the filter videos');
      console.log(channelName);

      $rootScope.$broadcast('new-filter-init:videos', 'channel', channelName);
  };

  $scope.clickSearch = function(event){

    var $elm = $(event.currentTarget),
        $targetInput = $elm.parent().find('input');
  
    console.log('clickSearch()......',$targetInput.val());
    $rootScope.$broadcast('new-filter-init:videos', 'channel', $targetInput.val());
  };

  $scope.$on('resetPlaceholder', function(event){
      $scope.placeholderReset();
  });

}]);

