woi.factory("userAPI", ['$resource', '$rootScope',"IPfetcher" , function($resource, $rootScope, IPfetcher){
    //Get current Hour IST
    var d, convertedHour;
    d=new Date();
    d.toUTCString();
    convertedHour = parseInt( (d.getUTCHours()+5.5)%24 );
    var noCache = function () {
        return (new Date()).getTime();
    }



    return $rootScope.woiresource("/appi/user", {responseformat:'json', responselanguage:'English', pageno:1, context:"custid=1;msisdn=222;headendid=0;applicationname=website"}, {
        // return $resource("/api-user/:call", {responseformat:'json', responselanguage:'English', pageno:1}, {
        "signIn": {
            "method": "GET",
            "params": {
                "mode": "signIn"
            }
        }
        ,
        "forgotPassword": {
            "method": "GET",
            "params": {
                "mode": "forgotPassword"
            }
        },
        "registerUser": {
            "method": "GET",
            "params": {
                "mode": "registerUser"
            }
        },
        "featuredProgramme": {
            "method": "GET",
            "params": {
                "mode": "featuredProgramme",
                "operatorid": 0,
                "userid": $rootScope.getUser().userid
            }
        },
        "premiers": {
            "method": "GET",
            "params": {
                "mode": "premiers",
                "userid": $rootScope.getUser().userid
            }
        },
        "exclusiveList": {
            "method": "GET",
            "params": {
                "mode": "exclusiveList",
                "userid": $rootScope.getUser().userid
            }
        },
        "nowNext": {
            "method": "GET",
            "params": {
                "mode": "nowNext",
                "operatorname": 0,
                "selecteddate": 0,
                "starthour": convertedHour ,
                "userid": $rootScope.getUser().userid
            }
        },
        "myWatchlist": {
            "method": "GET",
            "params": {
                "mode": "myWatchlist",
                "userid": $rootScope.getUser().userid,
                "noCache": noCache()
            }
        },
        "toggleWatchlist": {
            "method": "GET",
            "params": {
                "mode": "toggleWatchlist",
                "context": 'custid=1;msisdn=222;headendid=0;applicationname=website;ipaddress=' + $.cookie('userIP') + ';useragent=' + navigator.userAgent.replace(/;/g, ','),
                "userid": $rootScope.getUser().userid,
                "watchliststatus": true,
                "noCache": noCache()
            }
        },
        "toggleFavoriteProgramme": {
            "method": "GET",
            "params": {
                "mode": "toggleFavoriteProgramme",
                "userid": $rootScope.getUser().userid,
                "programmeid": 0,
                "like": true,
                "operatorid": 0,
                "context": 'custid=1;msisdn=222;headendid=0;applicationname=website;ipaddress=' + $.cookie('userIP') + ';useragent=' + navigator.userAgent.replace(/;/g, ',')
            }
        },
        "myFavoritesProgramme": {
            "method": "GET",
            "params": {
                "mode": "myFavoritesProgramme",
                "userid": $rootScope.getUser().userid,
                "useragent": null,
                "operatorid": 0
            }
        },
        "addReminder": {
            "method": "GET",
            "params": {
                "mode": "addReminder",
                "context": 'custid=1;msisdn=222;headendid=0;applicationname=website;ipaddress=' + $.cookie('userIP') + ';useragent=' + navigator.userAgent.replace(/;/g, ','),
                "channelid": 0,
                "programmeid": 0,
                "starttime": 0
            }
        },
        "removeReminder": {
            "method": "GET",
            "params": {
                "mode": "removeReminder",
                "reminderid": 0
            }
        },
        "myReminders": {
            "method": "GET",
            "params": {
                "mode": "myReminders",
                "userid": $rootScope.getUser().userid
            }
        },
        "topRated": {
            "method": "GET",
            "params": {
                "mode": "topRated",
                "operatorid": 0
            }
        },
        "yourRecs": {
            "method": "GET",
            "params": {
                "mode": "yourRecs",
                "userid": $rootScope.getUser().userid
            }
        },
        "homeTrendingDiscussion": {
            "method": "GET",
            "params": {
                "mode": "homeTrendingDiscussion"
            }
        },
        "thirdPartyRegistration": {
            "method": "POST",
            "params": {
                "mode": "thirdPartyRegistration"
            }
        },
        "facebookActivity": {
            "method": "GET",
            "params": {
                "mode": "facebookActivity",
                "userid": $rootScope.getUser().userid
            }
        },
        "searchCast": {
            "method": "GET",
            "params": {
                "mode": "searchCast",
                "userid": $rootScope.getUser().userid
            }
        },
        "searchChannel": {
            "method": "GET",
            "params": {
                "mode": "searchChannel",
                "userid": $rootScope.getUser().userid
            }
        },
        "yourChannelRecs": {
            "method": "GET",
            "params": {
                "mode": "yourChannelRecs"
            }
        },
        "addRemoveLike": {
            "method": "GET",
            "params": {
                "mode": "addRemoveLike",
                "context": 'custid=1;msisdn=222;headendid=0;applicationname=website;ipaddress=' + $.cookie('userIP') + ';useragent=' + navigator.userAgent.replace(/;/g, ','),
                "userid": $rootScope.getUser().userid,
                "contentid": 0,
                "removelike": true,
                "videoid": 0
            }
        },
        "toggleFavoriteChannel": {
            "method": "GET",
            "params": {
                "mode": "toggleFavoriteChannel",
                "context": 'custid=1;msisdn=222;headendid=0;applicationname=website;ipaddress=' + $.cookie('userIP') + ';useragent=' + navigator.userAgent.replace(/;/g, ','),
                "userid": $rootScope.getUser().userid,
                "channelid": 0,
                "like": true
            }
        },
        "subscribeNewsLetter": {
            "method": "GET",
            "params": {
                "mode": "subscribeNewsLetter",
                "isweekly": true,
                "istrendingdaily": true,
                "istrendingweekly": true,
                "isprogrammeAnnouncement": true,
                "isprogramReminder": true,
                "userid": 0
            }
        },
        "getProgrammeDetails": {
            "method": "GET",
            "params": {
                "mode": "getProgrammeDetails",
                "context": 'custid=1;msisdn=222;headendid=0;applicationname=website;ipaddress=' + $.cookie('userIP') + ';useragent=' + navigator.userAgent.replace(/;/g, ','),
                "programmeid": 0,
                "channelid": 0,
                "userid": $rootScope.getUser().userid
            }
        },
        "getProgramme": {
            "method": "GET",
            "params": {
                "mode": "getProgramme",
                "context": 'custid=1;msisdn=222;headendid=0;applicationname=website;ipaddress=' + $.cookie('userIP') + ';useragent=' + navigator.userAgent.replace(/;/g, ','),
                "userid": $rootScope.getUser().userid
            }
        },
        "verifyMobileNumber": {
            "method": "GET",
            "params": {
                "mode": "verifyMobileNumber",
                "userid": $rootScope.getUser().userid
            }
        },
        "verifyMobileCode": {
            "method": "GET",
            "params": {
                "mode": "verifyMobileCode",
                "userid": $rootScope.getUser().userid
            }
        },
        "userFavoriteLanguage": {
            "method": "GET",
            "params": {
                "mode": "userFavoriteLanguage",
                "userid": $rootScope.getUser().userid,
                "pageno": 1
            }
        },
        "updateUserFavoriteLanguage": {
            "method": "GET",
            "params": {
                "mode": "updateUserFavoriteLanguage",
                "userid": $rootScope.getUser().userid
            }
        },
        "fullProgrammeDetail": {
            "method": "GET",
            "params": {
                "mode": "fullProgrammeDetail",
                "pageno": 1,
                "userid": $rootScope.getUser().userid
            }
        },
        "getProgrammeid": {
            "method": "GET",
            "params": {
                "mode": "getProgrammeid"
            }
        },
        "getChannelid": {
            "method": "GET",
            "params": {
                "mode": "getChannelid"
            }
        },
        "CastGallery" :{
            "method": "GET",
            "params": {
                "mode": "CastGallery"
            }
        },
        "MoviesByActor": {
            "method": "GET",
            "params": {
                "mode": "MoviesByActor"
            }
        },

        "actor_profile": {
            "method": "GET",
            "params": {
                "mode": "actor_profile"
            }
        },
        "getActorId":{
            "method": "GET",
            "params": {
                "mode": "getActorId"
            }
        },
        "SimilarActor":{
            "method": "GET",
            "params": {
                "mode": "SimilarActor"
            }
        },
        "castNcrew": {
            "method": "GET",
            "params": {
                "mode": "castNcrew",
                "pageno": 1
            }
        },
        "channelDetails": {
            "method": "GET",
            "params": {
                "mode": "channelDetails",
                "context": 'custid=1;msisdn=222;headendid=0;applicationname=website;ipaddress=' + $.cookie('userIP') + ';useragent=' + navigator.userAgent.replace(/;/g, ','),
                "pageno": 1,
                "channelid": 0,
                "userid": $rootScope.getUser().userid
            }
        },
        "channelPopularPrograms": {
            "method": "GET",
            "params": {
                "mode": "channelPopularPrograms",
                "pageno": 1,
                "channelid": 0,
                "userid": $rootScope.getUser().userid
            }
        },
        "createDiscussion": {
            "method": "GET",
            "params": {
                "mode": "createDiscussion",
                "forumtypeid": 0,
                "userid": $rootScope.getUser().userid
            }
        },
        "replyDiscussion": {
            "method": "GET",
            "params": {
                "mode": "replyDiscussion",
                "forumid": 0,
                "userid": $rootScope.getUser().userid
            }
        },
        "getTrendingDiscussion": {
            "method": "GET",
            "params": {
                "mode": "getTrendingDiscussion",
                "pageno": 1,
                "forumid": 0,
                "userid": $rootScope.getUser().userid
            }
        },
        "getProgrammeDiscussions": {
            "method": "GET",
            "params": {
                "mode": "getProgrammeDiscussions",
                "channelid": 0,
                "programmeid": 0,
                "userid": $rootScope.getUser().userid
            }
        },
        "getChannelDiscussions": {
            "method": "GET",
            "params": {
                "mode": "getChannelDiscussions",
                "forumid": 0,
                "userid": $rootScope.getUser().userid
            }
        },
        "toggleDiscussionLike": {
            "method": "GET",
            "params": {
                "mode": "toggleDiscussionLike",
                "forumid": 0,
                "userid": $rootScope.getUser().userid
            }
        },
        "flagDiscussion": {
            "method": "GET",
            "params": {
                "mode": "flagDiscussion",
                "forumid": 0,
                "reportabuse": true,
                "userid": $rootScope.getUser().userid
            }
        },
        "toggleCommentLike": {
            "method": "GET",
            "params": {
                "mode": "toggleCommentLike",
                "threadid": 0,
                "userid": $rootScope.getUser().userid
            }
        },
        "toggleFlagComment": {
            "method": "GET",
            "params": {
                "mode": "toggleFlagComment",
                "threadid": 0,
                "reportabuse": true,
                "userid": $rootScope.getUser().userid
            }
        },
        "featuredChannelVideos": {
            "method": "GET",
            "params": {
                "mode": "featuredChannelVideos",
                "pageno": 1,
                "channelid": 0,
                "userid": $rootScope.getUser().userid
            }
        },
        "programmeVideoGallery": {
            "method": "GET",
            "params": {
                "mode": "programmeVideoGallery",
                "pageno": 1,
                "userid": $rootScope.getUser().userid
            }
        },
        "nextSchedule": {
            "method": "GET",
            "params": {
                "mode": "nextSchedule",
                "pageno": 1,
                "userid": $rootScope.getUser().userid
            }
        },
        "similarProgrammes": {
            "method": "GET",
            "params": {
                "mode": "similarProgrammes",
                "pageno": 1,
                "userid": $rootScope.getUser().userid
            }
        },
        "ChannelScheduleTodayTomorrow": {
            "method": "GET",
            "params": {
                "mode": "ChannelScheduleTodayTomorrow",
                "pageno": 1
            }
        },
        "availableIn": {
            "method": "GET",
            "params": {
                "mode": "availableIn"
            }
        },
        "friends": {
            "method": "GET",
            "params": {
                "mode": "friends",
                "userid": $rootScope.getUser().userid
            }
        },
        "similarChannels": {
            "method": "GET",
            "params": {
                "mode": "similarChannels",
                "pageno": 1,
                "userid": $rootScope.getUser().userid
            }
        },
        "episodesList": {
            "method": "GET",
            "params": {
                "mode": "episodesList",
                "pageno": 1,
                "userid": $rootScope.getUser().userid
            }
        },
        "getBrowseForChannel": {
            "method": "GET",
            "params": {
                "mode": "getBrowseForChannel",
                "headendid": 0,
                "userid": 196878,
                "channelid": 0,
                "pageno": 1
            }
        },
        "userRate": {
            "method": "GET",
            "params": {
                "mode": "userRate",
                "typeid": 0,
                "rating": 0,
                "userid": $rootScope.getUser().userid
            }
        },
        "promos": {
            "method": "GET",
            "params": {
                "mode": "promos",
                "pageno": 1,
                "userid": $rootScope.getUser().userid
            }
        },
        "webVideos": {
            "method": "GET",
            "params": {
                "mode": "webVideos",
                "pageno": 1,
                "userid": $rootScope.getUser().userid
            }
        },
        "quotation": {
            "method": "GET",
            "params": {
                "mode": "quotation",
                "pageno": 1,
                "userid": $rootScope.getUser().userid
            }
        },
        "filterChannels": {
            "method": "GET",
            "params": {
                "mode": "filterChannels",
                "starthour": convertedHour ,
                "dateselected": 0,
                "userid": $rootScope.getUser().userid
            }
        },
        "updateUserLocationDetails": {
            "method": "GET",
            "params": {
                "mode": "updateUserLocationDetails",
                "userid": $rootScope.getUser().userid
            }
        },
        "favoriteDetails": {
            "method": "GET",
            "params": {
                "mode": "favoriteDetails",
                "date": 0,
                "starthour": 18,
                "userid": $rootScope.getUser().userid
            }
        },
        "featuredChannelsLP": {
            "method": "GET",
            "params": {
                "mode": "featuredChannelsLP",
                "userid": $rootScope.getUser().userid
            }
        },
        "browseItems": {
            "method": "GET",
            "params": {
                "mode": "browseItems",
                "userid": $rootScope.getUser().userid
            }
        },
        "filterByHybridGenre": {
            "method": "GET",
            "params": {
                "mode": "filterByHybridGenre",
                "userid": $rootScope.getUser().userid
            }
        },
        "getprodctionhouselist": {
            "method": "GET",
            "params": {
                "mode": "getprodctionhouselist"
            }
        },
        "getprodctionhousemovielist": {
            "method": "GET",
            "params": {
                "mode": "getprodctionhousemovielist"
            }
        },
        "getAppDetails": {
            "method": "GET",
            "params": {
                "mode": "getAppDetails",
                "pageno": 1,
                "userid": 196878
            }
        },
        "getAppFeatures": {
            "method": "GET",
            "params": {
                "mode": "getAppFeatures",
                "pageno": 1,
                "userid": 196878,
                "appid": 1
            }
        },
        "getAppTestimonials": {
            "method": "GET",
            "params": {
                "mode": "getAppTestimonials",
                "pageno": 1,
                "userid": 196878,
                "appid": 1
            }
        },
        "getAppImages": {
            "method": "GET",
            "params": {
                "mode": "getAppImages",
                "pageno": 1,
                "userid": 196878,
                "appid": 1
            }
        },
        "getSitemapSections": {
            "method": "GET",
            "params": {
                "mode": "getSitemapSections"
            }
        },
        "getSitemapApps": {
            "method": "GET",
            "params": {
                "mode": "getSitemapApps",
                "pageno": 1,
                "userid": 196878
            }
        },
        "getSitemapOperators": {
            "method": "GET",
            "params": {
                "mode": "getSitemapOperators",
                "pageno": 1,
                "userid": 0,
                "countryid": 2,
                "stateid": 22,
                "cityid": 120,
                "areaid": 0
            }
        },
        "getAllMovies": {
            "method": "GET",
            "params": {
                "mode": "getAllMovies",
                "pageno": 1,
                "productionstartyear": 2001,
                "productionendyear": 2013,
                "userid": $rootScope.getUser().userid,
                "isfavMovies": false
            }
        },
        "getSitemapGenres": {
            "method": "GET",
            "params": {
                "mode": "getSitemapGenres",
                "userid": $rootScope.getUser().userid
            }
        },
        "getChannelsByGenre": {
            "method": "GET",
            "params": {
                "mode": "getChannelsByGenre",
                "pageno": 1,
                "userid": $rootScope.getUser().userid
            }
        },
        "getDiscussionCategories": {
            "method": "GET",
            "params": {
                "mode": "getDiscussionCategories",
                "headendid": 0
            }
        },
        "getAllDiscussions": {
            "method": "GET",
            "params": {
                "mode": "getAllDiscussions",
                "userid": $rootScope.getUser().userid,
                "pageno": 1
            }
        },
        "getDiscussionFilters": {
            "method": "GET",
            "params": {
                "mode": "getDiscussionFilters",
                "headendid": 0
            }
        },
        "searchByChannelName": {
            "method": "GET",
            "params": {
                "mode": "searchByChannelName",
                "pageno": 1,
                "userid": $rootScope.getUser().userid
            }
        },
        "getAllVideos": {
            "method": "GET",
            "params": {
                "mode": "getAllVideos",
                "pageno": 1,
                "userid": $rootScope.getUser().userid
            }
        },
        "getVideosGenre": {
            "method": "GET",
            "params": {
                "mode": "getVideosGenre"
            }
        },
        "getWatchlistByDate": {
            "method": "GET",
            "params": {
                "mode": "getWatchlistByDate",
                "userid": $rootScope.getUser().userid,
                "noCache": noCache(),
                "allvalue": true
            }
        },
        "getFavouriteByDate": {
            "method": "GET",
            "params": {
                "mode": "getFavouriteByDate",
                "userid": $rootScope.getUser().userid,
                "noCache": noCache(),
                "allvalue": true
            }
        },
        "getReminderByDate": {
            "method": "GET",
            "params": {
                "mode": "getReminderByDate",
                "msisdn": 150,
                "headendid": 0,
                "userid": $rootScope.getUser().userid,
                "noCache": noCache(),
                "allvalue": true
            }
        },
        "getSuggestKeyword": {
            "method": "GET",
            "params": {
                "mode": "getSuggestKeyword"
            }
        },
        "getUserAccountDetails": {
            "method": "GET",
            "params": {
                "mode": "getUserAccountDetails",
                "noCache": noCache()
            }
        },
        "updateUserDetails": {
            "method": "GET",
            "params": {
                "mode": "updateUserDetails"
            }
        },
        "updateHeadendInfo": {
            "method": "GET",
            "params": {
                "mode": "updateHeadendInfo"
            }
        },
        "getPopularFeed": {
            "method": "GET",
            "params": {
                "mode": "getPopularFeed"
            }
        },
        "updateUserSettings": {
            "method": "GET",
            "params": {
                "mode": "updateUserSettings"
            }
        },
        "getUserReminders": {
            "method": "GET",
            "params": {
                "mode": "getUserReminders",
                "userid":  $rootScope.getUser().userid,
                "pageno": 1
            }
        },
        "getUserFavorites": {
            "method": "GET",
            "params": {
                "mode": "getUserFavorites",
                "pageno": 1,
                "userid": $rootScope.getUser().userid
            }
        },
        "getRecentSearches": {
            "method": "GET",
            "params": {
                "mode": "getRecentSearches",
                "userid": $rootScope.getUser().userid,
                "pageno": 1
            }
        },
        "getRecentlyBrowsed": {
            "method": "GET",
            "params": {
                "mode": "getRecentlyBrowsed",
                "userid": $rootScope.getUser().userid,
                "pageno": 1
            }
        },
        "getLatestFeeds": {
            "method": "GET",
            "params": {
                "mode": "getLatestFeeds",
                "userid": $rootScope.getUser().userid,
                "pageno": 1
            }
        },
        "getWatchlist": {
            "method": "GET",
            "params": {
                "mode": "getWatchlist",
                "userid": $rootScope.getUser().userid,
                "pageno": 1
            }
        },
        "getTVGuideInfo": {
            "method": "GET",
            "params": {
                "mode": "getTVGuideInfo",
                "userid": $rootScope.getUser().userid
            }
        },
        "getUsersWhoLikeThisFeed": {
            "method": "GET",
            "params": {
                "mode": "getUsersWhoLikeThisFeed",
                "userid": $rootScope.getUser().userid,
                "contentid": 0
            }
        },
        "getContextFlag": {
            "method": "GET",
            "params": {
                "mode": "getContextFlag",
                "userid": $rootScope.getUser().userid
            }
        },
        "verifyUser": {
            "method": "GET",
            "params": {
                "mode": "verifyUser",
                "userid": $rootScope.getUser().userid
            }
        },
        "getQuestionnaireQuestions": {
            "method": "GET",
            "params": {
                "mode": "getQuestionnaireQuestions",
                "userid": $rootScope.getUser().userid
            }
        },
        "getGenreList": {
            "method": "GET",
            "params": {
                "mode": "getGenreList",
                "pageno": 1
            }
        },
        "getUserGenreList": {
            "method": "GET",
            "params": {
                "mode": "getUserGenreList",
                "pageno": 1
            }
        },
        "customAPI": {
            "method": "GET",
            "params": {
                "mode": "customAPI"
            }
        },
        "getFBAccessToken": {
            "method": "GET",
            "params": {
                "mode": "getFBAccessToken"
            }
        }
    });
}]);
