'use strict';
woi.directive('searchList', ['$filter', function($filter){
  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){


      $(window).scroll(function() {
        if ($('body').height() <= ($(window).height() + $(window).scrollTop())) {
          scope.$apply(function(){
            scope.loadMore();
          });    
        }
      });

    }
  };
}]);