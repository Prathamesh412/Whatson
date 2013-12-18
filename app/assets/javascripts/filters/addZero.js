// filter program name
woi.filter('addZero', function(){
  return function (num){
    return (num < 10) ? "0" + num : num;
  };
});