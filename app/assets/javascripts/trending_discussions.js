woi.controller("TrendingDiscussionController", ['$scope', '$rootScope' , '$routeParams', '$filter', 'userAPI', function($scope, $rootScope, $routeParams, $filter, userAPI){

  var params = {
    channelid   : $scope.$parent.channelid,
    programmeid : (_.isUndefined($scope.$parent.programmeid))? 0 : $scope.$parent.programmeid,
    userid      : $rootScope.getUser().userid,
  };

  $scope.channels = [];
  $scope.discussionsAvailable = false;
  $scope.programmes = [];
  $rootScope.currentforumid = 0;
  $scope.loadingDiscussions = true;
  $dlIndicator = $('#DiscussionLoadIndicator');// Discussion loading indicator

  $rootScope.thread = {
    current: [], 
    all: [], 
  };

  var loading = $filter('loading');
  loading('show', {element: $dlIndicator});

  var APIkey;

  //////////////////////////////////////
  //  Load discussion                 //
  //////////////////////////////////////
  //
  $scope.loadDiscussion = function(item, e, requestPage){
    if(e) {
      e.preventDefault();
      var element = $(e.currentTarget),
      thisChannel = $scope.channels.indexOf(item);
    }
    
    	// Make sure this is a number!
      if(! _.isUndefined(requestPage)) {
        requestPage = parseInt(requestPage);
        if(requestPage == 0) {
         requestPage = 1;
       }
     } else {
		// If it's not defined, set it as 1
    requestPage = 1;
  }

  if(requestPage == 1) {
    // tabs management
    for (var i = 0; i < $scope.channels.length; i++) {
      $scope.channels[i].active = false;
    };
    item.active = true;
    item.loading = true;
    loading('hide', {element: $('.comments-list .loadingIndicator')});
    loading('show', {element: $('.comments-list .loadingIndicator')});
   $rootScope.thread.all = [];
   $rootScope.thread.current = [];
   }

   var params = {
    forumid: item.forumid, 
    userid: $rootScope.getUser().userid,
    pageno: requestPage
  };
  $rootScope.currentforumid = item.forumid;

  APIkey = (new Date()).getTime();

  (function(APIfingerprint) {
    userAPI.getTrendingDiscussion(params, function(rs) {

      if( APIfingerprint != APIkey ) return false;

      item.loading = false;
      loading('hide', {element: $('.comments-list .loadingIndicator')});

        if(!rs.gettrendingdiscussion) {
          return false;
        }

       if(_.isArray(rs.gettrendingdiscussion.trendinglist)) {
         if(requestPage == 1) {
          $rootScope.thread.all = rs.gettrendingdiscussion.trendinglist;  
        } else {
          var recData = rs.gettrendingdiscussion.trendinglist,
          recLength = recData.length;
          for(var i = 0; i < recLength; i++) {
           $rootScope.thread.all.push(recData[i]);
         }
       }
     } else{
      $rootScope.thread.all.push(rs.gettrendingdiscussion.trendinglist);
    }

      // Show the first comment...
      if(requestPage == 1) {
       $rootScope.thread.current.push($rootScope.thread.all[0]);
     }

        // Load the next page...
       requestPage++;
       $scope.loadDiscussion(item, e, requestPage);
       $scope.loadingDiscussions = false;
     });
  })(APIkey);
};
  //
  //// -- END Load Discussion /////////

  //////////////////////////////////////
  //  Show All comments for a thread  //
  //////////////////////////////////////

  $scope.showAllComments = function(e){
    e.preventDefault();
    $rootScope.thread.current = $rootScope.thread.all;
  };
  
  // -- END Show All comments for a thread

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

  // verify the parent controller if it's a programme or a channel
  // CHANNEL trending discussions
  $scope.initTrending = function(forceFetch){
    // $scope.channels = [];
    // $scope.programmes = [];
    // $rootScope.currentforumid = 0;
    
    // $rootScope.thread = {
    //   current: [], 
    //   all: []
    // };
    console.log('Reloading discussions....', forceFetch);
    // Show the loading indicator
    $scope.loadingDiscussions = true;
    var discussionBodies = $('.discussionBody');

    loading('show', {element: discussionBodies});

    if(_.isUndefined($scope.$parent.programmeid)) {
      console.log('Loading channel discussions....');
      userAPI.getChannelDiscussions(params, function(rs) {
        loading('hide', {element: discussionBodies});
        if(! rs.getchanneldiscussion) {
          console.log('Returning false for channel discussions!')
          $scope.loadingDiscussions = false;
          $scope.discussionsAvailable = false;
          return false; 
        }

        $scope.discussionsAvailable = true;

        $scope.channels = addData( rs.getchanneldiscussion.channeldiscussion );

        for (var i = 0; i < $scope.channels.length; i++) {
          $scope.channels[i].active = false;
        };

        $scope.channels = _.sortBy($scope.channels, function(c) {
          return parseInt(c.forumid);
        });

        $scope.channels = $scope.channels.reverse();

        if($scope.channels.length > 4) {
          $scope.channels = $scope.channels.slice(0, 4);
        }

        if(forceFetch && forceFetch.forumid) { // This means the pull was triggered by the user, so load the appropriate discussion
          console.log('Channels in scope', $scope.channels);
          var numChannels = $scope.channels.length;
          for(var i = 0; i < numChannels; i++) {
            if($scope.channels[i].forumid == forceFetch.forumid) {
              $scope.loadDiscussion($scope.channels[i]);
              console.log('Case 1, Loading comments for discussion', $scope.channels[i]);
              break;
            } else {
              if( i == numChannels - 1 ) {
                $scope.loadDiscussion($scope.channels[0]);
                console.log('Case 2, Loading comments for discussion', $scope.channels[0]);
              }
            }
          }      
        } else {
          console.log('Case 3, Loading comments for discussion', $scope.channels[0]);
          $scope.loadDiscussion($scope.channels[0]);
        }
      });
    } else { //PROGRAMME trending discussion
      console.log('Loading program discussions....');
      userAPI.getProgrammeDiscussions(params, function(rs) {
        loading('hide', {element: discussionBodies});
        $scope.loadingDiscussions = false;
        if(! rs.getprogramdiscussion) {
          console.log('Returning false for program discussions!')
          $scope.discussionsAvailable = false;
          return false; 
        }

        $scope.discussionsAvailable = true;

        $scope.channels = addData( rs.getprogramdiscussion.programdiscussion );

        for (var i = 0; i < $scope.channels.length; i++) {
          $scope.channels[i].active = false;
        };

        $scope.channels = _.sortBy($scope.channels, function(c) {
          return parseInt(c.forumid);
        });

        $scope.channels = $scope.channels.reverse();
        
        if($scope.channels.length > 4) {
          $scope.channels = $scope.channels.slice(0, 4);
        }

      if(forceFetch && forceFetch.forumid) { // This means the pull was triggered by the user, so load the appropriate discussion
        console.log('Channels in scope', $scope.channels);
  			var numChannels = $scope.channels.length;
  			for(var i = 0; i < numChannels; i++) {
          if($scope.channels[i].forumid == forceFetch.forumid) {
           $scope.loadDiscussion($scope.channels[i]);
            console.log('Case 1, Loading comments for discussion', $scope.channels[i]);
           break;
          } else {
            if( i == numChannels - 1 ) {
              $scope.loadDiscussion($scope.channels[0]);

              console.log('Case 2, Loading comments for discussion', $scope.channels[0]);
            }
          }
        }
      } else {
  			// Otherwise, open the first discussion on load
        console.log('Case 3, Loading comments for discussion', $scope.channels[0]);
  			$scope.loadDiscussion($scope.channels[0]);
  		}
    });
  }
};

$scope.$on('discussionPosted', function(args, feedback){
 $scope.initTrending(feedback);
});

$scope.initTrending();

}]);

