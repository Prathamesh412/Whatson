// Directive will initialize the tooltip plugin on elements
woi.directive('liveTooltip',['$rootScope', function($rootScope){
	if(!Modernizr.touch) {
		return function(scope, element, attrs) {
			attrs.$observe('liveTooltip', function(ttText){
				// Set the title before applying the tooltip
				element.attr('title', ttText);
				// For dynamic elements, it doesn't work unless we set the data-original-title as well =/
				element.attr('data-original-title', ttText);

				element.tooltip({'html':true, trigger:'hover'});
				// @TODO: Looks like this isn't working in the TVGuide contents, need to figure out why and apply a fix
			});

			element.on('mouseenter', function(e) {
				var element = $(e.currentTarget),
						ttText = element.attr('live-tooltip'),
						changeText = false;

				// In case of the favorite button, the initial tooltip depends on the initial state
				if($rootScope.isUserLogged()){
					if(element.hasClass('active') && ( ttText == "Add to Favorites" || ttText == "Add to Favorite" )) {
						ttText = "Remove from Favorites";
						changeText = true;
					}
					else if((ttText == "Remove from Favorites" || ttText == "Remove from Favorite") && !element.hasClass('active')){
						ttText = 'Add to Favorites';
						changeText = true;
					}

					// In case of the watchlist button, the initial tooltip depends on the initial state
					if(element.hasClass('active') && ( ttText == "Add to Watchlist" )) {
						ttText = "Remove from Watchlist";
						changeText = true;
					}
					else if(ttText.match('Watchlist') && !element.hasClass('active')){
						ttText = 'Add to Watchlist';
						changeText = true;
					}
				}

				if( changeText ) {
					// Set the title before applying the tooltip
					// element.attr('title', ttText);
					// For dynamic elements, it doesn't work unless we set the data-original-title as well =/
					element.attr('data-original-title', ttText);
					element.attr('live-tooltip', ttText);

					element.tooltip({'html':true, trigger:'hover'});
				}
			});
		};
	}
}]);


woi.directive('liveTooltipSingleLine',['$timeout', function($timeout){
	if(!Modernizr.mq("screen and (max-width:1024px)")) {
		return function(scope, element, attrs) {
			element.on('mouseenter', function(e) {
				// if(element.attr('data-original-title') && element.attr('data-original-title').length) { return false; }

				var sWidth = element[0].scrollWidth,
		        	oWidth = element[0].offsetWidth,
		        	ttText = element.attr('live-tooltip-single-line');

	        	element.attr('title', ttText);
	        	element.attr('data-original-title', ttText);
	        	console.log("outside");
				if(sWidth > oWidth + 1) {
					console.log("inside");						
					element.tooltip({'html':true, trigger:'hover'});
					element.tooltip('show');
		        }

				element.attr('title', '');	
			});
		};
	}
}]);

woi.directive('liveTooltipLocation', ['$timeout', function($timeout){
	
	if(!Modernizr.mq("screen and (max-width:1024px)")) {
		
		return function(scope, element, attrs) {
			
			element.find('.location-input').bind('mouseenter',function(){				
				return false;		
			});

			// for first load give timeout
			var timeout_duration = 1000;

			attrs.$observe('liveTooltipLocation', function(ttText){

				$timeout(function(){

					timeout_duration = 0;

					var sWidth = element[0].scrollWidth;
		        	var oWidth = element[0].offsetWidth;
								
					if(sWidth > oWidth ){						
						element.attr('title', ttText);						
						element.attr('data-original-title', ttText);
						element.tooltip({'html':true, trigger:'hover'});
					}else{
						element.attr('title', '');					
						element.attr('data-original-title', '');
						element.tooltip({'html':true});
					}

				},timeout_duration);		
			});
		};
	}
}]);

woi.directive('watchlistTooltip', ['$timeout',function($timeout){
	if(!Modernizr.mq("screen and (max-width:1024px)")) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				$timeout(function() {
					var $parent = $('#watchlist-excoll');
					var initiallyHidden = $parent.css('display') == 'none';
					
					// Can't get height if the parent is hidden, so show it temporarily
					if(initiallyHidden) {
						$parent.show();
					}
					var sWidth = element[0].scrollWidth;
			        var oWidth = element[0].offsetWidth;
			        var ttText = attrs.watchlistTooltip;
			        if(sWidth > oWidth){

						// Set the title before applying the tooltip
						element.attr('title', ttText);
						// For dynamic elements, it doesn't work unles we set the data-original-title as well =/
						element.attr('data-original-title', ttText);
						
						
							element.tooltip({'html':true, trigger:'hover'});
							// @TODO: Looks like this isn't working in the TVGuide contents, need to figure out why and apply a fix
			        }	
					

					// If the parent was originally hidden, hide it
					if(initiallyHidden) {
						$parent.hide();
					}
					
					
				});
			}
		}
	}
}]);