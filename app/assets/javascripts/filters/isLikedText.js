
woi.filter('isLikedText', function(){
  return function (txt){
    if(txt == '0'){
    	return 'Like';
    }else{
    	return 'Liked';
    }
  };
});