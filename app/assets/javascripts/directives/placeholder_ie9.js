
woi.directive('placeholder', ["$rootScope",function($rootScope){
	return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
    	if( !$('html').hasClass('ie9') ) return false;
    	var ph,
    			phReset = false;

    	function resetPlaceholder() {
	    	ph = elem.attr('placeholder');
	    	if( !!ph ) {
	    		elem.attr('value', ph).css('color','#999');

	    		updatePlaceholder();
	    		attachListeners();
	    	}
    	}

    	function attachListeners() {
    		elem.live('focus', function(){
          if(elem.attr('value') == ph){
            elem.attr('value', '');
          }
        })

        elem.live('blur', function(){
          if($(this).val() == ''){
            $(this).val($(this).attr('placeholder'));
          }
        });
    	}

    	function updatePlaceholder() {
    		if(!phReset) {
    			elem.focus().blur();
    			phReset = true;
    		}
    	}

    	// resetPlaceholder();

    	attrs.$observe('placeholder', function(newPlaceholder){
    		ph = newPlaceholder;
    		resetPlaceholder();
    	});

    	$rootScope.$on('inputs:reset', function(){
    		resetPlaceholder();
    	});
    }
	};
}]);
