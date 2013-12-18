'use strict';

woi.directive('tvGuideItemActions', ['$filter', '$location', '$rootScope', 'userAPI',  function($filter, $location, $rootScope, userAPI){


  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){
      if( $rootScope.device.isTouch ) {
        element.click(function(e){          
          scope.$apply(function(){
              $rootScope.EncodeUrlWithDash(attrs.programName,e,'programme',attrs.channelId,attrs.programId);
          });
        });
//        return false;
      }

      var loading = $filter('loading');
      if( $rootScope.device.isTablet ) {
        element.click(function(e){          
          scope.$apply(function(){
            if($('.sidebar').length !== 0 && !$('.sidebar').hasClass('expand')){
                $rootScope.EncodeUrlWithDash(attrs.programName,e,'programme',attrs.channelId,attrs.programId);
            }
          });
        });
      } else {
        element.click(function(e) {
          if(scope.allowClick){
            scope.$apply(function() {
              //if the tvguide is collapsed does not show popover, instead goes to the programme details page
              if($('.sidebar').length !== 0 && !$('.sidebar').hasClass('expand')){
                  $rootScope.EncodeUrlWithDash(attrs.programName,e,'programme',attrs.channelId,attrs.programId);
              }  
          
              // Divide the element into four quadrants, and position the description-popover element based on that
              var Element = element,
                  Slider = Element.parent().parent(),
                  heightSetter = Slider.parent().parent().parent().children('.channels'), // Can't get height from slider due to floats, so using the channels bar instead
                  Parent = Slider.parent(),
                  descriptionPopover = Slider.find('#description-popover'), // Assign the description div to this once it's created
                  popoverWidth = 362,
                  E = {}, // Object to store element properties
                  S = {}, // Object to store slider properties
                  P = {}; // Object to store slider container properties

              // Just short variables to decrease typing effort :P
              E.w = Element.width();
              E.x = Element.position().left;
              E.y = Element.parent().position().top;
              S.x = Math.abs( Slider.position().left );
              S.w = Slider.width();
              P.w = Parent.width();

              // Actual values to be used, for readability :o
              var leftLimit = P.w / 2,
                  topLimit = heightSetter.height() / 2 - 50,
                  leftOffset = E.x - S.x,
                  topOffset = E.y,
                  elemHeight = Element.height() + 2;

              // Variables to check if the element is partially visible
              var thisLeft = E.x,
                  thisWidth = ( E.w > popoverWidth ? E.w : popoverWidth ),
                  lowerBound = S.x,
                  upperBound = S.x + P.w,
                  leftCutoff = thisLeft < lowerBound,
                  rightCutoff = thisLeft + thisWidth > upperBound,
                  isPartial = ( leftCutoff || rightCutoff );

              // Set the horizontal position
              if( isPartial ) {
                var offsetAdjust = -2;
                if(leftCutoff) {
                  offsetAdjust = S.x - E.x;
                } else if (rightCutoff) {
                  offsetAdjust = ( S.x + P.w ) - ( E.x + popoverWidth ) - 86;
                }

                descriptionPopover.css({right: 'auto', left: offsetAdjust + 'px'});
              } else {
                if( leftOffset > leftLimit ) {
                  descriptionPopover.css({left: 'auto', right: -2 + 'px'});
                } else {
                  descriptionPopover.css({left: -2 + 'px', right: 'auto'});
                }
              }

              // Set the vertical position
              if( topOffset < topLimit ) {
                descriptionPopover.css({bottom: 'auto', top: elemHeight + 'px'});
              } else {
                descriptionPopover.css({bottom: elemHeight + 'px', top: 'auto'});
              }

              //////////////////////////////////////
              //  Toggle Active Handler           //
              //////////////////////////////////////

              var closeDescription = function(e) {

                if( $(e.target).parents('.qtip').length || $(e.target).parents('.item.active').length > 0 ) {
                  // Click was made in the descriptionPopover, don't close it
                  return false;
                }

                document.removeEventListener('click', closeDescription, true);

                var activeElements = Slider.find('.active'),
                    activeDom = activeElements.get(),
                    activeCount = activeElements.length;

                activeElements.removeClass('active');

                descriptionPopover.hide();
                $rootScope.showinfo.visible = false;
                Slider.prepend( descriptionPopover );

                // In case there are still expanded items in the tvGuide, let's collapse those
                var expandedElements = Slider.find('.expanded'),
                    elementCount = expandedElements.length;
                for(var i = 0; i < elementCount; i++) {
                  var thisElement = expandedElements[i],
                      originalWidth = thisElement.getAttribute('data-originalWidth'),
                      wasInfo = thisElement.getAttribute('data-wasInfo'),
                      oldLeft = ( thisElement.getAttribute('data-oldLeft') ? thisElement.getAttribute('data-oldLeft') : $(thisElement).position().left);

                  if(originalWidth) {
                    thisElement.removeAttribute('data-originalWidth');
                    $(thisElement).width(originalWidth + 'px');
                  }

                  if(oldLeft) {
                    thisElement.removeAttribute('data-oldLeft');
                    $(thisElement).css({left: oldLeft + 'px'});
                  }

                  if(wasInfo) {
                    $(thisElement).addClass('info');
                    thisElement.removeAttribute('data-wasInfo');
                  }
                }
              };

              var isActive = false;
              if(element.hasClass('active'))
                isActive = true;

              $rootScope.showinfo.visible = false;
              Slider.find('.active').removeClass('active');

              $('.qtip').qtip('hide');

              if(!isActive) {
                // In case there are still expanded items in the tvGuide, let's collapse those
                var expandedElements = Slider.find('.expanded'),
                    elementCount = expandedElements.length;
                for(var i = 0; i < elementCount; i++) {
                  var thisElement = expandedElements[i],
                      originalWidth = thisElement.getAttribute('data-originalWidth'),
                      wasInfo = thisElement.getAttribute('data-wasInfo'),
                      oldLeft = ( thisElement.getAttribute('data-oldLeft') ? thisElement.getAttribute('data-oldLeft') : $(thisElement).position().left);

                  if(originalWidth) {
                    thisElement.removeAttribute('data-originalWidth');
                    $(thisElement).width(originalWidth + 'px');
                  }

                  if(oldLeft) {
                    thisElement.removeAttribute('data-oldLeft');
                    $(thisElement).css({left: oldLeft + 'px'});
                  }

                  if(wasInfo) {
                    $(thisElement).addClass('info');
                    thisElement.removeAttribute('data-wasInfo');
                  }
                }

                element.addClass('active loading').append( descriptionPopover );
                loading('show', { element: descriptionPopover.find('.loading-spinner') });
                descriptionPopover.css({ display: 'table' });

                // Animate the width if the element width is less than the popoverWidth
                if(E.w + 24 < popoverWidth) {
                  var newLeft = E.x;
                  // Change the element position in case animating the width will push it out of the TV Guide
                  if(E.x > S.w - popoverWidth) {
                    newLeft = S.w - popoverWidth;
                    element.get(0).setAttribute('data-oldLeft', E.x);
                  }

                  // Animating the element position
                  element.animate({width: popoverWidth - 4 + 'px', left: newLeft}).addClass('expanded');

                  if(element.hasClass('info')) {
                    element.removeClass('info');
                    element.get(0).setAttribute('data-wasInfo', true);  
                  }
                  element.get(0).setAttribute('data-originalWidth', E.w);
                }

                document.addEventListener('click', closeDescription, true);
              } else {
                var originalWidth = element.get(0).getAttribute('data-originalWidth'),
                    wasInfo = element.get(0).getAttribute('data-wasInfo'),
                    oldLeft = ( element.get(0).getAttribute('data-oldLeft') ? element.get(0).getAttribute('data-oldLeft') : E.x);

                descriptionPopover.hide();
                $rootScope.showinfo.visible = false;
                Slider.prepend( descriptionPopover );

                if(originalWidth) {
                  element.animate({width: originalWidth + 'px', left: oldLeft + 'px'}).removeClass('expanded').get(0).removeAttribute('data-originalWidth');
                }

                if(wasInfo) {
                  element.addClass('info');
                  element.get(0).removeAttribute('data-wasInfo');
                }
              }

              // -- END Toggle Active Handler 

              //////////////////////////////////////
              //  AJAX call for programme Details //
              //////////////////////////////////////

              if(attrs.startTime.indexOf('+')!= -1)
                attrs.startTime = attrs.startTime.slice(0, attrs.startTime.indexOf('+')).replace('T', ' ');
                var params = {
                  userid      : $rootScope.getUser().userid,
                  programmeid : attrs.programId, 
                  channelid   : ( attrs.channelId ? attrs.channelId : 0 ), 
                  starttime   : attrs.startTime,
                  programmename :attrs.programName
                };
                $rootScope.showinfo = {};
                userAPI.getProgrammeDetails(params, function(rs) {

                  var result = rs.getfullprogrammedetails.fullprogrammedetails;
                  element.removeClass('loading');
                  $rootScope.showinfo = result;
                  $rootScope.showinfo.visible = true;

                  loading('hide', { element: descriptionPopover });
                });
              // -- END AJAX call for programme Details
            });
          }
        });

        element.mousedown(function() {
          $('.qtip').qtip('hide');
        });
      }
    }
  }; 
}]);
