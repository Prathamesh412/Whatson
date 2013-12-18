// woi.controller('AccountsLanguageController', ['$scope', '$rootScope', '$http', '$compile', 'userAPI', 'recoAPI', 'autoAPI', function($scope, $rootScope, $http, $compile, userAPI, recoAPI, autoAPI){

  // $scope.languages     = [];
  // $scope.paginate      = [];
  // $scope.amountDefault = 10;
  // $scope.amount        = $scope.amountDefault;
  // $scope.step          = 10;

  // $scope.selectedLanguages = [];
  // $scope.edit;

//   // autoCompleteFunction
//   $scope.triggerAutoComplete = function( string, callback){

//     if(string.length < 2)
//       return false;

//     $scope.safeApply = function(fn) {
//       var phase = this.$root.$$phase;
//       if(phase == '$apply' || phase == '$digest') {
//         if(fn && (typeof(fn) === 'function')) {
//           fn();
//         }
//       } else {
//         this.$apply(fn);
//       }
//     };

//     autoAPI.autoCompleteLocation( {placename:string}, function(rs){

//       $scope.safeApply(function() {
//         $scope.autoComplete.data = rs.response.docs;
//       });

//       if (callback && typeof(callback) === "function") {
//         callback($scope.autoComplete.data);
//       }
//     });
//   };

//   $scope.$on('filter:languages', function(event, locationObj) {   
    
//     userAPI.userFavoriteLanguage({stateid:locationObj.stateid, cityid:locationObj.cityid, areaid:locationObj.areaid },function(rs) {

//       if(!rs.favlanguage){
//         return false;
//       }

//       $scope.languages = rs.favlanguage.languagelist;
//       $scope.loadMore();
//     });   
//   }); 
 

//   $scope.updateUserLocation = function(locationObj){
    
//     var params = {
//       city    : locationObj.cityname, 
//       state   : locationObj.statename, 
//       area    : locationObj.areaid, 
//       userid  : $rootScope.getUser().userid
//     };

//     userAPI.updateUserLocationDetails(params, function(rs){

//       if(rs.response.responsestatus){
//         $scope.$broadcast('update:location', locationObj);
//       }
//     });

//     $scope.$broadcast('filter:languages', locationObj);
//   };
  
  

//   if(angular.isDefined($rootScope.getUser().City)){
//     // we have the city name already
//     $scope.locationString = $rootScope.getUser().City;
//   }else{

//     // find the city state using the Auto location    
//     var city = geoip_city();
//     //var state = geoip_region_name();

//     $scope.locationString = city;
//   }

//   $scope.$on('update:location', function(event, locationObj) {   
    
//     var userDetails = $rootScope.getUser();

//     if(userDetails.userid == -1){
//       return false;
//     }

//     $scope.locationString = locationObj.cityname;

//     // Update the cookie as well
//     $rootScope.userInfo.City      = userDetails.City      = locationObj.cityname;
//     $rootScope.userInfo.areaid    = userDetails.areaid    = locationObj.areaid;
//     $rootScope.userInfo.areatype  = userDetails.areatype  = locationObj.areatype;
//     $rootScope.userInfo.cityid    = userDetails.cityid    = locationObj.cityid;
//     $rootScope.userInfo.cityname  = userDetails.cityname  = locationObj.cityname;
//     $rootScope.userInfo.placename = userDetails.placename = locationObj.placename;
//     $rootScope.userInfo.stateid   = userDetails.stateid   = locationObj.stateid;
//     $rootScope.userInfo.statename = userDetails.statename = locationObj.statename;
     
//     $.cookie('userInfo', JSON.stringify(userDetails), {expires:365});
//   }); 
  
  // var userDetails = $rootScope.getUser();
  // var param;

  // if(userDetails.userid == -1){
  //     param = {};
  // }else{

  //   param = {
  //     stateid : userDetails.stateid, 
  //     cityid  : userDetails.cityid, 
  //   };  
  // }
  

  
//   $scope.addLanguage = function(e,langName){ 

//     var lang_string = "";
    
//     $scope.selectedLanguages =   $('.language-list input').serializeArray();
//     _.each($scope.selectedLanguages, function(l) {
//       lang_string += (!lang_string.length)? l.value : ", "+l.value;
//     });

//     $('#checkbox'+langName.replace(' ','')).parent().siblings('label').toggleClass('selectedLanguage');

//     userAPI.updateUserFavoriteLanguage({languagetext: lang_string, userid:$rootScope.getUser().userid }, function(rs) {
//       if(rs.response.responsestatus == "false")
//         alert(rs.response.message);
//     });
//   };
  



// }]);