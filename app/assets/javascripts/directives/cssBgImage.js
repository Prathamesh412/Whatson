'use strict'
woi.directive('cssBgImage', function(){
	return function(scope, element, attrs) {
		attrs.$observe('cssBgImage', function(URL){
			element.css({
				'background-image'		: 'url("' + URL + '")',
				'background-repeat'		: 'no-repeat',
				'background-position' : 'center center',
				'background-color' 		: 'transparent'
			});
		});
	};
});

woi.directive('cssBgImageFallback', function(){
	return function(scope, element, attrs) {

		scope.$watch(function(){return attrs;}, function()
		{
			var url = ( !!attrs.videoThumbnail ? attrs.videoThumbnail : attrs.imageFilepath );
			var youTubeFlag = 0;
			
			if(attrs.isYoutube == '1' || attrs.isYoutube == 'true'){
				youTubeFlag = 1;
			}

			if(youTubeFlag) {
 				injectYT(element, attrs.videoId)
			} else {
				element.css( 'background-image', 'url("' + url + '")');
			}
			element.css({
				'background-repeat'  : 'no-repeat',
				'background-color'   : 'transparent',
				'background-size'    : 'cover'
			})
		});

	};
});



woi.directive('backgroundImageFallback', function(){
	return function(scope, element, attrs) {

		function assignBG() {
			
			var url = ( !!attrs.videoThumbnail ? attrs.videoThumbnail : attrs.imageFilepath );					

			element.css({
				'background-image'   : "url('" + url + "')",
				'background-repeat'  : 'no-repeat',
				'background-color'   : 'transparent',
				'background-size'    : 'cover'
			});
		}

		attrs.$observe('videoThumbnail', function(){
			assignBG();
		});

		attrs.$observe('imageFilepath', function(){
			assignBG();
		});
	};
});









