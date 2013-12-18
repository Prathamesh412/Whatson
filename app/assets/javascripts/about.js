woi.controller("AboutController", ['$scope', '$rootScope', function($scope, $rootScope){
	// Reset menu highlighting
	$rootScope.$broadcast('resetHighlight', []);
}]);