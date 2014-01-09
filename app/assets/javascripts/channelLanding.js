woi.controller("ChannelLandingPageController", ['$scope','$location', '$rootScope', '$filter', '$routeParams','userAPI', function($scope,$location, $rootScope, $filter, $routeParams, userAPI){

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

  $scope.phoneSidebar= 'off';

  $scope.toggleSidebar = function(status){
    $scope.phoneSidebar = status;
  };

  // Highlight the respective item in the main navigation
  $rootScope.$broadcast('highlightChannel', []);

}]);



woi.controller("FeaturedChannelPageController", ['$scope', '$location', '$rootScope', '$filter', '$timeout', '$compile' ,'userAPI', function($scope, $location, $rootScope, $filter, $timeout, $compile, userAPI){

    // NOTE :- As of now we are not calling the loadMore(); again. We may include pagination later.

    $scope.changeurl= function(url,element){
        var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");           //Prathamesh Changes for programme
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

    $scope.recommended = [];
    $scope.paginate    = []; // Accessed from the HTML

    $scope.amount  = 0;
    $scope.step    = 4; // total items to be shown

    $scope.showMore = true;

    $scope.loadMore = function(){
      if(!$scope.lpFeaturedChannels.length)
        return false;
      $scope.amount= $scope.amount + $scope.step;

      if($scope.amount >= $scope.lpFeaturedChannels.length){ 
        $scope.showMore = false;
        $scope.amount = $scope.lpFeaturedChannels.length;
      }
      $scope.paginate = $scope.lpFeaturedChannels.slice(0, $scope.amount);
    };

    // API is called here
    userAPI.featuredChannelsLP({userid: $rootScope.getUser().userid},function(rs){

      if(!rs.featuredchannels)
        return false;

      // if(angular.isArray(rs.featuredchannels.featuredchannelslist)){
        $scope.lpFeaturedChannels = addData(rs.featuredchannels.featuredchannelslist);
        $scope.loadMore();  
      // }else{
        
      //   $scope.lpFeaturedChannels = [];        
      // }
    });

  var loading = $filter('loading');
  $spinnerDiv =  $('.spin');
    // toggles Channel favorite
  $scope.toggleFavoriteChannel = function(e, c, forceRefresh){

    e.preventDefault();
    e.stopPropagation();

    var element = $(e.currentTarget);
    if(!$rootScope.isUserLogged()){

      $rootScope.beforeaction.title = "Login to Favorite";
      $rootScope.beforeaction.subtitle = "Please login to favorite";
      // adjustments for popover for tvguide channels
      var yoffset = (element.attr("data-popover"))? (-15) : 5;
      var popover_position = ($('.sidebar').hasClass('expand') || $('.tv_guide').hasClass('tv'))? {my:'top left', at:'bottom center'} : {my: 'top center', at: 'bottom center'};
      popover_position.my = ($rootScope.device.isTouch && element.offset().left < 125) ? 'top left' : 'top center';
      // Settings for login/sign up pop-over
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
                    $scope.toggleFavoriteChannel(e, c, true);
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


    // shows loading spinner
    element.addClass("loading");
    loading('show', {element: element});

    var params = {
      channelid: c.channelid, 
      userid: $rootScope.getUser().userid, 
      like: ((c.ischannelfavorite == "1")? false : true)
    };

    // Make an API call to favorite the channel
    userAPI.toggleFavoriteChannel(params, function(rs) {

      if(forceRefresh) {
        location.reload();
        return false;
      }

      element.removeClass('loading');
      loading('hide', {element:element});

      if(rs.response.responsestatus == 'false') {

        //return false;
      }
  
      c.ischannelfavorite = (c.ischannelfavorite == "1")? '0' : '1';

      $rootScope.$broadcast('update:fav-ui',c);
    });

  };

  $scope.$on('update:fav-ui', function(event, c) {
      
    _.map($scope.lpFeaturedChannels, function(x){

      if(x.channelid == c.channelid){
        x.ischannelfavorite = c.ischannelfavorite;
      }      
    });   
  });
}]);


woi.controller("BrowseController", ['$scope', '$rootScope', '$filter', '$timeout', '$compile', 'userAPI', function($scope, $rootScope, $filter, $timeout, $compile, userAPI){
  
  $scope.curretHybridGenre     = ''; // Current Selected item.
  $rootScope.currentOperatorId = 0; // Operator id of selected operator
  $scope.requestCompleted      = false;
  var loading = $filter('loading');
  $spinnerDiv =  $('.spin');
  
  // API call to get the list
  userAPI.browseItems({},function(rs){
      console.log("browse item................");
      console.log(rs);
    if(!rs.channelgenre)
      return false;

    // Check for Array
    // if(angular.isArray(rs.channelgenre.channelgenrelist)){

      $scope.browseCategories = addData(rs.channelgenre.channelgenrelist);  

      // Call the API to get the results for first category
      $scope.curretHybridGenre = $scope.browseCategories[0].hybridgenre;
      $scope.filterByHybridGenre($scope.browseCategories[0].hybridgenre);

    // }else{
    //   return false;
    // }
    
  });

  
  $scope.$on('update:fav-ui', function(event, c) {
      
    _.map($scope.detailedList, function(x){

      if(x.channelid == c.channelid){
        x.ischannelfavorite = c.ischannelfavorite;
      }      
    });   
  });

  $scope.itemClicked = function(event, item){

    if(item == "favorites"){
      $scope.curretHybridGenre = "favorites";
      $scope.filterByHybridGenre(); // Call the API
      $('#channelSearch').val('Channel Name...');
      $('#channelSearchMobile').val('Channel Name...');

      return false;
    }
    
    $scope.curretHybridGenre = item.hybridgenre;
    
    $('#channelSearch').val('Channel Name...');
    $('#channelSearchMobile').val('Channel Name...');
    $scope.filterByHybridGenre(); // Call the API
  };

  
  var reset = function(){

    $scope.detailedList = [];
    $scope.paginateDetailedList = [];
    $scope.amount  = 0;
    $scope.step    = 3;
    $scope.scrollValue = 300;
  };

  // called only when the user scrolls the page
  $scope.loadMoreDetails = function(){

    // // if page is scrolled more than 300px
    // $scope.scrollValue = $scope.scrollValue + 300;

    // if($scope.detailedList.length == $scope.paginateDetailedList.length){
    //   return false;
    // }
      
    // $scope.amount= $scope.amount + $scope.step;

    // if($scope.amount >= $scope.detailedList.length){
    //   $scope.amount = $scope.detailedList.length;
    // }

    // $scope.paginateDetailedList = $scope.detailedList.slice(0, $scope.amount);
  };

  $scope.loadOnlyFiveDetails = function(){
  
    $scope.amount= 8;

    if($scope.amount >= $scope.detailedList.length){
      $scope.amount = $scope.detailedList.length;
    }

    $scope.paginateDetailedList = $scope.detailedList.slice(0, $scope.amount);
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

  $scope.filterByHybridGenre = function(){

    $scope.requestCompleted = false;
    var operatorContext = 'headendid='+$rootScope.currentOperatorId+';applicationname=website';

    $scope.safeApply(function(){
      reset();
    });
    
    loading('show', {element: $spinnerDiv});

    var params = {
      userid      : $rootScope.getUser().userid, 
      hybridgenre : $scope.curretHybridGenre, 
      context     : operatorContext
    };


    userAPI.filterByHybridGenre(params,function(rs){

      $scope.requestCompleted = true;
      if(!rs.hybridchannels){

        loading('hide', {element: $spinnerDiv});

        if($scope.curretHybridGenre == 'favorites'){
          // alert('No favourites added');
        }else{
          // alert('No results for '+$scope.curretHybridGenre);  
        }
        
        $scope.detailedList = [];
        return false;
      }
        
      if(!angular.isArray(rs.hybridchannels.hybridchannelslist)){

        if(angular.isObject(rs.hybridchannels.hybridchannelslist)){
          rs.hybridchannels.hybridchannelslist = [rs.hybridchannels.hybridchannelslist];
        }else{
          $scope.detailedList = [];
          return false;  
        }
      }

      if(rs.hybridchannels.hybridchannelslist[0].tablegenre.toLowerCase() != $scope.curretHybridGenre.toLowerCase()){
        $scope.detailedList = [];
        return false;
      }
        
      $scope.detailedList = rs.hybridchannels.hybridchannelslist;
      // $scope.loadMoreDetails();

      $scope.loadOnlyFiveDetails();
    });
  };

  $scope.$on('filter:based-on-operator', function(event, operatorObj) {
    
    if($scope.curretHybridGenre == ''){
      $scope.curretHybridGenre = 'Popular';      
    }
    
    $rootScope.currentOperatorId = operatorObj.operator_id;
    $scope.filterByHybridGenre();
  });

  $scope.$on('searched-by-channel', function(event, newResults) {

    $scope.safeApply(function(){
      reset();
    });

    $scope.curretHybridGenre = '';
    $scope.detailedList = newResults;
    $scope.loadOnlyFiveDetails();    
  });
  
  // toggles Channel favorite
  $scope.toggleFavoriteChannel = function(e, c, forceRefresh){

    e.preventDefault();
      
    var element = $(e.currentTarget);
    if(!$rootScope.isUserLogged()){

      $rootScope.beforeaction.title = "Login to Favorite";
      $rootScope.beforeaction.subtitle = "Please login to favorite";
      // adjustments for popover for tvguide channels
      var yoffset = (element.attr("data-popover"))? (-15) : 5;
      var popover_position = ($('.sidebar').hasClass('expand') || $('.tv_guide').hasClass('tv'))? {my:'top left', at:'bottom center'} : {my: 'top center', at: 'bottom center'};      popover_position.my = ($rootScope.device.isTouch && element.offset().left < 125) ? 'top left' : 'top center';
      if($rootScope.device.isMobile){
        popover_position.my =  'top left';
      }
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus',
          },
          position:{
            my: popover_position.my, 
            at: popover_position.at,
            adjust:{
              y: yoffset, 
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
                    $scope.toggleFavoriteChannel(e, c, true);
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
      element.qtip(qtipConfig).qtip('show'); // show login/sign-up pop-over
      return false;

    }
    element.qtip('destroy');


    // shows loading spinner
    element.addClass("loading");
    loading('show', {element: element});

    var params = {
      channelid: c.channelid, 
      userid: $rootScope.getUser().userid, 
      like: ((c.ischannelfavorite == "1")? false : true)
    };

    userAPI.toggleFavoriteChannel(params, function(rs) {

      if(forceRefresh) {
        location.reload();
        return false;
      }

      element.removeClass('loading');
      loading('hide', {element:element});

      if(rs.response.responsestatus == 'false') {

        //return false;
      }
  
      c.ischannelfavorite = (c.ischannelfavorite == "1")? '0' : '1';     

      if($scope.curretHybridGenre == 'favorites'){
        $scope.paginateDetailedList = _.reject($scope.paginateDetailedList, function(obj){ 
          return obj.ischannelfavorite == '0'; 
        });  
      }
       
      $rootScope.$broadcast('update:fav-ui',c);
    });

  };
}]);

woi.controller("OperatorsControllerChannels", ['$scope', '$rootScope', '$filter', 'userAPI', 'tsmAPI',  function($scope, $rootScope, $filter,  userAPI, tsmAPI){

  $scope.allOperators = [];
  $scope.paginateOps = [];

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
    var operatorUI = $('.operator-name');
    operatorUI.html(operatorObj.operator_name);

    $rootScope.$broadcast('filter:based-on-operator', operatorObj);
  };

}]);

woi.controller('SidebarVideosController', ['$rootScope', '$scope', 'recoAPI', 'userAPI', 'videoActions', function($rootScope, $scope, recoAPI, userAPI, videoActions){



  // load featured videos list
  userAPI.featuredProgramme({pageno:1, userid: $rootScope.getUser().userid},function(r){

    var init = function(){
      $scope.featuredProgramsList = [];
      $scope.paginatefeaturedList = [];
      $scope.amount  = 0;
      $scope.step    = 2;
      $scope.scrollValue = 300;
    };

    init();

    // called only when the user scrolls the page more than 300px;
    $scope.loadMoreDetails = function(){

      // $scope.scrollValue = $scope.scrollValue + 300;

      // if($scope.featuredProgramsList.length == $scope.paginatefeaturedList.length){
      //   return false;
      // }
        
      // $scope.amount= $scope.amount + $scope.step;

      // if($scope.amount >= $scope.featuredProgramsList.length){
      //   $scope.amount = $scope.featuredProgramsList.length;
      // }

      // $scope.paginatefeaturedList = $scope.featuredProgramsList.slice(0, $scope.amount);
      // console.log('$scope.paginatefeaturedList == '+$scope.paginatefeaturedList.length);
    };

    $scope.loadOnlyFourDetails = function(){
      
      $scope.amount= 5;

      if($scope.amount >= $scope.featuredProgramsList.length){
        $scope.amount = $scope.featuredProgramsList.length;
      }
      $scope.paginatefeaturedList = $scope.featuredProgramsList.slice(0, $scope.amount);
      
    };


    if(!r.getfeaturedprogramme){
      $scope.featuredProgramsList = [];
      return false;
    }

    if(angular.isArray(r.getfeaturedprogramme.featuredprogrammelist)){
      $scope.featuredProgramsList = r.getfeaturedprogramme.featuredprogrammelist;
      //$scope.loadMoreDetails();
      $scope.loadOnlyFourDetails();
    }else{
      $scope.featuredProgramsList = [];
      return false;
    }
      
  });

}]);


woi.controller("ChannelAutoCompleteController", ['$scope', '$rootScope', '$filter', 'userAPI', 'autoAPI',  function($scope, $rootScope, $filter,  userAPI, autoAPI){

  $scope.getNewDataSet = function (val){
    
    if(val.length < 2)
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

    var contextParam ='applicationname=sourcebits;headendid=' + $rootScope.currentOperatorId;
    
    var params = {
      channelname : val, 
      context     : contextParam
    };

    (function(params){

      userAPI.searchByChannelName(params, function(rs){

        if(params.channelname != val){        
          return false;
        }

        if(!rs.hybridchannelsbychannelname) 
          return false;

        var response = addData(rs.hybridchannelsbychannelname.hybridchannelsbychannelnamelist);
          

        $scope.safeApply(function() {
          $rootScope.$broadcast('searched-by-channel', response);
        });
      }); 
    })(params);  
  };

}]);
