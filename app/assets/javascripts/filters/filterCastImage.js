// filter program name
woi.filter('filterDefaultImage', function(){
	return function(inputString) {
		if(!inputString) return '../assets/img/cast-default.png';

		var imageReference = inputString.split('/').pop(),
			imageName = ( imageReference ? imageReference.split('.')[0] : 'no_image' );

		if( imageName == 'no_profile' || imageName == 'no_image' || imageName == 'profileimage' || imageName == 'null' ) {
			inputString = '../assets/img/cast-default.png';
		}
		return inputString;
	}
});

woi.filter('filterDefaultProfileImage', function(){
	return function(inputString) {
		if(!inputString) return '../assets/img/profile-default.png';

		var imageReference = inputString.split('/').pop(),
			imageName = ( imageReference ? imageReference.split('.')[0] : 'no_image' );
		regular_exp = /^[A-Za-z]+$/;
		if(!regular_exp.test(inputString))
		{	
			// alert(1);
			inputString = '/images/upload/' + inputString;
		}
		if( imageName == 'no_profile' || imageName == 'no_image' || imageName == 'profileimage' ) {
			inputString = '../assets/img/profile-default.png';
		}
		return inputString;
	}
});

woi.filter('filterDefaultDiscussionImage', function(){
	return function(inputString) {
		if(!inputString) return '../assets/img/cast-default.png';

		var imageReference = inputString.split('/').pop(),
			imageName = ( imageReference ? imageReference.split('.')[0] : 'no_image' );
		regular_exp = /^[A-Za-z]+$/;
		if(!regular_exp.test(inputString))
		{	
			// alert(1);
			inputString = '/images/upload/' + inputString;
		}
		if( imageName == 'no_profile' || imageName == 'no_image' || imageName == 'profileimage' ) {
			inputString = '../assets/img/profile-default.png';
		}
		return inputString;
	}
});