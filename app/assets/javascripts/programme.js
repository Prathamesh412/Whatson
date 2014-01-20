woi.controller("ProgrammeController", ['$scope', '$rootScope', '$routeParams', '$timeout','$location', 'userAPI', '$http', '$filter','userList','$route', function($scope, $rootScope, $routeParams, $timeout, $location, userAPI,$http,$filter,userList,$route){

    $rootScope.$broadcast('handleResetEmit');
    // Reset the searh boxes
    $('#mainSearch').css('background-color','transparent');
    if( !$('html').hasClass('ie9') ) {
        $('#mainSearch').val('');
        $('#searchBoxBottom').val('');
    }
    console.log('proge page === $rootScope.programmeStartTime == ',$rootScope.programmeStartTime);

    if(!!$rootScope.programmeStartTime){
        $rootScope.thisStartTime  = $rootScope.programmeStartTime.replace('T', ' ').split('+')[0];
    }else{
        //$rootScope.thisStartTime  = '1900-01-01 00:00:00';
        $rootScope.thisStartTime  = '';
    }

//    $rootScope.programmeStartTime = null;

    if( angular.isUndefined($routeParams.channelid) || !$routeParams.channelid.length ) {
        $routeParams.channelid = 0;
    }

    $scope.channelid   =  $rootScope.channelid;
    $scope.programmeid = $routeParams.programmeid;
    // $rootScope.thisStartTime = '';


    var getFullDetails = function(){
        //Main Controller here
        var params = {
            programmeid : $rootScope.Programmeid,       //Prathamesh-Changes here to be done
            channelid   :  $rootScope.channelid,
            starttime   : $rootScope.thisStartTime,
            userid      : $rootScope.getUser().userid
        };

        $scope.fullProgrammeDetail = [];
        userAPI.fullProgrammeDetail(params, function(rs) {
            $routeParams.channelname=rs.getfullprogrammedetails.fullprogrammedetails.channelname;
            // Wrong programme id passed
            if(_.isUndefined(rs.getfullprogrammedetails)){
                $scope.fullProgrammeDetail = null;
                return false;
            }

            // Using this var in order to print stuff in view
            $scope.fullProgrammeDetail = rs.getfullprogrammedetails.fullprogrammedetails;
            if( !$scope.fullProgrammeDetail.popularityindex ) {
                $scope.fullProgrammeDetail.popularityindex = '0';
            }

            $rootScope.programmeDetailForWatchlist = $scope.fullProgrammeDetail;
            // Check the $rootScope.exclusives array to check if the current programme is an exclusive from the homepage
            // If so, set the appropriate flag to true
            var pID = $scope.fullProgrammeDetail.programmeid;

            if( $rootScope.exclusives.indexOf(pID) != -1 ) {
                $scope.fullProgrammeDetail.showExclusive = true;
            } else {
                $scope.fullProgrammeDetail.showExclusive = false;
            }

            $rootScope.exclusives = [];

            $scope.findDuration = function (starttime, endtime){
                var hours = 0 ;
                if(!starttime || !endtime ) {
                    return "??:??";
                }

                endtime = endtime.substring(0, endtime.length - 6).replace(/\-/g,'\/').replace(/[T|Z]/g,' ');
                starttime = starttime.substring(0, starttime.length - 6).replace(/\-/g,'\/').replace(/[T|Z]/g,' ');
                minutes = Math.abs(new Date(endtime).getTime() - new Date(starttime).getTime());

                minutes = (  Math.floor((minutes/1000)/60) );


                if(isNaN(minutes)) {
                    return "??:??";
                    return false;
                }

                if(minutes < 60) {
                    minutes = ((minutes+"").length >1)? minutes : "0"+minutes;
                    return minutes+" minutes";
                }

                hours = parseInt(minutes / 60);
                minutes = parseInt(minutes % 60);
                hr_text = (hours>1) ? " hours":" hour";
                minute_text = (minutes>1) ? " minutes":" minute";
                minutes = ((minutes+"").length >1)? " "+minutes : " 0"+minutes;
                return hours+hr_text+minutes+minute_text;
            };


            $scope.$on("sync:nextSchedulePrograms",function(event,reminderList){
                if(!_.isUndefined(reminderList)){
                    $scope.syncReminderObject = _.some(reminderList,function(item){
                        return item.isreminder == "1";
                    });
                    if($scope.syncReminderObject){
                        $scope.fullProgrammeDetail.isreminder = "1";
                    }
                    else{
                        // $scope.fullProgrammeDetail.isreminder = "0";
                        userAPI.fullProgrammeDetail(params,function(rs){
                            $scope.fullProgrammeDetail.isreminder = rs.getfullprogrammedetails.fullprogrammedetails.isreminder;
                            if(!$scope.$$phase){
                                $scope.$apply();
                            }
                        });
                    }
                    if(!$scope.$$phase){
                        $scope.$apply();
                    }
                }
            });
            $scope.fullProgrammeDetail.duration = $scope.findDuration($scope.fullProgrammeDetail.starttime, $scope.fullProgrammeDetail.endtime);
            $rootScope.channelNo = $scope.fullProgrammeDetail.lcn;
            console.log('$rootScope.channelNo = ',$rootScope.channelNo);
            $scope.aboutTabText = 'View More';

            var _keys = [
                {
                    "keyLabel": 'Channel',
                    "keyValue": 'channelname'
                },
                {
                    "keyLabel": 'Duration',
                    "keyValue": 'duration'
                },
                {
                    "keyLabel": 'Genre',
                    "keyValue": 'genre'
                },
                {
                    "keyLabel": 'Language',
                    "keyValue": 'languagename'
                },
                {
                    "keyLabel": 'Actor',
                    "keyValue": 'actor'
                },
                {
                    "keyLabel": 'Director',
                    "keyValue": 'director'
                },
                {
                    "keyLabel": 'Rating',
                    "keyValue": 'mpaarating'
                },
                {
                    "keyLabel": 'Released',
                    "keyValue": 'released'
                },
                {
                    "keyLabel": 'Production Year',
                    "keyValue": 'productionyear'
                },
                {
                    "keyLabel": 'Sub-genre',
                    "keyValue": 'subgenre'
                }
            ];

            $scope.detailsToInclude = [];

            for(var i=0; i < _keys.length; i++) {
                if($scope.fullProgrammeDetail[_keys[i].keyValue] && $scope.fullProgrammeDetail[_keys[i].keyValue] != "0" && $scope.fullProgrammeDetail[_keys[i].keyValue] != "00 minutes" && $scope.fullProgrammeDetail[_keys[i].keyValue] != "??:??") { // if we have a value then add it
                    $scope.detailsToInclude.push({
                        key:_keys[i].keyLabel,
                        val:$scope.fullProgrammeDetail[_keys[i].keyValue]
                    });
                }
            }


            $scope.detailsToIncludePaginate = $scope.detailsToInclude.slice(0, 6);

            $scope.showMoreButton = true;

            if($scope.detailsToIncludePaginate.length == $scope.detailsToInclude.length){
                $scope.showMoreButton = false;
            }

            $scope.showMore = function(){
                if($scope.aboutTabText == 'Hide'){

                    $scope.detailsToIncludePaginate = $scope.detailsToInclude.slice(0, 6);
                    $scope.aboutTabText = 'View More';
                }
                else{
                    $scope.aboutTabText = 'Hide';

                    $scope.detailsToIncludePaginate = $scope.detailsToInclude;
                }
                setTimeout(function() {
                    $('.right-about').css('height',$('.left-about').css('height'));
                },0)
            };



            $scope.twitterHandle = rs.getfullprogrammedetails.fullprogrammedetails.twitterhandle;
            $scope.facebookHandle = rs.getfullprogrammedetails.fullprogrammedetails.facebookhandle;


            console.log('$scope.twitterHandle = ',$scope.twitterHandle);
            console.log('$scope.facebookHandle = ',$scope.facebookHandle);

            if($scope.facebookHandle == null || $scope.facebookHandle == 'null'){
                $scope.showFacebook = false;
            }else{
                if($scope.facebookHandle.length>1){
                    $scope.showFacebook = true;
                    getFbFeed();
                }else{
                    $scope.showFacebook = false;
                }
            }

            if($scope.twitterHandle == null || $scope.twitterHandle == 'null'){
                $scope.showTwitter = false;
            }else{
                if($scope.twitterHandle.length>1){
                    $scope.showTwitter = true;
                    getTwitterFeed();
                }else{
                    $scope.showTwitter = false;
                }
            }

            // sets the text for affinityindex /affinityicon
            if($scope.affinityindex < 2 ){
                $scope.fullProgrammeDetail.affinitytext = 'Poor';
                $scope.fullProgrammeDetail.affinityicon = 'poor' ;
            } else if($scope.affinityindex > 4){
                $scope.fullProgrammeDetail.affinitytext = 'Excellent';
                $scope.fullProgrammeDetail.affinityicon = 'ex' ;
            }
            else{
                $scope.fullProgrammeDetail.affinitytext = 'Good';
                $scope.fullProgrammeDetail.affinityicon = 'ex' ;
            }

            setTimeout(function() {
                $('.right-about').css('height',$('.left-about').css('height'));
            },0);

        });
    };


    // if($scope.channelid == 0){
    //   $rootScope.thisStartTime = '1900-01-01 00:00:00';
    // }
    getFullDetails();

    // else{
    //   // Code to pick up the starttime for the requested show
    //   userAPI.getProgramme({programmeid:$routeParams.programmeid, channelid:$routeParams.channelid, userid:$rootScope.getUser().userid}, function(rd) {

    //     if(!rd.getprogrammedetails){
    //       $rootScope.thisStartTime = '1900-01-01 00:00:00';
    //       getFullDetails();
    //     }

    //     else {

    //       $rootScope.thisStartTime = rd.getprogrammedetails.programmedetailslist.starttime;
    //       console.log('$rootScope.thisStartTime ===',$rootScope.thisStartTime);
    //       /*
    //        * The time is returned in the format YYYY-MM-DDTHH:MM:SS+HH:MM
    //        * We need it in YYYY-MM-DD HH:MM:SS. If they fix this in the API, just
    //        * Remove the following line and it'll function as normal
    //        */
    //       $rootScope.thisStartTime = $rootScope.thisStartTime.replace('T', ' ').split('+')[0];

    //       getFullDetails();
    //     }

    //   });
    // }

    $scope.programmeCast = [];
    $scope.paginate      = [];
    $scope.amount        = 0;
    $scope.step          = 5;

    $scope.showMore = true;

    $scope.loadMore = function(){

        if(!$scope.programmeCast.length)

            return false;
        $scope.amount= $scope.amount + $scope.step;

        if($scope.amount >= $scope.programmeCast.length){
            $scope.amount = $scope.programmeCast.length;
        }

        $scope.paginate = $scope.programmeCast.slice(0, $scope.amount);
    };

    userAPI.castNcrew({programmeid:$rootScope.Programmeid}, function(rs) {
        $scope.checked=true;                                                 //cast and crew hidden with ng-hide
        // console.log('CAST n CREW .....',rs);
        // Wrong programme id passed
        if(!rs.getprogrammecast){
            $scope.programmeCast = [];
            return false;
        }

        $scope.programmeCast = addData(rs.getprogrammecast.programmecast);
        $rootScope.storeActorNameAndId = [];
        angular.forEach($scope.programmeCast,function(actor){
            if(actor.castname)

            {                                                                                 //cast and crew hidden implemented
                $scope.checked=false;
                $rootScope.storeActorNameAndId.push({name: actor.castname,id: actor.castid});
            }
        }) ;
        $scope.loadMore();

    });

    $scope.infotab = 0;


    var getTwitterFeed = function(){
        // console.log("Twitter Handle ---->"+$scope.twitterHandle);
        $http({
                method: 'JSONP',
                url: 'http://api.twitter.com/1/statuses/user_timeline.json',
                params:{
                    screen_name:$scope.twitterHandle,
                    count: '10',
                    callback:'JSON_CALLBACK'
                }
            }
        )
            .success(function(data, status) {
                console.log('got twitter response');
                $scope.twitterResponse = data;

                if(!$scope.twitterResponse || !($scope.twitterResponse.length)) {
                    $scope.showTwitter = false;
                    return;
                }

                $scope.paginateTwitter = $scope.twitterResponse.slice(0, 2);
            })
            .error(function(data, status) {
                $scope.data = data || "Request failed";
                $scope.status = status;
            });

    };

    var getFbFeed = function(){

        userAPI.getFBAccessToken({}, function(rs){

            console.log('got the access_token .... ',rs);

            var access_token = 'access_token='+rs.access_token;

            $http({
                    method: 'JSONP',
                    url: 'https://graph.facebook.com/'+$scope.facebookHandle+'/posts?'+access_token,
                    params:{
                        limit:10,
                        callback:'JSON_CALLBACK'
                    }
                }
            )
                .success(function(data, status) {
                    console.log('fb response === ',data);
                    $scope.facebookResponse = data.data;

                    if(!$scope.facebookResponse || !($scope.facebookResponse.length)){
                        $scope.showFacebook = false;
                        return;
                    }
                    $scope.paginateFb = $scope.facebookResponse.slice(0, 2);
                })
                .error(function(data, status) {
                    // console.log("ERROR in fetching facebook feed");
                });

        });

        // $.get('https://graph.facebook.com/oauth/access_token?type=client_cred&client_id=303987246384508&client_secret=4c7a41faef68263a62f56a4a78298407&callback=text',

        //   function(access_token) {

        //       $http({
        //         method: 'JSONP',
        //         url: 'https://graph.facebook.com/'+$scope.facebookHandle+'/posts?'+access_token,
        //         params:{
        //           limit:10,
        //           callback:'JSON_CALLBACK'
        //         }
        //       }
        //     )
        //     .success(function(data, status) {
        //       $scope.facebookResponse = data.data;

        //       if(!$scope.facebookResponse || !($scope.facebookResponse.length)){
        //         $scope.showFacebook = false;
        //         return;
        //       }
        //       $scope.paginateFb = $scope.facebookResponse.slice(0, 2);
        //     })
        //     .error(function(data, status) {
        //       // console.log("ERROR in fetching facebook feed");
        //     });
        // });


        // fetch the profile pic for facebook
        $http({
            method: 'JSONP',
            url: 'http://graph.facebook.com/'+$scope.facebookHandle+'/?fields=picture&type=small',
            params:{
                callback:'JSON_CALLBACK'
            }
        }).success(function(data, status) {
                if(typeof(data.picture)=="undefined"){
                    $scope.facebookProfilePic = "";
                    return;
                }

                $scope.facebookProfilePic = data.picture.data.url;
            }).error(function(data, status) {
                // console.log("ERROR in fetching Profile Pic");
                $scope.facebookProfilePic = "";
            });
    };

    // TWITTER
    $scope.paginateTwitter = [];
    $scope.twitterText     = 'View More';


    $scope.loadMoreTweets = function(){

        if($scope.twitterText == 'View More'){
            $scope.twitterText = 'View Less';
            $scope.paginateTwitter = $scope.twitterResponse;
        }else{
            $scope.twitterText = 'View More';
            $scope.paginateTwitter = $scope.twitterResponse.slice(0, 2);
        }
    };

    // Facebook
    $scope.paginateFb = [];
    $scope.fbText     = 'View More';

    $scope.loadMoreFb = function(){

        if($scope.fbText == 'View More'){
            $scope.fbText = 'View Less';
            $scope.paginateFb = $scope.facebookResponse;
        }else{
            $scope.fbText = 'View More';
            $scope.paginateFb = $scope.facebookResponse.slice(0, 2);
        }
    };





    $scope.shareLinkOnFb = function(){                            //Link on facebook -Prathamesh

        if ($rootScope.getUser().SocialSharing != "true") {
            alert("Social Sharing is disabled. Please enable Social Sharing in Myaccounts to share the watchlist");
            return false;
        }

        console.log('check this....',$scope.fullProgrammeDetail);

        var shareURL    = $location.absUrl();
        var progName    = $scope.fullProgrammeDetail.programmename;
        var subgenre    = $scope.fullProgrammeDetail.subgenre;
        var description = $scope.fullProgrammeDetail.synopsis;
        var pic         = $scope.fullProgrammeDetail.imagefilepath;

        FB.ui({
            method              : 'stream.publish',
            link                : shareURL,
            user_message_prompt : 'Post this to your wall?',
            picture             : pic,
            name                : progName,
            caption             : subgenre,
            description         : description
            // redirect_uri: redirectURL
        });
    };

    $rootScope.$on('programme:syncReminder', function(event, args) {
        var thisItem    = args.item,
            pID         = thisItem.programmeid,
            cID         = thisItem.channelid,
            rID         = thisItem.reminderid,
            sTime       = thisItem.starttime,
            newReminder = thisItem.isreminder;

        // Sync values in the Featured Videos section
        if( $scope.fullProgrammeDetail.programmeid == pID && $scope.fullProgrammeDetail.starttime == sTime ) {
            $scope.fullProgrammeDetail.isreminder = newReminder;
            $scope.fullProgrammeDetail.reminderid = rID;
            // console.log('$scope.fullProgrammeDetail.programmeid == pID');
        }
    });


}]);

