woi.controller('VerificationController', ['$scope', '$rootScope', 'userAPI', '$location','$routeParams','$filter',  function($scope,  $rootScope,  userAPI, $location,$routeParams,$filter){
	
	var loading = $filter('loading');
	var $element = $('#verifyspinner');
	loading('show',{element: $element});
	$rootScope.$broadcast('handleResetEmit');
  	
	  $scope.verificationcode   = $routeParams.verificationcode;
	  $scope.userid 			= $routeParams.userid;
	  $scope.emailid 			= $routeParams.emailid;

  if ($rootScope.isUserLogged()) 
  	$rootScope.signOutUser();
  else{
	  userAPI.verifyUser({userid:$scope.userid, emailid: $scope.emailid, verificationcode:$scope.verificationcode},function(rs){
	  	if (rs.response.responsestatus == "true") {
	  		alert("Thank You! Your account have been successfully verified.");
	  		$location.path("/home");
	  	}else{
	  		alert(rs.response.message);
	  		$location.path("/home");	  		
	  	}
	  });  	
  }

}]);


