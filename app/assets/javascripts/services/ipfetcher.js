woi.factory("IPfetcher",["$http","$timeout",function($http,$timeout){

  $http.get("/ip/")
      .success(function(data){
    	$.cookie('userIP', data);
      });

}]);