woi.controller("ProgrammeFeaturedVideosController", ['$scope','$location','$rootScope' , '$routeParams', 'userAPI','$timeout', function($scope, $location, $rootScope, $routeParams, userAPI,$timeout){

    var isSpanVisible = false;
    userAPI.programmeVideoGallery({programmeid:$rootScope.Programmeid, userid:$rootScope.getUser().userid}, function(rs) {
        console.log($rootScope.Programmeid);
        var $featured = $(".featured").hide();

        if(rs.getprogrammevideogallery) {
            var maxItems = 10;


            $scope.featuredVideos = [];
            // load featured videos list
            // remove rando page after API adjusts
            //userAPI.featuredProgramme({pageno:(Math.floor(Math.random() * 4) + 1)},function(rs){
            var videos = addData( rs.getprogrammevideogallery.programmevideogallery ),
                channelVideos = [];

            if ((!_.isUndefined($rootScope.playThisVideoObj) && $rootScope.playThisVideoObj != "")) {
                videos = addData( $rootScope.playThisVideoObj );
            }

            _.each( videos, function(v, index){
                if( v && v.channelid ==  $rootScope.channelid) {
                    channelVideos.unshift( v );
                } else {
                    channelVideos.push( v );
                }
            });

            var count = 0;
            $scope.featuredVideos =  channelVideos.slice(0,maxItems);

            var currentVideo = 0;
            var hasVideo  = false;
            // sets Id's for the slides in order to control their user Action menu
            _.each($scope.featuredVideos, function(v,index) {
                v.slideid = count++;
                if (!_.isUndefined($rootScope.playThisVideo) && $rootScope.playThisVideo != "") {
                    if ($rootScope.playThisVideo == v.videourl) {
                        currentVideo = index;
                        hasVideo = true;
                    }
                }
            });

            // if (!hasVideo && (!_.isUndefined($rootScope.playThisVideoObj) && $rootScope.playThisVideoObj != "")) {
            //   var newFeaturedVideo = $rootScope.playThisVideoObj;
            //   newFeaturedVideo.slideid = $scope.featuredVideos.length;
            //   $scope.featuredVideos.push(newFeaturedVideo);
            //   currentVideo = newFeaturedVideo.slideid;
            //   $rootScope.playThisVideoObj = "";
            // }
            // called with timeout for dom creation
            setTimeout(function(){
                $featured.show();
                $featured.find(".item:eq(0)").addClass("active");
                $featured.find(".item-content:eq(0)").addClass("active");
                // console.log("Page modified");
                // if (!_.isUndefined($rootScope.playThisVideo) && $rootScope.playThisVideo != "") {
                //   $featured.find('.carousel').carousel({interval:false});
                //   $featured.find('.carousel').carousel(currentVideo);
                //   setTimeout(function(){
                //     $featured.find('.carousel .item:nth-child('+ (currentVideo + 1) +') .play').hide();
                //     $featured.find('.carousel .item:nth-child('+ (currentVideo + 1) +') .player').trigger("click");
                //   },500);
                //   $rootScope.playThisVideo = "";
                var emptyThisPlayer = '';
                var isYoutubePlayer;
                // }else{
                $featured.find('.carousel').carousel({
                    interval:false
                }).on("slide", function(e){
                        // var hasVideo = parseInt($featured.find('.carousel-inner .active').attr('data-isvideo'));
                        // var hasYoutube = parseInt($featured.find('.carousel-inner .active').attr('data-isyoutube'));
                        // var youtubeURL = $featured.find('.carousel-inner .active').attr('data-youtubeurl');

                        isYoutubePlayer = parseInt($featured.find('.carousel-inner .active .player').attr('data-isyoutube'));

                        //console.log($featured.find('.carousel-inner .active .player'));

                        var iframeId = $featured.find('.carousel-inner .active .player iframe').attr('id');
                        emptyThisPlayer = $featured.find('.carousel-inner .active .player');
                        console.log($featured.find('.carousel-inner .active'));

                        if(isYoutubePlayer){

                            if(($.browser.msie))
                            {
                                callPlayer(iframeId, function() {
                                    callPlayer(iframeId, "stopVideo");
                                    emptyThisPlayer.html('');
                                    injectYT($featured.find('.carousel-inner .active'), $featured.find('.carousel-inner .active').attr('data-youtubeurl'))
                                });
                            }
                            else
                            {
                                callPlayer(iframeId, function() {
                                    callPlayer(iframeId, "stopVideo");
                                });
                            }

                        }



                    });

                $featured.find('.carousel').carousel({
                    interval:false
                }).on("slid", function(e){

                        var hasVideo = parseInt($featured.find('.carousel-inner .active').attr('data-isvideo'));
                        var hasYoutube = parseInt($featured.find('.carousel-inner .active').attr('data-isyoutube'));
                        var youtubeURL = $featured.find('.carousel-inner .active').attr('data-youtubeurl');

                        if(!isYoutubePlayer){
                            emptyThisPlayer.html('');
                        }

                        if(hasVideo){
                            if(!hasYoutube)
                                $featured.find('.carousel-inner .active span.play').show();
                        }else{
                            $featured.find('.carousel-inner .active span.play').hide();
                        }

                        var currentSlideId =  $featured.find('.carousel-inner .active').attr('data-slideid');
                        $('.item-content').removeClass('active');
                        $('.item-content[data-actionsid='+currentSlideId+']').addClass('active');
                    });


                if ((!_.isUndefined($rootScope.playThisVideoObj) && $rootScope.playThisVideoObj != "")){

                    $featured.find('.carousel .item:nth-child('+ (currentVideo + 1) +') .play').hide();
                    $featured.find('.carousel .item:nth-child('+ (currentVideo + 1) +') .play').trigger("click");
                    $rootScope.playThisVideo = "";
                    $rootScope.playThisVideoObj = "";
                }


                // console.log("false");
                // $featured.find('.carousel').carousel({interval:false});
                // $featured.find('.carousel').carousel(3);
                // console.log($featured.find('.carousel .active'));
                // setTimeout(function(){

                // $featured.find('.carousel .item:nth-child(4) .player').trigger("click");
                // },100);
                // }

            },5);
            //});
        }
        else{
            return false;
        }
    });

    $scope.$on("appendAndPlayThisVideo",function(event){
        var newFeaturedVideo = $rootScope.playThisVideoObj;
        newFeaturedVideo.slideid = $scope.featuredVideos.length;
        $scope.featuredVideos.push(newFeaturedVideo);
        var currentVideo = newFeaturedVideo.slideid;
        $rootScope.playThisVideoObj = "";

        setTimeout(function(){
            var $featured = $(".featured");
            $featured.find('.carousel').carousel(currentVideo);
            $featured.find('.carousel .item:nth-child('+ (currentVideo + 1) +') .play').hide();
            $featured.find('.carousel .item:nth-child('+ (currentVideo + 1) +') .player').trigger("click");
        },1000);
        $rootScope.playThisVideo = "";
    });

    $scope.$on("PlaythisVideo",function(event){
        $scope.featuredVideos = [$rootScope.playThisVideoObj];
        $timeout(function(){
            var $featured = $(".featured");
            $featured.find('.carousel .item:nth-child(1)').addClass("active");
            $featured.find('.carousel-actions .item-content:nth-child(1)').addClass("active");
            $('body,html').queue('fx', []).animate({
                scrollTop: $featured.find('.carousel .item:nth-child(1)').offset().top
            }, 500);
            $featured.find('.carousel .item:nth-child(1) .play').hide();
            $featured.find('.carousel .item:nth-child(1) .play').trigger("click");
            $featured.find('.carousel .item:nth-child(1)');
            // console.log($featured.find('.carousel .item:nth-child(1)').offset().top);
        },5);
        $rootScope.playThisVideo = "";
        $rootScope.playThisVideoObj = "";
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    });

    $rootScope.$on('programme:syncReminder', function(event, args) {
        var thisItem    = args.item,
            pID         = thisItem.programmeid,
            cID         = thisItem.channelid,
            rID         = thisItem.reminderid,
            sTime       = thisItem.starttime,
            newReminder = thisItem.isreminder;

        // Sync values in the Featured Videos section
        _.each($scope.featuredVideos, function(o) {
            if( o.programmeid == pID && o.starttime == sTime ) {
                o.isreminder = newReminder;
                o.reminderid = rID;
                // console.log('featuredVideos');
            }
        });
    });


}]);

