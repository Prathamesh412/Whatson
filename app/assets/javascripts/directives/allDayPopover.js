woi.directive('allDayPopover', ['$compile', '$timeout', function($compile, $timeout){


  var $content;

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
          my: 'top right',
          at: 'bottom right', 
          adjust:{
            x:-5, 
            y:5
          }
        },
        content:{
          text: '<div class="popover-loader signin-loader"></div>',
          ajax: {
            url: '/movies/popover', 
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
          classes:'popover rside-popover tvoperator-popover'
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