woi.directive('questionnaireTip', ['$compile', '$timeout', '$rootScope',  function($compile, $timeout, $rootScope){
  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){
      var resetQtip = function() {
        return {
          show: {
            event: 'click'
          },
          hide: {
            fixed: true,
            event: 'unfocus click',
          },
          position:{
            my: 'top right',
            at: 'bottom right', 
            adjust:{
              x: ( Modernizr.touch ? 1 : 7 ), 
              y: ( Modernizr.touch ? -2 : 3 )
            }
          },
          style:{
            classes:'popover rside-popover'
          },
          content: {
            text: '<p class="questionnaireTip">The more we understand you, the more our site will show TV shows and channels that match your tastes and preferences. So answer the questions appearing in this section, keep favorite-ing channels and programs - and you will find that the site helps you discover shows that you are sure to like!</p>'
          }, 
        };
      };
      var qtipConfig = resetQtip();

      element.qtip(qtipConfig);  
    }
  };
}]);

