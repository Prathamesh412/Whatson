// filter get the name of the day
woi.filter('momentDiference', function(){
  return function (starttime){
    var st = new Date(starttime).toUTCString();
    var tday = new Date().toUTCString();
    //console.log('today', tday);
    //console.log('startime', st);
    return  moment(st).fromNow();
  };
});
