'use strict';
woi.directive('tvGuideCalendarPopover', ['$compile', '$timeout', '$location', function($compile, $timeout,$location){

//   find the location
// create 2 set of variables stroing teh right top center right left shit
// assing it to the qtip position

  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){

      //reset calendar for today
      scope.setCalendar();      

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
          my: tvguidechannel_my,
          at: tvguidechannel_at, 
          adjust:{
            x: tvguidechannel_x,
            y:5
            }
        },
        content: {
          text: '<div class="popover-loader signin-loader"></div>',
          ajax: {
              url: '/tv-guide/calendar',
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
          classes:'popover rside-popover', 
          width:"340px",
          marginLeft:"-20px"

        } , 
        events:{
          show:function(){element.addClass('active');}, 
          hide:function(){element.removeClass('active');}
          ,
          render: function(event, api) {
            if(Modernizr.mq("screen and (max-width:640px)")){
              var elem = api.elements.tip;
              elem.addClass('tip-tvguide-pos-fix');
            } 
          }
          }
      });
    }
  };
}]);

