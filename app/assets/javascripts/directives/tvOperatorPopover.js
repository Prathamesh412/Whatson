woi.directive('tvOperatorPopover', ['$rootScope', '$compile', '$timeout', '$location', function($rootScope, $compile, $timeout, $location){


  var $content;
  var location = $location.path();
  var mqIsTab = $rootScope.device.isTablet;
  //var tiploc = 'tvlisting-tip-location-fix';

  if(location == '/Tv-Listings'){
    var my = (mqIsTab) ? 'top left' : 'top center';
    var at = (mqIsTab) ? 'bottom left' : 'bottom center';
    var x = 5;
  }else{
    var my = (mqIsTab) ? 'top right' : 'top center';
    var at = (mqIsTab) ? 'bottom right' : 'bottom center';
    var x = (mqIsTab) ? 10 : 0;
  }

  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){
      
      element.click(function(){
        scope.update();
      });
      
      element.qtip({
        show: 'click',
        hide: {
          event: 'unfocus'
        },
        position:{
          my:my,
          at:at, 
          adjust:{
            x:x, 
            y:10
          }
        },
        content:{
          text: '<div class="popover-loader signin-loader"></div>',
          ajax: {
            url: '/tv-guide/tvoperator', 
            type: 'GET',
            data: {},
            success: function(data, status) {
              var _this = this;
              // Set the content manually (required!)
              $timeout(function(){
                _this.set('content.text', $compile(data)(scope));
                $timeout(function(){
                  _this.reposition();
                });
              });
            }
          }
        },
        style:{
          classes:'popover lside-popover tvoperator-popover'
        } , 
        events:{
          show:function(){element.removeClass('active').addClass('active');}, 
          hide:function(){
            element.removeClass('active');
          } 
        }
      });
    }
  };
}]);