require 'rubygems'
require 'json'
require 'net/http'
require 'cgi'
require "openssl"
require 'digest/sha2'
require 'base64'

class AppiController < ApplicationController

  def initialize()
    @alg = "AES-256-CBC"

    @recoparams = {
        "ExclusiveVideo" => {
            "apikey"             =>'577ef1154f3240ad5b9b413aa7346a1e',
            "operatorid"         => '0',
            "userid"             => 'USER_DEFINED',
            "applicationname"    => 'androidapp',
            "exclusiveid"        => '49',
            "programmeimagesize" => 'large',
            "channelimagesize"   => 'large',
            "imagesize"          => 'large'
        },
        "Search" => {
            "apikey"           => 'b7b16ecf8ca53723593894116071700c',
            "responseformat"   => 'json',
            "responselanguage" => 'English',
            "context"          =>'applicationname=website;custid=1;opid=sourcebits;msisdn=155;headendid=0',
            "searchvalue"      => 'USER_DEFINED',
            "searchcriteria"   => 'freetext',
            "userid"           => 'USER_DEFINED'
        },
        "addRemoveFavoriteProgram" => {
            "apikey"      => 'cb70ab375662576bd1ac5aaf16b3fca4',
            "userid"      => 'USER_DEFINED',
            "programmeid" => '4af7f9edc0f545f4de769f2e9e763df919915cab',
            "Like"        => true
        },
        "PremieresAndUpcoming" => {
            "apikey"             => '274ad4786c3abca69fa097b85867d9a4',
            "programmeimagesize" => 'xlarge',
            "channelimagesize"   => 'xlarge',
            "imagesize"          => 'xlarge'
        }
    }

    @autoparams = {
        "autoComplete" => {
            "page"             => 'WoiAutoComplete.aspx',
            "username"         => 'woi',
            "password"         => 'woiautow',
            "autocompleteword" => '',
            "noofrecords"      => 10
        },
        "autoCompleteLocation" => {
            "page"        => 'LocationAutoComplete.aspx',
            "username"    => 'woi',
            "password"    => 'woiautow',
            "placename"   => '',
            "noofrecords" => 15
        },
        "autoCompleteActors" => {
            "page"             => 'AutoComplete.aspx',
            "username"         => 'woi',
            "password"         => 'woiautow',
            "autocompletetype" => 'cast',
            "autocompleteword" => '',
            "noofrecords"      => 50
        },
        "autoCompleteChannel" => {
            "page" => 'AutoComplete.aspx',
            "username" => 'woi',
            "password" => 'woiautow',
            "autocompletetype" => 'channel',
            "autocompleteword" => 'star',
            "noofrecords" => 10
        },
        "customAutocomplete" => {

        }
    }

    @tsmparams = {
        "getOperatorList" => {
            "page" => "OperatorList",
            "apikey" => "efe937780e95574250dabe07151bdc23",
            "context" => "applicationname=website",
            "countryid" => 2,
        },
        "getSitemapChannels" => {
            "page" => 'ChannelDetails',
            "apikey" => '9de6d14fff9806d4bcd1ef555be766cd',
            "context" => 'Applicationname=sourcebits;headendid=0',
            "pageno" => 1,
            "channelimagesize" => 'small',
            "userid" => 196878
        },
        "getSitemapOperators" => {
            "page" => 'OperatorList',
            "apikey" => 'efe937780e95574250dabe07151bdc23',
            "pageno" => 1,
            "context" => 'applicationname=website',
            "userid" => 0,
            "countryid" => 2,
            "stateid" => 22,
            "cityid" => 120,
            "areaid" => 0
        },
        "getStateAndCityIds" => {
            "page" => 'LocationIDs',
            "apikey" => '1905aedab9bf2477edc068a355bba31a',
            "context" => 'applicationname=sourcebits',
        }
    }

    @userparams = {

        "getProgrammeid" => {
            "call" => "ProgrammeIDByName",
            "apikey" => "a4d2f0d23dcc84ce983ff9157f8b7f88",
            "responseformat" => "json",
            "responselanguage" => "english",
            "context" => "custid=1;msisdn=222;headendid=0;applicationname=website"     # api call for programme-Prathamesh
        },

        "getChannelid" => {
            "call" => "SingleChannelIDByName",
            "apikey" => "6a61d423d02a1c56250dc23ae7ff12f3",
            "responseformat" => "json",
            "responselanguage" => "english",
            "context" => "custid=1;msisdn=222;headendid=0;applicationname=website"     # api call for channel-Prathamesh
        },

       "CastGallery" => {
            "call" => "CastGallery",
            "apikey" => "925d1b50cf96fe5447879b4b57ef57c168e4fc34",
            "context" => "custid=1;msisdn=222;headendid=0;applicationname=website",
            "pageno"  => "1" ,
            "responseformat" => "json",
            "responselanguage" => "english"
        },
        "MoviesByActor" => {
            "call" => "CastProgrammesByGenre",
            "apikey" => "0ad54e429b2b6238550f24701541130b978e4640",
            "context" => "custid=1;msisdn=222;headendid=0;applicationname=website",
            "genre"  => "film" ,
            "imagesize" => "medium" ,
            "pageno"  => "0" ,
            "userid"  => "1"
        },
        "actor_profile" => {

            "call" => "CastDetails",
            "apikey" => "375f9609c9962cce0ad6ccaaabd80362ecd2b07f",
            "context" => "custid=1;msisdn=222;headendid=0;applicationname=website",
        },
        "SimilarActor" => {
            "call" => "SimilarCasts",
            "apikey" => "731df0fc93417f72fcb56f09cd754f9382ae6373",
            "context" => "custid=1;msisdn=222;headendid=0;applicationname=website",
            "userid"  => "1" ,
            "responseformat" => "json",
            "responselanguage" => "english"

        },
        "signIn" => {
            "call" => "AuthenticateUsers",
            "apikey" => "e46de7e1bcaaced9a54f1e9d0d2f800d"
        },
        "forgotPassword" => {
            "call" => "ForgotPassword",
            "apikey" => "d947bf06a885db0d477d707121934ff8"
        },
        "registerUser" => {
            "call" => "RegisterUser",
            "apikey" => "335f5352088d7d9bf74191e006d8e24c",
            "context" => "custid=1;msisdn=;headendid=0;applicationname=website"
        },
        "featuredProgramme" => {
            "call" => "FeaturedProgramme",
            "apikey" => "06138bc5af6023646ede0e1f7c1eac75",
            "programmeimagesize" => "xxlarge",
            "channelimagesize" => "xxlarge",
            "imagesize" => "xxlarge",
            "applicationname" => "website",
            "operatorid" => 0
        },
        "premiers" => {
            "call" => "Premiers",
            "apikey" => "f8c1f23d6a8d8d7904fc0ea8e066b3bb",
            "programmeimagesize" => "xlarge",
            "channelimagesize" => "xlarge",
            "imagesize" => "xlarge",
            "context" => "custid=1;opid=;msisdn=150;headendid=0;applicationname=website"
        },
        "exclusiveList" => {
            "call" => "ExclusiveList",
            "apikey" => "a01a0380ca3c61428c26a231f0e49a09",
            "programmeimagesize" => "xlarge",
            "channelimagesize" => "xlarge",
            "imagesize" => "xlarge",
            "context" => "custid=1;msisdn=150;headendid=0;applicationname=website"
        },
        "nowNext" => {
            "call" => "TVGuide",
            "apikey" => "20f07591c6fcb220ffe637cda29bb3f6",
            "programmeimagesize" => "large",
            "channelimagesize" => "large",
            "imagesize" => "large",
            "applicationname" => "website",
            "operatorname" => 0,
            "selecteddate" => 0
        },
        "myWatchlist" => {
            "call" => "WatchListDetails",
            "apikey" => "d6baf65e0b240ce177cf70da146c8dc8",
            "context" => "custid=1;msisdn=222;headendid=0;applicationname=website",
            "Programmeimagesize" => "xxLarge",
            "Channelimagesize" => "xxLarge",
            "Imagesize" => "xxLarge"
        },
        "toggleWatchlist" => {
            "call" => "AddWatchListDetails",
            "apikey" => "36660e59856b4de58a219bcf4e27eba3",
            "watchliststatus" => true
        },
        "toggleFavoriteProgramme" => {
            "call" => "addRemoveFavouriateProgram",
            "apikey" => "cb70ab375662576bd1ac5aaf16b3fca4",
            "programmeid" => 0,
            "like" => true,
            "applicationname" => "website",
            "operatorid" => 0
        },
        "myFavoritesProgramme" => {
            "call" => "UserFavoritePrograms",
            "apikey" => "f9b902fc3289af4dd08de5d1de54f68f",
            "Programmeimagesize" => "Large",
            "visitip" => "192.168.1.100",
            "useragent" => "",
            "applicationname" => "website",
            "operatorid" => 0
        },
        "addReminder" => {
            "call" => "SetReminder",
            "apikey" => "e4a6222cdb5b34375400904f03d8e6a5",
            "channelid" => 0,
            "programmeid" => 0,
            "starttime" => 0
        },
        "removeReminder" => {
            "call" => "DeleteReminder",
            "apikey" => "01161aaa0b6d1345dd8fe4e481144d84",
            "reminderid" => 0,
            "context" => "custid=1;msisdn=222; headendid=0;applicationname=website"
        },
        "myReminders" => {
            "call" => "AllUserReminders",
            "apikey" => "01386bd6d8e091c2ab4c7c7de644d37b",
            "Programmeimagesize" => "xxLarge",
            "applicationname" => "website"
        },
        "topRated" => {
            "call" => "TopRatedHomePage",
            "apikey" => "eda80a3d5b344bc40f3bc04f65b7a357",
            "programmeimagesize" => "xlarge",
            "channelimagesize" => "xlarge",
            "imagesize" => "xlarge",
            "applicationname" => "website",
            "operatorid" => 0
        },
        "yourRecs" => {
            "call" => "UserRecommendations",
            "apikey" => "b1a59b315fc9a3002ce38bbe070ec3f5",
            "context" => "custid=1;msisdn=150;headendid=0;applicationname=website",
            "programmeimagesize" => "large",
            "channelimagesize" => "medium",
            "imagesize" => "small",
            "languagename" => "English",
            "searhcategory" => "channel"
        },
        "homeTrendingDiscussion" => {
            "call" => "LatestDiscussion",
            "apikey" => "9a96876e2f8f3dc4f3cf45f02c61c0c1",
            "context" => "applicationname=sourcebits"
        },
        "thirdPartyRegistration" => {
            "call" => "ThirdPartyRegistration",
            "apikey" => "d96409bf894217686ba124d7356686c9",
            "context" => "custid=1;msisdn=222;headendid=0;applicationname=website",
            "thirdpartyid" => "1"
        },
        "facebookActivity" => {
            "call" => "FacebookActivity",
            "apikey" => "1543843a4723ed2ab08e18053ae6dc5b",
            "context" => "applicationname=sourcebits",
            "programmeimagesize" => "large",
            "channelimagesize" => "large",
            "imagesize" => "large"
        },
        "searchCast" => {
            "call" => "SearchCategoryWiseData",
            "apikey" => "1bb91f73e9d31ea2830a5e73ce3ed328",
            "context" => "applicationname=sourcebits",
            "searchtext" => "",
            "searchcategory" => "cast"
        },
        "searchChannel" => {
            "call" => "SearchCategoryWiseData",
            "apikey" => "1bb91f73e9d31ea2830a5e73ce3ed328",
            "context" => "applicationname=sourcebits",
            "searchtext" => "",
            "searchcategory" => "channel"
        },
        "yourChannelRecs" => {
            "call" => "SimilarChannelRecommendedProgramme",
            "apikey" => "ef0d3930a7b6c95bd2b32ed45989c61f",
            "pageno" => "1",
            "context" => "custid=1;msisdn=222;headendid=0;applicationname=website",
            "userid" => "0",
            "programmeimagesize" => "large",
            "channelimagesize" => "Large",
            "imagesize" => "Large",
            "channelid" => "0"
        },
        "addRemoveLike" => {
            "call" => "AddRemoveUserLikeDetails",
            "apikey" => "bbf94b34eb32268ada57a3be5062fe7d",
            "contenttype" => "program",
            "contentid" => 0,
            "removelike" => true,
            "videoid" => 0
        },
        "toggleFavoriteChannel" => {
            "call" => "addRemoveFavouriateChannel",
            "apikey" => "9188905e74c28e489b44e954ec0b9bca",
            "channelid" => 0,
            "like" => true
        },
        "subscribeNewsLetter" => {
            "call" => "SubscribeNewsLetter",
            "apikey" => "cfa0860e83a4c3a763a7e62d825349f7",
            "context" => "custid=1; msisdn=222; headendid=0;applicationname=website",
            "isweekly" => true,
            "istrendingdaily" => true,
            "istrendingweekly" => true,
            "isprogrammeAnnouncement" => true,
            "isprogramReminder" => true,
            "userid" => 0
        },
        "getProgrammeDetails" => {
            "call" => "FullProgrammeDetail",
            "apikey" => "74071a673307ca7459bcf75fbd024e09",
            "context" => "applicationname=sourcebits",
            "programmeimagesize" => "Large",
            "channelimagesize" => "Large",
            "imagesize" => "Large",
            "programmeid" => 0,
            "channelid" => 0,
            "starttime" => ""
        },
        "getProgramme" => {
            "call" => "ProgrammeDetails",
            "apikey" => "432aca3a1e345e339f35a30c8f65edce",
            "context" => "applicationname=website",
            "pageno" => "1",
            "programmeimagesize" => "medium",
            "channelimagesize" => "Medium",
            "imagesize" => "small",
            "channelid" => "0",
            "programmeid" => "0"
        },
        "verifyMobileNumber" => {
            "call" => "VerifyMobileNumber",
            "apikey" => "f4f6dce2f3a0f9dada0c2b5b66452017",
            "responseformat" => "json",
            "responselanguage" => "english"
        },
        "verifyMobileCode" => {
            "call" => "VerifyMobileNumberWithCode",
            "apikey" => "0d0fd7c6e093f7b804fa0150b875b868",
            "responseformat" => "json",
            "responselanguage" => "english"
        },
        "userFavoriteLanguage" => {
            "call" => "UserFavoriteLanguage",
            "apikey" => "c24cd76e1ce41366a4bbe8a49b02a028",
            "context" => "custid=1;msisdn=222;headendid=0;applicationname=website",
            "responseformat" => "json",
            "responselanguage" => "english",
            "pageno" => 1
        },
        "updateUserFavoriteLanguage" => {
            "call" => "UpdateUserFavoriteLanguage",
            "apikey" => "c52f1bd66cc19d05628bd8bf27af3ad6",
            "context" => "applicationname=website",
            "responseformat" => "json",
            "responselanguage" => "english",
            "languagetext" => ""
        },
        "fullProgrammeDetail" => {
            "call" => "FullProgrammeDetail",
            "apikey" => "74071a673307ca7459bcf75fbd024e09",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "applicationname=sourcebits",
            "pageno" => 1,
            "programmeimagesize" => "large",
            "channelimagesize" => "large",
            "imagesize" => "large",
            "channelid" => "0",
            "programmeid" => "0",
            "starttime" => "0"
        },
        "castNcrew" => {
            "call" => "ProgramCastAndCrew",
            "apikey" => "c3c59e5f8b3e9753913f4d435b53c308",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "applicationname=sourcebits",
            "pageno" => 1,
            "programmeid" => "0"
        },
        "channelDetails" => {
            "call" => "SingleChannelDetail",
            "apikey" => "352fe25daf686bdb4edca223c921acea",
            "responseformat" => "json",
            "responselanguage" => "English",
            "pageno" => 1,
            "channelimagesize" => "large",
            "channelid" => 0
        },
        "channelPopularPrograms" => {
            "call" => "TopProgrammeForChannel",
            "apikey" => "f90f2aca5c640289d0a29417bcb63a37",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "custid=1;msisdn=222;headendid=0;applicationname=website",
            "pageno" => 1,
            "programmeimagesize" => "large",
            "channelimagesize" => "large",
            "imagesize" => "large",
            "channelid" => 0,
            "languagename" => "English",
            "hybridgenre" => "all"
        },
        "createDiscussion" => {
            "call" => "CreateDiscussion",
            "apikey" => "15d4e891d784977cacbfcbb00c48f133",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "applicationname=sourcebits",
            "forumtype" => "",
            "forumtypeid" => 0,
            "forumimage" => "",
            "forumtitle" => ""
        },
        "replyDiscussion" => {
            "call" => "CommentOnDiscussion",
            "apikey" => "c203d8a151612acf12457e4d67635a95",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "applicationname=sourcebits",
            "forumid" => 0,
            "commenttext" => ""
        },
        "getTrendingDiscussion" => {
            "call" => "TrendingDiscussion",
            "apikey" => "9b70e8fe62e40c570a322f1b0b659098",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "applicationname=sourcebits",
            "pageno" => 1,
            "forumid" => 0
        },
        "getProgrammeDiscussions" => {
            "call" => "ProgramDiscussion",
            "apikey" => "d61e4bbd6393c9111e6526ea173a7c8b",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "applicationname=sourcebits",
            "channelid" => 0,
            "programmeid" => 0
        },
        "getChannelDiscussions" => {
            "call" => "ChannelLatestDiscussion",
            "apikey" => "f5f8590cd58a54e94377e6ae2eded4d9",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "applicationname=sourcebits",
            "forumid" => 0,
            "commenttext" => ""
        },
        "toggleDiscussionLike" => {
            "call" => "LikeDislikeDiscussion",
            "apikey" => "67f7fb873eaf29526a11a9b7ac33bfac",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "applicationname=sourcebits",
            "forumid" => 0,
            "contentType" => "forum",
            "likeStatus" => "True"
        },
        "flagDiscussion" => {
            "call" => "ReportAbuseDiscussion",
            "apikey" => "13f3cf8c531952d72e5847c4183e6910",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "applicationname=sourcebits",
            "forumid" => 0,
            "contentType" => "forum",
            "reportabuse" => true
        },
        "toggleCommentLike" => {
            "call" => "LikeDislikeThread",
            "apikey" => "1a5b1e4daae265b790965a275b53ae50",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "applicationname=sourcebits",
            "threadid" => 0,
            "contentType" => "thread",
            "LikeStatus" => "true"
        },
        "toggleFlagComment" => {
            "call" => "ReportAbuseThread",
            "apikey" => "550a141f12de6341fba65b0ad0433500",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "applicationname=sourcebits",
            "threadid" => 0,
            "contentType" => "thread",
            "reportabuse" => true
        },
        "featuredChannelVideos" => {
            "call" => "FeaturedVideosForChannel",
            "apikey" => "496e05e1aea0a9c4655800e8a7b9ea28",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "custid=1;msisdn=155;headendid=0;applicationname=website",
            "pageno" => 1,
            "imagesize" => "large",
            "channelid" => 0
        },
        "programmeVideoGallery" => {
            "call" => "ProgrammeVideoGallery",
            "apikey" => "9431c87f273e507e6040fcb07dcb4509",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "applicationname=sourcebits",
            "pageno" => 1,
            "programmeimagesize" => "xxlarge",
            "channelimagesize" => "xxlarge",
            "imagesize" => "xxlarge",
            "programmeid" => "0"
        },
        "nextSchedule" => {
            "call" => "MoreProgrammeSchedule",
            "apikey" => "758874998f5bd0c393da094e1967a72b",
            "responseformat" => "json",
            "responselanguage" => "English",
            "pageno" => 1,
            "context" => "applicationname=website",
            "channelimagesize" => "large",
            "programmeid" => "0"
        },
        "similarProgrammes" => {
            "call" => "SimilarProgramme",
            "apikey" => "950a4152c2b4aa3ad78bdd6b366cc179",
            "responseformat" => "json",
            "responselanguage" => "English",
            "pageno" => 1,
            "context" => "custid=1;msisdn=150;headendid=0;applicationname=website",
            "programmeimagesize" => "large",
            "channelimagesize" => "large",
            "imagesize" => "large",
            "programmeid" => "0"
        },
        "ChannelScheduleTodayTomorrow" => {
            "call" => "ChannelScheduleTodayTomorrow",
            "apikey" => "18d8042386b79e2c279fd162df0205c8",
            "responseformat" => "json",
            "responselanguage" => "English",
            "pageno" => 1,
            "context" => "custid=1;msisdn=155;headendid=0;applicationname=website",
            "programmeimagesize" => "large",
            "channelimagesize" => "large",
            "imagesize" => "large",
            "dayparam" => "1",
            "channelid" => "10000000004170000"
        },
        "availableIn" => {
            "call" => "StoresAvailability",
            "apikey" => "e555ebe0ce426f7f9b2bef0706315e0c",
            "programmeid" => "0",
            "channelid" => "0"
        },
        "friends" => {
            "call" => "PeopleWholikeThisProgram",
            "apikey" => "6e2713a6efee97bacb63e52c54f0ada0",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "applicationname=website",
            "programmeid" => "0"
        },
        "similarChannels" => {
            "call" => "SimilarChannels",
            "apikey" => "839ab46820b524afda05122893c2fe8e",
            "responseformat" => "json",
            "responselanguage" => "English",
            "pageno" => 1,
            "context" => "custid=1;msisdn=222;headendid=0;applicationname=website",
            "channelimagesize" => "large",
            "imagesize" => "large",
            "channelid" => "0"
        },
        "episodesList" => {
            "call" => "EpisodeVideos",
            "apikey" => "cfee398643cbc3dc5eefc89334cacdc1",
            "responseformat" => "json",
            "responselanguage" => "English",
            "pageno" => 1,
            "context" => "applicationname=website",
            "imagesize" => "large",
            "programmeid" => "0"
        },
        "getBrowseForChannel" => {
            "call" => "ChannelBrowsedProgrammes",
            "apikey" => "98d6f58ab0dafbb86b083a001561bb34",
            "context" => "applicationname=website",
            "headendid" => 0,
            "userid" => 196878,
            "channelid" => 0,
            "imagesize" => "large",
            "pageno" => 1
        },
        "userRate" => {
            "call" => "UserRating",
            "apikey" => "556f391937dfd4398cbac35e050a2177",
            "responseformat" => "json",
            "responselanguage" => "English",
            "typename" => "channel",
            "typeid" => 0,
            "rating" => 0
        },
        "promos" => {
            "call" => "PromoVideos",
            "apikey" => "d18f655c3fce66ca401d5f38b48c89af",
            "responseformat" => "json",
            "responselanguage" => "English",
            "pageno" => 1,
            "context" => "applicationname=website",
            "imagesize" => "large",
            "programmeid" => "0"
        },
        "webVideos" => {
            "call" => "WebVideos",
            "apikey" => "9461cce28ebe3e76fb4b931c35a169b0",
            "responseformat" => "json",
            "responselanguage" => "English",
            "pageno" => 1,
            "context" => "applicationname=website",
            "imagesize" => "large",
            "programmeid" => "0"
        },
        "quotation" => {
            "call" => "ProgramEditorialPickDiscussion",
            "apikey" => "11b921ef080f7736089c757404650e40",
            "responseformat" => "json",
            "responselanguage" => "English",
            "pageno" => 1,
            "context" => "applicationname=sourcebits",
            "imagesize" => "large",
            "programmeid" => "0",
            "channelid" => "0"
        },
        "filterChannels" => {
            "call" => "TVGuideChannelGenreFilterDetailed",
            "apikey" => "821fa74b50ba3f7cba1e6c53e8fa6845",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "applicationname=woiwebsite;headendid=0",
            "channelimagesize" => "small",
            "programmeimagesize" => "small",
            "dateselected" => 0,
            "channelgenre" => "gec",
            "pageno" => "1"
        },
        "updateUserLocationDetails" => {
            "call" => "UpdateUserLocationDetails",
            "apikey" => "28267ab848bcf807b2ed53c3a8f8fc8a",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "applicationname=sourcebits",
            "city" => "",
            "state" => "",
            "country" => "",
            "area" => ""
        },
        "favoriteDetails" => {
            "call" => "UserFavoriteTvGuide_Detailed",
            "apikey" => "7a53928fa4dd31e82c6ef826f341daec",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "applicationname=sourcebits",
            "channelimagesize" => "Large",
            "programimagesize" => "Large",
            "date" => 0,
            "starthour" => 18
        },
        "featuredChannelsLP" => {
            "call" => "FeaturedChannels",
            "apikey" => "8f7d807e1f53eff5f9efbe5cb81090fb",
            "responseformat" => "json",
            "responselanguage" => "English",
            "context" => "headendid=0;applicationname=website",
            "channelimagesize" => "Large"
        },
        "browseItems" => {
            "call" => "ChannelGenreList",
            "apikey" => "918317b57931b6b7a7d29490fe5ec9f9",
            "responseformat" => "json",
            "responselanguage" => "English",
            "pageno" => "1",
            "context" => "headendid=0;applicationname=website"
        },
        "filterByHybridGenre" => {
            "call" => "HybridChannels",
            "apikey" => "fa83a11a198d5a7f0bf77a1987bcd006",
            "responseformat" => "json",
            "responselanguage" => "English",
            "pageno" => "1",
            "languageid" => "0",
            "channelimagesize" => "small",
            "context" => "headendid=0;applicationname=website",
            "hybridgenre" => "popular"
        },
        "getAppDetails" => {
            "call" => "AllApps",
            "apikey" => "f9a40a4780f5e1306c46f1c8daecee3b",
            "pageno" => 1,
            "context" => "applicationname=sourcebits;headendid=0",
            "userid" => 196878
        },
        "getAppFeatures" => {
            "call" => "AppFeatures",
            "apikey" => "19b650660b253761af189682e03501dd",
            "pageno" => 1,
            "context" => "applicationname=sourcebits;headendid=0",
            "userid" => 196878,
            "appid" => 1
        },
        "getAppTestimonials" => {
            "call" => "AppTestimonials",
            "apikey" => "1fc214004c9481e4c8073e85323bfd4b",
            "pageno" => 1,
            "context" => "applicationname=sourcebits;headendid=0",
            "userid" => 196878,
            "appid" => 1
        },
        "getAppImages" => {
            "call" => "AppGallery",
            "apikey" => "3b3dbaf68507998acd6a5a5254ab2d76",
            "pageno" => 1,
            "context" => "applicationname=sourcebits;headendid=0",
            "userid" => 196878,
            "appid" => 1
        },
        "getSitemapSections" => {
            "call" => "Sitemap",
            "apikey" => "ca8155f4d27f205953f9d3d7974bdd70",
            "context" => "Applicationname=sourcebits;headendid=0"
        },
        "getSitemapApps" => {
            "call" => "AllApps",
            "apikey" => "f9a40a4780f5e1306c46f1c8daecee3b",
            "pageno" => 1,
            "context" => "applicationname=sourcebits;headendid=0",
            "userid" => 196878
        },
        "getSitemapOperators" => {
            "call" => "OperatorList",
            "apikey" => "efe937780e95574250dabe07151bdc23",
            "pageno" => 1,
            "context" => "applicationname=website",
            "userid" => 0,
            "countryid" => 2,
            "stateid" => 22,
            "cityid" => 120,
            "areaid" => 0
        },
        "getAllMovies" => {
            "call" => "AllMovies",
            "apikey" => "dd45045f8c68db9f54e70c67048d32e8",
            "pageno" => 1,
            "context" => "applicationname=website;headendid=0",
            "fromdatetime" => "2003-04-08 18:00",
            "todatetime" => "2013-04-08 23:59",
            "productionstartyear" => 2001,
            "productionendyear" => 2013,
            "programmeimagesize" => "xxlarge",
            "castname" => "kids",
            "isfavMovies" => false
        },
        "getSitemapGenres" => {
            "call" => "ChannelGenre",
            "apikey" => "390e982518a50e280d8e2b535462ec1f",
            "context" => "Applicationname=sourcebits;headendid=0"
        },
        "getChannelsByGenre" => {
            "call" => "ChannelsByChannelGenre",
            "apikey" => "0e01938fc48a2cfb5f2217fbfb00722d",
            "context" => "Applicationname=sourcebits;headendid=0",
            "pageno" => 1,
            "channelimagesize" => "small",
            "channelgenre" => ""
        },
        "getDiscussionCategories" => {
            "call" => "ForumType",
            "apikey" => "a2137a2ae8e39b5002a3f8909ecb88fe",
            "context" => "applicationname=website",
            "headendid" => 0
        },
        "getAllDiscussions" => {
            "call" => "AllDiscussion",
            "apikey" => "2290a7385ed77cc5592dc2153229f082",
            "context" => "applicationname=sourcebits",
            "pageno" => 1,
            "forumtype" => "channels",
            "filter" => "latest"
        },
        "getDiscussionFilters" => {
            "call" => "Filter",
            "apikey" => "43dd49b4fdb9bede653e94468ff8df1e",
            "context" => "applicationname=website",
            "headendid" => 0
        },
        "searchByChannelName" => {
            "call" => "HybridChannelsByChannelName",
            "apikey" => "fc49306d97602c8ed1be1dfbf0835ead",
            "pageno" => 1,
            "context" => "applicationname=sourcebits;headendid=0",
            "channelimagesize" => "large",
            "hybridgenre" => "",
            "channelname" => ""
        },
        "getAllVideos" => {
            "call" => "VideosByFilter",
            "apikey" => "53adaf494dc89ef7196d73636eb2451b",
            "pageno" => 1,
            "context" => "applicationname=sourcebits",
            "filtertype" => "popular",
            "channelname" => "sony",
            "videogenre" => "",
            "programmeImageSize" => "xxlarge"
        },
        "getVideosGenre" => {
            "call" => "VideoGenre",
            "apikey" => "31857b449c407203749ae32dd0e7d64a",
            "context" => "applicationname=sourcebits"
        },
        "getWatchlistByDate" => {
            "call" => "WatchListDetails",
            "apikey" => "d6baf65e0b240ce177cf70da146c8dc8",
            "responseformat" => "json",
            "responselanguage" => "english",
            "pageno" => "1",
            "context" => "applicationname=website;headendid=0",
            "programmeimagesize" => "xxlarge",
            "channelimagesize" => "xxlarge",
            "imagesize" => "xxlarge",
            "allvalue" => true
        },
        "getFavouriteByDate" => {
            "call" => "UserFavoritePrograms",
            "apikey" => "f9b902fc3289af4dd08de5d1de54f68f",
            "responseformat" => "json",
            "responselanguage" => "english",
            "pageno" => "1",
            "context" => "applicationname=website;headendid=0",
            "programmeimagesize" => "large",
            "imagesize" => "large",
            "allvalue" => true
        },
        "getReminderByDate" => {
            "call" => "AllUserReminders",
            "apikey" => "01386bd6d8e091c2ab4c7c7de644d37b",
            "responseformat" => "json",
            "responselanguage" => "english",
            "pageno" => "1",
            "context" => "custid=1",
            "msisdn" => 150,
            "headendid" => 0,
            "applicationname" => "website",
            "programmeimagesize" => "xxlarge",
            "channelimagesize" => "xxlarge",
            "imagesize" => "xxlarge",
            "allvalue" => true
        },
        "getSuggestKeyword" => {
            "call" => "KeywordSuggestion",
            "apikey" => "443cb001c138b2561a0d90720d6ce111",
            "responseformat" => "json",
            "responselanguage" => "english",
            "context" => "applicationname=sourcebits",
            "Keyword" => "",
            "noofsuggestions" => "1"
        },
        "getUserAccountDetails" => {
            "call" => "UserPreference",
            "apikey" => "705f2172834666788607efbfca35afb3",
            "responseformat" => "json",
            "responselanguage" => "english",
            "context" => "applicationname=sourcebits;headendid=2645",
            "pageno" => "1"
        },
        "updateUserDetails" => {
            "call" => "UpdateMyAccount",
            "apikey" => "4e2545f819e67f0615003dd7e04a6087",
            "responseformat" => "json",
            "responselanguage" => "english",
            "context" => "applicationname=website;headendid=0",
            "pageno" => "1"
        },
        "updateHeadendInfo" => {
            "call" => "UpdateHeadendInfo",
            "apikey" => "9f36407ead0629fc166f14dde7970f68",
            "responseformat" => "json",
            "responselanguage" => "english",
            "context" => "applicationname=website;headendid=0",
            "pageno" => "1"
        },
        "getPopularFeed" => {
            "call" => "PopularFeed",
            "apikey" => "c9f95a0a5af052bffce5c89917335f67",
            "responseformat" => "json",
            "responselanguage" => "english",
            "context" => "applicationname=website;headendid=2645",
            "pageno" => "1",
            "programmeimagesize" => "large"
        },
        "updateUserSettings" => {
            "call" => "UpdateUserSettings",
            "apikey" => "03f544613917945245041ea1581df0c2",
            "responseformat" => "json",
            "responselanguage" => "english",
            "context" => "applicationname=website;headendid=0",
            "programmeimagesize" => "large"
        },
        "getUserReminders" => {
            "call" => "AllUserReminders",
            "apikey" => "01386bd6d8e091c2ab4c7c7de644d37b",
            "context" => "custid=1;msisdn=150;headendid=2645;applicationname=website",
            "applicationname" => "website",
            "programmeimagesize" => "xxlarge",
            "pageno" => 1
        },
        "getUserFavorites" => {
            "call" => "UserFavoritePrograms",
            "apikey" => "f9b902fc3289af4dd08de5d1de54f68f",
            "pageno" => 1,
            "context" => "custid=1;msisdn=150;headendid=2645;applicationname=website",
            "applicationname" => "website",
            "programmeimagesize" => "large"
        },
        "getRecentSearches" => {
            "call" => "RecentBrowsedChannel",
            "apikey" => "e5e63da79fcd2bebbd7cb8bf1c1d0274",
            "context" => "headendid=0",
            "applicationname" => "website",
            "channelimagesize" => "large",
            "pageno" => 1
        },
        "getRecentlyBrowsed" => {
            "call" => "RecentBrowsedPrograms",
            "apikey" => "818f4654ed39a1c147d1e51a00ffb4cb",
            "context" => "headendid=0;applicationname=website",
            "programmeimagesize" => "large",
            "pageno" => 1
        },
        "getLatestFeeds" => {
            "call" => "LatestFeed",
            "apikey" => "c667d53acd899a97a85de0c201ba99be",
            "context" => "headendid=0;applicationname=website",
            "programmeimagesize" => "large",
            "pageno" => 1
        },
        "getWatchlist" => {
            "call" => "WatchListDetails",
            "apikey" => "d6baf65e0b240ce177cf70da146c8dc8",
            "context" => "custid=1;msisdn=222;headendid=0;applicationname=website",
            "Programmeimagesize" => "xxLarge",
            "Channelimagesize" => "xxLarge",
            "Imagesize" => "xxLarge",
            "pageno" => 1
        },
        "getTVGuideInfo" => {
            "call" => "TVGuideDetailed",
            "apikey" => "8a1e808b55fde9455cb3d8857ed88389",
            "context" => "headendid=0;applicationname=sourcebits",
            "programmeimagesize" => "Large",
            "channelimagesize" => "Large",
            "Imagesize" => "Large",
            "channelgenre" => "all"
        },
        "getUsersWhoLikeThisFeed" => {
            "call" => "UserFeed",
            "apikey" => "db2b4182156b2f1f817860ac9f409ad7",
            "context" => "applicationname=website;headendid=0",
            "contentid" => 0,
            "contenttype" => ""
        },
        "getContextFlag" => {
            "call" => "DisplayContextualHelp",
            "apikey" => "f197002b9a0853eca5e046d9ca4663d5",
            "context" => "applicationname=website;headendid=0"
        },
        "verifyUser" => {
            "call" => "VerifyEmailAddressWithCode",
            "apikey" => "42e77b63637ab381e8be5f8318cc28a2",
            "context" => "applicationname=website",
            "criteria" => "verify"
        },
        "getQuestionnaireQuestions" => {
            "call" => "UserFeedBackQuestions",
            "apikey" => "884d79963bd8bc0ae9b13a1aa71add73",
            "context" => "applicationname=sourcebits"
        },
        "getGenreList" => {
            "call" => "HybridGenreForChannel",
            "apikey" => "69cb3ea317a32c4e6143e665fdb20b14",
            "pageno" => 1,
            "context" => "custid=1;msisdn=155;headendid= 0;applicationname=website"
        },
        "getUserGenreList" => {
            "call" => "UserFavouriteHybridGenre",
            "apikey" => "fe131d7f5a6b38b23cc967316c13dae2",
            "pageno" => 1,
            "context" => "custid=1;msisdn=155;headendid=0;applicationname=website"
        },
        "customAPI" => {},
        "getFBAccessToken" => {
            "call" => "FacebookAccessToken",
            "apikey" => "e53a0a2978c28872a4505bdb51db06dc",
            "context" => "headendid=2645"
        }
    }

  end

  def index

    cipher = OpenSSL::Cipher::Cipher.new(@alg)
    cipher.decrypt
    key = cipher.random_key

    session[:key] = key;

    render :json => {:mkey => Base64.encode64(key).gsub(/\n/, '')}
  end

  def reco

    get_params = request.GET;

    local_params = {:data => 'NOTING'}
    has_param = false

    if get_params.has_key?('mode')
      if @recoparams.has_key?(get_params[:mode])
        local_params = @recoparams[get_params[:mode]]

        get_params.each do |key, value|
          local_params[key] = get_params[key]
        end

        has_param = true
      end
    end

    mode = get_params[:mode]
    local_params.delete(:mode)

    js = "{}"
    if has_param
      js = Net::HTTP.get('services.whatsonindia.com', "/recoStar/recoStarHost.svc/"+ mode +"?".concat(local_params.collect { |k,v| "#{k}=#{CGI::escape(v.to_s)}" }.join('&')))
    end

    if js.length <= 0
      js = "{}"
    end

    cipher = OpenSSL::Cipher::Cipher.new(@alg)
    cipher.encrypt
    key = session[:key]
    iv = cipher.random_iv
    cipher.key = key
    cipher.iv = iv
    encrypted = cipher.update(js) + cipher.final

    encrypted = Base64.encode64(encrypted).gsub(/\n/, '')
    iv64 = Base64.encode64(iv).gsub(/\n/, '')

    render :json => {:data => encrypted, :pki => iv64}
  end

  def auto

    get_params = request.GET;

    local_params = {:data => 'NOTING'}
    has_param = false

    if get_params.has_key?('mode')
      if @autoparams.has_key?(get_params[:mode])
        local_params = @autoparams[get_params[:mode]]

        get_params.each do |key, value|
          local_params[key] = get_params[key]
        end

        has_param = true
      end
    end

    page = local_params["page"]
    local_params.delete(:page)

    js = "{}"
    if has_param

      url = URI.parse('http://124.153.73.108/WoiAuto/' + page + "?".concat(local_params.collect { |k,v| "#{k}=#{CGI::escape(v.to_s)}" }.join('&')))

      response = Net::HTTP.start(url.host, 80) do |http|
        http.get url.request_uri
      end
      js = response.body

      #js = Net::HTTP.get('124.153.73.108/WoiAuto/' + page, "?".concat(local_params.collect { |k,v| "#{k}=#{CGI::escape(v.to_s)}" }.join('&')))
    end

    if js.length <= 0
      js = "{}"
    end

    cipher = OpenSSL::Cipher::Cipher.new(@alg)
    cipher.encrypt
    key = session[:key]
    iv = cipher.random_iv
    cipher.key = key
    cipher.iv = iv
    encrypted = cipher.update(js) + cipher.final

    encrypted = Base64.encode64(encrypted).gsub(/\n/, '')
    iv64 = Base64.encode64(iv).gsub(/\n/, '')

    render :json => {:data => encrypted, :pki => iv64}
  end

  def tsm

    get_params = request.GET;

    local_params = {:data => 'NOTING'}
    has_param = false

    if get_params.has_key?('mode')
      if @tsmparams.has_key?(get_params[:mode])
        local_params = @tsmparams[get_params[:mode]]

        get_params.each do |key, value|
          local_params[key] = get_params[key]
        end

        has_param = true
      end
    end

    page = local_params["page"]
    local_params.delete(:page)

    js = "{}"
    if has_param
      js = Net::HTTP.get('services.whatsonindia.com', "/TSM/TSMHost.svc/"+ page +"?".concat(local_params.collect { |k,v| "#{k}=#{CGI::escape(v.to_s)}" }.join('&')))
    end

    if js.length <= 0
      js = "{}"
    end

    cipher = OpenSSL::Cipher::Cipher.new(@alg)
    cipher.encrypt
    key = session[:key]
    iv = cipher.random_iv
    cipher.key = key
    cipher.iv = iv
    encrypted = cipher.update(js) + cipher.final

    encrypted = Base64.encode64(encrypted).gsub(/\n/, '')
    iv64 = Base64.encode64(iv).gsub(/\n/, '')

    render :json => {:data => encrypted, :pki => iv64}
  end

  def user

    get_params = request.GET;

    local_params = {:data => 'NOTING'}
    has_param = false

    if get_params.has_key?('mode')
      if @userparams.has_key?(get_params[:mode])
        local_params = @userparams[get_params[:mode]]

        get_params.each do |key, value|
          local_params[key] = get_params[key]
        end

        has_param = true
      end
    end

    call = local_params["call"]
    local_params.delete(:call)

    js = "{}"
    if has_param
      js = Net::HTTP.get('services.whatsonindia.com', "/UserStar/UserStarHost.svc/"+ call +"?".concat(local_params.collect { |k,v| "#{k}=#{CGI::escape(v.to_s)}" }.join('&')))
    end

    if js.length <= 0
      js = "{}"
    end

    cipher = OpenSSL::Cipher::Cipher.new(@alg)
    cipher.encrypt
    key = session[:key]
    iv = cipher.random_iv
    cipher.key = key
    cipher.iv = iv
    encrypted = cipher.update(js) + cipher.final

    encrypted = Base64.encode64(encrypted).gsub(/\n/, '')
    iv64 = Base64.encode64(iv).gsub(/\n/, '')

    render :json => {:data => encrypted, :pki => iv64}
  end

end
