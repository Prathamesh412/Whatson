// filter get the name of the day
woi.filter('getNameDay', function(){
  return function (num, abbr){
    var week = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var abbrWeek = ['Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (abbr)? abbrWeek[num]  : week[num];
  };
});
