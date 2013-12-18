'use strict';
woi.directive('scrollCallback', ['$filter', function($filter){
  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){

      $(window).scroll(function() {
        
        if (this.pageYOffset > scope.scrollValue) {
          scope.$apply(function(){
            scope.loadMoreDetails();
          });    
        }
      });

    }
  };
}]);


woi.directive('scrollCallbackTvGuide', ['$filter', function($filter){
  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){

      $(window).scroll(function() {

        // scope.scrollSpeed = Math.abs(scope.previousY - this.pageYOffset);
        // scope.previousY = this.pageYOffset;

        // if(scope.scrollSpeed < 200) {
          scope.loadOnScrollTop();
        // }

      });

     
    }
  };
}]);

