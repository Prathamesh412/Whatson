/*
 *
 *	JQuery Range Slider Plugin
 * 	==========================
 *
 *	Author : Ameen Ahmed <ameen.ahmed@sourcebits.com>
 *
 *	Dependencies: JQuery, JqueryUI, Hammer.js
 *
 *	Files: range_slider.js, range-slider.css
 */
(function($) {
	"use strict";
	$.fn.rangeSlider = function(options) {

		var self = this;

		// Initialize the options if provided or set them to default
		self.change2 = options.change2;
		self.offset = 0;
		self.maxOffset = (options && options.maxRight && (options.maxRight - 1900-50) ) || 70;
		self.minOffset = (options && options.maxLeft && (options.maxLeft - 1900) ) || 20;
		self.currentLeft = (options && options.currentLeft && (options.currentLeft - 1900) ) || 60;

		// Html creation for the plugin
		var $container = $('<div></div>').addClass('range-slider-inner');
		var $thumbContainer = $('<div></div>').addClass('thumb-container');
		this.append($container);
		
		$container.append($thumbContainer);
		var $thumbStart = $('<div></div>').addClass('thumb').addClass('start');
		
		$thumbContainer.append($thumbStart);
		var $tooltipContainer = $('<div></div>').addClass('tooltip');
		var $tooltipArrow = $('<div></div>').addClass('tooltip-arrow');
		var $tooltip = $('<div></div>').addClass('tooltip-inner start');
		$tooltipContainer.append($tooltip).append($tooltipArrow);

		
		$('body').append($tooltipContainer);

		var $goldenBar = $('<div></div>').addClass('golden-bar');
		$thumbContainer.append($goldenBar);

		var $thumbEnd = $('<div></div>').addClass('thumb').addClass('end');
		
		$thumbContainer.append($thumbEnd);

		var $leftArrow = $('<div></div>').addClass('left-arrow');
		$container.append($leftArrow);

		var $rightArrow = $('<div></div>').addClass('right-arrow');
		$container.append($rightArrow);

		var $yearsContainer = $('<div></div>').addClass('years-container');
		var $yearsInner = $('<div></div>').addClass('years-inner');
		for(var i=0; i<14; i++) {
			var $year = $('<div></div>').addClass('year').html(1900 + i*10);
			$yearsInner.append($year);
		} 
		$yearsContainer.append($yearsInner);
		$container.append($yearsContainer);

		// On hover for the thumb dispay the tooltip
		$thumbContainer.on('mouseenter', '.thumb', function($ev) { 
			var point = $(this).position().left;
			var top = $(this).offset().top;
			var left = $(this).offset().left;
			$tooltipContainer.css('left', left - 28 + 'px');
			$tooltipContainer.css('top', top - 60 + 'px');
			var year = 1900 + Math.round(point / 5);
			$tooltip.html(year + self.offset);
			$tooltipContainer.show();
			
		});

		// On mouse leave for the thumb
		$thumbContainer.on('mouseleave', '.thumb', function() { 
			$tooltipContainer.hide();
		});

		// Listener for thumb drag
		$('.thumb').draggable({
			axis: 'x',
			containment: 'parent',
			// Call this method while dragging
			drag: function(event, ui) {

				var point = $(this).position().left;

				if($(this).hasClass('start')) {
					var endLeft = $('.thumb.end').position().left;
					$goldenBar.css('left', (point + 10) + 'px');
					$goldenBar.css('width', (endLeft - point) + 'px');

					if(Math.round(point/5) > Math.round((endLeft - 50)/5)) {
						$(this).css('left', endLeft - 50);
						return false;
					}
					self.start = 1900 + Math.round(point / 5) + self.offset;
				} else {
					var startLeft = $('.thumb.start').position().left;
					$goldenBar.css('width', (point - startLeft - 5) + 'px');

					if(Math.round(point/5) < Math.round((startLeft + 50)/5)) {
						$(this).css('left', startLeft + 50);
						return false;
					}
					self.end = 1900 + Math.round(point / 5) + self.offset;
				}
				var top = $(this).offset().top;
				var left = $(this).offset().left;
				$tooltipContainer.css('left', left - 28 + 'px');
				$tooltipContainer.css('top', top - 60 + 'px');
				
				self.year = 1900 + Math.round(point / 5);
				$tooltip.html(self.year + self.offset);

			},
			// Call this method when dragging stops
			stop: function() {
				
				var startLeft = $('.thumb.start').position().left;
				var endLeft = $('.thumb.end').position().left;
				$goldenBar.css('left', (startLeft + 10) + 'px');
				$goldenBar.css('width', (endLeft - startLeft) + 'px');
				if(self.change2) {
					self.change2({
						start: self.start,
						end: self.end
					});
				}
			}
		});

		if(Modernizr.touch){
			$('.thumb').hammer().on("dragstart", function(event) {
				self.tempLeft =  + $(this).css('left').replace('px','');

			});

			$('.thumb').hammer().on("drag", function(event) {
				
				var left = + $(this).css('left').replace('px','');

				var newLeft = self.tempLeft + event.gesture.deltaX
				if(newLeft < -5) {
					return;
				}

				if(newLeft >= 265) {
					return;
				}

				if($(this).hasClass('start')) {
					if(((+$('.thumb.end').css('left').replace('px','')) - newLeft) < 50) {
						return;
					}
				} else {
					if((newLeft - (+$('.thumb.start').css('left').replace('px',''))) < 50) {
						return;	
					}
				}


				$(this).css('left',self.tempLeft + event.gesture.deltaX);
			
				

				var point = $(this).position().left;



				if($(this).hasClass('start')) {
					var endLeft = $('.thumb.end').position().left;
					$goldenBar.css('left', (point + 10) + 'px');
					$goldenBar.css('width', (endLeft - point) + 'px');

					if(Math.round(point/5) > Math.round((endLeft - 50)/5)) {
						$(this).css('left', endLeft - 50);
						return false;
					}
					self.start = 1900 + Math.round(point / 5) + self.offset;
				} else {
					var startLeft = $('.thumb.start').position().left;
					$goldenBar.css('width', (point - startLeft - 5) + 'px');

					if(Math.round(point/5) < Math.round((startLeft + 50)/5)) {
						$(this).css('left', startLeft + 50);
						return false;
					}
					self.end = 1900 + Math.round(point / 5) + self.offset;
				}
				var top = $(this).offset().top;
				var left = $(this).offset().left;
				$tooltipContainer.css('left', left - 28 + 'px');
				$tooltipContainer.css('top', top - 60 + 'px');
				
				self.year = 1900 + Math.round(point / 5);
				$tooltip.html(self.year + self.offset);
			});	

			$('.thumb').hammer().on("dragend", function() {
				var startLeft = $('.thumb.start').position().left;
				var endLeft = $('.thumb.end').position().left;
				$goldenBar.css('left', (startLeft + 10) + 'px');
				$goldenBar.css('width', (endLeft - startLeft) + 'px');
				if(self.change2) {
					self.change2({
						start: self.start,
						end: self.end
					});
				}
			});
		}
		

		

		// Stop event bubbling on the thumb click
		$('.thumb').on('click', function($ev) {
			$ev.stopPropagation();
		});

		$('.golden-bar').on('click', function($ev) {
			$ev.stopPropagation();
		});

		// Handler for the thumb click
		$thumbContainer.on('click', function($ev) {

			var x;

			// this works for Firefox
			if($ev.offsetX==undefined){
			    x = $ev.pageX-$(this).offset().left;
			    
			}else{
			    x = $ev.offsetX;			    
			}

			x = x - 10;
			
			if(x > $(this).width() - 20) {
				x = $(this).width() - 20;
			}
			
			if(x < $thumbStart.position().left) {
				$thumbStart.animate({
					left: x
				}, 200);
				var gWidth = $thumbEnd.position().left - x;
				$goldenBar.animate({
					left: x+20,
					width: gWidth-20
				}, 200);

				self.start = 1900 + Math.round(x / 5) + self.offset;
				if(self.change2) {
				self.change2({
						start: self.start,
						end: self.end
					});
				}
			} else if(x > $thumbEnd.position().left + 20) {
				$thumbEnd.animate({
					left: x
				}, 200);
				var gWidth = x - $thumbStart.position().left;
				$goldenBar.animate({
					width: gWidth-5
				}, 200);
				self.end = 1900 + Math.round(x / 5) + self.offset;
				if(self.change2) {
				self.change2({
						start: self.start,
						end: self.end
					});
				}
			}
				
		});
		
		// When left arrow clicked...
		$leftArrow.on('click', function($ev) {
			var allDone = 0;

			function checkOffsets() {
				if(self.offset === self.minOffset) {
					$leftArrow.removeClass('enabled');
				} else {
					$leftArrow.addClass('enabled');
					$rightArrow.addClass('enabled');
				}
			}

			function animationAfter() {
				allDone += 1;
				if(allDone === 4) {
					checkOffsets();
				}
			}

			if(self.offset <=  self.minOffset) {
				return;
			}
			if(!$(this).hasClass('enabled')) {
				return;
			}
			
			$(this).removeClass('enabled');

			$yearsInner.animate({
				left: $yearsInner.position().left + 50
			}, animationAfter);
			$thumbStart.animate({
				left: $thumbStart.position().left + 50
			}, animationAfter);
			$thumbEnd.animate({
				left: $thumbEnd.position().left + 50
			}, animationAfter);
			$goldenBar.animate({
				left: $goldenBar.position().left + 50
			}, animationAfter);

			self.offset -= 10;

		});

		// When right arrow clicked...
		$rightArrow.on('click', function($ev) {

			var allDone = 0;

			function checkOffsets() {
				if(self.offset === self.maxOffset) {
					$rightArrow.removeClass('enabled');
				} else {
					$leftArrow.addClass('enabled');
					$rightArrow.addClass('enabled');
				}
			}

			function animationAfter() {
				allDone += 1;
				if(allDone === 4) {
					checkOffsets();
				}
			}

			if(self.offset >=  self.maxOffset) {
				return;
			}
			if(!$(this).hasClass('enabled')) {
				return;
			}

			$(this).removeClass('enabled');
			
			$yearsInner.animate({
				left: $yearsInner.position().left - 50
			}, animationAfter);
			$thumbStart.animate({
				left: $thumbStart.position().left - 50
			}, animationAfter);
			$thumbEnd.animate({
				left: $thumbEnd.position().left - 50
			}, animationAfter);
			$goldenBar.animate({
				left: $goldenBar.position().left - 50
			}, animationAfter);
			self.offset += 10;
			
		});

		// Set the offset of the scale from the beginning
		function setOffset(num) {
			$leftArrow.addClass('enabled');
			$rightArrow.addClass('enabled');

			self.offset = num;
			if(self.offset === self.maxOffset) {
				$rightArrow.removeClass('enabled');
				$('right-arrow').removeClass('enabled');
			} if(self.offset === self.minOffset) {
				$leftArrow.removeClass('enabled');
			}


			$yearsInner.animate({
				left: -9 - self.offset*5
			});
		}


		// Initialize all the elements
		setOffset(self.currentLeft);

		var currentYear = (new Date()).getFullYear();
		var startLeft = (currentYear - 10 - 1900 - self.offset) * 5;
		var endLeft = (currentYear - 1900 - self.offset) * 5;
		$tooltip.html(currentYear - 5);
		
		var yearsLeft = (-9 - self.offset) + 'px';
		$yearsInner.css('left',yearsLeft);

		self.start = currentYear - 10;
		self.end = currentYear;

		
		$thumbStart.css('left', startLeft + 'px');
		$thumbEnd.css('left', endLeft + 'px');
		$tooltip.css('left', (startLeft - 10) + 'px');
		$goldenBar.css('left', (startLeft + 10) + 'px');
		$goldenBar.css('width', (endLeft - startLeft) + 'px');
		
		$.fn.setOffset = setOffset;

		// Returns the current selected range
		$.fn.getRange = function() {
			return {
				start: self.start,
				end: self.end
			};
		};

		// Set the max year for the plugin
		$.fn.setMaxRight = function(num) {
			self.maxOffset = num - 1960;
		};

		// Set the min year for the plugin
		$.fn.setMaxLeft = function(num) {
			self.minOffset = num - 1900;
		};

		// Call the cb when the range value change2s
		$.fn.change2 = function(cb) {
			self.change2 = cb;
		};
	};

})(jQuery);