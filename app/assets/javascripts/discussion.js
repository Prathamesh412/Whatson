woi.controller("DiscussionsController", ['$scope', '$rootScope', '$filter', '$timeout', '$http', '$routeParams','userAPI', function($scope, $rootScope, $filter, $timeout, $http, $routeParams, userAPI){

	// Remove highlighting from the menu
  	$rootScope.$broadcast('resetHighlight', []);

	// Controller variables
	$scope.tabs = [],     						// Stores the object to be displayed in the UI
	$scope.tabsList = {}, 						// Stores the category list
	$scope.dataLoaded = false, 				// Flag indicating whether ATLEAST ONE discussion category has been loaded
	$scope.activeFilter = 'Latest',		// Currently active filter
	$scope.requestKey;							 	// uniqueKey to fingerprint requests with
	$scope.commentsExpanded = false;	// Flag storing the comment status of the current thread, necessary because
																		// expanded comments require different styles
	$scope.showFacebook = true;
	var loading = $filter('loading'); // Loading indicator filter

	// Initialize the loading indicator
	var $loadingIndicator = $('.loadingIndicator');
	loading('show', {element: $loadingIndicator});

	/*
	 * Execution starts with $scope.loadCategories
	 *
	 * Execution order:
	 * 	$scope.loadCategories					: Get the category list
	 * 	$scope.loadDiscussions				: Iterate through the categories and load the discussions for each one
	 * 	$scope.openThread							: Opens the first thread in the selected discussion by default, also used to open other threads
	 *	$scope.loadDiscussionThread	: Loads the comments for the loaded thread, called directly by openThread
	 *
	 * Description of other included functions:
	 *	$scope.openTab								: Opens the category tabs, also loads the first thread and its associated comments
	 *	$scope.openNotification				: Adds an additional notification to the notifier
	 *	$scope.closeNotification			: Remove the specified notification from the notifier
	 *	$scope.cleanObject						: Useful helper, check function for full documentation
	 *
	 * All data shown in the view is stored in the $scope.tabs object array. This is useful for enabling data
	 * caching in $rootScope without cluttering the rootScope with a million objects/arrays
	 *
	 */

	$scope.loadCategories = function() {
	 	userAPI.getDiscussionCategories({}, function(r) {
	 		if(!r.RootTag) { return false; }

			// Store the returned data
			$scope.tabsList = {
				'keys'			: r.RootTag.forumkey,
				'headings'	: r.RootTag.forumtype
			};

			// Now that we have this list, let's start loading the discussions
			$scope.loadDiscussions();
		});
	}(); // Self invocation, get's the ball rolling on loading the page

	$scope.loadDiscussions = function() {
		$scope.tabs = [];
		$scope.dataLoaded = false;

		var itemsLength = $scope.tabsList.keys.length;
		$scope.requestKey = (new Date()).getTime();

		for(var i = 0; i < itemsLength; i++) {
			// Closure to get the value of i, instead of just a reference.
			(function(thisIndex, reqKey){
				userAPI.getAllDiscussions({forumtype: $scope.tabsList.keys[thisIndex], filter: $scope.activeFilter}, function(r) {
					if(!r.alldiscussion) { if(console) console.log('Improper response for', $scope.tabsList.headings[thisIndex], r.alldiscussion); return false; }

					// Check if the returned request matches the live filter before updating
					if( !(reqKey == $scope.requestKey) ) { return false; }

					// Coerce the server response into a structure that's more suitable for us
					var tempArray = {
						'discussions'	: r.alldiscussion.alldiscussionlist.slice(0, 4),
						'heading'			: $scope.tabsList.headings[thisIndex],
						'active'			: false
					},
					totalDiscussions = tempArray.discussions.length;

					// Set all discussions as active = false, then set the first one as active = true
					// Also set all the loading flags as false
					for(var i = 0; i < totalDiscussions; i++) {
						tempArray.discussions[i].active = false;
						tempArray.discussions[i].loading = false;
					}

					// If this is the first tab loaded, set it as active
					if(!$scope.dataLoaded) {
						$scope.dataLoaded = true;
						tempArray.active = true;
						// $scope.openThread( tempArray.discussions, tempArray.discussions[0] );

						// Load the filters now
						$scope.loadFilters();
					}
					$scope.openThread( tempArray.discussions, tempArray.discussions[0] );
					$scope.tabs.push( tempArray );
				});	
			})(i, $scope.requestKey);
		}
	}

	$scope.applyFilter = function(e, newFilter) {
		e.preventDefault();
		$scope.dataLoaded = false;
		$scope.activeFilter = newFilter;
		$scope.loadDiscussions();
	}

	$scope.loadFilters = function() {
		userAPI.getDiscussionFilters({}, function(r) {
			if(!r.filters) { 
				$scope.allFilters = []; 
				return false; 
			}

			$scope.allFilters = r.filters.filtertype;
		});	
	};

	$scope.viewAllComments = function(thread) {
		thread.visibleComments = thread.allComments;
		$scope.commentsExpanded = true;
	}

	$scope.openThread = function(thisTabDiscussions, thread) {
		var $loadingIndicator = $('.discussionContents .loadingIndicator');

		// Set all threads as inactive
		$scope.cleanObject( thisTabDiscussions, 'active', false );

		// Activate the currently selected thread
		thread.active = true;
		thread.loading = true;
		(function(thread){
			$timeout(function() {
				$scope.commentsExpanded = true;
			}, 250);
		})(thread);

		var indicatorCount = $loadingIndicator.get().length;
		for(var i = 0; i < indicatorCount; i++) {
			var $thisElement = $( $loadingIndicator[i] ),
			childrenCount = $thisElement.children().length;
			if(!childrenCount) {
				loading('show', {element: $thisElement});	
			}
		}

		$scope.loadDiscussionThread(thread);

		// Set the commentsExpanded flag properly
		var openTabIndex = $scope.tabs.indexOf(thisTabDiscussions);
		if( openTabIndex != -1 && $scope.tabs[ openTabIndex ].active ) {
			$scope.commentsExpanded = true;
		}
	}

	$scope.loadDiscussionThread = function(thread, pageno) {
		var $loadingIndicator = $('.discussionContents .loadingIndicator');
		// Set the proper page number
		if(!pageno) { pageno = 1; }

		if(pageno === 1) {
			// Clear the previous comments
			thread.allComments = [];
			thread.visibleComments = [];
			thread.loading = true;
		}

		userAPI.getTrendingDiscussion({forumid: thread.forumid, pageno: pageno}, function(r){
			if(!r.gettrendingdiscussion) { 
				thread.loading = false;
				thread.threadcount = thread.allComments.length;
				return false; 
			}
			
			r = r.gettrendingdiscussion.trendinglist;

			// Show the first comment on the first page
			if(pageno === 1) {

				// In case of a single comment, it returns an object instead of an object array
				if(!_.isArray(r)) {
					thread.allComments = [r];
				} else {
					thread.allComments = r;
				}

				thread.visibleComments = thread.allComments.slice(0, 1);
			} else {
				if(!_.isArray(r)) {
					thread.allComments.push(r);
				} else {
					thread.allComments = thread.allComments.concat(r);
				}

				// View all comments has been clicked, so we also need to update the visibleComments
				if(thread.visibleComments.length > 1) {
					thread.visibleComments = thread.allComments;
				}
			}

			thread.loading = false;

			if(!$loadingIndicator.children().length){
				loading('hide', {element: $loadingIndicator});
			}

			// They're only sending us 10 comments at a time, so load the remaining comments
			$scope.loadDiscussionThread(thread, pageno + 1);
		});
	}

	$scope.openTab = function(e, object) {
		if(object.active){
			return false;
		}
		var thisElement = $(e.currentTarget);
		$scope.cleanObject($scope.tabs, 'active', false);
		object.active = true;
		$scope.openThread( object.discussions, object.discussions[0] );

    // Sometimes the tab opens off the screen, so we're adding some automatic scrolling
    // The setTimeout is to make sure we get the position after it's been animated (0.2s in CSS)
    setTimeout(function() {
    	$('body, window').animate({scrollTop: thisElement.position().top - 50 + 'px'});
    }, 205)
  }

  $scope.openNotification = function(selector_id) {
  	var parentElement = ( selector_id ? $('#' + selector_id) : $('.discussionConfirmation') ),
  	adjustElements = parentElement.children('li').children('.dc_check, .dc_close'),
  	totalHeight = parentElement.outerHeight();

  	adjustElements.height( totalHeight );
  	parentElement.fadeIn().slideDown();
  	setTimeout( function() {
  		$scope.closeNotification(null, parentElement);
  	}, 3000);
  }

  $scope.closeNotification = function(e, element) {
  	if(e) {
  		e.preventDefault();
  		var thisElement = $(e.currentTarget),
  		parentElement = thisElement.parent().parent();
  	} else {
  		parentElement = element;
  	}

  	parentElement.slideUp().fadeOut();
  } 

	// Use this function to set a common value to a parameter of all objects in an object array
	// Takes three arguments: objectArray, propertyName, Value.
	// Upon execution, it sets objectArray[i].propertyName = Value for all valid values of i
	// Pretty useful in Angular, to set all objects in an array to active/inactive etc. ;)
	$scope.cleanObject = function(arr, param, value) {
		var len = arr.length;
		for(var i = 0; i < len; i++) {
			arr[i][param] = value;
		}
	}

 /*
  *  Function to scroll the page down to the comment textarea when 'Comment' button
  *  is clicked under trending discussions
  */
  $scope.scrollToComment = function(e) {
    // The element that triggered the event
    var element = $(e.currentTarget),
    // The textarea we need to target
    targetTextarea = element.parents('.discussionBody').find('.post-comment textarea'),
    // The location we need to scroll the screen to, adjusted so the targetTextarea is in the middle of the screen
    targetOffset = targetTextarea.offset().top - ( $(window).height() / 2 ) + targetTextarea.height();

    $('body').animate({scrollTop: targetOffset}, function(){
    	targetTextarea.focus();
    });
  }

  $scope.facebookHandle = 'HBOIndia';
  var getFbFeed = function(){
  	$.get('https://graph.facebook.com/oauth/access_token?type=client_cred&client_id=135772246470432&client_secret=7fcfe7ded1aa03cb58318f9e93e874d2&callback=text', 
  		function(access_token) {      
  			$http({
  				method: 'JSONP', 
  				url: 'https://graph.facebook.com/'+$scope.facebookHandle+'/posts?'+access_token, 
  				params:{
  					limit:10,
  					callback:'JSON_CALLBACK'
  				}
  			})
  			.success(function(data, status) { 
  				$scope.facebookResponse = data.data;
  				if(typeof($scope.facebookResponse)=="undefined"){
  					return;
  				}
  				if(data.data.length <= 0){
  					$scope.showFacebook = false;
  				}
  				$scope.paginateFb = $scope.facebookResponse.slice(0, 2);
  			})
  			.error(function(data, status) {
          //console.log("ERROR in fetching facebook feed");
        }); 
  		});
    // fetch the profile pic
    $http({
    	method: 'JSONP', 
    	url: 'http://graph.facebook.com/'+$scope.facebookHandle+'/?fields=picture&type=small', 
    	params:{
    		callback:'JSON_CALLBACK'
    	}
    })
    .success(function(data, status) {
    	if(typeof(data.picture)=="undefined"){
    		$scope.facebookProfilePic = "";   
    		return;
    	}
    	$scope.facebookProfilePic = data.picture.data.url;  
    })
    .error(function(data, status) {
      $scope.facebookProfilePic = "";
    });
  }();

  
  // Facebook
  $scope.paginateFb = [];
  $scope.fbText     = 'View More';

  $scope.loadMoreFb = function(){ 

    if($scope.fbText == 'View More'){
      $scope.fbText = 'View Less';
      $scope.paginateFb = $scope.facebookResponse;
    }else{
      $scope.fbText = 'View More';
      $scope.paginateFb = $scope.facebookResponse.slice(0, 2);
    }    
  };

	// jQuery bindings for the filter dropdown
	$('#selectFilter').click(function(e) {
		e.stopPropagation();
		$('.dropdown-menu.selectFilter').toggle();
	});

	$(document).click(function() {
		$('.dropdown-menu.selectFilter').hide();
	});

}]);