woi.controller("SimilarProgrammesController", ['$scope', '$location','$rootScope', '$routeParams', '$filter', 'userAPI','userList', function($scope, $location, $rootScope, $routeParams, $filter, userAPI,userList){
    $scope.recommended = [];
    $scope.paginate = [];

    $scope.amount  = 0;
    $scope.step    = 2;

    $scope.showMore = true;
    $scope.loadMore = function(){
        if(!$scope.similarProgrammes.length)
            return false;
        $scope.amount= $scope.amount + $scope.step;

        if($scope.amount >= $scope.similarProgrammes.length){
            $scope.showMore = false;
            $scope.amount = $scope.similarProgrammes.length;
        }

        $scope.paginate = $scope.similarProgrammes.slice(0, $scope.amount);
    };

    userAPI.similarProgrammes({programmeid:$rootScope.Programmeid, userid: $rootScope.getUser().userid}, function(rs){
        if(!rs.getsimilarprogramme)
            return false;
        $scope.similarProgrammes = rs.getsimilarprogramme.similarprogrammelist;

        $scope.loadMore();
    });
}]);

woi.controller("NextScheduleController", ['$scope', '$location','$rootScope', '$routeParams', '$filter', 'userAPI', '$timeout', function($scope, $location,$rootScope, $routeParams, $filter, userAPI, $timeout){
    $scope.recommended = [];
    $scope.paginate    = [];
    $scope.loading     = true;
    $scope.loadError = false;

    $scope.amount   = 0;
    $scope.step     = 4;
    $scope.showMore = true;

    var loading = $filter('loading');
    loading('show', { element: $('.next-schedule #loadIndicator') });

    $scope.loadMore = function(){

        if(!$scope.nextSchedule.length)
        {

            return false;
        }

        $scope.amount = $scope.amount + $scope.step;

        if($scope.amount >= $scope.nextSchedule.length){

            $scope.showMore = false;
            $scope.amount   = $scope.nextSchedule.length;
        }

        $scope.paginate = $scope.nextSchedule.slice(0, $scope.amount);

    };

    $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };
    $scope.getNextSchedule = function() {
        userAPI.nextSchedule({programmeid:$rootScope.Programmeid, userid: $rootScope.getUser().userid}, function(rs){
            if(!rs.getmoreprogrammeschedule || !rs.getmoreprogrammeschedule.moreprogrammeschedulelist){

                loading('hide', { element: $('.next-schedule #loadIndicator') });
                $('.next-schedule #loadIndicator').css('display','none');

                // $scope.safeApply(function(){
                $scope.loadError = true;
                // });

                return false;
            }

            $scope.nextSchedule = addData( rs.getmoreprogrammeschedule.moreprogrammeschedulelist );

            $timeout(function(){
                //For setting Reminder & watchlist
                _.each($scope.nextSchedule, function(v) {
                    v.programmeid = v.ProgrammeID;
                    if (!_.isUndefined($rootScope.programmeDetailForWatchlist)) {
                        v.programmename = $rootScope.programmeDetailForWatchlist.programmename;
                        v.imagefilepath = $rootScope.programmeDetailForWatchlist.imagefilepath;
                        v.iswatchlist = $rootScope.programmeDetailForWatchlist.iswatchlist;
                        v.isfavorite = $rootScope.programmeDetailForWatchlist.isfavorite;
                    }
                },1000);
                $rootScope.programmeDetailForWatchlist = undefined;
                $scope.loadMore();
                // Hide loading indicator
                loading('hide', { element: $('.next-schedule #loadIndicator') });
                $scope.loading = false;
            });
        });
    };

    $scope.getNextSchedule();

    $rootScope.$on('programme:syncReminder', function(event, args) {
        var thisItem    = args.item,
            pID         = thisItem.programmeid,
            cID         = thisItem.channelid,
            rID         = thisItem.reminderid,
            sTime       = thisItem.starttime,
            newReminder = thisItem.isreminder;

        // Sync values in the Next Schedule section
        _.each($scope.nextSchedule, function(o) {
            if( o.programmeid == pID && o.starttime == sTime ) {
                o.isreminder = newReminder;
                o.reminderid = rID;
                // console.log('nextSchedule');
            }
        });
    });
}]);

