woi.filter('addLinks', ['$routeParams', '$rootScope', function($routeParams, $rootScope){
  
  return function (value, key){
    var link = '#!/';

    if (key == "Channel"){
//        link += 'channel/'+escape($routeParams.channelname);
//        if(!!$rootScope.channelNo){
//            return '<a href='+link.replace(/\-/g, "~").replace(/\:/g, "`").replace(/\s/g, "-").replace(/\//g, "$")+'>'+value+'</a>' + '(' + $rootScope.channelNo + ')';
//        }
        return '<a href=#!/channel/'+decodeURI(value).replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$")+'>'+decodeURI(value)+' </a>';


    }


    else if (key == "Language" || key == "Genre" || key == "Sub-genre"){
        link += 'search/'+escape(value); 
        return '<a href='+link+'>'+value+'</a>';
    }
    else if(key == "Director" || key == "Actor"){

        var array = value.split(',');
        var allLinks = '';
        var comma = array.length - 1;
        for(var i=0; i<array.length; i++){            

            var temp = escape(array[i]);
            if (comma == i)
            {
                allLinks += '<a href=#!/actor/'+decodeURI(temp).replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$")+ " title="  + decodeURI(temp).replace(/\s/g, "-") + '>'+decodeURI(array[i])  +' </a>';
            }
            else
            {
                allLinks += '<a href=#!/actor/'+decodeURI(temp).replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$")+ " title="  + decodeURI(temp).replace(/\s/g, "-") + '>'+decodeURI(array[i]) + ',' +' </a>';
            }

        }
        return allLinks.replace(/\,$/g,'');
    }
    else{
        return value;
    }

  };
}]);

