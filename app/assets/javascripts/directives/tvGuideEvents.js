'use strict';

woi.directive('tvGuideEvents', ['$rootScope', '$filter', function($rootScope, $filter){
  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){
      // Set header viewport to follow viewport scroll on x axis
      //$('.shows').
      //scrollsync({targetSelector: '.shows', axis : 'x'});

      // Set drag scroll on first descendant of class dragger on both selected elements
      var $container = element.find('#tv_guide_container'),
          $slider = $container.find(".slider");

      scope.wasDragged = false;

      // Userd to find out which direction the container was scrolled.
      scope.oldLeft = scope.currentPosition; 
      
      $container.
        dragscrollable({
        dragSelector: '.slider', 
        acceptPropagatedEvent: true, 
        orientation:'x', 
        onDrag:function(){      
          scope.wasDragged = true;
          scope.disableArrow('');          
        },
        onMouseUp:function(){
          
          if(scope.wasDragged){
            scope.wasDragged = false;
            scope.allowClick = false;
          }else{
            scope.allowClick = true;
          }
          
          var currentLeft = parseInt($slider.css("left").replace("px", "")),
              currentWidth = parseInt($slider.css("width").replace("px", "")),
              containerWidth = parseInt($container.css("width").replace("px", "")),
            newLeft = 0,
            change = false;
          var positionDiff = (currentLeft + currentWidth)-containerWidth;
        
          if(currentLeft > 0){
          
            newLeft = 0;
            change = true;
            scope.disableArrow('prev');
          }
          
          if(positionDiff < -90){
          
            // newLeft = -(23 * scope.hourWidth);
            newLeft = - ((currentWidth - containerWidth) + 86);
            change = true;
            scope.disableArrow('next');
          }
          if(change){
            $slider.stop().animate({left: newLeft+"px"}, 100);
          }

          // added for the re-alignment of the text
          scope.containerWidth = containerWidth;
          if( currentLeft > 0 ) {
            scope.currentPosition = 0;
          } else if( -currentLeft > 6000 - containerWidth ) {
            scope.currentPosition = 6000 - containerWidth;
          } else {
            scope.currentPosition = Math.abs(currentLeft);
          }
          // console.log('currentPosition Events', scope.currentPosition);
          $rootScope.$broadcast('tvGuide:updateIndent', {position: scope.currentPosition});

          if(((-1)*scope.oldLeft) > ((-1)*currentLeft)){                   
            scope.horizontalPageScrolled(currentLeft, false);
          }else{            
            scope.horizontalPageScrolled(currentLeft, true);
          }

          scope.oldLeft = currentLeft;
        }
      });

      

      element.bind('mouseover',function(){
        var leftButton = $('.expand-btn').get();

        if(leftButton.length) {
          var leftvalue = $('.expand-btn').position().left;
          if(leftvalue >= 0){
            if($('html').hasClass('win')){
              $('.expand-btn').animate({left: '-90px'},5);
            }
            else
              $('.expand-btn').animate({left: '-75px'},5);
          }
        }
      });
      element.bind('mouseleave',function(){
        $('.expand-btn').stop().animate({left: '0px'},5);
      })

    }
  };
}]);
