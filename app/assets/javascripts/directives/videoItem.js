woi.directive('videoItem', ['$rootScope','$location',function($rootScope,$location){
	return {
    // called in an attribute
    restrict: 'A',
    templateUrl: "video-item.html",
    link: function($scope, element, attrs){ 
    	// escope for fast access
    	var p = $scope.p;
    	// The ID has to be unique, or the video doesn't play properly
    	var playerID;
    	do { 
    		playerID = 'tab-' + p.videoid + (new Date()).getTime(); 
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
				var $thumb = thisPlayerElement.parent().parent();
				if(thisPlayer != currentPlayer) {

					$thumb.find('.play').show();
					// Check if this player is a YouTube player
					if(thisPlayerElement.is('iframe')) {
						// Player is YT, API isn't loaded so don't stop/pause for now
						// https://developers.google.com/youtube/iframe_api_reference#Playback_controls
					} else {
						// console.log("Pausing & hiding player with ID", thisPlayer);
						_V_(thisPlayer).pause();
            $thumb.find('.player').empty();
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

    	$scope.playVideo = function(){
	          if(element.find('.major-details').css('display')=='block'){
	          	// $thumbHeight = $thumb.outerHeight(true)-element.find('.video-details').outerHeight(true);
	          	console.log("Large");
	          }
	          else{
	          	$rootScope.playThisVideo = p.videourl;
			    $rootScope.playThisVideoObj = p;
                $rootScope.EncodeUrlWithDash(p.programmename,$scope.element,'programme',p.channelid,p.programmeid);
//	          	return false;
	          }


	        element.find('.play').hide();
    		var playerIDs = [];
    		
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
	          if(!($('html').hasClass('iphone'))){
		          if($("#"+playerID).length){
		            // show the player and start playback
		            element.find('.player').show();
		            _V_(playerID).play();
		            playerIDs = getPlayerIDs('player');
		        	stopPlaying(playerIDs, playerID);
		            return false;
		          }
		      }
	          // create html player structure
	          var $thumb = element.find('.thumb');
	          var $thumbHeight;
	          if(element.find('.major-details').css('display')=='block'){
	          	$thumbHeight = $thumb.outerHeight(true)-element.find('.video-details').outerHeight(true);
	          }
	          else{
	          	$thumbHeight = $thumb.outerHeight();
	          }
	          playerID = 'tab-' + p.videoid + (new Date()).getTime(); 
	          var $playerHTML = $('<video>')
	                            .attr({id:playerID, width:$thumb.width(), height:$thumbHeight})
	                            .addClass('video-js vjs-default-skin');
	
	          var $playerSource = $("<source></source>")
	                              .attr("src", p.videourl)
	                              .attr("type", "video/mp4");
	
	          $playerHTML.append($playerSource);
	          element.find('.player').append($playerHTML);
	          element.find('.player').show();
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
	            if($('html').hasClass('no-touch')){
		            element.find('.player').hide();
		        }
	            element.find('.play').show();

	            if($('html').hasClass('iphone')){
					element.find('.play').hide();
					if(element.find('.player').children().length > 0){
					$('.player')
					var exists = true;
					var itsID = element.find('.player > div:nth-child(1)').attr('id');
					element.find('.player').show();
					element.find('.player').empty();
					var $thumb = element.find('.thumb');
					var $thumb = element.find('.thumb');
					var $thumbHeight;
					if(element.find('.major-details').css('display')=='block'){
					$thumbHeight = $thumb.outerHeight(true)-element.find('.video-details').outerHeight(true);
					}
					else{
					$thumbHeight = $thumb.outerHeight();
					}
					var $playerHTML = $('<video>')
								.attr({id:itsID, width:$thumb.width(), height:$thumbHeight});

					var $playerSource = $("<source></source>")
											.attr("src", p.videourl)
											.attr("type", "video/mp4");

					$playerHTML.append($playerSource);
					element.find('.player').append($playerHTML);
					itsID = "#"+itsID;
					$(itsID).play();
					return false;
	          		}
	            }
              
	           if($('html').hasClass('ipad') || $('html').hasClass('android')) 
	            	element.find('.player').empty();
	          });
	        }
	        playerIDs = getPlayerIDs('player');
	        stopPlaying(playerIDs, playerID);
    	};
    }
  };
}]);