woi.controller("AvailableInController", ['$scope', '$rootScope', '$routeParams', '$filter', 'userAPI', function($scope, $rootScope, $routeParams, $filter, userAPI){

    $scope.availableIn = [];
    $scope.showAvailableIn = true;

    // Maximum number of elements to show
    $scope.cutoff = 8;

    userAPI.availableIn({programmeid:$rootScope.Programmeid, channelid: $rootScope.channelid}, function(rs){
        if(!rs.getstoresavailability){
            $scope.showAvailableIn = false;
            return false;
        }

        $scope.availableIn = addData( rs.getstoresavailability.storesavailability );
        $scope.availableIn = $scope.availableIn.slice(0, $scope.cutoff);

        $scope.showAvailableIn = true;
    });
}]);

woi.controller("FriendsController", ['$scope', '$rootScope', '$routeParams', '$filter', 'userAPI', function($scope, $rootScope, $routeParams, $filter, userAPI){
    $scope.recommended = [];
    $scope.paginate    = [];         //Changes to be made for facebook likes automatic --Prathamesh
    $scope.friends     = [];

    $scope.amount   = 0;
    $scope.step     = 5;
    $scope.showMore = true;

    if($rootScope.device.isTablet){
        $scope.step = 30;
    }
    if($rootScope.device.isMobile){
        $scope.step = 20;
    }

    $scope.loadMore = function(){
        if(!$scope.friends.length)
            return false;
        $scope.amount= $scope.amount + $scope.step;

        if($scope.amount >= $scope.friends.length){
            $scope.showMore = false;
            $scope.amount   = $scope.friends.length;
        }

        $scope.paginate = $scope.friends.slice(0, $scope.amount);
    };
    userAPI.friends({programmeid:$rootScope.Programmeid}, function(rs){
        console.log("**********************like");
        console.log(rs);
        if(!rs.getpeoplielikeprogram)
            return false;

        $scope.friends = addData(rs.getpeoplielikeprogram.peoplielikeprogram);

        $scope.loadMore();
    });
}]);

