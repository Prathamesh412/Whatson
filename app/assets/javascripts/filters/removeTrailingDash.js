// filter program name
woi.filter('removeTrailingDash', function(){
  return function (text){
    return String(text).substring(0, text.length - 3);
  };
});
