// filter program name
woi.filter('featuredVideoTime', ['$filter', function($filter){

  var isoToDate = $filter('isoToDate'),
      days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return function (dateStr){
    if(typeof dateStr == 'undefined'){
      return '';
    }

    if(dateStr == "coming soon"){
      return dateStr;
    }

    var date = isoToDate(dateStr);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    
    var now = new Date();
    var theDay = (now.getFullYear() == date.getFullYear() &&
                  now.getMonth() == date.getMonth() &&
                  now.getDate() == date.getDate()) ? "Today" : days[date.getDay()] + ", " + date.getDate() + ([,'st','nd','rd'][/1?.$/.exec(date.getDate())] || 'th') + " " + monthsShort[date.getMonth()];
    strTime += " " + theDay;
    return strTime;
  };
}]);


// filter program name
woi.filter('sideBarTime', ['$filter', function($filter){

  var isoToDate = $filter('isoToDate'),
      days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return function (dateStr){
    if(typeof dateStr == 'undefined'){
      return '';
    }
    var date = isoToDate(dateStr);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    
    return strTime;
  };
}]);

//filter to give time string without time value
woi.filter('sideBarDateString', ['$filter', function($filter){

  var isoToDate = $filter('isoToDate'),
      days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return function (dateStr){
    if(typeof dateStr == 'undefined'){
      return '';
    }
    var date = isoToDate(dateStr);
    
    var now = new Date();
    var theDay = (now.getFullYear() == date.getFullYear() &&
                  now.getMonth() == date.getMonth() &&
                  now.getDate() == date.getDate()) ? "Today" : days[date.getDay()] + ", " + date.getDate() + ([,'st','nd','rd'][/1?.$/.exec(date.getDate())] || 'th') + " " + monthsShort[date.getMonth()];
    return theDay;
  };
}]);

