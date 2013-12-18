'use strict';
woi.directive('accountLocationAutocomplete', ['$filter', function($filter){

  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){

      var location_input = element.find('.location-input');


      location_input.bind('keyup', function(){ 
        console.log('api call');

        scope.triggerAutoComplete(location_input.val(), function(data){
          //Search binding and tweaks
          scope.autoComplete.data = data;
        });
      });

      var results = [];
      var map = [];

      //expands main search entirely for phone version
      if(Modernizr.mq('screen and (max-device-width: 640px)')){

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
          $('.main-nav ul').css('visibility', 'hidden');
        })
        .bind('blur', function() {
          element.css(defaultCss);
          //shows navigation
          $('.main-nav ul').css('visibility', 'visible');
        });

      }
      location_input.typeahead({
        items:14, 
        source: function (query, process) {
          $.each(scope.autoComplete.data, function (i, state) {
            map[state.cityname] = state;
            results.push(state.cityname);
            results = _.uniq(results); 
          });
          process(results);
        },
        updater: function (item) {
          var userLocation = map[item].cityname;
          //location_str.text(userLocation);
          location_input.attr('value',userLocation);
          
          // Apply changes to the scope
          scope.locationString = userLocation;
                    
          scope.$apply();

          // Update user's location
          // scope.updateUserLocation(map[item]);
          console.log('returning user location',userLocation);
          
          return userLocation;
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
          return item.replace( regex, "<span class='search-category'></span><strong>$1</strong>" );
        },
      }); 
    }
  }
}]);


