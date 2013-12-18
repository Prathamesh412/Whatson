
woi.filter('makeURL', function(){
 
  return function (type, id){
    
    if(type.toLowerCase() == "channel"){
    	return "#!/channel/"+id;
    }else{
    	return "#!/program/" + id + "/channel/0";      //changes to be made Prathamesh
    }   
  };
});