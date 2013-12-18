woi.directive('trendingDiscussionItem', ['$compile', '$timeout', function($compile, $timeout){
  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){
      element.click(function(e) {
        e.preventDefault();
        console.log( "element", element);
        //scope.loadDiscussion();

      });
    }
  };
}]);

