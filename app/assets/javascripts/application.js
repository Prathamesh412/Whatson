// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require ../../../vendor/assets/javascripts/jquery-1.8.3.min
//= require_tree ../../../vendor/assets/javascripts/.
//= require_self
//= require_tree .
//
// str = str.replace(/\s/g, "-");


var woi = angular.module('woi',['ngResource']);

// configure app routes
woi.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider
        .when("/actor/:id",{
            templateUrl: "actor/profile.html",
                resolve:{
                    checkActorId : ['$route','$location','$rootScope','userAPI','$q', function($route,$location,$rootScope,userAPI,$q) {
                        var url = $route.current.params.id;
                        var actorName = url.replace(/\-/g, " ").replace(/\~/g, "-").replace(/\$/g, "/");
                        var  actorList = $rootScope.storeActorNameAndId;
                        if($rootScope.storeActorNameAndId){
                            angular.forEach(actorList, function(actor, key){
                                if(actor.name == actorName){
                                    $rootScope.actorid = actor.id;
                                }
                            });
                        }
                        else
                        {
                            var deferred = $q.defer();
                            userAPI.getActorId({castname: actorName }, function (r) {
                                if(r.getcastid != null)
                                {
                                    deferred.resolve($rootScope.actorid = r.getcastid.castidbyname.castid);
                                }
                                else
                                {
                                   $location.path("/");
                                }

                            });

                            return deferred.promise;
                        }
                }]
            }
        })
        .when("/Channel/:channelname", {

            redirectTo:"/channel/:channelname"
        })
        .when("/channels", {
            redirectTo:"/Channels"
        })

        .when("/Channels", {
            templateUrl:"channels"
        })

        .when("/Home", {
            templateUrl:"home"
        })
        .when("/Tv-Listings", {
            templateUrl:"tv-guide"
        })
        .when("/Tv-Listings/Channel/:channelid", {
            templateUrl:"tv-guide"
        })
        .when("/tv-guide", {
            redirectTo:'/Tv-Listings'
        })
        .when("/tv-guide/channel/:channelid", {
            redirectTo:'/Tv-Listings/Channel/:channelid'
        })
        // .when("/search", {
        //   templateUrl:"search"
        // })
        .when("/Search/:query", {
            templateUrl:"search"
        })
        .when("/Search/:query/:ismovie", {
            templateUrl:"search"
        })
        .when("/search/:query", {
            redirectTo:"/Search/:query"
        })
        .when("/search/:query/:ismovie", {
            redirectTo:"/Search/:query/:ismovie"
        })
        .when("/program/:programmeid/channel/:channelid", {
            redirectTo:"/Program/:programmeid/Channel/:channelid"
        })
        .when("/Program/:programmename", {
            redirectTo:"/program/:programmename"
        })
        .when('/program/:programmename', {                           //Url rewriting Prathamesh addition
            templateUrl:"programme/info.html" ,
            resolve: {
                programmeid: ['$rootScope','$route','$q','userAPI','$location',function($rootScope,$route,$q,userAPI,$location) {
                    if($rootScope.isclick)
                    {
                        $rootScope.isclick = false;
                        return false;
                    }

                    var url = $route.current.params.programmename;
                    url = url.replace(/\-/g, " ").replace(/\~/g, "-").replace(/\$/g, "/") ;
                    var deferred = $q.defer();
                    $rootScope.Channelid = 0;
                    $rootScope.channelid = 0;
                    userAPI.getProgrammeid({ programmename: url }, function (r) {
                        if(r.getprogrammeidbyname != null)
                        {
                            deferred.resolve($rootScope.Programmeid= r.getprogrammeidbyname.programmeidbyname.programmeid);
                        }
                        else
                        {
                           $location.path("/");
                        }
                        // now that our promise is resolved, our controller should execute
                    });
                    return deferred.promise;
                }]
            }

        })

        .when('/channel/:channelname', {                           //Url rewriting Prathamesh addition
            templateUrl:"channels/details.html" ,

            resolve: {
                storeId: ['$rootScope','$route','$q','userAPI','$location',function($rootScope,$route,$q,userAPI,$location){
//                    if($rootScope.Channelid || $rootScope.channelid)
//                    {
//                        $rootScope.Channelid = null;
//                        $rootScope.channelid = null;
//                        return false;
//                    }
                    if($rootScope.isclick)
                    {
                        $rootScope.isclick = false;
                        return false;
                    }

                    var url = $route.current.params.channelname;
                    if(!isNaN(url))
                    {
                        $rootScope.Channelid = $route.current.params.channelname;
                        return false;
                    }
                    url = url.replace(/\-/g, " ").replace(/\~/g, "-").replace(/\$/g, "/") ;
                    var deferred = $q.defer();
                    userAPI.getChannelid({ channelname: url }, function (r) {
                        if(r.getsinglechannelidbyname != null)
                        {
                            deferred.resolve($rootScope.Channelid= r.getsinglechannelidbyname.singlechannelidbyname.channelid);
                        }
                        else
                        {
                            $location.path("/");
                        }
                        // now that our promise is resolved, our controller should execute
                    });

                    return deferred.promise;
                }]
            }

        })

        .when("/Program/:programmeid/Channel/:channelid", {
            templateUrl:"programme/info.html",
            resolve:{
                setParams: function($rootScope,$route){
                    $rootScope.Programmeid = $route.current.params.programmeid;
                    $rootScope.channelid =   $route.current.params.channelid;
                }
            }
        })
        .when("/Watchlist", {
            templateUrl:"watchlist/"
        })
        .when("/Watchlistinfo", {
            templateUrl:"watchlistinfo/"
        })
        .when("/watchlist", {
            redirectTo:"/Watchlist"
        })
        .when("/watchlistinfo", {
            redirectTo:"/Watchlistinfo"
        })
        .when("/watchlistsocial", {
            redirectTo:"/Watchlistsocial"
        })
        .when("/movies", {
            redirectTo:"/Movies"
        })
        .when("/Movies", {
            templateUrl:"movies/index.html"
        })
        .when("/videos", {
            redirectTo:"/Videos"
        })
        .when("/Videos", {
            templateUrl:"videos/index.html"
        })
        .when("/apps", {
            redirectTo:"/Mobile-Apps"
        })
        .when("/apps/:appid", {
            redirectTo:"/Mobile-Apps/:appid"
        })
        .when("/Mobile-Apps", {
            templateUrl:"apps/index.html"
        })
        .when("/Mobile-Apps/:appid", {
            templateUrl:"apps/index.html"
        })
        .when("/about", {
            templateUrl:"about/index.html"
        })
        .when("/contact", {
            templateUrl:"contact/index.html"
        })
        .when("/corporate", {
            templateUrl:"corporate/index.html"
        })
        .when("/tnc", {
            templateUrl:"tnc/index.html"
        })
        .when("/privacy", {
            templateUrl:"tnc/index.html"
        })
        .when("/sitemap", {
            templateUrl:"sitemap/index.html"
        })
        .when("/discussion", {
            redirectTo:"/Discussion"
        })
        .when("/Discussion", {
            templateUrl:"discussion/home.html"
        })
        .when("/newdiscussion", {
            templateUrl:"discussion/newdiscussion.html"
        })
        .when("/myprofile", {
            redirectTo:"/Myprofile"
        })
        .when("/Myprofile", {
            templateUrl:"myprofile/index.html"
        })
        .when("/socialfeed", {
            templateUrl:"socialfeed/index.html"
        })
        .when("/favourites", {
            templateUrl:"favourites/index.html"
        })
        .when("/reminders", {
            templateUrl:"reminders/index.html"
        })
        .when("/Watchlistsocial", {
            templateUrl:"watchlistsocial/index.html"
        })
        .when("/socialfeed/:publicid", {
            templateUrl:"socialfeed/index.html"
        })
        .when("/myaccount", {
            redirectTo:"/Myaccount"
        })
        .when("/Myaccount", {
            templateUrl:"myaccount/index.html"
        })
        .when("/verifyuser/:verificationcode/:userid/:emailid", {
            templateUrl:"verify/index.html"
        })
        .when("/home", {
            redirectTo:'/Home'
        })
        .otherwise({
            redirectTo:'/home'
        });

    /*
     http://woi.sourcebits.com/Home
     http://woi.sourcebits.com/TV-Listings (change TV Guide menu to TV Listings)
     http://woi.sourcebits.com/Channels
     http://woi.sourcebits.com/Movies
     http://woi.sourcebits.com/Videos
     http://woi.sourcebits.com/Mobile-Apps
     http://woi.sourcebits.com/Watchlist
     http://woi.sourcebits.com/MyAccount
     http://woi.sourcebits.com/MyProfile
     http://woi.sourcebits.com/Search
     http://woi.sourcebits.com/Discussions
     */

    $locationProvider.hashPrefix('!');
    // $locationProvider.html5Mode(true);
}]);

