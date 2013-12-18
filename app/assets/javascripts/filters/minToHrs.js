
woi.filter('minToHrs', function(){
	
  return function (min){

  	var hours   = Math.floor( min / 60);
    var minutes = min % 60;
    var days = Math.floor(hours / 24);
    var remainingHours = hours % 24;

    // var timeDurations = {
    //      "15" : '15 minutes',
    //      "30" : '30 minutes',
    //      "60" : '1 hour',
    //      "120" : '2 hours',
    //      "1440" : '1 day',
    //      "2880" : '2 days'
    // };
    // return timeDurations[min];

    if(hours == 0 && days == 0){
    	return minutes + ' minutes';
    } else if(days == 0) {
    	if( minutes == 0 ){
    		if(hours == 1){
    			return hours + ' hour';
    		}else{
    			return hours + ' hours';	
    		}
    	} else {
    		return hours + ' hours and ' + minutes + ' minutes';	
    	}
    } else {
        if(minutes == 0) {
            if(remainingHours == 1){
                return days + ' days and ' + remainingHours + ' hour';
            } else {
                if(remainingHours == 0) {
                    return days + ' day' + ( days == 1 ? '' : 's' );    
                } else {
                    return days + ' days and ' + remainingHours + ' hours';    
                }
            }
        } else {
            return days + ' days, ' + remainingHours + ' hours and ' + minutes + ' minutes'
        }
    }
  };
});