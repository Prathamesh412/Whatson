woi.controller('SearchAutoCompleteController', ['$scope', '$rootScope', '$location', '$route', 'autoAPI',  function($scope, $rootScope, $location, $route, autoAPI){

 
  $rootScope.searchQuery = {
    text: ''
  };

  $scope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  $scope.clickSearch = function(){
    
    var value = $('#mainSearch').val();
  
    $scope.showInvalid = false;
    
    var searchKey = value.match(/[-$%^&*()_+|~=`{}\[\];<>.\/]/gi);
              
    if(searchKey != null && searchKey.length > 0){
      
      $scope.safeApply(function(){
          $scope.showInvalid = true;
      });              

      $('#mainSearch').select().focus();

      // Hide error msg after 3 sec
      setTimeout(function(){              
        $scope.safeApply(function(){
          scope.showInvalid = false;
        });              
      },3000);
      
      return false;
    }
    // Valid search key.
    else{      
      window.location.href = '#!/search/'+value;
    }
  };

}]);
