//  sample input ---> Mon May 21 20:09:48 +0000 2012

woi.filter('twitterTime', ['$filter', function($filter){

  return function (tdate){
    
  
    var date;

    if ($('html').hasClass('ie')) {
      /*
       * Twitter is returning the string in the following format for IE:
       *    Sun Jun 09 13:30:00 +0430 1995
       * But this isn't getting parsed properly in IE, so we need to 
       * rearrange it a bit to match this format:
       *    Mon, 25 Dec 1995 13:30:00 +0430
       */
      var arr       = tdate.split(' ')
          opArr     = [ arr[0] + ',', arr[2], arr[1], arr[5], arr[3], arr[4] ]
          opString  = opArr.join(' ');

      date = new Date( Date.parse(opString) );
    }else{
      date = new Date( Date.parse(tdate) );
    }

    var diff = (((new Date()).getTime() - date.getTime()) / 1000);
    diff = Math.floor(diff / 86400);
    
    if (diff <= 1) {return "just now";}
    if (diff < 20) {return diff + " seconds ago";}
    if (diff < 40) {return "half a minute ago";}
    if (diff < 60) {return "less than a minute ago";}
    if (diff <= 90) {return "one minute ago";}
    if (diff <= 3540) {return Math.round(diff / 60) + " minutes ago";}
    if (diff <= 5400) {return "1 hour ago";}
    if (diff <= 86400) {return Math.round(diff / 3600) + " hours ago";}
    if (diff <= 129600) {return "1 day ago";}
    if (diff < 604800) {return Math.round(diff / 86400) + " days ago";}
    if (diff <= 777600) {return "1 week ago";}
    return "on " + date;
  };
  // from http://widgets.twimg.com/j/1/widget.js
  // var K = function () {
  //   var a = navigator.userAgent;
  //   return {
  //       ie: a.match(/MSIE\s([^;]*)/)
  //   }
  // }();
}]);