'use strict';
woi.directive('searchAutoComplete', ['$rootScope', '$filter','$location','$route','autoAPI', function($rootScope, $filter, $location, $route, autoAPI){
  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){

      var APIDelay = 300,
          APITimeout,
          APILive = false,
          APIFingerprint,
          searchText,
          results = [],
          map = [],
          $searchIcon = $('.iconoverlay');

      scope.showInvalid = false;

      //expands main search entirely for phone version
      if($rootScope.device.isMobile){

        var responsiveCss = {
          'width': $('body').width()-30, 
          'position': 'absolute', 
          'right': 0, 
          'z-index': 5, 
          'background-position': '5px 5px', 
          'background-color': '#fff'
        };

        var defaultCss = {
          'width': element.width(), 
          'position': 'relative', 
          'right': 'auto', 
          'z-index': 1, 
          'background-position': element.css('background-position'), 
          'background-color': 'transparent'
        };

        //bindings
        element.bind('focus', function() {
          element.css(responsiveCss);
          //hides navigation
          $('.main-nav ul:not(.dropdown-menu)').css('visibility', 'hidden');
        })
        .bind('blur', function() {
          element.css(defaultCss);
          //shows navigation
          $('.main-nav ul:not(.dropdown-menu)').css('visibility', 'visible');
        });

      }

      element.bind('focus',function(){
        $searchIcon.removeClass('hidden-phone');
      });

      element.bind('blur',function(){
        $searchIcon.addClass('hidden-phone');
      });

      element.bind('keypress',function(e){
        var code = e.charCode || e.keyCode;
        
        // For handling the special characters  
        if(code == 13) {
                    
          scope.showInvalid = false;
          
          var searchKey = element.val().match(/[-$%^&*()_+|~=`{}\[\];<>.\/]/gi);
                    
          if(searchKey != null && searchKey.length > 0){
            
            scope.safeApply(function(){
                scope.showInvalid = true;
            });              

            element.select().focus();

            // Hide error msg after 3 sec
            setTimeout(function(){              
              scope.safeApply(function(){
                scope.showInvalid = false;
              });              
            },3000);
            
            return false;
          }
          // Valid search key.
          else{
            
            // $location.path('/search/'+element.val());
            // console.log('code... ',element.val());
            // $route.reload();
            // scope.$apply();

            // quick hack
            window.location.href = '#!/search/'+element.val();
          }
          

        }
        

      });

      
      element.typeahead({
        items: 50, 
        source: function (query, process) {
          // Cancel any timeouts so we don't generate unncessary requests
          clearTimeout(APITimeout);
          var queryString = element.val();
          // console.log('Search autocomplete!', queryString);
          if(queryString.length > 1){
            APIFingerprint = (new Date()).getTime();
            APITimeout = setTimeout(function(){
              // console.log('Generating fingerprint....', APIFingerprint);
              (function(thisFingerprint){
                // console.log('Sending request....', thisFingerprint);
                autoAPI.autoComplete( {autocompleteword:queryString}, function(rs){
                if(!rs || !rs.response || !(thisFingerprint == APIFingerprint) || !element.val().length) { 
                  // console.log('Search autocomplete returning false!', thisFingerprint, APIFingerprint, queryString, !element.val().length);
                  return false; 
                }
                  // console.log('Updating autocomplete with fresh data');
                  scope.autoComplete.data = rs.response.docs;

                  $.each(scope.autoComplete.data, function (i, state) {
                    map[state.autoprompt] = state;
                    results.push(state.autoprompt);
                    results = _.uniq(results); 
                  });

                  process(results);
                }); 
              })(APIFingerprint); 
            }, APIDelay);
            searchText = queryString;
          }          
        },

        updater: function (item) {

          if(angular.isUndefined(item)){
            
            //$location.path('/search/'+element.val());
            // $route.reload();
            // scope.$apply();

            // quick hack
            window.location.href = '#!/search/'+element.val();

            return element.val();
          }

          // We got the results from typeahead menu
          var selectedState = map[item].category;

          $location.path('/search/'+item);
          scope.$apply();
          
          // quick hack
          // window.location.href = '#!/search/'+item;

          return item;
        },
        matcher: function (item) {
          if (item.toLowerCase().indexOf(this.query.trim().toLowerCase()) != -1) {
            return true;
          }
        },
        sorter: function (items) {
          return items.sort();
        },
        highlighter: function (item) {
          var regex = new RegExp( '(' + this.query + ')', 'gi' );
          var icon = (map[item].category.toLowerCase() == "cast") ? map[item].category.toLowerCase() : map[item].genre.toLowerCase().replace(' ', '-');
          return "<span class='search-category'><i class='icon "+icon+"'></i></span>" + item.replace( regex, "<strong>$1</strong>" );
        },
      });  
    }
  };
}]);
