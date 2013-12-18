woi.directive("watchlistDropbox",["$rootScope","userAPI","$location",function($rootScope,userAPI,$location){

	var parseProgramme = function(programme){
		var toBeModified = ["ChannelID","ChannelName","StartTime","ProgrammeID","ProgrammeName"]		

		_.each(toBeModified,function(key){
			if (!_.isUndefined(programme[key]) && _.isUndefined(programme[key.toLowerCase()])) 
				programme[key.toLowerCase()] = programme[key];
		});

		return programme;		
	}
	return {
		restrict: 'A',
		link: function(scope,element,attrs){
			$(element).addClass("watchlistdropbox");

			if (!Modernizr.touch){	

				$(element).droppable({
			      // accept: ".watchable",
			      activeClass: "active",
			      over: function(event, ui ){
			      	if ($rootScope.isUserLogged()) {
				      	if (!$(".watchlist-excoll").is("visible") && $location.path() != ("/Watchlist")) {
		                  $(".watchlist-excoll").slideDown();
				          $("#watchList").addClass("watchlistactive")
				      	};
			      	}
			      },
			      drop: function( event, ui ) {
			      	if ($rootScope.isUserLogged()) {
				        var programme = ui.draggable.context.bgobj;//scope.$eval(ui.draggable.context.bgobj);
				        ui.draggable.context.scope[ui.draggable.context.refObj].iswatchlist = "1";
				        programme = parseProgramme(programme);
				        $rootScope.$broadcast("watchlist::add",programme);
				        var data = {watchliststatus: true};

				        if (_.isUndefined(programme.videoid)) {
				        	data.contenttype = "program";
				        	data.contentid = programme.programmeid;
				        	data.videoid = 0;
				        } else{
				        	data.contenttype = "video";
				        	data.contentid = programme.programmeid;
				        	data.videoid = programme.videoid;
				        };
				        userAPI.toggleWatchlist(data, function(rs){});

			      	}else{
			      		$("#watchList").trigger("click");
			      	}
			      }
			    });
			}


		}
	}
}]);