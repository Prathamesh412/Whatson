woi.controller('ProfileMainController', ['$rootScope', '$scope', '$location', '$routeParams', '$filter', 'userAPI',  function($rootScope, $scope, $location, $routeParams, $filter, userAPI){



	// Reset the searh boxes
	$('#mainSearch').css('background-color','transparent');
	  if( !$('html').hasClass('ie9') ) {
	    $('#mainSearch').val('');
	    $('#searchBoxBottom').val('');
	  }

	/*
	 * Controller execution begins with function loadWatchlist.
	 *
	 * Loading order:
	 * We want the page to feel fast, so we'll be loading the data visible to the user first, then we'll
	 * load the remaining page. In this case, this means we'll load the APIs in the following order:
	 * 		1. Watchlist, User Details, Recently Searched
	 *		2. Reminders, Favorites, Recently Browsed, Questionnaire
	 *		3. Feeds
	 *
	 *	Each section has an associated API function, so the order is easy to modify
	 *
	 */
	var thisPage =  $location.path().split('/')[1];

	if($rootScope.getUser().userid == -1){
		$location.path("/home");
		$route.reload();
		return false;
	}

	// Remove highlighting in the main menu
	$rootScope.$broadcast('resetHighlight', []);

	// Controller Variables, linked to the view
	$scope.profile = {
		watchlist : {
			sectionLoaded	: false,
			isActive 			: false,
			data 					: [],
			currentPage 	: 1
		},
		reminders : {
			sectionLoaded	: false,
			isActive 			: false,
			data 					: [],
			currentPage 	: 1
		},
		favorites : {
			sectionLoaded	: false,
			isActive 			: false,
			data 					: [],
			currentPage 	: 1
		},
		feeds     : {
			sectionLoaded	: false,
			loading 			: true,
			isActive 			: false, // We're not actually using this parameter for feeds, this is here for uniformity
			data 					: [],
			allData 			: [],
			currentPage 	: 1,
			nullReached		: false
		}
	};

	$scope.activeFeed = 'latest';

	// Private controller variables, only used internally
	var publicUser = $routeParams.publicid || $rootScope.getUser().userid,
			readOnlyMode = !!$routeParams.publicid;

	var friendsActivity = {
		sectionLoaded	: false,
		allData				: [],
		currentPage		: 1,
		pageLength 		: ( thisPage == "myprofile" ? 3 : 6 ),
		loading 			: true,
		nullReached		: false
	}

	var latestActivity = {
		sectionLoaded	: false,
		allData				: [],
		currentPage		: 1,
		pageLength 		: ( thisPage == "myprofile" ? 3 : 6 ),
		loading 			: true,
		nullReached		: false
	}

	// Private controller functions
	var loadWatchlist = function() {
		if(!$scope.profile.watchlist.sectionLoaded) {
			userAPI.getWatchlist({userid: publicUser, pageno: $scope.profile.watchlist.currentPage}, function(r) {
				// Mark this section as loaded
				$scope.profile.watchlist.sectionLoaded = true;

				if(!r.watchlistdata) {
					loadReminders();
					loadFavorites();
					return false;
				}

				$scope.profile.watchlist.data = addData( r.watchlistdata.watchlist ).slice(0, 6);
				loadReminders();
				loadFavorites();
			});
		}
	}(); // Controller execution begins here

	// Initialize the loading indicator
	var initializeIndicator = function() {
		var loading = $filter('loading'),
				loadingIndicator = $('.loadingIndicator');

		// Hide in case it's already initialized
		loading('hide', {element: loadingIndicator});

		loading('show', {element: loadingIndicator});
	}();

	var loadReminders = function() {
		if(!$scope.profile.reminders.sectionLoaded) {
			userAPI.getUserReminders({userid: publicUser, pageno: $scope.profile.reminders.currentPage}, function(r) {
				// Mark this section as loaded
				$scope.profile.reminders.sectionLoaded = true;

				if(!r.getalluserreminders) {
					if(!$scope.profile.favorites.sectionLoaded) { loadFeeds(); }
					return false;
				}

				if($scope.profile.reminders.data.length) {
					$scope.profile.reminders.data = $scope.profile.reminders.data.concat( addData( r.getalluserreminders.alluserreminderslist ).slice(0, 6) );
				} else {
					$scope.profile.reminders.data = addData( r.getalluserreminders.alluserreminderslist ).slice(0, 6);
				}

				// Call function to load the feeds if favorites hasn't been loaded yet
				if(!$scope.profile.favorites.sectionLoaded) { loadFeeds(); }
			});
		}
	};

	var loadFavorites = function() {
		if(!$scope.profile.favorites.sectionLoaded) {
			userAPI.getUserFavorites({userid: publicUser, pageno: $scope.profile.favorites.currentPage}, function(r) {
				// Mark this section as loaded
				$scope.profile.favorites.sectionLoaded = true;

				if(!r.getfavoriteprogrammes) {
					if(!$scope.profile.reminders.sectionLoaded) { loadFeeds(); }
					return false;
				}

				$scope.profile.favorites.data = addData( r.getfavoriteprogrammes.favoriteprogrammeslist ).slice(0, 6);

				// Call function to load the feeds if reminders hasn't been loaded yet
				// console.log('calling feeds from reminders');
				if(!$scope.profile.reminders.sectionLoaded) { loadFeeds(); }
			});
		}
	};

	var loadFeeds = function() {
		$scope.profile.feeds.data = $scope.profile.feeds.allData = [];
		$scope.profile.feeds.loading = true;
		userAPI.getLatestFeeds({userid: publicUser, pageno: latestActivity.currentPage}, function(r) {
			// Mark this section as loaded
			latestActivity.sectionLoaded = true;
			latestActivity.loading = false;
			$scope.profile.feeds.loading = false;

			if( $scope.activeFeed == 'latest' ) {
				$scope.profile.feeds.sectionLoaded = true;
			}

			if(!r.getlatestfeed) {
				// console.log('nullReached in latestActivity');
				latestActivity.nullReached = true;

			}

			if(r.getlatestfeed) {
				// console.log('Adding new data to Social Feed');
				latestActivity.allData = latestActivity.allData.concat( addData( r.getlatestfeed.latestfeedlist ) );
			}

			if($scope.activeFeed == 'latest') {
				$scope.profile.feeds.nullReached = latestActivity.nullReached;
				$scope.profile.feeds.allData = latestActivity.allData;
				$scope.profile.feeds.data = $scope.profile.feeds.allData.slice(0, latestActivity.currentPage * latestActivity.pageLength);
				loadLikesForFeed();
			}
		});
	};

	var loadFriendsActivity = function() {
		$scope.profile.feeds.data = $scope.profile.feeds.allData = [];
		$scope.profile.feeds.loading = true;
		userAPI.facebookActivity({userid: publicUser, pageno: friendsActivity.currentPage}, function(r) {
			friendsActivity.sectionLoaded = true;
			friendsActivity.loading = false;
			$scope.profile.feeds.loading = false;

			if( $scope.activeFeed == 'friends' ) {
				$scope.profile.feeds.sectionLoaded = true;
			}

			if(!r.getfacebookactivity) {
				// console.log('nullReached in friendsActivity');
				friendsActivity.nullReached = true;
			}

			if(r.getfacebookactivity) {
				// console.log('Adding new data to Friends Activity');
				friendsActivity.allData = friendsActivity.allData.concat( addData( r.getfacebookactivity.facebookactivitylist ) );
			}

			if($scope.activeFeed == 'friends') {
				$scope.profile.feeds.nullReached = friendsActivity.nullReached;
				$scope.profile.feeds.allData = friendsActivity.allData;
				$scope.profile.feeds.data = $scope.profile.feeds.allData.slice(0, friendsActivity.currentPage * friendsActivity.pageLength);
				loadLikesForFriends();
			}
		});
	};

	var loadLikesForFeed = function() {
		var totalFeeds = latestActivity.allData.length;

		for(var i = 0; i < totalFeeds; i++) {
			(function(feedIndex) {
				var thisFeed = latestActivity.allData[feedIndex],
						cType = thisFeed.contenttype,
						cID = thisFeed.contentid;

				if(cType == 'channel' || cType == 'program') {
					if(!cType || !cID) {
						return false;
					}
					// console.log(cType, cID, thisFeed);
					userAPI.getUsersWhoLikeThisFeed({contentid: cID, contenttype: cType}, function(r) {
						if(!r || !r.getuserfeed) {
							return false;
						}

						var data = addData( r.getuserfeed.userfeedlist );
						// console.log(data);
						latestActivity.allData[feedIndex].feedLikes = {
							showSection 	: 	( data.length ? true : false ),
							likeCount 		: 	( data.length > 1 ? data.length - 2 : 0 ),
							displayUsers 	: 	(function() {
																	var nameString = '';

																	if(data[0] && data[0].username) {
																		nameString += data[0].username;
																	}

																	if(data[1] && data[1].username) {
																		nameString += ', ' + data[1].username;
																	}

																	return nameString;
																})(),
							userImages 		: 	(function() {
																	var imagesArray = [];

																	for(var i = 0; i < data.length; i++) {
																		imagesArray.push({
																			userimage : data[i].userimage,
																			username 	: data[i].username
																		});
																	}

																	return imagesArray;
																})()
						};
						// console.log('Updated data:', latestActivity.allData[feedIndex].feedLikes);
					});
				}
			})(i);
		}
	};

	var loadLikesForFriends = function() {
		var totalFeeds = friendsActivity.allData.length;
		// console.log('loadLikesForFriends');
		for(var i = 0; i < totalFeeds; i++) {
			(function(feedIndex) {
				var thisFeed = friendsActivity.allData[feedIndex],
						cType = thisFeed.contenttype,
						cID = thisFeed.contentid;

				if(cType.toLowerCase() == 'channel' || cType.toLowerCase() == 'program') {
					if(!cType || !cID) {
						return false;
					}
					// console.log(cType, cID, thisFeed);
					userAPI.getUsersWhoLikeThisFeed({contentid: cID, contenttype: cType}, function(r) {
						if(!r || !r.getuserfeed) {
							return false;
						}

						var data = addData( r.getuserfeed.userfeedlist );
						// console.log(data);
						friendsActivity.allData[feedIndex].feedLikes = {
							showSection 	: 	( data.length ? true : false ),
							likeCount 		: 	( data.length > 1 ? data.length - 2 : 0 ),
							displayUsers 	: 	(function() {
																	var nameString = '';

																	if(data[0] && data[0].username) {
																		nameString += data[0].username;
																	}

																	if(data[1] && data[1].username) {
																		nameString += ', ' + data[1].username;
																	}

																	return nameString;
																})(),
							userImages 		: 	(function() {
																	var imagesArray = [];

																	for(var i = 0; i < data.length; i++) {
																		imagesArray.push({
																			userimage : data[i].userimage,
																			username 	: data[i].username
																		});
																	}

																	return imagesArray;
																})()
						};
						// console.log('Updated data:', friendsActivity.allData[feedIndex].feedLikes);
					});
				}
			})(i);
		}
	};

	var loadMoreSocialFeeds = function(){
		var nextPageLength 	= ( latestActivity.currentPage + 1 ) * latestActivity.pageLength,
				loadedItems 		= latestActivity.allData.length,
				visibleItems 		= $scope.profile.feeds.data.length;

		// console.log('loadMoreSocialFeeds', nextPageLength, loadedItems, visibleItems);

		latestActivity.currentPage++;

		if(nextPageLength > loadedItems) {
			latestActivity.loading = true;
			loadFeeds();
		} else {
			$scope.profile.feeds.data = $scope.profile.feeds.allData.slice(0, nextPageLength);
		}
	};

	var loadMoreFriendsActivity = function() {
		var nextPageLength 	= ( friendsActivity.currentPage + 1 ) * friendsActivity.pageLength,
				loadedItems 		= friendsActivity.allData.length,
				visibleItems 		= $scope.profile.feeds.data.length;

		// console.log('loadMoreFriendsActivity', nextPageLength, loadedItems, visibleItems);

		friendsActivity.currentPage++;

		if(nextPageLength > loadedItems) {
			friendsActivity.loading = true;
			loadFriendsActivity();
		} else {
			$scope.profile.feeds.data = $scope.profile.feeds.allData.slice(0, nextPageLength);
		}
	};

	var deactivateAll = function() {
		$scope.profile.watchlist.isActive = false;
		$scope.profile.reminders.isActive = false;
		$scope.profile.favorites.isActive = false;
		$scope.profile.feeds.isActive = false;
	};

	// View functions
	$scope.openTab = function(e, thisSection) {
		var $allTabs = $('.profile_item_content'),
				// Get the element if triggered from an event, otherwise selected the first tab
				$thisTab = ( e ? $($(e.currentTarget).siblings('.profile_item_content').get(0)) : $($allTabs.get(0)) );

		// Disable all the tabs, enable the current one
		deactivateAll();
		$allTabs.slideUp(200);

		thisSection.isActive = true;
		$thisTab.stop().queue('fx', []).slideDown(200, function() {
			// Scroll to get the selected tab onto the screen if openTab was triggered by a click
			if(e && e.target.nodeType != "A") {
				$('body, window').animate({scrollTop:  $thisTab.position().top - 100}, 200);
			}
		});
	};

	$scope.switchFeeds = function(e, type) {

		e.preventDefault();

		// Don't do anything if the feed is already selected
		if(type == $scope.activeFeed) {
			return false;
		}

		// Hide the loading indicator when switching tabs
		$scope.profile.feeds.loading = false;

		switch(type) {
			case 'latest'		: if(latestActivity.sectionLoaded) {
													$scope.profile.feeds.sectionLoaded = latestActivity.sectionLoaded;
													$scope.profile.feeds.nullReached = latestActivity.nullReached;
													$scope.profile.feeds.allData = latestActivity.allData;
													$scope.profile.feeds.data = $scope.profile.feeds.allData.slice(0, 6);
												} else {
													loadFeeds();
												}
												$scope.activeFeed = 'latest';
												break;

			case 'friends'	: if(friendsActivity.sectionLoaded) {
													$scope.profile.feeds.sectionLoaded = friendsActivity.sectionLoaded;
													$scope.profile.feeds.nullReached = friendsActivity.nullReached;
													$scope.profile.feeds.allData = friendsActivity.allData;
													$scope.profile.feeds.data = $scope.profile.feeds.allData.slice(0, 6);
												} else {
													loadFriendsActivity();
												}
												$scope.activeFeed = 'friends';
												break;

			default					: break;
		}
	};

	$scope.displayFeedComment = function(thisThread) {

		// Hide the comment form
		$('.testimonialContent .post-comment, .testimonialContent .post-reply').slideUp();

		userAPI.getTrendingDiscussion({forumid: thisThread.contentid}, function(r) {
			if (!r.gettrendingdiscussion) {
				return false;
			}

			r = addData( r.gettrendingdiscussion.trendinglist );

			thisThread.threadcount++;
			thisThread.ownComment = r[0];
		});
	};

	$scope.toggleComment = function(e) {
		var element = $(e.currentTarget),
			current_comment_Form  = element.parents('.testimonialContent').find('.post-comment, .post-reply'),
			commentForms = element.parents('.content-wrapper').find('.post-comment, .post-reply');
			// openElements = $(".post-commnet.opened");
    // Toggle all open elements, except the one we're focused on right now
    // console.log(commentForm);
    commentForms.each(function(){
    	console.log(current_comment_Form);
    	console.log(this);
      if(!(this == current_comment_Form)) {
      	console.log('Closing this element');
        $(this).slideUp().removeClass('opened');
      }
    });

    // Toggle the element we're focusing on. We ignored it earlier to make sure
    // it isn't toggled twice
    current_comment_Form.stop().queue('fx', []).slideToggle().toggleClass('opened');
	};
	 // $scope.openReply = function(e) {
	 //    var element = $(e.currentTarget),
	 //      thisReplyForm = element.parents('.info').find('form.post-reply'),
	 //      openElements = $("form.post-reply.opened");

	 //    // Toggle all open elements, except the one we're focused on right now
	 //    openElements.each(function(){
	 //      if(this != thisReplyForm.get(0)) {
	 //        $(this).slideUp().removeClass('opened');
	 //      }
	 //    });

	 //    // Toggle the element we're focusing on. We ignored it earlier to make sure
	 //    // it isn't toggled twice
	 //    thisReplyForm.slideToggle().toggleClass('opened');
	 //    $scope.toggleComment();
  // };


	$scope.loadMoreFeeds = function() {
		switch($scope.activeFeed) {
			case 'latest'	: if(!latestActivity.nullReached) {
												loadMoreSocialFeeds();
											}
											break;
			case 'friends': if(!friendsActivity.nullReached) {
												loadMoreFriendsActivity();
											}
											break;
			default 			: break;
		}
	}

	$scope.goToFeed = function(tab){
    $rootScope.feedTab = tab;
    $location.path( "/socialfeed" );
  };

	$scope.facebookShare = function(item, event, flag){
		var shareURL;

		if(flag){
			shareURL = item;
			// event.target.innerHTML = "Liked!";
		}else{
			var makeURL = $filter('makeURL');
			var url = makeURL(item.contenttype, item.contentid);

			shareURL = $location.host() +'/'+url;
		}

		if(event.target.innerHTML=='Like'){
	      userAPI.addRemoveLike({
	        contenttype: 'video',
	        // Adding case for item.programmeid, Popular section doesn't have a contentid as of now
	        contentid: (item.contentid ? item.contentid : item.programmeid),
	        removelike: true,
	        videoid: (item.contentid ? item.contentid : item.videoid)
	      }, function(rs){
	        if(!rs.response.responsestatus){
	          alert("Error sending request");
	        }
	        else{

	          event.target.innerHTML = "Liked!";

	         FB.ui({
	              method: 'stream.publish',
	              link: shareURL,
	              user_message_prompt: 'Post this to your wall?'
	          });
        	}

  		  });
    	} else {
	        userAPI.addRemoveLike({
	          contenttype: 'video',
	          contentid: item.contentid,
	          removelike: false,
	          videoid: item.contentid
	        }, function(rs){
	          if(!rs.response.responsestatus){
	            alert("Error sending request");
	          }
	          else{

	            event.target.innerHTML = "Like";
	            //var redirectURL = '\''+$location.host()+'\'';
	          }
	      });
	    }
	};

	// Open the first tab by default
	$scope.openTab(null, $scope.profile.watchlist);

	$scope.playVideo = function(p){
	    $rootScope.playThisVideo = p.videourl;
	    $rootScope.playThisVideoObj = p;
	    if (_.isUndefined($rootScope.playThisVideo) && !_.isUndefined(p.videoUrl))
	      $rootScope.playThisVideo = p.videoUrl;

	    $rootScope.playThisVideoObj.videourl = $rootScope.playThisVideo;

	    // $rootScope.$apply();

	    $location.path("/programme/"+ p.programmeid +"/channel/"+p.channelid);
	    // return false;
	};
	$scope.showVideoButton = function(item){
	    return !_.isUndefined(item.videoid);
	}

}]);

