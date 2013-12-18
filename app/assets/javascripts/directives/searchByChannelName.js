'use strict';
woi.directive('searchByChannelName', ['$filter', function($filter){

  return {
    restrict:'A',
    link:function(scope, element, attrs){

      element.bind('keyup', function(e){ 
        scope.getNewDataSet(element.val());
      });

      element.bind('focus', function(e){      	
      	element.val('');
      });

      element.bind('change', function(e){      	
      	element.val('');
      });
    }
  }
 }]);