woi.directive('watchlistPopover', ['$compile', '$timeout', '$rootScope', '$location', '$filter',  function($compile, $timeout, $rootScope, $location ,$filter){


  var $content;

  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){


      //////////////////////////////////////
      // set popover path according login //
      //////////////////////////////////////
      
      var setPopoverUrl = function() {
        if(!$rootScope.isUserLogged())
          return '/user/watchlist';
        return '/languages';
      };

      var popoverUrl = setPopoverUrl();

      // -- END 

      //////////////////////////////////////
      //  Generic config for popover Qtip //
      //////////////////////////////////////
      
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus click',
          },
          position:{
            my: (Modernizr.mq("screen and (max-width:640px)")) ? 'top right' : 'top center',
            at: (Modernizr.mq("screen and (max-width:640px)")) ? 'bottom center' : 'bottom center',
            adjust:{
              x:(Modernizr.mq("screen and (max-width:640px)")) ? 50 : 5, 
              y:5
            }
          },
          style:{
            classes:'popover rside-popover language-popover'
          } , 
          events:{
            show:function(){
              if($rootScope.isUserLogged()) 
                return false;
              // element.parent().parent('.thumb').addClass('active');
              element.addClass('watchlistactive');
            }, 
            hide: function() {
              element.parent().parent('.thumb').removeClass('active');
              element.removeClass('watchlistactive');
              // if (!$rootScope.isUserLogged) {
              //   var newConfig = resetQtip();
              //   newConfig.content.ajax.success = successFn;
              //   element.qtip(newConfig);
              // }
            },
          }, 
          content: {
            text: '<div class="popover-loader signin-loader"></div>',
            ajax: {
              url: popoverUrl,
              type: 'GET',
              data: {}
            }
          }, 
        };
      };
      var qtipConfig = resetQtip();

      // -- END Generic config for popover Qtip



      //////////////////////////////////////
      //  Qtip Content handler            //
      //////////////////////////////////////
      
       var successFn =  function(data, status) {
        if(!$rootScope.isUserLogged()) {
          
          var _this = this;
          // Set the content manually (required!)

          $timeout(function(){
            _this.set('content.text', $compile(data)(scope));
            // console.log("Testing");
            $timeout(function(){
              _this.reposition();
            });
          });

        $rootScope.beforeaction.title = "Create Your Watchlist";
          // console.log("called 3");

        $rootScope.beforeaction.subtitle = "Follow your favorites on TV";
          scope.$apply(function(){
            scope.reminderData = scope.programData;
            scope.$reminder = element;
            scope.actionObj = {
              element: element, 
              popconfig: qtipConfig, 
              // after log in display the reminde popover
              success: function(){
                element.qtip('hide');
                location.reload();
              },
              failure: function() {
                alert('oopss');
              }
            };
          }); 
        }
      };
        if(!$rootScope.isUserLogged()) {
          qtipConfig.content.ajax.success = successFn;
        }

      qtipConfig.events.hide = function(s){
        element.parent().parent('.thumb').removeClass('active');
        element.removeClass('watchlistactive');
        var newConfig = resetQtip();
        newConfig.content.ajax.success = successFn;
        element.qtip(newConfig);
      }
      // -- END Qtip Content handler
      element.live("click",function(e){
        if($rootScope.isUserLogged() ) {
            $rootScope.watchlistClicked = true;
            if (($location.path() != ("/Watchlist")) && scope.apiCalled) {
              $rootScope.$broadcast("watchlist::click");
            }
          }

          if(!scope.apiCalled && $rootScope.isUserLogged()){
            var loading = $filter('loading');
            var $element = $('.watchlist-spinner');
            var $watchlistText = $('span.mywatchlist');
            var $watchlistBtn = $('#watchList');
            var watchlistValue = $watchlistText.text();
            $watchlistText.text('');
            loading('show',{element: $element});
            $watchlistBtn.addClass('watchlistactive');
          }
      });

      element.qtip( qtipConfig);          

      $(".close-watchlist-slider").live("click",function(){
            $(".watchlist-excoll").slideUp();
            if ($("#watchList").hasClass("watchlistactive")) {
              $("#watchList").removeClass("watchlistactive")
            }
      });

    }
  };
}]);