woi.controller('ProfileSidebarController', ['$rootScope','$location', '$scope', '$routeParams', 'userAPI', function($rootScope,$location, $scope, $routeParams, userAPI) {

    $scope.changeurl= function(url,element){

       var  str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");

        $location.path("programme/" + str);

        element.stopPropagation();
        element.preventDefault();

    };

    $scope.changechannelurl= function(url,element){


        var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");

        $location.path("channel/" + str);
        element.stopPropagation();
        element.preventDefault();

    };


    // Controler Variables
	$rootScope.sidebar = {
		userData			: {
			dataLoaded 	: false,
			data 	 			: []
		},
		recentSearches: {
			dataLoaded 	: false,
			visibleData : [],
			allData 		: [],
			showMore : 	true,
			amount : 0,
			step: 4
		},
		recentBrowsed : {
			dataLoaded 	: false,
			showMore : 	true,
			visibleData : [],
			allData 	: [],
			amount : 0,
			step: 2
		},
		questionnaire : {
			dataLoaded 	: false,
			data 	 			: []
		}
	};

	$scope.loadMoreBrowsed = function(){
		var brData = $rootScope.sidebar.recentBrowsed.allData;
		var setting = $rootScope.sidebar.recentBrowsed;
	    if(!brData.length)
	      return false;

    	setting.amount= setting.amount + setting.step;

	    if(setting.amount >= brData.length){
	      setting.showMore = false;
	      setting.amount = brData.length;
	    }

	    setting.visibleData = brData.slice(0, setting.amount);
	    // console.log(setting.visibleData.length);
	};
	$scope.loadMoreSearches = function(){
		var srData = $rootScope.sidebar.recentSearches.allData;
		var setting = $rootScope.sidebar.recentSearches;
	    if(!srData.length)
	      return false;

    	setting.amount= setting.amount + setting.step;

	    if(setting.amount >= srData.length){
	      setting.showMore = false;
	      setting.amount = srData.length;
	    }
	    // console.log(setting.amount);
	    setting.visibleData = srData.slice(0, setting.amount);
	};

	// Private controller variables
	var publicUser = $routeParams.publicid || $rootScope.getUser().userid;

	var loadRecentSearches = function() {
		if(!$rootScope.sidebar.recentSearches.dataLoaded) {
			userAPI.getRecentSearches({userid: publicUser}, function(r) {
				$rootScope.sidebar.recentSearches.dataLoaded = true;
				if(!r.gebwowsedprogramme) {
					return false;
				}

				$rootScope.sidebar.recentSearches.allData = addData( r.gebwowsedprogramme.bwowsedprogrammelist );
				$scope.loadMoreSearches();
				// $rootScope.sidebar.recentSearches.visibleData = $rootScope.sidebar.recentSearches.allData.slice(0, 4);
				// console.log('recentSearches', $rootScope.sidebar);
			});
		}
	}(); // Trigger loading by self-invocation
	var loadRecentlyBrowsed = function() {
		if(!$rootScope.sidebar.recentBrowsed.dataLoaded) {
			userAPI.getRecentlyBrowsed({userid: publicUser}, function(r) {
				$rootScope.sidebar.recentBrowsed.dataLoaded = true;
				if(!r.gebwowsedprogramme) {
					return false;
				}
				$rootScope.sidebar.recentBrowsed.allData = addData( r.gebwowsedprogramme.bwowsedprogrammelist );
				$scope.loadMoreBrowsed();
			});
		}
	}(); // Trigger loading by self-invocation
	var loadUserAccountDetails = function() {
		if(!$rootScope.sidebar.userData.dataLoaded) {
			userAPI.getUserAccountDetails({userid: publicUser}, function(r) {
				$rootScope.sidebar.userData.dataLoaded = true;
				if(!r.userprofile) {
					return false;
				}
				$rootScope.sidebar.userData.data = r.userprofile.user;
					// console.log('userData', $rootScope.sidebar);
			});
		}
	}(); // Trigger loading by self-invocation

	// Listener to update user location when changed in layout
  $scope.$on('update:location', function(e, obj) {
  	$rootScope.sidebar.userData.data.city = obj.cityname;
  });

}]);