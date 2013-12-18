/*
 *
 *	JQuery Progress bar Plugin
 * 	==========================
 *
 *	Author : Ameen Ahmed <ameen.ahmed@sourcebits.com>
 *
 *	Dependencies: JQuery
 *
 *	Files: progress_bar.js
 */

(function($) {
	"use strict";
	$.fn.progress = function(options) {

		var self = this;
		console.log(options);


		// Initializations
		

		
		self.width = (options && options.width) || 200;

		if(options.value !== undefined) {
			self.value = options.value;
			self.percent = Math.round((self.value / self.width) * 100);
		} else if(options.percent !== undefined) {
			self.percent = options.percent;
			self.value = options.width * (self.percent / 100);
		} else {
			self.value = Math.round(self.width / 2);
			self.percent = 50;
		}

		// Build HTML
		var $progress = $('<div></div>').addClass('progress-inner');

		$progress.css({
			'width': self.width + 'px',
			'height': '14px',
			'background-color': 'rgba(0, 0, 0, 0.2)',
			'opacity': '40%',
			'box-shadow': 'inset 0px 0px 3px 1px rgba(0, 0, 0, 0.3), 1px 1px 1px #6a2c67',
			'border-radius': '14px',
			'overflow': 'hidden',
			'background-image': "url('/assets/img/progress-arrows.png')",
			'background-repeat': 'no-repeat',
			'background-position': '0px 5px'
		});


		var $progress_bar = $('<div></div>').addClass('bar');




		$progress_bar.css('width', self.value + 'px');
		$progress_bar.css('height', '14px');
		$progress_bar.css('background', '-webkit-gradient(linear, 0% 0%, 0% 100%, from(#F36501), to(#FA330a))');
    	$progress_bar.css('background', '-webkit-linear-gradient(top, #F36501, #FA330a)');
    	$progress_bar.css('background', '-moz-linear-gradient(top, #F36501, #FA330a)');
    	$progress_bar.css('background', '-ms-linear-gradient(top, #F36501, #FA330a)');
    	$progress_bar.css('background', '-o-linear-gradient(top, #F36501, #FA330a)');
    	$progress_bar.css('filter', "progid:DXImageTransform.Microsoft.gradient( startColorstr='#f36501', endColorstr='#fa330a',GradientType=0 )");
		$progress_bar.css('border-radius', '14px');
		$progress_bar.css('-webkit-box-shadow', 'inset 0 0 1px 1px #e19001');
		$progress_bar.css('-moz-box-shadow', 'inset 0 0 1px 1px #e19001');
		$progress_bar.css('-ms-box-shadow', 'inset 0 0 1px 1px #e19001');
		$progress_bar.css('-o-box-shadow', 'inset 0 0 1px 1px #e19001');
		$progress_bar.css('box-shadow', 'inset 0 0 1px 1px #e19001');
		$progress_bar.css('border-collapse', 'separate');

		$progress.append($progress_bar);

		self.append($progress);


		// Set the current percentage of progress
		$.fn.setPercent = function(percent) {
			self.percent = percent;
			self.value = Math.round((percent * self.width) / 100);

			$progress_bar.animate({
				width: self.value
			});
		};

		// Set the current value of progress
		$.fn.setValue = function(value) {
			self.value = value;
			
			$progress_bar.animate({
				width: value
			});
		};

		// Get current value of progress
		$.fn.getValue = function() {
			return self.value;
		};

		// Get current percentage of progress
		$.fn.getPercent = function() {
			return self.percent;
		};

		// Get the width of the progress bar
		$.fn.getWidth = function() {
			return	self.width;
		};
	};
})(jQuery);