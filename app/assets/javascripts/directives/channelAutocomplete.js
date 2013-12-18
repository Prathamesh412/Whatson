'use strict';
woi.directive('channelAutocomplete', ['$filter','$location','$route', function($filter, $location, $route){

  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){

      element.bind('keyup', function(){ 

        scope.triggerAutoComplete(element.val(), function(data){
          //Search binding and tweaks
          scope.autoComplete.data = data;
        });
      });

      element.bind('keypress', function(e){ 
        
        if(e.charCode == 13 || e.keyCode == 13) { 
          scope.callFilter(element.val());
          return false;
        }
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
          'background-position': element.css('background-position'), 
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
      element.typeahead({
        items:10, 
        source: function (query, process) {
          $.each(scope.autoComplete.data, function (i, state) {
            map[state.channelname] = state;
            results.push(state.channelname);
            results = _.uniq(results); 
          });
          process(results);
        },
        updater: function (item) {

          if(angular.isUndefined(item)){
            
            element.attr('value',element.val());
            scope.callFilter(element.val());
            return item;
          }
          var selectedText = map[item].channelname;
          
          element.attr('value',selectedText);
          scope.$apply();

          // filter the channels based on auto-complete text
          scope.callFilter(selectedText);

          return selectedText;
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

      scope.placeholderReset = function(){
        element.val('');                  
      };

    }
  }
}]);





