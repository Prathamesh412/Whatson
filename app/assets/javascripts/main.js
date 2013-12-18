Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

// Enabling the Object.keys method in case it doesn't exist
if (!Object.keys) {
  Object.keys = (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;
 
    return function (obj) {
      if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');
 
      var result = [];
 
      for (var prop in obj) {
        if (hasOwnProperty.call(obj, prop)) result.push(prop);
      }
 
      if (hasDontEnumBug) {
        for (var i=0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
        }
      }
      return result;
    }
  })()
};

// function androidTouch(){

//   var clickDelay = 300;
//   var isClick = false;

//   function touchHandler(e) {
//     var touches = e.changedTouches,
//         touch = ( touches ? touches[0] : null ),
//         type = "",
//         originalType = e.type,
//         targetType = e.target.nodeName,
//         exclusions = ["INPUT", "TEXTAREA", "BUTTON", "A", "I"],
//         isExcluded = ( exclusions.indexOf(targetType) > 0 );

//     if( !isExcluded && originalType == 'click' ) {
//       e.preventDefault();
//     }

//     switch(e.type) {
//       case "touchstart" : isClick = true;
//                           break;
//       case "touchmove"  : isClick = false;
//                           break;
//       case "touchend"   : if(isClick) {
//                             type = "click";
//                           }
//                           console.log(e.target.nodeName + ' TouchEnd at ' + (new Date()).getTime());
//                           break;
//       case "click"      : console.log(e.target.nodeName + ' Clicked at ' + (new Date()).getTime());
//                           break;
//       default           : return;
//     }

//     if(type == "click" && originalType == "touchend" && !isExcluded) {
//       var simulatedClick = document.createEvent("MouseEvent");
//       simulatedClick.initMouseEvent(type, true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
//       touch.target.dispatchEvent(simulatedClick);
//     }
//   }

//   document.addEventListener("touchstart", touchHandler, true);
//   document.addEventListener("touchmove", touchHandler, true);
//   document.addEventListener("touchend", touchHandler, true);
//   document.addEventListener("click", touchHandler, true);
//   // document.addEventListener("touchcancel", touchHandler, true);
// }

if(Modernizr.touch){
  if(navigator.userAgent.match(/Android/i)){
    // Don't add fast click library    
    // androidTouch();
    $('body').on('touchstart', '.watchable', function(e) {
      e.preventDefault && e.preventDefault();
      e.stopPropagation && e.stopPropagation();
      e.cancelBubble = true;
      e.returnValue = false;
      return false;
    });
  } else {

    window.addEventListener('load', function() {
      FastClick.attach(document.body);
    }, false);

    $(function() {
      FastClick.attach(document.body);
    });

    // To disable the horizontal web-page scrolling of iPad
    var xStart, yStart = 0;
     
    document.addEventListener('touchstart',function(e) {  
        xStart = e.touches[0].screenX;
        yStart = e.touches[0].screenY;
    });
     
    document.addEventListener('touchmove',function(e) {
      
        var xMovement = Math.abs(e.touches[0].screenX - xStart);
        var yMovement = Math.abs(e.touches[0].screenY - yStart);
        if((xMovement * 3) > yMovement) {

            e.preventDefault();
        }
    });
  }
}






$(document).ready(function(){

  //social btns behavior  
  // var $social = $('.social');
  // var $allExceptSh = $social.children('.btn:not(.sh)');
  // var $socialBtns = {
  //   facebook: $social.children('.fb')
  //   ,twitter: $social.children('.tw')
  //   ,googleplus: $social.children('.gp')
  //   ,rss: $social.children('.rss')
  //   ,share: $social.children('.sh')
  // };

  // $socialBtns.share.click(function() {
  //   $socialBtns.share.toggleClass('active');
  //   $allExceptSh.toggleClass('trigger');
  // });

  // watchlist tooltip
  // $('[rel="tooltip"]').live('hover', function(e){ 
  	// e.preventDefault(); 
  	// $(this).tooltip({'html':true, trigger:'hover'}); 
  // });
  //console.log($.browser.msie + ", " +$.browser.version)
  var  tvguidechannel_my,tvguidechannel_at,tvguidechannel_x;
  
  $('[href="#close"]').live('click', function(e){ 
    e.preventDefault(); 
    $(this).parent().fadeOut();
  });

  // Binding to restrict mobile-number input to numbers
  $('.mobile-number').live('keydown', function(e){
    var keyCode = e.which,
        whiteList = [
          8, // Backspace
          46, // Delete
          48, 49, 50, 51, 52, 53, 54, 55, 56, 57, // Number keys
          96, 97, 98, 99, 100, 101, 102, 103, 104, 105 // Numpad keys
        ],
        isModified = e.ctrlKey || e.shiftKey || e.altKey; // Check for modifiers

    if( whiteList.indexOf(keyCode) == -1 || isModified ) { e.preventDefault() } // If key is not whitelisted, cancel the action
  });

  function hideDropdown() {
    var menuDropdown = $('.moreDropdownTrigger').siblings('ul.dropdown-menu');
    menuDropdown.hide();
    document.removeEventListener('click', hideDropdown);
  };

  function dropdownListeners(e) {
    e.stopPropagation();

    var element = $(e.currentTarget),
        dropdownMenu = element.parent().find('.dropdown-menu'),
        initiallyHidden = dropdownMenu.is(':hidden');

    // Hide other open dropdowns
    $('.dropdown-menu').hide();

    // Show this if it was initially hidden
    if(initiallyHidden) {
      dropdownMenu.show();
    }

    document.removeEventListener('click', hideDropdown);
    document.addEventListener('click', hideDropdown);
  }

  // Don't let the event bubble if the click was in the dropdown
  $('body').on('click', '.moreDropdownTrigger', function(e) {
    dropdownListeners(e);
  });
});

// $('#channelSearch, #channelSearchMobile').live('focus', function(){
//   console.log('main');
//   $(this).val('');
// });
////////////////////////////
//
// HELPER FUNCTIONS
//
////////////////////////////

// receives a timestring
function abbrMonth(date){
  var d = new Date(date);
  return (d == "Invalid Date")? date :( dateFormat(d, "hh:MM TT, mmm"));
}

function addData(newData) {
  if(angular.isArray(newData)) {
    return newData;
  } else if (angular.isObject(newData)) {
    return [newData];
  }
}

function injectYT(element, url){
  element.find('span.play').hide();
  var playerID = 'featured-' + (new Date()).getTime();
  //var urlMatches = obj.videourl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
  element.find('.player').html('<iframe id="' + playerID + '" width="580" height="349" src="http://www.youtube.com/embed/'+ url + '?enablejsapi=1&wmode=opaque&autoplay=0&rel=0&modestbranding=1&showinfo=0" frameborder="0" allowfullscreen style="backgground-color=\'#000\'"></iframe>');
}



