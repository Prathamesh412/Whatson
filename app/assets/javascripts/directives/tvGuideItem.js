'use strict';

var hourWidth = 250;

woi.directive('tvGuideItem', ['$rootScope', '$filter', 'userAPI', function($rootScope, $filter, userAPI){

  var isoToDate = $filter('isoToDate');
  

  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){
    var $slider  = $("#tv_guide_container .slider"),
        $container = $("#tv_guide_container");
    // function to assign the loaded image as a background to the current element
    // Used to add a background for recommended programs
    var assignBG = function(attributes) {
      if(attrs.isRecommended == '1' && element.width() > hourWidth / 3) {
       var progDetails;
       userAPI.getProgrammeDetails(attributes, function(rs) {
        if(!rs.getfullprogrammedetails) {
         return false;
       }  
       progDetails = rs.getfullprogrammedetails.fullprogrammedetails;
       element.css('backgroundImage', 'url("' + progDetails.imagefilepath + '")');
       element.css('backgroundRepeat', 'no-repeat');
       element.css('backgroundPosition', 'right center');
       element.css('backgroundSize', '100%');
       element.addClass('recommended');
     });
     }
   };

  var isVisible = function(thisLeft, thisWidth, lowerLimit, windowWidth) {
    var upperBound = lowerLimit + windowWidth,
        lowerBound = lowerLimit;

    return ( thisLeft + thisWidth > lowerBound && thisLeft < upperBound );
  }

  scope.$watch('currentPosition', function(newValue, oldValue) {
    // console.log('currentPosition is updated!', newValue, oldValue);
    setTimeout(function(){
      var sliderPos = Math.abs(newValue),
          visibleWidth = scope.containerWidth || $container.width(),
          thisLeft = element.css('left').replace('px', '') - 0,
          thisWidth = element.css('width').replace('px', '') - 0;

      if( !isVisible( thisLeft, thisWidth, sliderPos, visibleWidth ) || thisLeft > sliderPos ) {
        element.children('h3, h4').css('text-indent', '');
        return false;
      }

      var sliderWidth = $slider.width(),
          childWidth = element.children(0).width(),
          clearance = (thisLeft + thisWidth) - sliderPos,
          childElements = element.children('h3, h4').css('text-indent', ''),
          firstChild = childElements.first(),
          minClearance = firstChild.css('display', 'inline').width();

          firstChild.css('display', '');

      if( thisWidth < minClearance ) {
        return false;
      }
      
      if( clearance > minClearance + 40 ) {
        var textOffset = sliderPos - thisLeft;
        childElements.css('text-indent', textOffset + 'px');
      } else {
        var textOffset = ( thisWidth - minClearance > 40 ? thisWidth - minClearance - 40 : 0 );
        childElements.css('text-indent', textOffset + 'px');
      }
    });
  });

   attrs.$observe('appliedFilter', function() {
        // set width based on duration
        var iniDate = isoToDate(scope.thisProgram.starttime);
        var endDate = isoToDate(scope.thisProgram.endtime);
        var duration = Math.floor((endDate-iniDate)/1000/60);
        var width = (duration * hourWidth) / 60;
        element.css("width", width+"px");

        // position left based on start time
        var today = new Date(iniDate.getTime());
        today.setHours(0);
        today.setMinutes(0);

        var left = (Math.floor((iniDate-today)/1000/60) * hourWidth) / 60;
        element.css("left", left+"px");

        //addClass info that replaces information with an icon "i"
        if(element.width() < hourWidth/3){
          if(!Modernizr.touch) {
            element.data("title", scope.thisProgram.programmename).tooltip();
          }
          element.addClass('info');

          if(element.width() < 10) {
            element.addClass('scaled');
          }
        }
      });

      // Wait for the image path to be interpolated
      // @TODO: Change the imagePath definition in index.html for home & tvGuide once the API is fixed
      attrs.$observe('imagePath', function(){
        if(attrs.imagePath) {
          var pgDetails = {
            userid      : $rootScope.getUser().userid,
            programmeid : attrs.programId,
            channelid   : ( attrs.channelId ? attrs.channelId : 0 ),
            starttime   : attrs.startTime.replace('T', ' ').split('+')[0],
            programmeimagesize : 'xxlarge'
          };
          assignBG(pgDetails);
        }
      });
      
    }
  }; }]);


woi.directive('tvGuideTimeElapsed', ['$filter', function($filter){

  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){

      // position left based on start time
      var today = new Date();
      var secOnePx = 60*60/hourWidth;



      var left = (Math.floor((today.getHours())) * hourWidth) + (today.getMinutes()*hourWidth/60) - element.outerWidth();
      element.css("left", left+"px");

      // updates each second the elapsed position
      setInterval(function(){
        element.animate({left:'+=1'} );

        // highlights the current time
        var nowDate = new Date();
        var highlightTime = nowDate.getHours()+'00'+nowDate.getDate()+nowDate.getMonth();
        $('.timeline ul li').css('color','#86477E');
        $('.timeline ul li[data-time='+highlightTime+']').css('color','#FEEF02');
      },1000*secOnePx);
    }
  };
}]);
