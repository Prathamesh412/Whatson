// Avoid `console` errors in browsers that lack a console.
if (!(window.console && console.log)) {
  (function() {
    var noop = function() {};
    var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
    var length = methods.length;
    var console = window.console = {};
    while (length--) {
      console[methods[length]] = noop;
    }
  }());
}


// Place any jQuery/helper plugins in here.
$(function(){
  $.breakpoint({
    condition: function () {
      return window.matchMedia('screen and (max-width:768px)').matches;
    },
    first_enter: function () {
      
    },
    enter: function () {
      $("body").addClass("tablet");
      $("#trending").insertBefore($("#fb-activity"));
    },
    exit: function () {
      $("body").removeClass("tablet");
    }
  });

  $.breakpoint({
    condition: function () {
      return window.matchMedia('screen and (max-width:480px)').matches;
    },
    first_enter: function () {
      
    },
    enter: function () {
      $("body").addClass("phone");
      // hide nav buttons
      var $mainNav = $(".main-nav");
      $mainNav.find(".watchlist button").text('Watchlist');
      // $mainNav.find(".search input").addClass('btn').attr('placeholder', '');
      $mainNav.find(".search a").removeClass("hide");

      // change feature icons
      var $featured = $(".featured");
      $featured.find(".actions .favourite").removeClass("btn btn-small").addClass("icon-search").text("");
      $featured.find(".actions .schedule").removeClass("btn btn-small").addClass("icon-time").text("");
      $featured.find(".actions .add-to").removeClass("btn btn-small").addClass("icon-plus").text("");
    },
    exit: function () {
      $("body").removeClass("phone");
    }
  });

  // placeholder handler
  // Placeholders.init({
  //   live: true, //Apply to future and modified elements too
  //   hideOnFocus: false //Hide the placeholder when the element receives focus
  // });
});


//Center any element - usage: $('')
jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px !important");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px !important");
    return this;
}

//Auto scroll to a particular element, which is out of the bounds of the viewport
jQuery.fn.extend({
scrollToMe: function (oh) {
  return false; //disabled as it caused issues later on. remove this to enable complete qtip visibility when out of bounds of the viewport.
  if((Modernizr.mq("screen and (max-width:640px)"))){
    var x = jQuery(this).outerHeight() + oh;
    jQuery('html,body').animate({scrollTop: x}, 500);
  }
}});


function callPlayer(frame_id, func, args) {
    if (window.jQuery && frame_id instanceof jQuery) frame_id = frame_id.get(0).id;
    var iframe = document.getElementById(frame_id);
    if (iframe && iframe.tagName.toUpperCase() != 'IFRAME') {
        iframe = iframe.getElementsByTagName('iframe')[0];
    }

    // When the player is not ready yet, add the event to a queue
    // Each frame_id is associated with an own queue.
    // Each queue has three possible states:
    //  undefined = uninitialised / array = queue / 0 = ready
    if (!callPlayer.queue) callPlayer.queue = {};
    var queue = callPlayer.queue[frame_id],
        domReady = document.readyState == 'complete';

    if (domReady && !iframe) {
        // DOM is ready and iframe does not exist. Log a message
        window.console && console.log('callPlayer: Frame not found; id=' + frame_id);
        if (queue) clearInterval(queue.poller);
    } else if (func === 'listening') {
        // Sending the "listener" message to the frame, to request status updates
        if (iframe && iframe.contentWindow) {
            func = '{"event":"listening","id":' + JSON.stringify(''+frame_id) + '}';
            iframe.contentWindow.postMessage(func, '*');
        }
    } else if (!domReady || iframe && (!iframe.contentWindow || queue && !queue.ready)) {
        if (!queue) queue = callPlayer.queue[frame_id] = [];
        queue.push([func, args]);
        if (!('poller' in queue)) {
            // keep polling until the document and frame is ready
            queue.poller = setInterval(function() {
                callPlayer(frame_id, 'listening');
            }, 250);
            // Add a global "message" event listener, to catch status updates:
            messageEvent(1, function runOnceReady(e) {
                var tmp = JSON.parse(e.data);
                if (tmp && tmp.id == frame_id && tmp.event == 'onReady') {
                    // YT Player says that they're ready, so mark the player as ready
                    clearInterval(queue.poller);
                    queue.ready = true;
                    messageEvent(0, runOnceReady);
                    // .. and release the queue:
                    while (tmp = queue.shift()) {
                        callPlayer(frame_id, tmp[0], tmp[1]);
                    }
                }
            }, false);
        }
    } else if (iframe && iframe.contentWindow) {
        // When a function is supplied, just call it (like "onYouTubePlayerReady")
        if (func.call) return func();
        // Frame exists, send message
        iframe.contentWindow.postMessage(JSON.stringify({
            "event": "command",
            "func": func,
            "args": args || [],
            "id": frame_id
        }), "*");
    }
    /* IE8 does not support addEventListener... */
    function messageEvent(add, listener) {
        var w3 = add ? window.addEventListener : window.removeEventListener;
        w3 ?
            w3('message', listener, !1)
        :
            (add ? window.attachEvent : window.detachEvent)('onmessage', listener);
    }
}
