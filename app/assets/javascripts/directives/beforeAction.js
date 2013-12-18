'use strict';
woi.directive('beforeAction', ['$filter','$rootScope', function($filter, $rootScope){
  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){
      //sets the title
      element.find('.action-title').html($rootScope.beforeaction.title);
      element.find('.action-subtitle').html($rootScope.beforeaction.subtitle);
    }
  };
}]);
