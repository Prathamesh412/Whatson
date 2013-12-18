woi.directive('searchResultsFilter', function() {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            $(elm).live('click',function(){
                  var $detailsWrapper = $('.content');
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
                    $innerWrapper.animate({marginLeft: 0},500,function(){});
                    $('.results_header.phone-view').css('opacity',0);
                    $('.results_header.phone-view').removeClass('hidden-phone').addClass('visible-phone');
                    $rightWrapper.animate({marginLeft: $outerWrapperWidth-$rightWrapperWidth},250,function(){
                      $rightWrapper.css('float','right');
                      $rightWrapper.css('margin-left','0px');
                      $('.results_header.phone-view').css('opacity',1);
                    });
                    $rightWrapperTitle.animate({opacity: 1},250);
                    scope.toggleSidebar('off');
                    scope.$apply();
                  }
                  else{        
                      scope.toggleSidebar('on');
                      scope.$apply();
                      $innerWrapper.animate({marginLeft: -($detailsWrapperWidth)},500);
                      $rightWrapper.css('margin-left',$outerWrapperWidth-$rightWrapperWidth);
                      $rightWrapper.css('float','none');
                      $rightWrapper.animate({marginLeft: -($rightWrapperWidth-$buttonWidth+$detailsWrapperMarginLeft)},500);
                      $rightWrapperTitle.animate({opacity: 0},500);
                      $('.results_header.phone-view').removeClass('visible-phone').addClass('hidden-phone');
                  }
            });
        }
    };
});