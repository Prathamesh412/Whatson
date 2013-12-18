'use strict';
woi.directive('watchlistCalendarPopover', ['$compile', '$timeout', function($compile, $timeout){



  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){

      //reset calendar for today
      // scope.setCalendar();      

      // popover plugin binding
      //element.click(function(){
        //$('div.qtip:visible').qtip('hide');
      //});
      element.qtip({
        show: 'click',
        hide: {
            event: 'unfocus',
        },
        position:{
          my: 'top right',
          at: 'bottom right', 
          adjust:{
            x:0,
            y:5
            }
        },
        content: {
          text: '<div class="popover-loader signin-loader"></div>',
          ajax: {
              url: '/watchlist/calendar',
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
          classes:'popover rside-popover'

        } , 
        events:{
          show:function(){element.addClass('active');}, 
          hide:function(){element.removeClass('active');} 
          }
      });

    }
  };
}]);

