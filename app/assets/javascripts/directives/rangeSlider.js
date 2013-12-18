'use strict';
woi.directive('rangeSlider', ['$compile', '$timeout', function($compile, $timeout){

  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){

        element.rangeSlider({
          bgImage: '/assets/img/bg.png',
          thumbImage: '/assets/img/selector.png',
          maxRight: 2010,
          maxLeft: 1940,
          currentLeft: 1960,
          change2:function(obj){
            scope.yearsFilter(obj);
          }
        });
    }
  };
}]);

