woi.directive('tvguideToggleFilter', function() {
  return {
    restrict: 'A',
    link: function(scope, elm, attrs) {
      $(elm).live('click',function(){
        var $detailsWrapper = $('.tv_guide');
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
        if( $('html').hasClass('android') ) {
          $detailsWrapperWidth = $detailsWrapper.eq(1).width() + 2;
        }
        $detailsWrapperMarginLeft = parseFloat($detailsWrapperMarginLeft.substring(0,$detailsWrapperMarginLeft.length-2));
        if(scope.phoneSidebar =='on'){
          $innerWrapper.animate({marginLeft: 0},500,function(){});
          $rightWrapper.animate({marginLeft: $outerWrapperWidth-$rightWrapperWidth},500);
          $rightWrapperTitle.animate({opacity: 1},250);
          $('nav.top-nav').slideUp();
          scope.toggleSidebar('off');
          scope.$apply();
        }
        else{        
          scope.toggleSidebar('on');
          scope.$apply();
          $innerWrapper.animate({marginLeft: -($detailsWrapperWidth)},500);
          $rightWrapper.css('margin-left',$outerWrapperWidth-$rightWrapperWidth);
          $rightWrapper.css('float','none');
          $('nav.top-nav').slideDown();
          $rightWrapper.animate({marginLeft: -($rightWrapperWidth-$buttonWidth+$detailsWrapperMarginLeft)},500);
          $rightWrapperTitle.animate({opacity: 0},500);
        }
      });
    }
  };
});