// filter program name
woi.filter('isoToDate', function(){
  return function (dateStr){
    var year = dateStr.substr(0,4),
    month = dateStr.substr(5,2),
    day = dateStr.substr(8,2);

    var hour = dateStr.substr(11,2),
        min = dateStr.substr(14,2),
        sec = dateStr.substr(17,2);

    var zone_hour = dateStr.substr(20,2),
        zone_min = dateStr.substr(23,2);

    var date = new Date();
    date.setYear(year);
    date.setDate(day);
    date.setMonth(month-1);
    date.setHours(hour);
    date.setMinutes(min);
    date.setSeconds(sec);
    // add timezone
    // date.setHours(date.getHours()+parseInt(zone_hour,10));
    // date.setMinutes(date.getMinutes()+parseInt(zone_min,10));
    
    return date;
  };
});