//configure root controller
woi.run(['$rootScope', '$route','$location','$timeout', '$http', function($rootScope, $route,$location,$timeout, $http){
    $rootScope.showForgotForm = function(){
        $("#submit_form").css('display','none');
        $("#popup_login_form").css('display','none');
        $("#forgot_form").css('display','block');
        hide();
    };

    $rootScope.showLoginForm = function(){
        $("#forgot_form").css('display','none');
        $("#submit_form").css('display','none');
        $("#popup_login_form").css('display','block');
        hide();
    };

    $rootScope.showSignupForm = function(){
        $("#popup_login_form").css('display','none');
        $("#forgot_form").css('display','none');
        $("#submit_form").css('display','block');
        hide();

    };

    function hide(){
        $(".errorMessage").css('display','none');
        $("#FBwrapperLinkWidth").find(".prev").css("z-index",1);
        $("#FBwrapperLinkWidth").find(".next").css("z-index",1);
    }

    function hide_all(){
        $("#submit_form").css('display','none');
        $("#popup_login_form").css('display','none');
        $("#forgot_form").css('display','none');
    }
    $rootScope.$on("$routeChangeSuccess", function(event, current, previous, rejection) {
        $rootScope.$broadcast("watchlist::fetch",1);

        if ($location.path() == "/reminders")
            $rootScope.feedTab = "reminder";
        else if($location.path() == "/favourites")
            $rootScope.feedTab = "favourite";
        else if($location.path() == "/Watchlistsocial")
            $rootScope.feedTab = "watchlist";
        else if($location.path() == "/socialfeed")
            $rootScope.feedTab = "feed";
    });

    $rootScope.$on("$routeChangeStart", function(next, current) {
        $rootScope.last_requested_url = $location.path();
    });

    $rootScope.redirctToHomePage = function(){
        hide_all();
        $location.path("/");
    };
    $rootScope.EncodeUrl= function(url,element,action){
        var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");
        $location.path(action + "/" + str);
        element.stopPropagation();
        element.preventDefault();
    };
    $rootScope.EncodeUrlWithDash= function(url,element,action,channelid,programmeid,starttime){
       if(starttime)
       {
           $rootScope.programmeStartTime = starttime.replace(/\..*/,'');
       }
        var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");
        $rootScope.Programmeid = programmeid;
        $rootScope.channelid =  channelid;
        $rootScope.Channelid =  channelid;
        $rootScope.isclick = true;
        if(action == 'programme')
        {
            action = 'program';
        }
        $location.path(action + "/" + str);
            try
            {
                element.stopPropagation();
                element.preventDefault();
            }
            catch(err)
            {
                //Handle errors here
            }
    };

    $rootScope.storeActorid = function(name,id,element){
        var str = name.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");
        $rootScope.actorid = id;
        $location.path("actor/" + str);
        element.stopPropagation();
        element.preventDefault();
        return false;
    };
    $rootScope.$on('$viewContentLoaded', function () {
        ga('send', 'pageview', {'page': $location.path()});
        if(!$rootScope.isUserLogged())
        {
            if($location.path() != "/Home" && $location.path() != "/")
            {
                $("#popup_login_form").css('display','block');
                hide();
            }
            else
            {
                hide_all();
            }
        }

    });

    $rootScope.woiresource = function (url, defaults, actions) {
        var $res = {};
        for (var i in actions) {

            var default_params = {};

            for (var di in defaults) {
                default_params[di] = defaults[di];
            }

            for (var ai in actions[i].params) {
                default_params[ai] = actions[i].params[ai];
            }

            $res[i] = (function (url, method, default_params) {
                return function (params, callback, headers) {

                    if (typeof params == 'function') {
                        callback = params;
                        params = {};
                    }

                    if (typeof headers == 'undefined') {
                        headers = {};
                    }

                    for (var pi in params) {
                        default_params[pi] = params[pi];
                    }

                    return $http({
                        url: url,
                        method: method,
                        transformResponse: [function (strData, headersGetter) {

                            var data = angular.fromJson(strData);

                            var encrypted = {};
                            encrypted.ciphertext = CryptoJS.enc.Base64.parse(data.data);
                             var decrypted = CryptoJS.AES.decrypt(encrypted, CryptoJS.enc.Base64.parse(pki),{ iv: CryptoJS.enc.Base64.parse(data.pki) });
                            var mainData = decrypted.toString(CryptoJS.enc.Utf8);
                            return angular.fromJson(mainData);
                        }].concat($http.defaults.transformResponse),
                        params: default_params,
                        headers: headers

                    }).success(function (data) {
                            var endApi = new Date();

                            callback(data);
                        });
                };
            })(url, actions[i].method, default_params);
        }

        return $res;
    };

    // user info
    $rootScope.userLogged = 'off';
    $rootScope.userInfo = {};

    $rootScope.beforeaction = {
        title    : "",
        subtitle : ""

    };
    $rootScope.$watch(function() {
            return $location.path();
        },
        function(a){
            checkurl(a);

        });

//   var woi = angular.module('woi', ['ngResource']);
// woi.run( function($rootScope, $location) {
//          $rootScope.$watch(function() { 
//             return $location.path(); 
//           },
//           function(a){  
//             checkurl(a);
//           });
// });

    function checkurl(path){

        $rootScope.$broadcast('inputs:reset', {});

        if((path == "/myaccount")){
            $("section.fb-trending-wrp").hide();
            $("div.trending").hide();
        }
        else{
            $("section.fb-trending-wrp").show();
            $("div.trending").show();
        }


        if(path == '/Tv-Listings'){
            tvguidechannel_my =  ($rootScope.device.isMobile) ? 'top center' : 'top right';
            tvguidechannel_at =  ($rootScope.device.isMobile) ? 'bottom center' : 'bottom right';
            tvguidechannel_x =   ($rootScope.device.isMobile) ? 82 : 0;
        }else{
            tvguidechannel_my =  ($rootScope.device.isMobile) ? 'top right' : 'top right';
            tvguidechannel_at =  ($rootScope.device.isMobile) ? 'bottom right' : 'bottom right';
            tvguidechannel_x =   ($rootScope.device.isMobile) ? 20 : 0;
        }

        $rootScope.$broadcast('layout:resetSocial', {});
    }

    // general user methods
    $rootScope.isUserLogged = function(){
        return ($rootScope.userLogged == 'on');
    };

    $rootScope.getUser = function(){

        if(!this.isUserLogged()){
            return {
                userid:-1
            };
        }
        return $rootScope.userInfo;
    };

    $rootScope.signInUser = function(user){

        console.log('user details === ',user);
        var details = '';
        for (var p in user) {
            details += p + ': ' + user[p] + '\n';
        }


        // $rootScope.$broadcast("user:signin", user);
        $timeout(function(){
            $rootScope.$broadcast("watchlist::fetch",1);
        });
        $rootScope.userLogged = 'on';
        $rootScope.userInfo = user;

        $.cookie('userLogged', 'on', {expires:365});
        $.cookie('userInfo', JSON.stringify(user), {expires:365});
        $("body").addClass("user-logged");



        if($rootScope.callback)
            if ($rootScope.callback.success && typeof($rootScope.callback.success) === "function") {
                $rootScope.callback.success();
                return false;
            }

        hide_all();
        $location.path($rootScope.last_requested_url)
        $route.reload();
//    window.location.reload();

    };

    $rootScope.signOutUser = function(){
        $rootScope.$broadcast("user:signout", {});
        $.cookie('userLogged', 'off');
        $.cookie('userInfo', '');

        $rootScope.userLogged = 'off';
        $rootScope.userInfo = {};
        $("body").removeClass("user-logged");

        // quick hack
        window.location.href = '/';

    };

    $rootScope.toggleMoreFooter = function(e) {
        e.preventDefault();
        var thisElement = $(e.currentTarget),
            shownElements = thisElement.parent().parent().children('.hidden-phone.special');

        shownElements.removeClass('hidden-phone').show();
        thisElement.parent().removeClass('visible-phone more').addClass('hidden-phone').hide();
    }

    // check for cookies
    if($.cookie('userLogged') == 'on'){

        $rootScope.userLogged = 'on';
        $rootScope.userInfo = JSON.parse($.cookie('userInfo'));

        if($rootScope.userInfo.emailverified == "false" && $rootScope.userInfo.emailverificationdays > 5){
            $rootScope.userInfo = {};
            alert('Please complete your email activation step!');
            $rootScope.signOutUser();
            return false;
        }
        $("body").addClass("user-logged");
    }

    $rootScope.$on('handleTvGuideEmit', function(event, args) {
        $rootScope.$broadcast('highlightTvGuide', args);
    });

    $rootScope.$on('handleResetEmit', function(event, args) {
        $rootScope.$broadcast('resetHighlight', args);
    });

    $rootScope.$on('handleChannelEmit', function(event, args) {
        $rootScope.$broadcast('highlightChannel', args);
    });

    // Stores details of the exclusive programs, to diplay badge when necessary
    $rootScope.exclusives = [];

    // Global object for storing device or browser details
    $rootScope.device = {
        isTablet      : false,
        isMobile      : false,
        isTouch       : false,
        isAndroid     : false
    }

    // Run some queries for device details, it's faster if we just run these once
    if( Modernizr.mq("screen and (max-width:1024px)") ) {
        $rootScope.device.isTablet = true;
    }

    if( Modernizr.touch ) {
        $rootScope.device.isTouch = true;
    }

    if( Modernizr.mq("screen and (max-width:640px)") ) {
        $rootScope.device.isMobile = true;
    }

    if( $('html').hasClass('android') ) {
        $rootScope.device.isAndroid = true;
    }

}]);

