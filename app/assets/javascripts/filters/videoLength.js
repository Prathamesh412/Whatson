woi.filter("videoLength",function(){
  return function (time){

  	if(angular.isUndefined(time)){
  		return false;
  	}
  	
	var hours = Math.floor(time / 3600);
	time -= hours * 3600;

	var minutes = Math.floor(time / 60);
	time -= minutes * 60;

	var seconds = parseInt(time % 60, 10);
	

	if(hours == 0){
		var finalTime = (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
	}else{
		var finalTime = hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
	}

	return finalTime;
  };
});