woi.directive('homeTabItem', ['$location','$rootScope','$route',function($location,$rootScope,$route){
	return {
    // called in an attribute
    restrict: 'A',
    templateUrl: "home-tab-item.html",
    link: function($scope, element, attrs){ 
    	// escope for fast access
    	var p = $scope.p;

    	element.bind('click', function(){
    		console.log('home tab item click .... ',p);
    		$rootScope.programmeStartTime = p.starttime;
    	});


    	// The ID has to be unique, or the video doesn't play properly
    	var playerID;
    	do { 
    		playerID = 'tab-' + p.videoid + Math.floor(Math.random()*100); 
    	} while ( $('#'+playerID).length );

		// Gets the IDs of all created players
		var getPlayerIDs = function(selectorClass) {
			// console.log('getPlayerIDs called...');
			var playersByClass = $('.'+selectorClass).get();
			var playerIDs = [];
			var thisLength = playersByClass.length;

			for( var i = 0; i < thisLength; i++ ) {
				var thisID,
					thisPlayer = playersByClass[i];
				if(thisPlayer.children && thisPlayer.children.length) {
					thisID = playersByClass[i].children[0].id;

					if(thisID) {
						playerIDs.push(thisID);
					}
				}
			}
			return playerIDs;
		}

		// Function to stop players that are currently playing. Use this to 
		// make sure that only one player is playing at a time. Pass the ID
		// of the player that should be playing
		var stopPlaying = function(playerIDs, currentPlayer) {
			var thisLength = playerIDs.length;
			for(var i = 0; i < thisLength; i++) {
				var thisPlayer = playerIDs[i],
					thisPlayerElement = $("#"+thisPlayer);
				
				if(thisPlayer != currentPlayer) {
					// Check if this player is a YouTube player
					if(thisPlayerElement.is('iframe')) {
						// Player is YT, API isn't loaded so don't stop/pause for now
						// https://developers.google.com/youtube/iframe_api_reference#Playback_controls
					} else {
						// console.log("Pausing & hiding player with ID", thisPlayer);
						_V_(thisPlayer).pause();
					}
					
					thisPlayerElement.parent().hide();
				} else {
					// console.log("Letting player", thisPlayer, "continue playing...");
				}
			}
		}

    	// check if programme has video to show
    	$scope.hasVideo = function(){
    		return (typeof p.videourl != 'undefined' && p.videourl != '');
    	};

    	$scope.playVideo = function(url,element){
    		var playerIDs = [];
		    if ($(element).parent(".thumb").first().outerWidth() < 550) {
		      $rootScope.playThisVideo = p.videourl;
		      $rootScope.playThisVideoObj = p;
		      var location_path = new RegExp("programme\/"+ p.programmeid +"\/channel\/"+p.channelid);
		      if (location_path.test($location.path())) {
		      	// $rootScope.$broadcast("appendAndPlayThisVideo");
		      	console.log($scope);
		      	$rootScope.$broadcast("PlaythisVideo",p);
		      	// $location.path("/programme/"+ p.programmeid +"/channel/"+(p.channelid + Math.floor((Math.random()*10)+1)));
		      }else{

                  $rootScope.EncodeUrlWithDash(url,$scope.element,'Program', p.channelid, p.programmeid, p.starttime);
//                  $location.path("/programme/"+ p.programmeid +"/channel/"+p.channelid);

		      }
//		      $scope.$apply();
		      return false;
		    }
    		
	    	if(p.isyoutube == "true"){
	    		
	    	  // Check if the player already exists 
	    	  if($("#"+playerID).length){
	            // show the player and start playback
	            element.find('.player').show();
	            
				// Stop other videos that are playing
	            playerIDs = getPlayerIDs('player');
	        	stopPlaying(playerIDs, playerID);
	          }	
	    		
	          // extract youtube id
	          var urlMatches = p.videourl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
	          // add youtube player
	          element.find('.player').html('<iframe id="' + playerID + '" width="170" height="130" src="http://www.youtube.com/embed/'+ urlMatches[1] + '?autoplay=1&rel=0&modestbranding=1&showinfo=0" frameborder="0" allowfullscreen style="backgground-color=\'#000\'"></iframe>');
	        } else { 
	          // check if player is built
	          if($("#"+playerID).length){
	            // show the player and start playback
	            element.find('.player').show();
	            _V_(playerID).play();
	            playerIDs = getPlayerIDs('player');
	        	stopPlaying(playerIDs, playerID);
	            return false;
	          }
	          // create html player structure
	          var $playerHTML = $('<video>')
	                            .attr({id:playerID, width:170, height:130})
	                            .addClass('video-js vjs-default-skin');
	
	          var $playerSource = $("<source></source>")
	                              .attr("src", p.videourl)
	                              .attr("type", "video/mp4");
	
	          $playerHTML.append($playerSource);
	          element.find('.player').append($playerHTML);
	          var videoJS = _V_(playerID, {
	            "controls": true,
	            "autoplay": true,
	            "preload": "auto"
	          }).addEvent("ended", function(){
	            // hide the player
	            if (document.exitFullscreen) {
	                document.exitFullscreen();
	            }
	            else if (document.mozCancelFullScreen) {
	                document.mozCancelFullScreen();
	            }
	            else if (document.webkitCancelFullScreen) {
	                document.webkitCancelFullScreen();
	            }
	            element.find('.player').hide();
	          });
	        }
	        playerIDs = getPlayerIDs('player');
	        stopPlaying(playerIDs, playerID);
    	};
    }
  };
}]);
