woi.filter('allFilter', function(){
  return function (txt){
    if(txt == ''){
    	return '!';
    }else{
    	return ' for ' + txt +'!';
    }
  };
});