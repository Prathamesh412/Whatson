// filter program name
woi.filter('filterUserName', function(){
	return function(inputString) {
		if(!inputString) return '';

		var displayName = inputString.split('@');

		return displayName[0];
	}
});