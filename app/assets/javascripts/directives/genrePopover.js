woi.directive('genrePopover', ['$compile', '$timeout', function($compile, $timeout){


  var $content;

  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){
      element.qtip({
        show: false,
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
            url: '/genre', 
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
      element.click(function(){
        scope.genreEdit = true;
        if(!_.isUndefined(attrs.modeValue)){
          scope.genreEdit = false;
        }
        scope.$apply();
        scope.constructObject();
        // if(scope.paginateGenres.length>0){
        //   element.qtip("show","click")
        // }
      });
    }
  };
}]);