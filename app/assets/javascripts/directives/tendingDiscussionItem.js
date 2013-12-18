woi.directive('trendingDiscussionItem', ['$compile', '$timeout', function($compile, $timeout){
  return {
    restrict:'A',
    link:function(scope, element, attrs){

      //get current father scope
      $pscope = scope.$parent;
      var thread = scope.td;
      //element.click(function(e) {
        //e.preventDefault();   
        //e.stopPropagation();   

        //if($('.row' + thread.rownum).hasClass('active'))
          //$('.row' + thread.rownum).removeClass('active');
        //else
          //$('.row' + thread.rownum).addClass('active');

        //$pscope.loadDiscussion(thread.forumid);
      //});
    }
  };
}]);

