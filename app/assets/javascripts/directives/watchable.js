//woi.directive("watchable",['$rootScope','$location','userAPI',function($rootScope,$location,userAPI){
//
//	var dragStart = function(){
//		$("#watchList").addClass("watchlistactive");
//		if ($location.path() == "/Watchlist")
//		$(".watchlist-user .overlay").show();
//	};
//
//	return {
//		restrict: 'A',
//		link: function(scope, element, attrs){
//		    // let the gallery items be draggable
//		    $(element).addClass("watchable");
//		    if (Modernizr.touch){
//
//          // deactivate drag and drop for android
//		    	if ($('html').hasClass('android')) {
//		    		return false;
//		    	}
//
//		    	element.isDragged = false;
//		    	element.isClicked = false;
//
//        // Hold event for touch devices
//				Hammer(element).on("hold", function (event) {
//				    if ($(event.target).hasClass("vjs-controls") || $(event.target).hasClass("vjs-control")) {
//              return false;
//				    }
//				    var bgimg = scope[attrs.watchable].imagefilepath;
//				    $("#dragDiv").css({
//				        left: event.gesture.center.pageX - 85,
//				        top: event.gesture.center.pageY - 65,
//				        'background-image': 'url(' + bgimg + ')'
//				    });
//
//				    $("#dragDiv").show();
//
//				    if (!element.isDragged) {
//				    	element.isDragged = true;
//				    }
//				    if (!element.isClicked) {
//				    	element.isClicked = true;
//				    }
//				    event.stopPropagation();
//				    event.preventDefault();
//            event.cancelBubble = true;
//            event.returnValue = false;
//				    event.gesture.stopPropagation();
//				    event.gesture.preventDefault();
//            return false;
//				});
//
//        // Release event for touch devices
//				Hammer(element).on("release",function (event){
//					if (element.isDragged) {
//				    	element.isDragged = false;
//				    	if ($("#dragDiv").is(":visible")) {
//					    	$("#dragDiv").hide();
//						    $("#dragDiv").css({
//						        left: 0,
//						        top: 0,
//						        'background-image': ''
//						    });
//				    	}
//				    }
//				});
//
//        // Drag event for touch devices
//				Hammer(element).on("drag", function (event) {
//
//					if (element.isDragged) {
//					    if ($("#dragDiv").is(":visible")) {
//
//					        if ($("#dragDiv").css("background-image") == "none") {
//					            var bgimg = scope[attrs.watchable].imagefilepath;
//					            $("#dragDiv").css({
//					                'background-image': 'url(' + bgimg + ')'
//					            });
//
//					        }
//
//					        $("#dragDiv").css({
//					            left: event.gesture.center.pageX - 85,
//					            top: event.gesture.center.pageY - 65
//					        });
//
//					        // console.log($("#dragDiv").offset().top);
//					        // console.log($(window).scrollTop());
//					        var winTop = ($(window).scrollTop() - 100) > 0 ? ($(window).scrollTop() - 100) : 0;
//					        if ($("#dragDiv").offset().top < ($(window).scrollTop()) && $("#dragDiv").offset().top >= 0) {
//					            $('body,html').queue('fx', []).animate({
//					                scrollTop: 0
//					            }, 500);
//
//					        }
//
//					        var $elem = $(".watchlistdropbox").first();
//					        var $offset = $elem.offset();
//
//					        //Hovering on watchlist
//					        if ((event.gesture.center.pageX > $offset.left && event.gesture.center.pageX < ($offset.left + $elem.width())) && (event.gesture.center.pageY > $offset.top && event.gesture.center.pageY < ($offset.top + $elem.height()))) {
//					            if ($rootScope.isUserLogged()) {
//					                if (!$(".watchlist-excoll").is(":visible") && $location.path() != ("/Watchlist")) {
//					                    $(".watchlist-excoll").slideDown();
//					                    $("#watchList").addClass("watchlistactive")
//					                };
//					            }
//					        }
//
//					    }
//					    event.stopPropagation();
//					    event.preventDefault();
//					    event.gesture.stopPropagation();
//					    event.gesture.preventDefault();
//					}
//				});
//
//        // Drag start event for touch devices
//				Hammer(element).on("dragstart",function(event){
//					if (element.isDragged) {
//				      	$("#watchList").addClass("watchlistactive");
//				      	if ($location.path() == "/Watchlist")
//				      		$(".watchlist-user .overlay").show();
//					}
//				});
//
//		$("a",element).live("click",function(event){
//			if (element.isClicked) {
//				element.isClicked = false;
//				event.stopPropagation();
//				event.preventDefault();
//			}
//		});
//
//
//        // Drag end event for touch devices
//				Hammer(element).on("dragend", function (event) {
//
//					if (element.isDragged) {
//
//					    $("#dragDiv").hide();
//					    $("#dragDiv").css({
//					        left: 0,
//					        top: 0,
//					        'background-image': ''
//					    });
//
//					    if (!$(".watchlist-excoll").is(":visible"))
//					        $("#watchList").removeClass("watchlistactive");
//
//					    if ($location.path() == "/Watchlist")
//					        $(".watchlist-user .overlay").hide();
//
//					    _.each($(".watchlistdropbox"), function (dropSpot,index) {
//					        var $offset = $(dropSpot).offset();
//					        if ((event.gesture.center.pageX > $offset.left && event.gesture.center.pageX < ($offset.left + $(dropSpot).width())) && (event.gesture.center.pageY > $offset.top && event.gesture.center.pageY < ($offset.top + $(dropSpot).height()))) {
//
//					            if ($rootScope.isUserLogged()) {
//					                var programme = scope[attrs.watchable];
//
//					                // console.log(scope[attrs.watchable]);
//					                $rootScope.$broadcast("watchlist::add", programme);
//							        var data = {watchliststatus: true};
//
//							        if (_.isUndefined(programme.videoid)) {
//							        	data.contenttype = "program";
//							        	data.contentid = programme.programmeid;
//							        	data.videoid = 0;
//							        } else{
//							        	data.contenttype = "video";
//							        	data.contentid = programme.programmeid;
//							        	data.videoid = programme.videoid;
//							        };
//					                userAPI.toggleWatchlist(data, function (rs) {
//					                    console.log(rs);
//					                });
//					            } else {
//					            	// if (index) {};
//					            	// console.log(index)
//					                // $("#watchList").trigger("click");
//					                $("#watchList").qtip('show');
//					                if($("#watchList").hasClass('qtip')) {
//					                	console.log("true");
//					                }else{
//					                	console.log("false");
//					                }
//
//					                // alert("pop up");
//					            }
//
//					        }
//					    });
//
//						event.stopPropagation();
//					    event.preventDefault();
//					}
//
//				});
//		    } else {
//          // Drag functionality for desktop
//			    $(element).draggable({
//			      containment: "document",
//			      appendTo: "body",
//			      helper: function(){
//	    			var bgimg = scope[attrs.watchable].imagefilepath;
//			        return $("<div class='draggable-image-cont' style='background-image:url(\""+ bgimg+"\")' ><span class='plus_icon'></span></div>").clone();
//			      },
//			      cursorAt: { left: 85, top: 65 },
//			      cursor: "move",
//			      start: function(event, ui){
//			      	if ($(event.srcElement).first().hasClass("vjs-control") || $(event.srcElement).first().hasClass("vjs-controls")) {
//			      		return false;
//			      	}
//
//			      	$("#watchList").addClass("watchlistactive");
//			      	element.context.bgobj = scope[attrs.watchable];
//			      	element.context.refObj = attrs.watchable;
//			      	element.context.scope = scope;
//
//			      	if ($location.path() == "/Watchlist")
//			      		$(".watchlist-user .overlay").show();
//			      },
//			      stop: function(event, ui){
//			      	if (!$(".watchlist-excoll").is(":visible")) {
//				      	$("#watchList").removeClass("watchlistactive");
//				     }
//			      	if ($location.path() == "/Watchlist")
//			      		$(".watchlist-user .overlay").hide();
//			      }
//			    });
//
//		    }
//
//		}
//	}
//}]);
