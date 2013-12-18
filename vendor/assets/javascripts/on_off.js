/*
 *
 *	JQuery On/Off Plugin
 * 	==========================
 *
 *	Author : Ameen Ahmed <ameen.ahmed@sourcebits.com>
 *
 *	Dependencies: JQuery
 *
 *	Files: on_off.js, on-off.css
 */


(function($) {
	'use strict';
	
	$.fn.on_off = function(options) {

		var self = this;


		
		if(typeof options === 'string') {
			var $on_off = this.find('.on-off-container');
			var $thumb = this.find('.thumb-on-off');
			if(options === 'forceOn') {
				if(self.value === 'off') {
					toggleOnOff();		
				}
				return;
			}
			if(options === 'forceOff') {
				if(self.value === 'on') {
					toggleOnOff();		
				}
				return;
			}
			if(options === 'toggle') {
				toggleOnOff();
				return;
			}
			if(options === 'getValue') {
				return $on_off.data('value');
				return;
			}
		}
		

		// Set options
		
		self.value = (options && options.value) || 'on';


		self.change  = options.change;

		// Make this div inline-block
		self.css('display', 'inline-block');
		self.css('width', '70px');
		self.css('height', '24px');
		self.css('position', 'relative');

		var $on_off = $('<div></div>').addClass('on-off-container');
		var $on_off_inner = $('<div></div>').addClass('on-off-inner').css('left', '-42px');

		$on_off.append($on_off_inner);

		self.append($on_off);
		var $on = $('<div></div>').addClass('on').css('left', '0px').html('<span class="on-off-label">On</span>');
		var $off = $('<div></div>').addClass('off').css('left','42px').html('<span class="on-off-label">Off</span>');


		var $thumb = $('<div></div>').addClass('thumb-on-off');
		$on_off_inner.append($on).append($off);

		self.append($thumb);

		if(self.value === 'on') {
			$thumb.css('left', '42px');
			$on_off_inner.css('left', '0px');
			self.attr('data-value', 'on');
		} else {
			$thumb.css('left', '-5px');
			$on_off_inner.css('left', '-42px');
			self.attr('data-value', 'off');
		}

		function callChange() {
			if(self.change) {
				self.change(self.value)		
			}
		}

		function toggleOnOff() {
			if(self.animating) {
				return;
			}

			if(self.value === 'off') {
				$thumb.animate({
					'left': '42px'
				}, 250);
				$on_off_inner.animate({'left': '0px'},250, function() {
					self.animating = false;
					self.value = 'on';
					self.attr('data-value', 'on');
					callChange();
				});
				self.animating = true;
			}

			if(self.value === 'on') {
				$thumb.animate({
					'left': '-5px'
				}, 250);
				$on_off_inner.animate({'left': '-42px'},250, function() {
					self.animating = false;
					self.value = 'off';
					self.attr('data-value', 'off');
					callChange();
				});
				self.animating = true;
			}
		}


		self.on('click', function() {
			toggleOnOff();
		});
		if(!Modernizr.touch) {
			$thumb.draggable({
				axis: 'x',
				containment: 'parent',
				drag: function(event, ui) {
					if($(this).position().left < 0) {
						$(this).css('left', '0');
					}
					if($(this).position().left > 42) {
						$(this).css('left', '42px');
					}
					
					if(self.value === 'off' && $(this).position().left < 18) {
						
						self.value = 'on';
					
						
					}

					if(self.value === 'on' && $(this).position().left > 18) {
						self.value = 'off';
					}
					$on_off_inner.css('left', ($(this).position().left - 42) + 'px');

				},
				stop: function() {
					toggleOnOff();
				}
			});	
		}
		
		
		if(Modernizr.touch){
			
			Hammer($thumb).on('drag', function(event) {	
			
				if($(this).position().left < 0) {
					$(this).css('left', '0');
				}
				if($(this).position().left > 42) {
					$(this).css('left', '42px');
				}
				$on_off_inner.css('left', ($(this).position().left - 42) + 'px');
			});

			Hammer($thumb).on('dragend', function(event) {
				toggleOnOff();
			});		
		}
		
	};
})(jQuery);