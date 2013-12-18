woi.filter('durationFormated', function(){
  return function (starttime, endtime){
  
    var hours = 0 ;
    if(!starttime || !endtime ) {
      return false;
    }

    endtime = endtime.substring(0, endtime.length - 2).replace(/\-/g,'\/').replace(/[T|Z]/g,' ');
    starttime = starttime.substring(0, starttime.length - 2).replace(/\-/g,'\/').replace(/[T|Z]/g,' ');


    minutes = Math.abs(new Date(endtime).getTime() - new Date(starttime).getTime());
    
    minutes = ( Math.floor((minutes/1000)/60) );


    if(isNaN(minutes)) {
      return false;
    }

    if(minutes < 60) {
      minutes = ((minutes+"").length >1)? minutes : "0"+minutes;
      return minutes+':00';
    }

    hours = parseInt(minutes / 60);
    minutes = parseInt(minutes % 60);
    minutes = ((minutes+"").length >1)? minutes : "0"+minutes;
    return hours+":"+minutes+":00";
  };
});

