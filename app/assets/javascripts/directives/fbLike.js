'use strict';
woi.directive('fbLike', ['$filter','$rootScope', function($filter, $rootScope){
  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){

    	attrs.$observe('fbLike', function(URL){
   
	    	element.fbjlike({
				appID: '135772246470432',
			    siteTitle:'WOI Facebook.',
			    href: URL,
			    onlike:function(response){
			    	alert('like');
			    },
			    onunlike:function(response){
			      alert('un-like');
			    },

			    lang:'en_US'
			});      
		});
    }
  };
}]);

// Usage :-
// <div fb-like="http://www.whatsonindia.com"></div>