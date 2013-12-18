woi.controller("SitemapController", ['$scope', '$rootScope', '$filter', '$timeout', '$location', '$routeParams','userAPI', 'tsmAPI', function($scope, $rootScope, $filter, $timeout, $location, $routeParams, userAPI, tsmAPI){

	// Controller variables
	$rootScope.sitemap = {},					// Stores the object to be displayed in the UI
	$scope.sitemapLoaded = false,			// Flag stores whether the sitemap API has responded
	$scope.hasChannels = false,				// Flag stores whether the sitemap has channels, when true, stores the index
	$scope.hasApps = false,						// Flag stores whether the sitemap has apps, when true, stores the index
	$scope.hasOperators = false;			// Flag stores whether the sitemap has operators, when true, stores the index

	// Reset menu highlighting
  $rootScope.$broadcast('resetHighlight', []);

	var loading = $filter('loading');
	loading('show', {element: $('.pageLoadingIndicator')});

	// Program execution starts here, we get the sitemap sections first
	getSitemap = function() {
		userAPI.getSitemapSections({}, function(r){
			$scope.sitemapLoaded = true;
			if(!r.getsitemap) { 
				return false; 
			}
			
			$rootScope.sitemap = r.getsitemap.sitemaplist;

			// Check if the sections with subsections are returned, so we only load things we need to
			checkSubitems();

			// Populate the URLs to link to, these aren't provided by the API for Operators and Channels
			// @TODO: TV Guide operators section needs to be edited for proper linking for Operator links
			populateLinks();

			$timeout(function() {
				loading('show', {element: $('.loadingIndicator.live')});
			}, 5);

			// Load the channels subsections if hasChannels is true
			if($scope.hasChannels) {

				tsmAPI.getSitemapChannels({}, function(r){
					if(!r.getchanneldetails) { return false; }

					var tempStructure = [],
					origStructure = r.getchanneldetails.channeldetaillist,
					dataLength = origStructure.length;

					for(var i = 0; i < dataLength; i++) {
						tempStructure[i] = {
							'sectionName'	: origStructure[i].displayname,
							'sectionUrl'	: '#!/channel/' + origStructure[i].channelid
						}
					}

					$scope.insertSubsection( $scope.channelsIndex, tempStructure );
					$scope.sitemap[ $scope.hasChannels.index ].loading = false;
				});
			}

			// Load the apps subsections if hasApps is true
			if($scope.hasApps) {

				userAPI.getSitemapApps({}, function(r){
					if(!r.getallapps) { return false; }

					var tempStructure = [],
					origStructure = r.getallapps.appslist,
					dataLength = origStructure.length;

					for(var i = 0; i < dataLength; i++) {
						tempStructure[i] = {
							'sectionName'	: origStructure[i].appname,
							'sectionUrl'	: '#!/apps/' + origStructure[i].appid
						}
					}

					$scope.insertSubsection( $scope.appsIndex, tempStructure );
					$scope.sitemap[ $scope.hasApps.index ].loading = false;
				});
			}

			// Load the operators subsections if hasOperators is true
			if($scope.hasOperators) {

				tsmAPI.getSitemapOperators({}, function(r){
					if(!r.getoperators) { return false; }

					var tempStructure = [],
					origStructure = r.getoperators.operatorslist,
					dataLength = origStructure.length;

					for(var i = 0; i < dataLength; i++) {
						(function(i) {
							tempStructure[i] = {
								'sectionName'		: origStructure[i].publicname,
								'sectionAction'	: function() {
									$rootScope.preselectOperator = origStructure[i];
									$location.path('/tv-guide');
								}
							}
						})(i);
					}

					$scope.insertSubsection( $scope.operatorIndex, tempStructure );
					$scope.sitemap[ $scope.hasOperators.index ].loading = false;
				});
			}
		});
}();

$scope.insertSubsection = function(index, objArray) {
	$rootScope.sitemap[ index ].subsections = objArray;
}

checkSubitems = function() {
	var totalItems = $rootScope.sitemap.length;

	for(var i = 0; i < totalItems; i++) {
		$rootScope.sitemap[i].loading = false;

		if($rootScope.sitemap[i].sitemaptitle == "Channels") {
			$scope.hasChannels = {'index': i};
			$rootScope.sitemap[i].loading = true;
			$scope.channelsIndex = i;
		}

		if($rootScope.sitemap[i].sitemaptitle == "Apps") {
			$scope.hasApps = {'index': i};
			$rootScope.sitemap[i].loading = true;
			$scope.appsIndex = i;
		}

		if($rootScope.sitemap[i].sitemaptitle == "Operator") {
			$scope.hasOperators = {'index': i};
			$rootScope.sitemap[i].loading = true;
			$scope.operatorIndex = i;
		}			
	}
}

populateLinks = function() {

	var linkingLogic = {
		'Home': '#!/home',
		'TV Guide': '#!/tv-guide',
		'Channels': '#!/channels',
		'Apps': '#!/apps',
		'About': '#!/about',
		'Contact': 'http://www.whatsonindia.net/contact.html',
		'Corporate': 'http://www.whatsonindia.net',
		'Terms & Condition': '#!/tnc',
		'Privacy': '#!/privacy',
		'Operator': ''
	},
	totalItems = $rootScope.sitemap.length;

	for(var i = 0; i < totalItems; i++) {
		// console.log($rootScope.sitemap[i].sitemaptitle);
		if(!_.isUndefined(linkingLogic[$rootScope.sitemap[i].sitemaptitle])) {
			$rootScope.sitemap[i].linkUrl = linkingLogic[$rootScope.sitemap[i].sitemaptitle];
		} else {
			$rootScope.sitemap[i].linkUrl = '';
		}
	}
}
}]);