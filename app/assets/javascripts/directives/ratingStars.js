woi.directive('ratingStars', ['$rootScope', '$compile', '$timeout', 'userAPI', function($rootScope, $compile, $timeout, userAPI){
  var $content;
  return {
    // called in an attribute
    restrict:'A',
    scope: {
      typeId: "=typeId",
      userRating: "=userRating",
      ratingCount: "=ratingCount",
      userId: "=userId",
      loadAuth: "&"
    },
    link:function(scope, element, attrs) {
      scope.$watch(function(){       
        if(!scope.typeId)
          return false;
        
        element.find('> .star').rating({callback: function(value, link) {
          if(!$rootScope.isUserLogged()){
            $rootScope.beforeaction.title = "Login To Rate"
            $rootScope.beforeaction.subtitle = "Please login to rate this program";
            var popover_position = {my: 'top center', at: 'bottom center'};
            var resetQtip = function() {
              return {
                show: 'click',
                hide: {
                  fixed: true,
                  delay: 750,
                  event: 'unfocus'
                },
                position:{
                  my: popover_position.my, 
                  at: popover_position.at,
                  adjust:{
                    y: -15, 
                  }
                },
                style:{
                  classes:'popover login-popover'
                },
                events: {
                  hide: function() {
                    if(!$rootScope.isUserLogged()) {
                      element.qtip('destroy');
                      var qtipConfig = resetQtip();
                      element.qtip(qtipConfig);
                      element.find('> .star').rating('drain');
                    }
                  }
                },
                content: {
                  text: '<div class="popover-loader signin-loader"></div>',
                  ajax: {
                    url: "/user/beforeaction",
                    type: 'GET',
                    data: {},
                    success:function(data, status) {
                      var _this = this;
                      // Set the content manually (required!)
                      $timeout(function(){
                        _this.set('content.text', $compile(data)(scope));
                        $timeout(function(){
                          _this.reposition();
                        });
                      });
                      scope.actionObj = {
                        element: element, 
                        popconfig: qtipConfig, 
                        // after log in display the reminder popover
                        success: function(){
                          element.qtip('hide').qtip('destroy');
                          scope.userId = $rootScope.getUser().userid;
                          userAPI.userRate({typename:'programme', typeid: scope.typeId, rating:value, userid: scope.userId}, function(rs) {
                            if(rs.response.responsestatus){

                              location.reload();
                              return false;

                              // Increment the ratingCount if this is the first time this user is rating
                              if(scope.userRating == '0'){
                                scope.ratingCount++;
                              }

                              // Update the displayed userRating to reflect the latest rating
                              scope.userRating = value;
                            }
                          });
                        },
                        failure: function() {
                          alert('oops');
                        }
                      };
                    }
                  }
                }, 
              };
            };

            var qtipConfig = resetQtip();
            element.qtip(qtipConfig);

            return false;
          }

          userAPI.userRate({typename:'programme', typeid: scope.typeId, rating:value, userid: scope.userId}, function(rs) {
            if(rs.response.responsestatus){
              // Increment the ratingCount if this is the first time this user is rating
              if(scope.userRating == '0'){
              	scope.ratingCount++;
              }
              // Update the displayed userRating to reflect the latest rating
              scope.userRating = value;
            }
          });
        }});
      });
    }
  };
}]);
