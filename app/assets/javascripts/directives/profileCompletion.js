'use strict';
woi.directive('profileCompletion', ['$compile', '$timeout', function($compile, $timeout){

  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){

      element.progress({
        width:200,
        percent: 0
      });

      scope.updateProgressBar = function(percent){
        element.setPercent(percent);
      };      

      scope.$watch('profileCompletion',function(newValue, oldValue){

          if(newValue == oldValue)
            return false;

          element.setPercent(newValue);
      });
    }
  };
}]);


  