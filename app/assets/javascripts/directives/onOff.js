'use strict';
woi.directive('onOff', ['$compile', '$timeout', function($compile, $timeout){

  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){

      scope.initSwitch = function(val){
        element.on_off({
          value: val,
          change:function(value){
            scope.toggleSwitch(value);
          }
        });
      };

      scope.toggleState = function(){
        
        var state = element.on_off('getValue');

        if(state == 'on'){
          element.on_off('forceOff');
        }else{
          element.on_off('forceOn');
        }
      };
    }
  };
}]);