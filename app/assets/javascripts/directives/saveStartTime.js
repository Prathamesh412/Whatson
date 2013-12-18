woi.directive('saveStartTime', ['$location','$rootScope',function($location,$rootScope){
	return {

    restrict: 'A',

    link: function(scope, element, attrs){ 
    	

    	element.bind('click', function(){
    		console.log('generic item click .... ',scope[attrs.saveStartTime].starttime);
    		$rootScope.programmeStartTime = scope[attrs.saveStartTime].starttime;
    	});
    	
    }
  };
}]);
