'use strict';

woi.directive('featuredVideoPlayer', ['$compile', '$location','$rootScope', function($compile, $location,$rootScope){
  return {
    // called in an attribute
    restrict:'A',
    link:function($scope, element, attrs){

      var video = $scope.v;
      var hasVideo = (video.videourl) ? true : false;

      $scope.showVideo = function(){
        var playerID = 'featured-' + video.programmeid +(new Date()).getTime();
        var isYoutubeVideo = (video.videourl.indexOf("youtu") != -1);
        if(isYoutubeVideo){
        // if($scope.isyoutubevideo === "1"){
          // check if player if built
          if($("#"+playerID).length){
            return false;
          }

          // extract youtube id
          var urlMatches = video.videourl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
          // add youtube player
          
          // element.find('.player').html('<iframe id="' + playerID + '" width="580" height="349" src="http://www.youtube.com/embed/'+ urlMatches[1] + '?autoplay=1&rel=0&modestbranding=1&showinfo=0" frameborder="0" allowfullscreen style="backgground-color=\'#000\'"></iframe>');
          element.find('.player').html('<iframe id="' + playerID + '" width="580" height="349" src="http://www.youtube.com/embed/'+ urlMatches[1] + '?enablejsapi=1&wmode=opaque&autoplay=1&rel=0&modestbranding=1&showinfo=0" frameborder="0" allowfullscreen style="backgground-color=\'#000\'"></iframe>');
        } else {
          // check if player if built
          

          if(element.find(".player").children("video").hasClass("video-js")){
            // show the player and start playback
            _V_(playerID).play();
            return false;
          }

          // create html player structure
          var $playerHTML = $('<video>')
                            .attr({'id':playerID, width:580, height:300})
                            .addClass('video-js vjs-default-skin');

          var $playerSource = $("<source></source>")
                              .attr("src", video.videourl)
                              .attr("type", "video/mp4");

          $playerHTML.append($playerSource);
          element.find('.player').append($playerHTML);
          var videoJS = _V_(playerID, {
            "controls": true//,
            // "autoplay": true,
            // "preload": "auto"
          })
            _V_(playerID).play();
          // .addEvent("ended", function(){
          //   // hide the player
          //   // element.find('.player').hide();
          // });

        }
      };

      $scope.gotoDetail = function(){
//          alert("hey");
//          var str = video.programmename.replace(/\s/g, "-");            //Prathamesh Changes for
//          $location.path('/programme/'+ str);
          $rootScope.EncodeUrlWithDash(video.programmename,element,'programme',video.channelid,video.programmeid, video.starttime);

      };
      element.find('.player').click(function(){
        if(!hasVideo){
          $scope.gotoDetail();
        }else{
          if (element.find(".play").first().is(":visible")) {
            // var _v_control = element.find('.active .vjs-play-control');
            // if(element.hasClass('vjs-paused')){
            //     element.find('.active .vjs-play-control:nth-child(1)').click();
            //     return false;
            //  }
            $(element).find(".play").trigger("click");
          };
        } 
        // else {
        //   $scope.showVideo();
        // }
      });

      if($scope.v.videourl){
        $(element).find(".play").css({'display':'block ','z-index':'2000000'}).click(function(){
        $(element).find(".play").hide();
          if(hasVideo)
            $scope.showVideo();
          else 
            $scope.gotoDetail();        
      });
      }else
        $(element).find(".play").css({'display':'none'});
    }
  };
}]);
