woi.directive('channelToggleFilter', function() {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            $(elm).live('click',function(){
                  var $container = $('.channel-detail-content');
                  var $sideList = $('.sideList');
                  var $detailsWrapper = $('.detailsWrapper');
                  var $rightWrapper = $('.phone-filters .right-wrapper');
                  var $innerWrapper = $('.channel-inner-wrapper');
                  var $sideListWidth = $sideList.outerWidth(true);
                  var $detailsWrapperWidth = $detailsWrapper.outerWidth(true);
                  var $rightWrapperTitleWidth = $rightWrapper.find('.title').outerWidth(true);
                  var $rightWrapperWidth = $rightWrapper.outerWidth(true);
                  if(scope.phoneSidebar =='on'){
                    $detailsWrapper.show();
                    $innerWrapper.animate({marginLeft: 0},500,function(){
                      $innerWrapper.toggleClass('mobileView');
                      $innerWrapper.css('marginLeft','');
                      $detailsWrapper.css('display','');
                    });
                    console.log('before animate');
                    // $rightWrapper.animate({marginLeft: $detailsWrapperWidth-$rightWrapperWidth},500);
                    // $rightWrapperTitle.animate({opacity: 1},250);
                    // $detailsWrapper.show().animate({left: '0'},500);
                    // $sideList.animate({left: ($sideListWidth)},500,function(){$(this).hide();});
                    $rightWrapper.animate({left: $detailsWrapperWidth-$rightWrapperWidth},500);
                    // $container.css('min-height',$detailsWrapper.outerHeight(true));
                    scope.toggleSidebar('off');
                    scope.$apply();
                  }
                  else{        
                      scope.toggleSidebar('on');
                      scope.$apply();
                      $innerWrapper.animate({marginLeft: -($detailsWrapperWidth)},500,function(){
                        $innerWrapper.toggleClass('mobileView');
                        $innerWrapper.css('marginLeft','');
                      });
                      // $rightWrapper.css('margin-left',$outerWrapperWidth-$rightWrapperWidth);
                      // $rightWrapper.css('float','none');
                      // $rightWrapper.animate({marginLeft: -($rightWrapperTitleWidth)},500);
                      // $rightWrapperTitle.animate({opacity: 0},500);

                      // $detailsWrapper.animate({left: -($detailsWrapperWidth)},500,function(){$(this).hide();});
                      // $sideList.show().animate({left: '0'},500);
                      // $container.css('min-height',$sideList.outerHeight(true));
                      $rightWrapper.animate({left: -($rightWrapperTitleWidth)},500);
                  }
            });
        }
    };
});