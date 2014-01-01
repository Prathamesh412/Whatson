woi.filter('encodeActorNameWIthDash',['$rootScope',function($rootScope){
    return function(actor)
    {
        if(actor.castname == undefined)
            return false;
        return actor.castname.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");
    }
}]);