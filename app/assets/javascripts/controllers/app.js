woi.controller('AppController', ['$scope',  '$rootScope', '$route', 'userAPI', 'recoAPI', 'autoAPI','$location',  function($scope,  $rootScope, $route,  userAPI, recoAPI, autoAPI,$location){

   // array of API calls & pattern string stored
   $scope.autoComplete = {
    data: [], 
    lastQuery: '' , 
    previousQueries:[]
  };
  $scope.goToFeed = function(tab){
    $rootScope.feedTab = tab;
    $location.path( "/socialfeed" );
  } ;
  $scope.clearMainNav = function() {
    $rootScope.$broadcast('resetHighlight', []);
  }

}]);

woi.controller('App_UserActionController', ['$scope', '$rootScope', '$compile', '$timeout', '$window', '$http', 'userAPI', 'recoAPI', function($scope, $rootScope, $compile, $timeout, $window, $http, userAPI, recoAPI){
   // current state of UI
   $scope.state = 'login';

   // form data
   $scope.data = {};

   //validate email function
   var validateEmail = function (email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\ ".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA -Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  

  // $('.dropdown-toggle').dropdown();
  // $('.dropdown-toggle').on('click touchend', function(e) {
  //   e.preventDefault();
  // });

   // Object used to store the error messages for submitSignIn() and submitForgotPassword()
   var errorMessages = {
    'missingEmail': "Please enter your Email ID",
    'existingEmail': "This Email is already registered",
    'missingPassword': "Please enter your password",
    'invalidEmail': "Please enter a valid Email",
    'invalidPassLength': "Password must be atleast 6 characters",
    'unverifiedEmail': "Please complete email activation to continue"
  };

  var toggleError = function(element, open) {
    if(open) {
      element.stop().queue('fx', []).slideDown();
      element.prev().addClass('error');
    } else {
      element.stop().queue('fx', []).hide();
      element.prev().removeClass('error');
    }
  }

  var toggleSuccess = function(element, open) {
    if(open) {
      element.stop().queue('fx', []).slideDown();
    } else {
      element.stop().queue('fx', []).slideUp();
    }
  }

  $scope.submitForgotPassword = function(){
      alert(" I AM INSIDE");
    var errorReferences = $('.errorMessage'),
    emError = $('.recover_email_error'),
    successMessage = $('.recover_email_success');
    recoverFormElements = $('#recoverEmail, #recoverSubmit, .forgotPassword > p, .forgotPassword > div.footer');

    toggleError(emError, false);
    toggleSuccess(successMessage, false);

      //validate forgotPassword email
      if(!$scope.data.forgot){
       emError.html( errorMessages.missingEmail );
       toggleError(emError, true);
       $('form[name="forgotPasswordForm"] input[name="email"]').val('').focus();
       return false;
     }
     if(!validateEmail($scope.data.forgot.emailid)){
         //alert('Email id not valid,please enter valid email id');
         $('#recoverEmail').addClass('invalid_info');
         emError.html( errorMessages.missingEmail );
         toggleError(emError, true);
         //$('form[name="forgotPasswordForm"] input[name="email"]').val('').focus();
         $('form[name="forgotPasswordForm"] input[name="email"]').focus();
         return false;
       }
      // check for valid fields
      if(this.forgotPasswordForm && this.forgotPasswordForm.$invalid){
       emError.html( errorMessages.missingEmail );
       toggleError(emError, true);
       return false;
     }
     var $container = $(".signin-container");
     $container.block();
      console.log($scope.data.forgot);
     userAPI.forgotPassword($scope.data.forgot, function(r){
       if (r.response && r.response.responsestatus) {
        successMessage.html(r.response.message);
        
        if (r.response.responsestatus.toLowerCase() == "false") {
          successMessage.css('color', '#A00');
        }

        toggleSuccess(successMessage, true);
        $scope.data = {};
        recoverFormElements.hide();
        $timeout( function() {
          toggleSuccess(successMessage, false);
          successMessage.css('color', '#0A0');
          recoverFormElements.show();
          $scope.state = 'login';
        }, 5000);
      } else {
        alert('Error sending request');
      }
      $container.unblock();
    });
   };

   $scope.submitSignIn = function(){

    var errorReferences = $('.errorMessage'),
    pwError = $('.signin_pw_error'),
    emError = $('.signin_email_error');


    toggleError(pwError, false);
    toggleError(emError, false);

    if(!$scope.data.signin){
     pwError.html( errorMessages.missingPassword );
     emError.html( errorMessages.missingEmail );
     toggleError(pwError, true);
     toggleError(emError, true);
     $('form[name="signInForm"] input[name="email"]').val('').focus();
     return false;
   }
      //check for empty email
      if(!$scope.data.signin.email){
       emError.html( errorMessages.missingEmail );
       toggleError(emError, true);
       $('form[name="signInForm"] input[name="email"]').val('').focus();
       return false;
     }
     if(!validateEmail($scope.data.signin.email)){
       emError.html( errorMessages.invalidEmail );
       toggleError(emError, true);
       $('form[name="signInForm"] input[name="email"]').val('').focus();
       $('form[name="signInForm"] input[name="password"]').val('');
       return false;
     }
      if(($('html').hasClass('ipad') || $('html').hasClass('ipod') || $('html').hasClass('iphone')) && (_.isUndefined($scope.data.signin.password) || $scope.data.signin.password == '')){
        var $qtipElement = $('div.qtip:visible');
        var $signinPassword = $qtipElement.find('.ios-password');
        var prefixvalue = $signinPassword.attr('prefixvalue');
        $scope.data.signin.password = $('#'+prefixvalue+'signpwd').val();
      }
      //check for empty password
      if(!$scope.data.signin.password){
       pwError.html( errorMessages.missingPassword );
       toggleError(pwError, true);
       $('form[name="signInForm"] input[name="password"]').val('').focus();
       return false;
     }
      //check for empty password
      if($scope.data.signin.password.length == 0){
       pwError.html( errorMessages.missingPassword );
       toggleError(pwError, true);
       $('form[name="signInForm"] input[name="password"]').val('').focus();
       return false;
     }
      // check for valid fields
      if(this.signInForm && this.signInForm.$invalid){
       pwError.html( errorMessages.missingPassword );
       emError.html( errorMessages.missingEmail );
       toggleError(pwError, true);
       toggleError(emError, true);
       return false;
     }
      // password length
     //  if($scope.data.signin.password.length < 6){
     //   pwError.html( errorMessages.invalidPassLength );
     //   toggleError(pwError, true);
     //   return false; 
     // }

      var $container = $(".signin-container");
      $container.block();
      //  Encode and send password
      // $scope.data.signin.password = Base64.encode($scope.data.signin.password);
      userAPI.signIn($scope.data.signin, function(r){
         if (r.userprofile && r.userprofile.user.userid > 0) {

            if(r.userprofile.user.emailverified == "false" && r.userprofile.user.emailverificationdays > 5){
              pwError.html( errorMessages.unverifiedEmail );
              toggleError(pwError, true);
              $container.unblock();

              // setTimeout( function() {
              //   $('div.qtip:visible').qtip('hide');
              // }, 5000);

              return false;
            }

            
            $rootScope.signInUser(r.userprofile.user);
            $scope.data = {};
         } else {
            // alert(r.userprofile.user.message);
            if( r.userprofile.user.message.toLowerCase().indexOf('password') > 0 ) {
              pwError.html( r.userprofile.user.message );
              toggleError(pwError, true);
            } else {
              emError.html( r.userprofile.user.message );
              toggleError(emError, true);
            }
            $('form[name="signInForm"] input[name="password"]').val('').removeClass('filled');
            $('form[name="signInForm"] input[name="email"]').val('').removeClass('filled').focus();
            var $qtipElement = $('div.qtip:visible');
            var $signinPassword = $qtipElement.find('.ios-password');
            var prefixvalue = $signinPassword.attr('prefixvalue');
            $('#'+prefixvalue+'_'+prefixvalue+'signpwd').val('');
            $('#'+prefixvalue+'_'+prefixvalue+'signpwd').removeClass('filled');
            $scope.data = {};
         }
         $container.unblock();
      });
   };

   $scope.clearSignupForm = function(field){
    switch(field) {
      case 'pw':
      $('form[name="signUpForm"] input[name="password"]').val('').removeClass('filled').focus();
      var $qtipElement = $('div.qtip:visible');
      var $signinPassword = $qtipElement.find('.ios-password');
      var prefixvalue = $signinPassword.attr('prefixvalue');
      $('#'+prefixvalue+'_'+prefixvalue+'signpwd').val('');
      $('#'+prefixvalue+'_'+prefixvalue+'signpwd').removeClass('filled');
      $scope.data.register.password = "";
      break;

      case 'em': 
      $('form[name="signUpForm"] input[name="email"]').val('').removeClass('filled').focus();
      $scope.data.register.email = "";
      break;

      default:
      $('form[name="signUpForm"] input[name="email"]').val('').removeClass('filled').focus();
      $('form[name="signUpForm"] input[name="password"]').val('').removeClass('filled');
      var $qtipElement = $('div.qtip:visible');
      var $signinPassword = $qtipElement.find('.ios-password');
      var prefixvalue = $signinPassword.attr('prefixvalue');
      $('#'+prefixvalue+'_'+prefixvalue+'signpwd').val('');
      $('#'+prefixvalue+'_'+prefixvalue+'signpwd').removeClass('filled');
      $scope.data.register = {};
      break;
    }
  }

  $scope.submitRegister = function(){
    var errorReferences = $('.errorMessage'),
    pwError = $('.signup_pw_error'),
    emError = $('.signup_email_error');

    toggleError(pwError, false);
    toggleError(emError, false);

      // check for valid fields
      if(this.signUpForm.$invalid){
       pwError.html( errorMessages.missingPassword );
       emError.html( errorMessages.missingEmail );
       toggleError(pwError, true);
       toggleError(emError, true);
       $scope.clearSignupForm();
       return false;
     }

      //validate 
      if (!$scope.data.register) {
       pwError.html( errorMessages.missingPassword );
       emError.html( errorMessages.missingEmail );
       toggleError(pwError, true);
       toggleError(emError, true);
       $scope.clearSignupForm();
       return false;
     }

      //validate 
      if (!$scope.data.register.email) {
       emError.html( errorMessages.missingEmail );
       toggleError(emError, true);
       $scope.clearSignupForm('em');
       return false;
     }

     if(!validateEmail($scope.data.register.email) ){
       emError.html( errorMessages.invalidEmail );
       toggleError(emError, true);
       $scope.clearSignupForm('em');
       return false;
     }
     if(($('html').hasClass('ipad') || $('html').hasClass('ipod') || $('html').hasClass('iphone'))){        
        var $qtipElement = $('div.qtip:visible');
        var $signinPassword = $qtipElement.find('.ios-password');
        var prefixvalue = $signinPassword.attr('prefixvalue');
        $scope.data.register.password = $('#'+prefixvalue+'signpwd').val();
     }
      //check for empty password
      if(!$scope.data.register.password){
       pwError.html( errorMessages.missingPassword );
       toggleError(pwError, true);
       $scope.clearSignupForm('pw');
       return false;
     }

    //check for script tag in  password
    if($scope.data.register.password){
            
      var temp = ($scope.data.register.password).match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);      
      if(temp != null && temp.length > 0){
       pwError.html( "Invalid Password !" );
       toggleError(pwError, true);
       $scope.clearSignupForm('pw');
       return false; 
      }
       
     }
      // password length
      if($scope.data.register.password.length < 6){
       pwError.html( errorMessages.invalidPassLength );
       toggleError(pwError, true);
       $scope.clearSignupForm('pw');
       return false; 
     }
     var $container = $(".signin-container");
     $container.block();
     // Encode and send password
     // $scope.data.register.password = Base64.encode($scope.data.register.password);
     userAPI.registerUser($scope.data.register, function(r){
      if (r.response && r.response.responsestatus === "true") {
            // if user is registered, login
            $scope.data.signin = $scope.data.register;
            $scope.submitSignIn();
            // display message
            alert("Registration Successful! A confirmation email has been sent to your email address.");
          } else {
            emError.html( errorMessages.existingEmail );
            toggleError(emError, true);
            $scope.clearSignupForm();
            $container.unblock();
          }
        });
     
   };



   $scope.checkFacebookRegister = function(user){

    var params = {
     apikey:	       'd96409bf894217686ba124d7356686c9',
     context:		'headendid=2645;applicationname=website',
     pageno:		'1',
     responseformat:   'json',
     responselanguage: 'English',
     email:            user.email,
     fullname:         user.name,
     firstname:        user.first_name,
     lastname:         user.last_name,
     gender:           user.gender,
     timezone:         user.timezone,
     locale:           user.locale,
     userid:           '0',
     thirdpartyid:     1,
     thirdpartyobjid:  user.id,
     username:         null,
     link:             ( user.link ? user.link : null ),
     link2:            null,
     friendid:         null
    };

    // hit http://graph.facebook.com/517267866/friends/
    // response is array, make csv and pass to friend id
    var urlFB = "https://graph.facebook.com/" + user.id + "/picture?type=large&fields=picture&callback=JSON_CALLBACK";

    $http.jsonp(urlFB).success(function(data, status){
      // Update the params object with picture from FB
      if( data && data.data && data.data.url && !data.data.is_silhouette ) {
        params.link2 = data.data.url;
      }

      FB.api('/'+ user.id +'/friends/', function(r){
        // Update the params object with freinds from FB
        var friendsString = [],
            friendCount = r.data.length;

        for(var i = 0; i < friendCount; i++) {
          friendsString.push(r.data[i].id);
        }

        params.friendid = friendsString.join(',');
	params['Content-Type'] = 'application/json'

        //userAPI.thirdPartyRegistration(params, function(r){
	$http({
    url: "/api-user/PostThirdPartyRegistration",
    method:'POST',
    data: '',
    headers: params
  }).success(function(r){
          var thirdPartyObject = addData(r.userdetails.thirdpartyregistration);
          thirdPartyObject = thirdPartyObject[0];
          if(r.userdetails && thirdPartyObject.responsestatus == "True"){
            
            var userDetails = thirdPartyObject;
            // user registered and logged
            var userObj = {
              emailaddress     : user.email,
              name             : userDetails.name,
              userid           : userDetails.userid,
              cityid           : userDetails.cityid,
              countryid        : userDetails.countryid,
              emailverified    : userDetails.emailverified,
              isdevicereminder : userDetails.isdevicereminder,
              isEmailReminder  : userDetails.isEmailReminder,
              isrecurring      : userDetails.isrecurring,
              isSMSReminder    : userDetails.isSMSReminder,
              languagefilter   : userDetails.languagefilter,
              message          : userDetails.message,
              mobile           : userDetails.mobile,
              mobilenumberverified : userDetails.mobilenumberverified,
              socialsharing    : userDetails.socialsharing,
              stateid          : userDetails.stateid,          
              utcoffsetinmin   : userDetails.utcoffsetinmin,
              priortimeinminutes : userDetails.priortimeinminutes,
              // emailverificationdays : userDetails.priortimeinminutes
              SocialSharing : userDetails.SocialSharing,
              LanguageFilter : userDetails.LanguageFilter
            };

            $rootScope.signInUser(userObj);
          }
          else{
            alert('Sorry could not process your request due to technical reasons. Please try again after some time.');
            $window.location.href='#!/home';
            $window.location.reload();
          }
        });
      });
    });
  };

  $scope.submitFacebookLogin = function(){
    // first try to login the user
    FB.login(function(response) {
     if (response.authResponse) {
        // if logged, call extra info
        FB.api('/me?fields=id,email,name,username,first_name,last_name,link,gender,timezone,locale,picture', function(response) {
          // perform facebook check and login
          $scope.checkFacebookRegister(response);
        });
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    },{scope:'email'});
  };

  $scope.displaySignIn = function(){
    $scope.state = 'login';
    $scope.data = {};
  };

  $scope.displayForgotPassword = function(){
    $scope.state = 'forgot';
    $scope.data = {};
  };

  $rootScope.$on('change:loginPopoverState', function() {
    $scope.displaySignIn();
  });


  }]); 


woi.controller('SocialController', ['$rootScope', '$scope', 'facebookAPI', function($rootScope, $scope, facebookAPI) {
 facebookAPI.graph(function(rs) {
  console.log(rs) ;
});  
}]);


woi.controller('App_UserController', [ '$rootScope', '$scope', '$compile', 'userAPI', 'recoAPI', 'userList', function($rootScope, $scope, $compile, userAPI, recoAPI, userList){
   //temporary test
   //userList.getWatchlist(function(rs){
   //$rootScope.watchlist = rs;
   //});
   //$rootScope.favorites = [];
   //$rootScope.reminds = [];

 }]); 





woi.controller('NewsletterController', ['$scope', '$rootScope', '$compile', 'userAPI', 'recoAPI', function($scope, $rootScope, $compile, userAPI, recoAPI){ 

 $scope.data = {
  'subscribe': {}
 };


 var validateEmail = function (email) { 
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\ ".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA -Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

   // Object used to store the error messages for getSubscribe()
   var errorMessages = {
    'missingEmail': "Please Enter Your Email ID",
    'invalidEmail': "Please Enter A Valid Email",
    'requestFailed': "Subscription failed, please try again"
  };

  var toggleError = function(element, open) {
    if(open) {
      element.stop().queue('fx', []).slideDown();
      element.prev().addClass('error');
    } else {
      element.stop().queue('fx', []).slideUp();
      element.prev().removeClass('error');
    }
  }

  var toggleSuccess = function(element, open) {
    if(open) {
      element.stop().queue('fx', []).slideDown();
    } else {
      element.stop().queue('fx', []).slideUp();
    }
  }

  $scope.getSubscribe = function(){

    var errorReferences = $('.errorMessage'),
    emError = $('#subscribe_email_error'),
    successMessage = $('#subscribe_email_success');

    toggleError(emError, false);
    toggleSuccess(successMessage, false);

      //check for empty email
      if(!$scope.data.subscribe){
       emError.html( errorMessages.missingEmail );
       toggleError(emError, true);
       $('input[name="subscribeEmail"]').val('').focus();
       return false;
     }

     if(!$scope.data.subscribe.mailid){
       emError.html( errorMessages.missingEmail );
       toggleError(emError, true);
       $('input[name="subscribeEmail"]').val('').focus();
       return false;
     }
      //check for valid email

      if(!validateEmail($scope.data.subscribe.mailid)){
       emError.html( errorMessages.invalidEmail );
       toggleError(emError, true);
       $('input[name="subscribeEmail"]').val('').focus();
       return false;
     }

     userAPI.subscribeNewsLetter($scope.data.subscribe, function(r){

       if (r.response && r.response.responsestatus == "true") {
        toggleSuccess(successMessage, true);
        $scope.data = {};
        setTimeout(function() {
          toggleSuccess(successMessage, false);
        }, 5000);
      } else {
       emError.html( errorMessages.requestFailed );
       toggleError(emError, true);
       $scope.data= {};
     }
   });

   };


 }]);


woi.controller('App_UserLanguageController', ['$scope', '$rootScope', '$http', '$compile', 'userAPI', 'recoAPI', 'autoAPI', 'tsmAPI', function($scope, $rootScope, $http, $compile, userAPI, recoAPI, autoAPI, tsmAPI){

  $scope.languages     = [];
  $scope.paginate      = [];
  $scope.amountDefault = 10;
  $scope.amount        = $scope.amountDefault;
  $scope.step          = 10;

  $scope.selectedLanguages = [];

  // autoCompleteFunction
  $scope.triggerAutoComplete = function( string, callback){

    if(string.length < 2)
      return false;

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

    autoAPI.autoCompleteLocation( {placename:string}, function(rs){

      $scope.safeApply(function() {
        $scope.autoComplete.data = rs.response.docs;
      });

      if (callback && typeof(callback) === "function") {
        callback($scope.autoComplete.data);
      }
    });
  };

  $scope.$on('filter:languages', function(event, locationObj) {   
    
    console.log('updating languages...');
    
    if ($rootScope.isUserLogged()) {
      userAPI.userFavoriteLanguage({stateid:locationObj.stateid, cityid:locationObj.cityid, areaid:locationObj.areaid },function(rs) {

        if(!rs.favlanguage){
          return false;
        }

        $scope.languages = rs.favlanguage.languagelist;
        $scope.loadMore();
      });   
    }
  }); 

  $scope.$on('filter:account-language-list',function(event, languageList){
    userAPI.userFavoriteLanguage({stateid:$rootScope.userInfo.stateid, cityid: $rootScope.userInfo.cityid, userid: $rootScope.getUser().userid},function(rs) {

        if(!rs.favlanguage){
          return false;
        }

        $scope.languages = rs.favlanguage.languagelist;
        if(!$scope.$$phase) 
         $scope.$apply();
        // $scope.$apply();
        $scope.loadMore();
    });   
  });
 

  $scope.updateUserLocation = function(locationObj){
    console.log('updateUserLocation .... ',locationObj);

    var params = {
      city    : locationObj.cityname, 
      state   : locationObj.statename, 
      area    : locationObj.areaid, 
      userid  : $rootScope.getUser().userid
    };

    userAPI.updateUserLocationDetails(params, function(rs){

      if(rs.response.responsestatus){ 

        $rootScope.$broadcast('update:location', locationObj);
      }
    });
    
    $scope.$broadcast('filter:languages', locationObj);
    
  };
  
  

  if(angular.isDefined($rootScope.getUser().City)){
    // we have the city name already
    $scope.locationString = $rootScope.getUser().City;
  }else{

    console.log('AUTO LOCATIOn');
    // find the city state using the Auto location    
    var _city    = geoip_city();
    var _state   = geoip_region_name();
    var _country = geoip_country_name();

    $scope.locationString = _city;

    var params = {
      country : _country,
      state   : _state,
      city    : _city
    };

    console.log('params ... ',params);

    tsmAPI.getStateAndCityIds(params, function(rs){



      var _ids = rs.getlocationids.locationids;      
  
      $rootScope.userInfo.cityid    = _ids.cityid;
      $rootScope.userInfo.cityname  = _city;
      
      $rootScope.userInfo.stateid   = _ids.stateid;
      $rootScope.userInfo.statename = _state

      $rootScope.userInfo.countryid = _ids.countryid;
       
      $.cookie('userInfo', JSON.stringify(userDetails), {expires:365});
      $scope.getLanguages();
    });
  }

  $scope.$on('update:location', function(event, locationObj) {   
    
    var userDetails = $rootScope.getUser();

    if(userDetails.userid == -1){
      return false;
    }

    $scope.locationString = locationObj.cityname;

    // Update the cookie as well
    $rootScope.userInfo.City      = userDetails.City      = locationObj.cityname;
    $rootScope.userInfo.areaid    = userDetails.areaid    = locationObj.areaid;
    $rootScope.userInfo.areatype  = userDetails.areatype  = locationObj.areatype;
    $rootScope.userInfo.cityid    = userDetails.cityid    = locationObj.cityid;
    $rootScope.userInfo.cityname  = userDetails.cityname  = locationObj.cityname;
    $rootScope.userInfo.placename = userDetails.placename = locationObj.placename;
    $rootScope.userInfo.stateid   = userDetails.stateid   = locationObj.stateid;
    $rootScope.userInfo.statename = userDetails.statename = locationObj.statename;
    $rootScope.userInfo.countryid = userDetails.countryid = locationObj.countryid;
     
    $.cookie('userInfo', JSON.stringify(userDetails), {expires:365});
  }); 
  
  var userDetails = $rootScope.getUser();
  var param;

  if(userDetails.userid == -1){
      param = {};
  }else{

    param = {
      stateid : userDetails.stateid, 
      cityid  : userDetails.cityid
    };  
  }
  
  $scope.getLanguages = function(){
    param = {
      stateid : $rootScope.userInfo.stateid, 
      cityid  : $rootScope.userInfo.cityid, 
      userid  : $rootScope.getUser().userid
    }; 

    if(param.cityid == 0 && param.stateid == 0){
      return false;
    }
    userAPI.userFavoriteLanguage(param, function(rs) {

      if(! rs.favlanguage){
        $scope.noLanguagesResponse = true;
        return false;
      }

      $scope.languages = rs.favlanguage.languagelist;
      $scope.paginate = $scope.languages.slice(0, $scope.amountDefault);
    });
  };
  
  $scope.addLanguage = function(e,langName){ 

    var lang_string = "";
    
    $scope.selectedLanguages =   $('.header-language-list input').serializeArray();
    _.each($scope.selectedLanguages, function(l) {
      lang_string += (!lang_string.length)? l.value : ", "+l.value;
    });

    $('#checkbox'+langName.replace(' ','')).parent().siblings('label').toggleClass('selectedLanguage');
    userAPI.updateUserFavoriteLanguage({languagetext: lang_string, userid:$rootScope.getUser().userid }, function(rs) {
      if(rs.response.responsestatus == "false")
        alert(rs.response.message);
      $rootScope.$broadcast('favorite:language-added');
    });
  };
  

  $scope.loadMore = function(){

    var $languages = $('#languageList');

    $languages.css({
      'max-height' : '300px',
      'overflow-y' : 'scroll',
      '-ms-overflow-y' : 'scroll'
    });
    
    
    $scope.amount += $scope.step;

    $scope.amount = ($scope.amount >= $scope.languages.length) ? $scope.languages.length : $scope.amount;

    $scope.paginate = $scope.languages.slice(0, $scope.amount);
 
    $languages.animate({scrollTop: $languages[0].scrollHeight});
  };

}]);

