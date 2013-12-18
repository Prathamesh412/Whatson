woi.filter("watchlisttimeformat",function(){
  return function (str){
  	return moment(str).format("h:mma, Do MMM");
  };
});