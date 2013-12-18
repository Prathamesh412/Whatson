woi.directive('signInPopover', ['$rootScope', '$compile', '$timeout', function($rootScope, $compile, $timeout){


  var $content;

  return {
    // called in an attribute
    restrict:'A',
    scope:{},
    link:function(scope, element, attrs){
      element.click(function(){
        $('div.qtip:visible').qtip('hide');
      });
      element.qtip({
        show: 'click',
        hide: {
          fixed: true,
          delay: 750,
          event: 'unfocus click',
        },
        position:{
          my: 'top center',
          at: 'bottom center'
        },
        content:{
          text: '<div class="popover-loader signin-loader"></div>',
          ajax: {
            url: '/user/'+attrs.action,
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
          classes:'popover selfClearing'
        }, 
        events:{
          show:function() {
            element.addClass('active'); 
            $rootScope.$apply(function() {
              $rootScope.$broadcast('change:loginPopoverState', { newState: 'login' });
            });

            $('.error').removeClass('error');
            $('.errorMessage').hide();
            $('.selfClearing').find('input').removeClass('filled').val('');
          }, 
          hide:function() {
            element.removeClass('active');
          } 
        }
      });
    }
  };
}]);