woi.controller('ProgramDetailsTabController', ['$scope','$location','$rootScope', '$routeParams', '$timeout', '$filter', 'userAPI', function($scope, $location, $rootScope, $routeParams, $timeout, $filter, userAPI){
    $scope.channelid =  $rootScope.channelid;
    var loading      = $filter('loading');
    var $channelTabs = $(".channel-tabs").hide();
    var $tabButtons;
    var $tabs;
    var $moreButtons;
    var openTabIndex;
    $scope.isweb = true;
    $scope.isepi = true;
    $scope.ispromo = true;
    // $scope.web_epi_visiblity = true;
    // escope filter methods
    var addZero   = $filter('addZero');
    var isoToDate = $filter('isoToDate');

    var recsReady = false,
        promosReady = false,
        episodesReady = false,
        webReady = false,
        userInteracted = false;

    $scope.elements = function() {
        $tabButtons  = $channelTabs.find(".tab-btn");
        $tabs        = $channelTabs.find(".tab");
        $moreButtons = $channelTabs.find(".more");
        $tabTriggers = $channelTabs.find("> ul li");
    };

    // Function checks to see if all the APIs have responded
    function tabsReady() {
        // If the user has already interacted, then disable the automatic tab selection behavior
        if(userInteracted) return false;

        // If the user isn't logged in, set recsReady as true for conformity
        if( !$rootScope.isUserLogged() ) {
            recsReady = true;
        }
        // console.log('tabsReady', recsReady, promosReady, episodesReady, webReady);
        // Mark all tabs as ready by checking their individual states
        var tabsReady = ( recsReady && promosReady && episodesReady && webReady );

        // We don't want one delayed request to cause a blank screen, so show the first
        // tab that is visible on each check.
        $timeout(function(){
            var tabCount = $tabTriggers.length;
            for(var i = 0; i < tabCount; i++) {
                if( $tabTriggers.eq(i).is(':visible') ) {
                    // console.log($tabTriggers.eq(i), i);
                    showTab(i);
                    break;
                } else {
                    // console.log('Index', i, 'is hidden');
                }
            }
        });

        // Return the value of tabsReady for debugging purposes
        return tabsReady;
    }

    $scope.elements();

    $scope.programs = {
        yourrecs:[],
        promos:[],
        episodes:[],
        web:[]
    };

    $scope.loadYourRecs = function() {
        if($rootScope.isUserLogged())
            userAPI.yourChannelRecs( {userid:$rootScope.getUser().userid, channelid:$scope.channelid}, function(r) {
                recsReady = true;
                tabsReady();
                if(!r.getsimilarchannelprogramme){
                    $scope.programs.yourrecs = 0;
                    setTimeout(function(){
                        showMoreOnTab(0);
                    }, 5);
                    return false;
                }

                $scope.programs.yourrecs = addData(r.getsimilarchannelprogramme.similarchannelprogrammelist);

                for(i=0; i<$scope.programs.yourrecs.length; i++){
                    //abbreviates the month
                    $scope.programs.yourrecs[i].timestring = abbrMonth($scope.programs.yourrecs[i].timestring) ;
                }

                $scope.programs.yourrecs = _.reject($scope.programs.yourrecs, function(obj){
                    return obj.programmeid == $rootScope.Programmeid;
                });

                // called with timeout for dom creation
                setTimeout(function(){
                    showMoreOnTab(0);
                }, 5);
            });
    };

    $scope.loadPromos = function(){
        // call api
        userAPI.promos({programmeid:$rootScope.Programmeid}, function(r){
            promosReady = true;
            tabsReady();
            if(!r.getpromovideos) {
                $scope.ispromo = false;
                setTimeout(function(){
                    showMoreOnTab(1);
                }, 5);
                return false;
            }
            $scope.ispromo = true;
            $scope.programs.promos = addData(r.getpromovideos.promovideolist);

            for(i=0; i<$scope.programs.promos.length; i++){
                //abbreviates the month
                $scope.programs.promos[i].timestring = abbrMonth($scope.programs.promos[i].timestring) ;
            }
            // called with timeout for dom creation
            setTimeout(function(){
                showMoreOnTab(1);
            }, 5);
        });
    };

    $scope.loadEpisodes = function(){
        // call api
        userAPI.episodesList({programmeid:$rootScope.Programmeid}, function(r){
            episodesReady = true;
            tabsReady();
            if( !r.getepisodevideos ){
                $scope.isepi = false;
                $scope.tablet_visibility();
                setTimeout(function(){
                    showMoreOnTab(2);
                }, 5);
                return false;
            }
            $scope.isepi = true;
            $scope.programs.episodes = addData(r.getepisodevideos.episodevideolist);
            $scope.tablet_visibility();
            for(i=0; i<$scope.programs.episodes.length; i++){
                //abbreviates the month
                // $scope.programs.episodes[i].timestring = abbrMonth($scope.programs.episodes[i].timestring) ;
            }
            // called with timeout for dom creation
            setTimeout(function(){
                showMoreOnTab(2);
            }, 5);
        });
    };

    $scope.loadWeb = function(){
        // call api
        userAPI.webVideos({programmeid:$rootScope.Programmeid}, function(r){
            webReady = true;
            tabsReady();
            if( !r.getwebvideos ){
                $scope.isweb = false;
                $scope.tablet_visibility();
                setTimeout(function(){
                    showMoreOnTab(3);
                }, 5);
                return false;
            }
            $scope.isweb = true;
            $scope.programs.web = addData(r.getwebvideos.webvideolist);
            $scope.tablet_visibility();

            for(i=0; i<$scope.programs.web.length; i++){
                //abbreviates the month
                $scope.programs.web[i].timestring = abbrMonth($scope.programs.web[i].timestring) ;
            }
            // called with timeout for dom creation
            setTimeout(function(){
                showMoreOnTab(3);
            }, 5);
        });
    };



    $scope.init = function(){

        $scope.loadPromos();
        $scope.loadEpisodes();
        $scope.loadWeb();

        /*
         * Check if user is logged in, if so load Recommended and show first tab
         * Otherwise, show second tab
         */
        if($rootScope.isUserLogged()) {
            $scope.loadYourRecs();
        }

        // setTimeout(function(){$tabs.find('.item').show();}, 1000); //@TODO this needs to be done properly. it's a temporary fix
    };

    // show current tab
    function showTab(index, newindex){
        // highlight corret button
        $tabButtons.removeClass('active');
        $tabButtons.eq(index).addClass('active');
        // $moreButtons.css('background-position','0 -542px'); // default image is +
        $moreButtons.removeClass('less');
        $tabs.hide().eq(index).show();
        openTabIndex = index;

        checkIfItemsAreDisplayed(index);
    }

    /*
     Function to check if all items are displayed, if yes, then hide +/- icon.
     */
    function checkIfItemsAreDisplayed(index){

        var $tab         = $tabs.eq(index);
        var $items       = $tab.find(".item");
        var totalItems   = $items.length;
        var visibleItems = $items.filter(":visible").length;
        var displayLimit = (Modernizr.mq("screen and (min-width:768px) and (max-width:1024px)"))? 4:6;

        if(totalItems > 0 && totalItems > displayLimit) {
            // if(totalItems == visibleItems || !totalItems || totalItems <= displayLimit){
            if(totalItems == visibleItems) {
                $moreButtons.addClass('less');
            }
            $moreButtons.show();
        }else{
            $moreButtons.hide();
        }
    }

    function showMoreOnTab(index){
        // display container
        $scope.elements();
        $channelTabs.show();
        // Show loading indicator
        var visibleMoreButtons = $moreButtons.filter(':visible').length;
        if(visibleMoreButtons) {
            $moreButtons.addClass('loading');
            loading('show', {element: $moreButtons});
        }

        var $tab          = $tabs.eq(index);
        var numberOfItems = (Modernizr.mq("screen and (min-width:768px) and (max-width:1024px)"))? 4:6;

        var $items            = $tab.find(".item");
        // retrive current page based in the amount of items displayed
        var currentPage       = Math.ceil($items.filter(":visible").length / numberOfItems);
        var currentPageLength = (currentPage * numberOfItems);
        var nextPageLength    = ((currentPage+1) * numberOfItems);

        // hide to original state
        if($items.filter(":visible").length == $items.length){
            // $moreButtons.css('background-position','0 -542px');
            $moreButtons.removeClass('less');
            $items.hide().filter(':lt(' + numberOfItems + ')').show();
            // Hide loading indicator
            loading('hide', {element: $moreButtons});
            $moreButtons.removeClass('loading');
            return false;
        }
        // display next page
        $items.filter(':lt(' + nextPageLength + ')').show();

        // Hide loading indicator
        loading('hide', {element: $moreButtons});
        $moreButtons.removeClass('loading');

        // All items are shown
        if(nextPageLength >= $items.length){
            // change the pic
            if($items.filter(":visible").length == $items.length){
                // $moreButtons.css('background-position','-154px -542px');
                $moreButtons.addClass('less');
            }
        }
    }



    // bind buttons events
    $tabButtons.live('click', function(e){
        e.preventDefault();
        $scope.elements();
        userInteracted = true;

        var openTabIndex = $tabButtons.index(this);
        $scope.currentActiveTab = '';

        // Recommended
        if(openTabIndex == 0){
            $scope.currentActiveTab = 'recs';
        }

        else if(openTabIndex == 1){
            $scope.currentActiveTab = 'promos';
        }

        else if(openTabIndex == 2){
            $scope.currentActiveTab = 'episodes';
        }

        else if(openTabIndex == 3){
            $scope.currentActiveTab = 'web';
        }

        showTab(openTabIndex);
    });

    $moreButtons.click(function(e){
        $scope.elements();
        showMoreOnTab($moreButtons.index(this));
        e.preventDefault();
    });

    $scope.addToFavorite = function(p){

        userAPI.toggleFavoriteProgramme({like:(p.isfavorite == "0"), programmeid:p.programmeid}, function(rs){
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
        // alert("Not yet");
        // return false;

        // can't apply code due to API error
        if(p.isreminder == "0"){
            var d = isoToDate(p.starttime);
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
            var data = {watchliststatus: true};

        if (_.isUndefined(p.videoid)) {
            data.contenttype = "program";
            data.contentid = p.programmeid;
            data.videoid = 0;
        } else{
            data.contenttype = "video";
            data.contentid = p.programmeid;
            data.videoid = p.videoid;
        }
        userAPI.toggleWatchlist(data, function(rs){
            if(!rs.response.responsestatus){
                alert(rs.response.message);
            } else {
                // change the flag
                p.iswatchlist = (p.iswatchlist == "0") ? "1" : "0";
            }
        });
    };

    $scope.tablet_visibility = function(){
        if(Modernizr.mq("screen and (min-width:768px) and (max-width:1024px)")){
            // alert($scope.isweb);
            if(($scope.isweb) && ($scope.isepi)){
                $scope.isweb = false;
                $scope.isepi = true;
            }
            else if($scope.isepi){
                $scope.isepi= true;
                $scope.isweb = false;
            }
            else{
                $scope.isweb= true;
                $scope.isepi= false;
            }
        }
    };

}]);

/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* THIS CONTROLLER IS NOT BEING USED, CHECK THE CONTROLLER IN CHANNEL.JS
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
woi.controller("ProgrammeDiscussionController", ['$scope', '$rootScope', '$routeParams', 'userAPI', function($scope, $rootScope, $routeParams,  userAPI){
    // get the id param specified in the route
    $scope.programmeid = $rootScope.Programmeid;
    $scope.post = {
        title: '',
        message:''
    };
    $scope.postDiscussion = function(){
        alert(1);
        userAPI.createDiscussion({forumtype: 'Program', forumtypeid:$scope.programmeid, forumtitle: $scope.post.title ,comments: $scope.post.message }, function(rs) {
            var forumid = "";
            if(rs.response.forumid) {

                forumid = rs.response.forumid;
                // if(console) console.log('postedDiscussion!');
            } else {
                // if(console) console.log('Creation failed!');
            }
            // alert(rs.response.message+" forumid:"+forumid)
        });
    };
}]);

woi.controller("DiscussionSliderController", ['$scope', '$rootScope','$routeParams', function($scope, $rootScope, $routeParams){

    $scope.canShow = false;
    $scope.startDiscussion = function(){
        $scope.canShow = true;
        $('#discussionsBox').slideToggle();
    }
}]);

// moved to parent controller since we need to access prog details
// woi.controller("FbShareController", ['$scope', '$rootScope','$location', function($scope, $rootScope, $location){


//   var shareURL = $location.absUrl();
//   console.log('check this....',$scope.fullProgrammeDetail);
//   $scope.shareLinkOnFb = function(){

//     if ($rootScope.getUser().SocialSharing != "true") {
//       alert("Social Sharing is disabled. Please enable Social Sharing in Myaccounts to share the watchlist");
//       return false;
//     }

//     FB.ui({
//       method: 'stream.publish',
//       link: shareURL,
//       user_message_prompt: 'Post this to your wall?',
//       name: 'Facebook Dialogs',
//       caption: 'Reference Documentation',
//       description: 'Using Dialogs to interact with people.'
//       // redirect_uri: redirectURL
//     });
//   };

// }]);


woi.controller("QuotationController", ['$scope', '$rootScope', '$routeParams', 'userAPI', function($scope, $rootScope, $routeParams,  userAPI){

    userAPI.quotation({},function(rs){
        if(!rs.getprogrameditorialpickdiscussion) { return false; }
        $scope.quote = rs.getprogrameditorialpickdiscussion.programeditorialpickdiscussion;
    });

}]);
