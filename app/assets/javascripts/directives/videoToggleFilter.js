woi.directive('videoToggleFilter', function() {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            $(elm).live('click',function(){
                  var $detailsWrapper = $('.videosWrapper');
                  var $rightWrapper = $('.phone-filters').find('.filter-wrapper');
                  var $innerWrapper =  $('.inner-wrapper');
                  var $outerWrapper = $('.outer-wrapper');
                  var $rightWrapperTitle = $rightWrapper.find('.title');
                  var $detailsWrapperWidth = $detailsWrapper.outerWidth(true);
                  var $rightWrapperTitleWidth = $rightWrapperTitle.outerWidth(true);
                  var $rightWrapperWidth = $rightWrapper.outerWidth();
                  var $outerWrapperWidth = $outerWrapper.outerWidth();
                  var $buttonWidth=$rightWrapper.find('button').outerWidth(true);
                  var $detailsWrapperMarginLeft = $detailsWrapper.css('margin-left');
                  $detailsWrapperMarginLeft = parseFloat($detailsWrapperMarginLeft.substring(0,$detailsWrapperMarginLeft.length-2));
                  if(scope.phoneSidebar =='on'){
                    $detailsWrapper.show();
                    $innerWrapper.animate({marginLeft: 0},500,function(){
                      $innerWrapper.toggleClass('mobileView');
                      $innerWrapper.css('marginLeft','');
                      $detailsWrapper.css('display','');
                    });
                    $rightWrapper.animate({marginLeft: $outerWrapperWidth-$rightWrapperWidth},500);
                    $rightWrapperTitle.animate({opacity: 1},250);
                    $('div.select-boxes').slideUp();
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
                      $('div.select-boxes').slideDown();
                      $rightWrapper.animate({marginLeft: -($rightWrapperWidth-$buttonWidth+$detailsWrapperMarginLeft)},500);
                      $rightWrapperTitle.animate({opacity: 0},500);
                  }
            });
        }
    };
});