woi.directive('contextualInfo', ['$rootScope', '$timeout', 'userAPI',  function($rootScope, $timeout, userAPI){
  return {
    restrict:'A',
    link:function(scope, element, attrs){
      var actionsList = element.find('.favTrigger > a').hide(),
          actionsPrompt = element.find('.favPrompt').hide(),
          activeIndex = 0,
          maxIndex = actionsList.length - 1;

      scope.showTips = function() {
        if(angular.isUndefined($rootScope.showTips)) {
          userAPI.getContextFlag({}, function(r) {
            if(!r || !r.displayhelp) {
              return false;
            }

            $rootScope.showTips = ( r.displayhelp == "true" ? true : false );

            if(r.displayhelp == 'true') {
              scope.openPrompt();
              $(element).slideDown();
            }
          });
        } else if ($rootScope.showTips) {
          scope.openPrompt();
          $(element).slideDown();
        }
      }

      scope.openPrompt = function() {
        $(actionsList[activeIndex]).fadeIn();
        $(actionsPrompt[activeIndex]).fadeIn();
      }

      scope.closePrompt = function() {
        $(actionsList[activeIndex]).fadeOut();
        $(actionsPrompt[activeIndex]).fadeOut(function() {
          if(activeIndex < maxIndex) {
            activeIndex++;
            scope.openPrompt();
          } else {
            $(element).slideUp().fadeOut();
          }
        });
      }

      // Beginning of execution
      $timeout(function() {
        scope.showTips();
      });
    }
  };
}]);

