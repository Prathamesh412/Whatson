woi.factory("autoAPI", ['$rootScope', '$resource', function($rootScope, $resource){

  return $rootScope.woiresource("/appi/auto/",{},  {

    autoComplete:{
      method:'GET',
      params:{
        mode             : 'autoComplete',
        autocompleteword : '', 
        noofrecords      : 10
      }
    },
    autoCompleteLocation:{
      method:'GET',
      params:{
        mode        : 'autoCompleteLocation',
        placename   : '', 
        noofrecords : 15 
      }
    },
    autoCompleteActors:{
      method:'GET',
      params:{
        mode             : 'autoCompleteActors',
        autocompleteword : '', 
        noofrecords      : 50 
      }
    },
    autoCompleteChannel:{
      method:'GET',
      params:{
        mode:'autoCompleteChannel',
        noofrecords:10 
      }
    },
    customAutocomplete: {
      method: 'GET',
      params: {}
    }
  });

}]);
