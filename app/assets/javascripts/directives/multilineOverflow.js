woi.directive('multilineOverflow', ['$timeout', function($timeout){
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			$timeout(function() {
				var p = $( $(element.find('a, p')).get(0) ),
					  divh = element.height(),
					  parent = element.parent().parent(), // The parent element, in case the programme is hidden initially
					  grandparent = parent.parent(), // The tab wrapper, in case the entire tab is hidden
					  initiallyHidden = parent.css('display') == 'none',
					  gpHidden = grandparent.css('display') == 'none',
					  dirtyHeight = false; // Variable to flag elements whose heights have been modified, so we can add a tooltip
				
				// Can't get height if the grandparent is hidden, so show it temporarily
				if(gpHidden) {
					grandparent.show();
				}
				
				// Can't get the height if parent is hidden, so show the parent temporarily
				if(initiallyHidden)	{
					parent.show();
				}
				
				while (p.outerHeight()>divh) {
					// console.log(p.outerHeight(), divh);
				    p.text(function (index, text) {
				        return text.replace(/\W*\s(\S)*$/, '...');
				    });
				    dirtyHeight = true;
				}
				
				if(!Modernizr.mq("screen and (max-width:1024px)")) {
					if(dirtyHeight) {
						// The height was modified, so enable the tooltip to show the whole text
						p.tooltip({'html':true, trigger:'hover'});
					}
				}

				// If the parent was originally hidden, hide it
				if(initiallyHidden) {
					parent.hide();
				}
				
				// If the grandparent was originally hidden, hide it
				if(gpHidden) {
					grandparent.hide();
				}

				element.attr('title', '');	
			});
		}
	}
}]);
