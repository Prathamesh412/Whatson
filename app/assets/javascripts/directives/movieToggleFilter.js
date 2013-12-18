woi.directive('movieToggleFilter', function() {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            $(elm).live('click',function(){
                  var $detailsWrapper = $('.moviesWrapper');
                  var $rightWrapper = $('.phone-filters').find('.filter-wrapper');
                  var $innerWrapper =  $('.inner-wrapper');
                  var $outerWrapper = $('.outer-wrapper');
                  var $rightWrapperTitle = $rightWrapper.find('.title');
                  var $detailsWrapperWidth = $detailsWrapper.outerWidth(true);
                  var $rightWrapperTitleWidth = $rightWrapperTitle.outerWidth(true);
                  var $rightWrapperWidth = $rightWrapper.outerWidth();
                  var $outerWrapperWidth = $outerWrapper.outerWidth();
                  if(scope.phoneSidebar =='on'){
                    $detailsWrapper.show();
                    $innerWrapper.animate({marginLeft: 0},500,function(){
                      $innerWrapper.toggleClass('mobileView');
                      $innerWrapper.css('marginLeft','');
                      $detailsWrapper.css('display','');});
                    $rightWrapper.animate({marginLeft: $outerWrapperWidth-$rightWrapperWidth},500);
                    $rightWrapperTitle.animate({opacity: 1},250);
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
                      $rightWrapper.css('margin-left',$outerWrapperWidth-$rightWrapperWidth);
                      $rightWrapper.css('float','none');
                      $rightWrapper.animate({marginLeft: -($rightWrapperTitleWidth)},500);
                      $rightWrapperTitle.animate({opacity: 0},500);
                  }
            });
        }
    };
});