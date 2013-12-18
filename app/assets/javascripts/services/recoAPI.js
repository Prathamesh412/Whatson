woi.factory("recoAPI", ['$resource', '$http', '$rootScope', function($resource, $http, $rootScope){

  var $res = $rootScope.woiresource("/appi/reco/", {responseformat: 'json', responselanguage:'English', pageno:1}, {
    exclusiveVideo:{
      method:'GET',
      params:{
        mode:'ExclusiveVideo',
        userid: $rootScope.getUser().userid
      }
    },
    search:{
      method:'GET',
      params:{
        mode:'Search',
        searchvalue: '',
        userid: $rootScope.getUser().userid//API bug
      }
    },
    addToFavorite:{
      method:'GET',
      params:{
        mode:'addRemoveFavoriteProgram',
        userid: $rootScope.getUser().userid
      }
    },
    premiers:{
      method:'GET',
      params:{
        mode:'PremieresAndUpcoming'
      }
    }
  });

  /*
  $res = {
    search: function (params, callback) {
      default_params = {
        mode:'Search',
        apikey:'10309cbe2800a679343754aa99688bac884f9fac', 
        responseformat: 'json', 
        responselanguage: 'English', 
        context:'applicationname=website;custid=1;opid=sourcebits;msisdn=155;headendid=0', 
        searchvalue: '', 
        searchcriteria: 'freetext', 
        userid: $rootScope.getUser().userid//API bug
      };

      for (i in params) {
        default_params[i] = params[i];
      }

      return $http({
        url: '/appi/get/',
        method:'GET',
        transformResponse: [function (strData, headersGetter) {

            var data = angular.fromJson(strData);

            var encrypted = {};
            encrypted.ciphertext = CryptoJS.enc.Base64.parse(data.data);

            var decrypted = CryptoJS.AES.decrypt(encrypted, CryptoJS.enc.Base64.parse(pki),
                        { iv: CryptoJS.enc.Hex.parse('00000000000000000000000000000000') });;
            var mainData = decrypted.toString(CryptoJS.enc.Utf8);
            return angular.fromJson(mainData);
        }].concat($http.defaults.transformResponse),
        params: default_params,
        
      }).success(function (data) {
        callback(data);
      });
    }
  };*/

  return $res;
}]);
