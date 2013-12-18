woi.factory("tsmAPI", ['$resource', '$rootScope', function($resource, $rootScope){

  return $rootScope.woiresource("/appi/tsm/", {responseformat:'json', responselanguage:'English', pageno:1, context:"custid=1;msisdn=222;headendid=0;applicationname=website"}, {
    // return $resource("/api-user/:call", {responseformat:'json', responselanguage:'English', pageno:1}, {
    getOperatorList:{
      method:'GET',
      params:{
        mode:'getOperatorList',
        userid:$rootScope.getUser().userid
      }
    },
    getSitemapChannels: {
      method: 'GET',
      params: {
        mode: 'getSitemapChannels'
      }
    },
    getSitemapOperators: {
      method: 'GET',
      params: {
        mode: 'getSitemapOperators',
        pageno: 1,
        userid: 0
      }
    },

    getStateAndCityIds: {
      method: 'GET',
      params: {
        mode: 'getStateAndCityIds'
      }
    }

  });

}]);
