woi.directive("deleteProgram",['$rootScope',function($rootScope){
  return {
    restrict: 'A',
    link: function(scope, element, attrs){
      $(element).live("click",function(){
        var obj  = scope.$eval(attrs.deleteProgram);
        var tempArray = [];
        tempArray.push(obj.programmeid);
        tempArray.push(obj.container);
        $rootScope.watchlistDeleted = true;
        $rootScope.$broadcast("watchlistPage::remove",scope.$eval(attrs.deleteProgram));
      });
    }
  }
}]);