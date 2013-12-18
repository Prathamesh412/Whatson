// Adds 1st, 2nd, 3th, etc
woi.filter('toOrdinal', function(){
  return function(num) {
    var n = num % 100;
    var suffix = ['th', 'st', 'nd', 'rd', 'th'];
    var ord = n < 21 ? (n < 4 ? suffix[n] : suffix[0]) : (n % 10 > 4 ? suffix[0] : suffix[n % 10]);
    return num + ord;
  };

});
