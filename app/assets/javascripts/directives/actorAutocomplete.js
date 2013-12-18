'use strict';
woi.directive('actorAutocomplete', ['$filter','$location','$route', function($filter, $location, $route){

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
        
        if(e.charCode == 13) { 
          //scope.callFilter(element.val());
          if(element.val() == ''){
            alert('Please enter the keyword');
            return false;
          }
          var searchKey = element.val().match(/[-$%^&*()_+|~=`{}\[\];<>.\/]/gi);
                    
          if(searchKey != null && searchKey.length > 0){
            
            alert('Invalid search text');              

            element.select().focus();                                  
          }
          else{

            $location.path('/search/'+element.val()+'/movie');
            $route.reload();
            scope.$apply();            
          }

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
      element.typeahead({
        items:50, 
        source: function (query, process) {
          $.each(scope.autoComplete.data, function (i, obj) {
            
            var name  = obj.autoprompt;
            var count = obj.castprogramecount
            var temp = name + ' (' + count + ')';

            map[temp] = obj;            
            results.push(temp);

            results = _.uniq(results); 
          });
          
          process(results);
        },
        updater: function (item) {

          if(angular.isUndefined(item)){
            
            element.attr('value',element.val());
            //scope.callFilter(element.val());

            if(element.val() == ''){
              alert('Please enter the keyword');
              return false;
            }
            // goto search page :(
            $location.path('/search/'+element.val()+'/movie');
            $route.reload();
            scope.$apply();

            return item;
          }
          var selectedText = map[item].autoprompt;
          
          element.attr('value',selectedText);
          // scope.$apply();

          $location.path('/search/'+selectedText+'/movie');
          $route.reload();
          scope.$apply();

          // filter the channels based on auto-complete text
          //scope.callFilter(selectedText);

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
    }
  }
}]);


