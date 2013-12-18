'use strict';
woi.directive('fbActivityWidthSetter', ['$compile', '$timeout', function($compile, $timeout){
  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){ 
      if (scope.$last === true) { 
        $timeout(function(){
          scope.setWidthFb(attrs.fbActivityWidthSetter);
        });
      }
    }
  };
}]);

