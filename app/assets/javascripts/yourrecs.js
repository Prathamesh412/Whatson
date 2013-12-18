woi.controller('YourRecsController', ['$scope','$location', '$rootScope','$filter',  'recoAPI', 'userAPI', function($scope, $location, $rootScope,$filter,  recoAPI, userAPI){

    $scope.changeurl= function(url,element){
        var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");           //Prathamesh Changes for programme
        $location.path("programme/" + str);
        element.stopPropagation();
        element.preventDefault();

    };

    $scope.changechannelurl= function(url,element){
        var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");            //Prathamesh Changes for  channel
        $location.path("channel/" + str);
        element.stopPropagation();
        element.preventDefault();

    };
  $scope.recommended = [];
  $scope.paginate = [];

  $scope.amount  = 0;
  $scope.step    = 4;

  $scope.showMore = true;

  var durationFormated = $filter('durationFormated');

  $scope.loadMore = function(){
    if(!$scope.recommended.length)
      return false;
    $scope.amount= $scope.amount + $scope.step;

    if($scope.amount >= $scope.recommended.length){
      $scope.showMore = false;
      $scope.amount = $scope.recommended.length;
    }

    $scope.paginate = $scope.recommended.slice(0, $scope.amount);
  };

  userAPI.yourRecs({userid: $rootScope.getUser().userid}, function(rs){
    if(!rs.getrecommendationpreferences)
      return false;
    $scope.recommended = rs.getrecommendationpreferences.recommendationlist;

    /* Changed in order to cope with server isssue. */
    // $scope.recommended = rs.getrecommendationpreferences.recommendationlist;
    $scope.recommended = _.map(rs.getrecommendationpreferences.recommendationlist,function(item){
      if (_.isUndefined(item.programmeid) && !_.isUndefined(item.programid)) {
        item.programmeid = item.programid;
      }
      return item;
    });

    // _.each($scope.recommended, function(r) {
    //   r.duration = durationFormated(r.starttime, r.endtime);
    // });
    $scope.loadMore();
  });

  $scope.addToFavorite = function(p){

    userAPI.toggleFavoriteProgramme({like:(p.isfavorite == "0"), programmeid:p.programmeid}, function(rs){
      // if it fails, display error message                                               
      if(!rs.response.responsestatus){
        alert(rs.response.message);
      } else {
        // change the flag
        p.isfavorite = (p.isfavorite == "0") ? "1" : "0";
        
	
      }
    });
  };

  $scope.addToReminder = function(p){
    alert("Not yet"); 
    return false;
    
    // can't apply code due to API error
    if(p.isreminder == "0"){
      var d = new Date();
      userAPI.addReminder({
        channelid: p.channelid,
        programmeid: p.programmeid,
        starttime: "" + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes())
      },function(rs){
        // if it fails, display error message
        if(!rs.response.responsestatus){
          alert(rs.response.message);
        }
      });
    } else {
      removeReminder.addReminder({reminderid:p.reminderid},function(rs){
        
      });
    }
    
  };

  // $scope.addToWatchlist = function(p){
  //   if ($rootScope.isUserLogged()) 
  //     userAPI.toggleWatchlist({
  //       contenttype: 'program',
  //       contentid: p.programmeid,
  //       watchliststatus: (p.iswatchlist == "0")
  //     }, function(rs){
  //       if(!rs.response.responsestatus){
  //         alert(rs.response.message);
  //       } else {
  //         // change the flag
  //         p.iswatchlist = (p.iswatchlist == "0") ? "1" : "0";
  //       }
  //     });
  // };

  

}]);
