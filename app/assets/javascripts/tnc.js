woi.controller("TNC_Controller", ['$scope', '$rootScope', '$location' , '$routeParams', '$filter', 'userAPI', function($scope, $rootScope, $location, $routeParams, $filter, userAPI){

	// Reset menu highlighting
  $rootScope.$broadcast('resetHighlight', []);

	$scope.openSection = function(index) {
		var sectionTabs = $('.tnc_privacy_nav_wrapper .common_header_style'),
				sectionBodies = $('.common_wrapper_style');

		sectionTabs.removeClass('active');
		sectionTabs.eq(index).addClass('active');

		sectionBodies.hide();
		sectionBodies.eq(index).show();
	}

	var showPage = $location.path().replace(/\//g, '');

	if(showPage == 'privacy') {
		$scope.openSection(1);
	}
}]);

