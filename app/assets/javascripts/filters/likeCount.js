woi.filter('likeCount', function(){
  return function (count){
    
    count = parseInt(count);

    if(!angular.isNumber(count)){
    	return "Be the first one to like.";

    }else if(count == 1){

    	return " likes it.";
    }
    else if(count <= 0){

		return "Be the first one to like.";
	}
	else{
		
		var tempCount = count;
		tempCount -= 1;

		if(tempCount == 1){
			return " and " + tempCount + " person likes this.";
		}else{
			return " and " + tempCount + " people liked this.";	
		}	
	}
  };
});
