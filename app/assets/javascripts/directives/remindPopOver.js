'use strict';
woi.directive('remindPopover', ['$filter', '$timeout', '$compile', '$parse','$rootScope',  function($filter, $timeout, $compile, $parse, $rootScope){

  var isoToDate = $filter('isoToDate');

  return {
    // called in an attribute
    restrict:'A',
    //transclude: true, 
    scope:{
      programData: '=programData'  
    }, 
    link:function(scope, element, attrs){
      
      //////////////////////////////////////
      // set popover path according login //
      //////////////////////////////////////
      
      var setPopoverUrl = function() {
        if(!$rootScope.isUserLogged())
          return '/user/beforeaction';
        return '/user/reminders';
      };

      var popoverUrl = setPopoverUrl();

      // -- END 

      //////////////////////////////////////
      //  Generic config for popover Qtip //
      //////////////////////////////////////
      
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus click',
          },
          position:{
            my: 'top center',
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
            }, 
            hide: function() {
              element.parent().parent('.thumb').removeClass('active');
              element.parent().parent('.minor-details').removeClass('active');
              element.removeClass('active');
            },
          }, 
          content: {
            text: '<div class="popover-loader signin-loader"></div>',
            ajax: {
              url: popoverUrl,
              type: 'GET',
              data: {}
            }
          }, 
        };
      };
      var qtipConfig = resetQtip();

      // -- END Generic config for popover Qtip



      //////////////////////////////////////
      //  Qtip Content handler            //
      //////////////////////////////////////
      
       var successFn =  function(data, status) {
        var _this = this;
        // Set the content manually (required!)
        $timeout(function(){
          _this.set('content.text', $compile(data)(scope));
          $timeout(function(){
            _this.reposition();
          });
        });

      $rootScope.beforeaction.title = "Login to Set Reminder";
      $rootScope.beforeaction.subtitle = "Please login to set this reminder";
        scope.$apply(function(){
          scope.reminderData = scope.programData;
          scope.$reminder = element;
          scope.actionObj = {
            element: element, 
            popconfig: qtipConfig, 
            // after log in display the reminde popover
            success: function(){
              var config = qtipConfig;
              config.content.ajax.url = setPopoverUrl();
              element.qtip(config).qtip('show');
            },
            failure: function() {
              alert('oopss');
            }
          };
        }); 
      };
      qtipConfig.content.ajax.success = successFn;
      // -- END Qtip Content handler

      qtipConfig.events.hide = function(s){
        element.removeClass('active');
        element.parent().parent('.thumb').removeClass('active');
        var newConfig = resetQtip();
        newConfig.content.ajax.success = successFn;
        element.qtip(newConfig);
      } 


      element.click(function(e){
        $('div.qtip:visible').qtip('hide');
        e.stopPropagation();


      // fix for intantiation before auth action
        if($rootScope.isUserLogged()) {
            var newConfig = resetQtip();
            newConfig.content.ajax.success = successFn;
            newConfig.content.ajax.url =  setPopoverUrl()
            element.qtip('disable').qtip(newConfig).qtip('enable').qtip('show');
          }
      });

      element.qtip( qtipConfig);          


    }
  };
}]);


// hack to a directive inherits the father's scope
//function inheritanceHack( $scope ) {
  //for( var prop in $scope.$parent ) {
    //if( '$' != prop.charAt( 0 ) && $scope[prop] == undefined )
      //$scope[prop] = $scope.$parent[prop];
  //}
//}

