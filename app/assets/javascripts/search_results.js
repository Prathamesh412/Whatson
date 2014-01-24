woi.controller('SearchResultsController', ['$scope', '$rootScope', '$filter',  'recoAPI', 'userAPI','$routeParams', '$compile', '$timeout','$location', function($scope, $rootScope, $filter,  recoAPI, userAPI, $routeParams, $compile, $timeout,$location){

    $scope.changeurl= function(url,element){
        var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");            //Prathamesh Changes for programme
        $location.path("programme/" + str);
        element.stopPropagation();
        element.preventDefault();

    };

    $scope.changechannelurl= function(url,element){
        var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");           //Prathamesh Changes for  channel
        $location.path("channel/" + str);
        element.stopPropagation();
        element.preventDefault();

    };

    if(angular.isUndefined($routeParams.query) || $routeParams.query == ''){
        $scope.isEmptyText = true;
        $rootScope.searchQuery.text = '';
        $rootScope.searchQuery.resultText = '';
        return false;
    }else{
        $scope.isEmptyText = false;
    }

    $scope.updateSearchText = function(text){
        $("#mainSearch").val(text);
    }
    var search_params = {};
    $scope.scrollValue = 500;
    // query passed by GET
    $rootScope.searchQuery.text = $routeParams.query;
    $rootScope.searchQuery.resultText =  $routeParams.query;
    $rootScope.searchTitle = "Searching for ";
    $scope.updateSearchText($routeParams.query);
    search_params.searchtext = $rootScope.searchQuery.text;

    $scope.amount  = 0;
    $scope.amount_channel  = 0;
    $scope.amount_cast  = 0;

    $scope.current      = 'all';
    $scope.searchType   = 'programs, movies or channels';
    $scope.step         = 8;
    $scope.step_channel = 8;
    $scope.step_cast    = 8;
    $scope.isLoaded     = false;
    $scope.isSorted = false;
    // $scope.clear = false;
    $scope.phoneSidebar = 'off';

    $scope.toggleSidebar= function(status){
        $scope.phoneSidebar = status;
    };
    // contains full results
    $scope.searchResults = {};

    $scope.removedSearch={
    };

    $scope.resetRemovedSearch = function(){
        $scope.removedSearch = {
            all:[],
            channels:[],
            casts:[]
        };
    };

    $scope.resetSearchResults = function() {
        // contains full results
        $scope.searchResults = {
            all      : [],
            movies   : [],
            tvshows  : [],
            videos   : [],
            channels : [],
            casts    : [],
            count:{
                all      : 0,
                movies   : 0,
                tvshows  : 0,
                videos   : 0,
                channels : 0,
                casts    : 0
            }
        };
        $scope.amount = 0;
        $scope.amount_channel = 0;
        $scope.amount_cast = 0;

    };


    // main data structure
    $scope.paginated = [];

    //resets the search results
    $scope.resetSearchResults();

    //resets the Removed Search
    $scope.resetRemovedSearch();

    var addZero = $filter('addZero');
    var durationFormated = $filter('durationFormated');

    $scope.displayEmptyBlock = function(){
        return $scope.isLoaded && $scope.searchResults[$scope.current].length < 1 && _.isEmpty($scope.paginated);
    }

    // helper to fill the searchResults objects
    $scope.applyFilter = function(item, pushToAll) {
        switch(item.M2eCategoryName){
            case "Film":
                $scope.searchResults.movies.push(item);
                break;
            case "TV Show":
                $scope.searchResults.tvshows.push(item);
                break;
        }
        if(pushToAll)
            $scope.searchResults.all.push(item);
    };

    var resetFilter = function() {

        // joins back the removed items on previous filtering
        var all = $scope.searchResults.all.concat($scope.removedSearch.all);

        var channels = $scope.searchResults.channels.concat($scope.removedSearch.channels);
        var casts = $scope.searchResults.casts.concat($scope.removedSearch.casts);

        $scope.resetRemovedSearch();
        $scope.resetSearchResults();

        $scope.searchResults.all =  all;
        $scope.searchResults.channels =  channels;
        $scope.searchResults.casts =  casts;

    };

    // Event listeners

    $scope.$on('search:categorize', function(event, params) {

        resetFilter();

        switch(params.filter) {
            case 'recommended':
                $scope.removedSearch.all = _.filter($scope.searchResults.all, function(r) {
                    return r.isrecommended == "0";
                });

                $scope.searchResults.all = _.filter($scope.searchResults.all, function(id) {
                    return id.isrecommended == "1";
                });
                break;
            //M2eCategory
            case 'film':
            case 'sport':
            case 'childrens':
            case 'music':
                $scope.removedSearch.all = _.filter($scope.searchResults.all, function(r) {
                    return r.M2eCategoryName.toLowerCase() != params.filter;
                });
                $scope.searchResults.all  = _.filter($scope.searchResults.all, function(id) {
                    return id.M2eCategoryName.toLowerCase() ==  params.filter;
                });
                break;
            case 'allcategories':  //AllCategories default action
                break;
            //M2eSubCategory
            default: // all the others

                $scope.removedSearch.all = _.filter($scope.searchResults.all, function(r) {
                    return r.M2eSubCategoryName.toLowerCase() != params.filter;
                });
                $scope.searchResults.all = _.filter($scope.searchResults.all, function(id) {
                    return id.M2eSubCategoryName.toLowerCase() ==  params.filter;
                });
        }


        if(params.filter != 'allcategories') {
            //Remove casts/channels from searchlist
            $scope.removedSearch.channels = $scope.searchResults.channels;
            $scope.searchResults.channels = [];

            $scope.removedSearch.casts = $scope.searchResults.casts;
            $scope.searchResults.casts = [];
        }

        $scope.paginated=[];

        for (var i = 0; i < $scope.searchResults.all.length; i++) {
            $scope.applyFilter($scope.searchResults.all[i], false /*push to all*/);
        };

        // $scope.loadMoreDetails();
        $scope.$emit('search:updateCount', $scope.searchResults);

    });


    $scope.$on('search:sort', function(event, params) {

        $scope.isSorted = true;

        switch(params.filter) {
            case 'viewcount':
                $scope.searchResults[$scope.current] = _.sortBy($scope.searchResults[$scope.current] , function(it) {
                    return parseInt(it.ViewCount);
                });
                break;
            case 'rating':
                $scope.searchResults[$scope.current] = _.sortBy($scope.searchResults[$scope.current] , function(it) {
                    return parseFloat(it.woiscore);
                });
                break;
            case 'airingtime':
                $scope.searchResults[$scope.current] = _.sortBy($scope.searchResults[$scope.current] , function(it) {
                    var d = new Date(it.StartTime);
                    return d.getTime();
                });
                break;
            default: //relevance default action
                //default sort by name
                $scope.searchResults[$scope.current] = _.sortBy($scope.searchResults[$scope.current] , function(it) {
                    return it.ProgrammeName;

                    $scope.isSorted = false;
                });
        }

        $scope.amount = 0;
        $scope.amount_channel = 0;
        $scope.amount_cast = 0;
        $scope.loadMoreDetails();
    });

    // The search and suggest api are called here.
    $scope.$on('search:make', function(event, params) {
        $scope.resetSearchResults();
        $scope.isLoaded = false;

        $rootScope.searchTitle = "Searched for ";
        $('#mainSearch').trigger('blur');
        $('#mainSearch').css('background-color','#fff !important');

        $scope.$emit('handleResetEmit');

        if(angular.isDefined($routeParams.ismovie)){

            params.searchcriteria = 'cast';
            recoAPI.search(params, function(rs) {
                // $rootScope.searchTitle = "Searched for ";

                // $('#mainSearch').trigger('blur');
                // $('#mainSearch').css('background-color','#fff !important');

                // $scope.$emit('handleResetEmit');

                if(!rs.Search){

                    $scope.isLoaded = true;
                    return false;
                }

                var result = addData(rs.Search.Programme);
                _.each(result, function(c) {

                    c.duration = durationFormated( c.StartTime , c.EndTime );
                    c.type = "programme";

                    var params = Object.keys( c ),
                        paramCount = params.length;

                    for( var i = 0; i < paramCount; i++ ) {
                        c[ params[i].toLowerCase() ] = c[ params[i] ];
                    }

                    $scope.applyFilter(c, true);
                });

                // only 1 entry
                // if(! _.isArray(result)){
                //   result.duration = durationFormated( result.StartTime ,  result.EndTime );

                //   result.type = "programme";
                //   $scope.applyFilter(result, true);
                // }
                // else{
                //   _.each(result, function(c) {

                //   c.duration = durationFormated( c.StartTime , c.EndTime );

                //     c.type = "programme";
                //     $scope.applyFilter(c, true);
                //   });
                // }
                $scope.$emit("search:updateCount", $scope.searchResults);
                // $scope.loadMoreDetails();
            });
        }
        else{
            recoAPI.search(params, function(rs) {

                // $rootScope.searchTitle = "Searched for ";

                // $('#mainSearch').trigger('blur');
                // $('#mainSearch').css('background-color','#fff !important');

                // $scope.$emit('handleResetEmit');

                if(!rs.Search){

                    $scope.isLoaded = true;
                    return false;
                }

                var result = addData(rs.Search.Programme);
                _.each(result, function(c) {

                    c.duration = durationFormated( c.StartTime , c.EndTime );
                    c.type = "programme";

                    var params = Object.keys( c ),
                        paramCount = params.length;

                    for( var i = 0; i < paramCount; i++ ) {
                        c[ params[i].toLowerCase() ] = c[ params[i] ];
                    }

                    $scope.applyFilter(c, true);
                });

                // only 1 entry
                // if(! _.isArray(result)){
                //   result.duration = durationFormated( result.StartTime ,  result.EndTime );

                //   result.type = "programme";
                //   $scope.applyFilter(result, true);
                // }
                // else{
                //   _.each(result, function(c) {

                //   c.duration = durationFormated( c.StartTime , c.EndTime );

                //     c.type = "programme";
                //     $scope.applyFilter(c, true);
                //   });
                // }
                $scope.$emit("search:updateCount", $scope.searchResults);
                // $scope.loadMoreDetails();
            });
        }


        // Suggest API
        userAPI.getSuggestKeyword({Keyword:$rootScope.searchQuery.text},function(rs){

            if(!rs.response){
                $scope.showSuggestionBox = false;
                return false;
            }

            if(rs.response.responsestatus == "false"){
                $scope.showSuggestionBox = false;
                return false;
            }

            $scope.showSuggestionBox = true;
            $scope.suggestedWord     = rs.response.keywordsuggestionlist.displayName;
        });
    });

    // LOAD MORE ITENS
    $scope.loadMoreDetails = function() {
        if(!$scope.isLoaded){
            return false;
        }

        var channels = $scope.searchResults.channels;
        var casts    = $scope.searchResults.casts;

        var rs = $scope.searchResults[$scope.current];

        if($scope.current=="all") {

            if(casts.length) {
                $scope.paginated = $scope.paginated.concat(casts.slice($scope.amount_cast, $scope.step_cast + $scope.amount_cast) );
                $scope.amount_cast    += $scope.step_cast;
            }

            if(channels.length) {
                $scope.paginated = $scope.paginated.concat(channels.slice($scope.amount_channel, $scope.step_channel + $scope.amount_channel) )
                $scope.amount_channel += $scope.step_channel;
            }

            $scope.paginated = ($scope.isSorted)
                ? rs.slice(0, $scope.step + $scope.amount)
                .concat(channels.slice(0, $scope.step_channel + $scope.amount_channel))
                .concat(casts.slice(0, $scope.step_cast + $scope.amount_cast))
                : $scope.paginated.concat(rs.slice($scope.amount, $scope.step + $scope.amount) );

        }
        else {
            $scope.paginated = rs.slice(0,  $scope.step + $scope.amount);
        }

        $scope.amount += $scope.step;
        // console.log("knknk",$scope.amount);

    };

    // Top Filters
    $scope.filter = function(option, event) {
        event.preventDefault();

        //sets current filter
        $scope.current = option;
        $scope.paginated = $scope.searchResults[option];
        $scope.amount = 0;
        $scope.amount_channel = 0;
        $scope.amount_cast = 0;
        $scope.paginated = [];
        $scope.loadMoreDetails();
        switch(option) {
            case 'movies'   :
                $scope.searchType = 'movies';
                break;

            case 'tvshows'  :
            case 'videos'   :
                $scope.searchType = 'programs';
                break;

            case 'channels' :
                $scope.searchType = 'channels';
                break;

            default         :
                $scope.searchType = 'programs, movies or channels';
                break;

        }
    };



    // event catcher to update searchResults Counter
    $scope.$on("search:updateCount", function (event, args){

        // updates the count for each category
        $scope.searchResults.count.all      = args.all.length + args.channels.length + args.casts.length ;
        $scope.searchResults.count.movies   = args.movies.length;
        $scope.searchResults.count.tvshows  = args.tvshows.length;
        $scope.searchResults.count.channels = args.channels.length;
        $scope.searchResults.count.casts    = args.casts.length;

        // loaded all content
        $scope.isLoaded = true;

        $scope.filter('all',event);
        // if($scope.searchResults.count.all<10){
        //   $scope.loadMoreDetails();
        //   $scope.filter('all',event);
        // }

    });


    $scope.addToFavorite = function(p){
        userAPI.toggleFavoriteProgramme({like:(p.isfavorite == "0"), programmeid:p.ProgrammeID}, function(rs){
            // if it fails, display error message
            if(!rs.response.responsestatus){
                alert(rs.response.message);
            } else {
                // change the flag
                p.isfavorite = (p.isfavorite == "0") ? "1" : "0";
            }
        });
    };

    $scope.addToReminder = function(p){
        alert("Not yet");
        return false;

        // can't apply code due to API error
        if(p.isreminder == "0"){
            var d = new Date();
            userAPI.addReminder({
                channelid: p.channelid,
                programmeid: p.programmeid,
                starttime: "" + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes())
            },function(rs){
                // if it fails, display error message
                if(!rs.response.responsestatus){
                    alert(rs.response.message);
                }
            });
        } else {
            removeReminder.addReminder({reminderid:p.reminderid},function(rs){

            });
        }

    };

    $scope.addToWatchlist = function(p){
        if ($rootScope.isUserLogged())
            var data = {watchliststatus: (p.iswatchlist == "0")};

        if (_.isUndefined(p.videoid)) {
            data.contenttype = "program";
            data.contentid = p.ProgrammeID;
            data.videoid = 0;
        } else{
            data.contenttype = "video";
            data.contentid = p.ProgrammeID;
            data.videoid = p.videoid;
        };
        userAPI.toggleWatchlist(data, function(rs){
            if(!rs.response.responsestatus){
                alert(rs.response.message);
            } else {
                // change the flag
                p.iswatchlist = (p.iswatchlist == "0") ? "1" : "0";
            }
        });
    };

    // Functions to manage videos on the search page

    // Gets the IDs of all created players
    $scope.getPlayerIDs = function(selectorClass) {
        // console.log('getPlayerIDs called...');
        var playersByClass = $('.'+selectorClass).get();
        var playerIDs = [];
        var thisLength = playersByClass.length;

        for( var i = 0; i < thisLength; i++ ) {
            var thisID,
                thisPlayer = playersByClass[i];
            if(thisPlayer.children && thisPlayer.children.length) {
                thisID = playersByClass[i].children[0].id;

                if(thisID) {
                    playerIDs.push(thisID);
                }
            }
        }
        return playerIDs;
    }

    // Function to stop players that are currently playing. Use this to
    // make sure that only one player is playing at a time. Pass the ID
    // of the player that should be playing
    $scope.stopPlaying = function(playerIDs, currentPlayer) {
        var thisLength = playerIDs.length;
        for(var i = 0; i < thisLength; i++) {
            var thisPlayer = playerIDs[i];

            if(thisPlayer != currentPlayer) {
                // console.log("Pausing & hiding player with ID", thisPlayer);
                _V_(thisPlayer).pause();
                $('#'+thisPlayer).parent().hide();
            } else {
                // console.log("Letting player", thisPlayer, "continue playing...");
            }
        }
    }

    $scope.playVideo = function(p,obj) {
        var playerIDs = [],
            playerID  = p.videoid,
            element   = $('#trigger-' + p.videoid).parent().parent();

        if (element.outerWidth() < 550) {
            $rootScope.playThisVideo = p.url;
            p.videourl = p.url;
            $rootScope.playThisVideoObj = p;
            $rootScope.EncodeUrlWithDash(obj.ProgrammeName,element,'program',obj.ChannelID,obj.ProgrammeID,obj.StartTime);
//            $location.path("/programme/"+ obj.ProgrammeID +"/channel/"+obj.ChannelID);
//            return false;
        }

        // check if player is built
        if($("#"+playerID).length){
            // show the player and start playback
            element.find('.player').show();
            _V_(playerID).play();
            playerIDs = $scope.getPlayerIDs('player');
            $scope.stopPlaying(playerIDs, playerID);
            return false;
        }
        // create html player structure
        var $playerHTML = $('<video>')
            .attr({id:playerID, width:170, height:130})
            .addClass('video-js vjs-default-skin');

        var $playerSource = $("<source></source>")
            .attr("src", p.url)
            .attr("type", "video/mp4");

        $playerHTML.append($playerSource);
        element.find('.player').append($playerHTML);
        var videoJS = _V_(playerID, {
            "controls": true,
            "autoplay": true,
            "preload": "auto"
        }).addEvent("ended", function(){
                // hide the player
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
                else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                }
                else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                }
                element.find('.player').hide();
            });

        playerIDs = $scope.getPlayerIDs('player');
        $scope.stopPlaying(playerIDs, playerID);
    }

    var params = {
        searchvalue: $rootScope.searchQuery.text
    };
    $scope.$emit('search:make', params);

    if(angular.isUndefined($routeParams.ismovie)){

        //Channel Search
        userAPI.searchChannel( search_params, function(rs) {

            if(!rs.searchdetails)
                return false;

            if(! _.isArray(rs.searchdetails.searchdata)){
                rs.searchdetails.searchdata.type = "channel";
                $scope.searchResults.channels.push(rs.searchdetails.searchdata);
            }
            else{
                _.each(rs.searchdetails.searchdata, function(c) {
                    c.type = "channel";
                });
                $scope.searchResults.channels = rs.searchdetails.searchdata;
            }

            // updates counter
            $scope.$emit("search:updateCount", $scope.searchResults);
        });

        //CHANNEL Search
        userAPI.searchCast( search_params, function(rs) {

            if(!rs.searchdetails)
                return false;

            if(! _.isArray(rs.searchdetails.searchdata)){
                rs.searchdetails.searchdata.type = "cast";
                $scope.searchResults.casts.push(rs.searchdetails.searchdata);
                $rootScope.storeActorNameAndId = [];
                angular.forEach($scope.searchResults.casts,function(actor){
                    $rootScope.storeActorNameAndId.push({name: actor.castname,id: actor.castid});
                });
            }
            else{
                _.each(rs.searchdetails.searchdata, function(c) {
                    c.type = "cast";
                });
                $scope.searchResults.casts = rs.searchdetails.searchdata;
                $rootScope.storeActorNameAndId = [];
                angular.forEach($scope.searchResults.casts,function(actor){
                    $rootScope.storeActorNameAndId.push({name: actor.castname,id: actor.castid});
                });
            }
            // updates counter
            $scope.$emit("search:updateCount", $scope.searchResults);
        });
    }


}]);
