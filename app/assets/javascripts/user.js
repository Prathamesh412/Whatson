woi.controller('UserController', [ '$rootScope','$location','$scope', '$compile', '$filter', '$location','$timeout', '$routeParams',   'userAPI', 'recoAPI', 'videoActions',  'userList','$location', function($rootScope,$location, $scope, $compile, $filter, $location,$timeout, $routeParams, userAPI, recoAPI, videoActions, userList,$location){
    $scope.changeurl= function(url,element){

       var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");
        $location.path("programme/" + str);

        element.stopPropagation();
        element.preventDefault();

    };

    $scope.changechannelurl= function(url,element){

        var str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");
        $location.path("channel/" + str);

        element.stopPropagation();
        element.preventDefault();

    };

  $scope.userData = $rootScope.getUser();
  $scope.remindVerified = false;




  var addZero = $filter('addZero');
  var loading = $filter('loading');

  //////////////////////////////////////
  //  Discussion  actions             //
  //////////////////////////////////////

  $scope.takeMeToInfo = function(){
    $('div.qtip:visible').qtip('hide');
    $location.path("/watchlistinfo");
    $rootScope.$emit("handleResetEmit");
  }

  //like discussion
  $scope.toggleLikeDiscussion = function(like, discussion, e, forceRefresh){
    e.preventDefault();
    var element = $( e.currentTarget );

    if(!$rootScope.isUserLogged()){

      $rootScope.beforeaction.title = "Login to Like";
      $rootScope.beforeaction.subtitle = "Please login to Like";
      // adjustments for popover for tvguide channels
      var yoffset = (element.attr("data-popover"))? (-15) : 5;
      var popover_position = ($('.sidebar').hasClass('expand') || $('.tv_guide').hasClass('tv'))? {my:'top left', at:'bottom center'} : {my: 'top center', at: 'bottom center'};
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus',
          },
          position:{
            my: popover_position.my, 
            at: popover_position.at,
            adjust:{
              y: yoffset, 
            }
          },
          style:{
            classes:'popover reminder-popover cside-popover'
          } , 
          events:{
            show:function(){
              element.parent().parent('.thumb').addClass('active');
              element.addClass('active');
            } ,
            hide:function(){
              element.parent().parent('.thumb').removeClass('active');
              element.removeClass('active');
            } 
          }, 
          content: {
            text: '<div class="popover-loader signin-loader"></div>',
            ajax: {
              url: "/user/beforeaction",
              type: 'GET',
              data: {},
              success:function(data, status ) {
                var _this = this;
                // Set the content manually (required!)
                $timeout(function(){
                  _this.set('content.text', $compile(data)($scope));
                  $timeout(function(){
                    _this.reposition();
                  });
                });
                $scope.actionObj = {
                  element: element, 
                  popconfig: qtipConfig, 
                  // after log in display the reminde popover
                  success: function(){
                    $scope.toggleLikeDiscussion(like, discussion, e, true);
                    element.qtip('hide').qtip('destroy');
                  },
                  failure: function() {
                    alert('oopss');
                  }
                };
              }
            }
          }, 
        };
      };

      var qtipConfig = resetQtip();
      element.qtip(qtipConfig).qtip('show');
      return false;

    }
    element.qtip('destroy');

    element.addClass("loading");
    loading('show', {element: element});
    var params = {
      likeStatus : (like)? 'True': 'False', 
      contentType : 'forum', 
      forumid : ( discussion.forumid ? discussion.forumid : discussion.contentid ), 
      userid: $rootScope.getUser().userid
    };

    userAPI.toggleDiscussionLike( params, function(rs) {

      if(forceRefresh) {
        location.reload();
        return false;
      }

      element.removeClass("loading");
      loading('hide', {element: element});
      if(! rs.response.responsestatus ){
        alert(rs.response.message);
        return false;
      }

      if(like) {
        if( discussion.userlike*1 == 0 ) {
          discussion.forumlikecount++;
          if( discussion.likecount ) {
            discussion.likecount++;
          }
        }
      } else {
        if( discussion.userlike*1 == 1 ) {
          discussion.forumlikecount--;
          if( discussion.likecount ) {
            discussion.likecount--;
          }
        }
      }

      // Update the state in the UI
      discussion.userlike = ( like ? 1 : 0 );
      discussion.userdislike = ( like ? 0 : 1 );
    });
    
  };

  //Flag Discussion
  $scope.flagDiscussion = function(discussion, e, forceRefresh){
    
    e.preventDefault();
    var element = $( e.currentTarget );

    if(!$rootScope.isUserLogged()){

      $rootScope.beforeaction.title = "Login to Flag this discussion";
      $rootScope.beforeaction.subtitle = "Please login to Flag this discussion";
      // adjustments for popover for tvguide channels
      var yoffset = (element.attr("data-popover"))? (-15) : 5;
      var popover_position = ($('.sidebar').hasClass('expand') || $('.tv_guide').hasClass('tv'))? {my:'top left', at:'bottom center'} : {my: 'top center', at: 'bottom center'};
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus',
          },
          position:{
            my: popover_position.my, 
            at: popover_position.at,
            adjust:{
              y: yoffset, 
            }
          },
          style:{
            classes:'popover reminder-popover cside-popover'
          } , 
          events:{
            show:function(){
              element.parent().parent('.thumb').addClass('active');
              element.addClass('active');
            } ,
            hide:function(){
              element.parent().parent('.thumb').removeClass('active');
              element.removeClass('active');
            } 
          }, 
          content: {
            text: '<div class="popover-loader signin-loader"></div>',
            ajax: {
              url: "/user/beforeaction",
              type: 'GET',
              data: {},
              success:function(data, status ) {
                var _this = this;
                // Set the content manually (required!)
                $timeout(function(){
                  _this.set('content.text', $compile(data)($scope));
                  $timeout(function(){
                    _this.reposition();
                  });
                });
                $scope.actionObj = {
                  element: element, 
                  popconfig: qtipConfig, 
                  // after log in display the reminde popover
                  success: function(){
                    $scope.flagDiscussion(discussion, e, true);
                    element.qtip('hide').qtip('destroy');
                  },
                  failure: function() {
                    alert('oopss');
                  }
                };
              }
            }
          }, 
        };
      };

      var qtipConfig = resetQtip();
      element.qtip(qtipConfig).qtip('show');
      return false;

    }
    element.qtip('destroy');

    element.addClass("loading");
    loading('show', {element: element});
    var params = {
      reportabuse: ( discussion.userreportabuse == "0")? true: false, 
      contentType : 'forum', 
      forumid : ( discussion.forumid ? discussion.forumid : discussion.contentid ), 
      userid: $rootScope.getUser().userid
    };

    userAPI.flagDiscussion( params, function(rs) {

      if(forceRefresh) {
        location.reload();
        return false;
      }

      element.removeClass("loading");
      loading('hide', {element: element});
      if(! rs.response.responsestatus ){
        alert(rs.response.message);
        return false;
      }

      discussion.userreportabuse = ( discussion.userreportabuse == "0")?'1': '0';

    });
    
  };

  // -- END Discussion  actions      




  //////////////////////////////////////
  //  Comments Actions                //
  //////////////////////////////////////
  
  //like comment
  $scope.toggleLikeComment = function(like, comment, e, forceRefresh){
    e.preventDefault();
    var element = $( e.currentTarget );

    if(!$rootScope.isUserLogged()){

      $rootScope.beforeaction.title = "Login to Like";
      $rootScope.beforeaction.subtitle = "Please login to Like";
      // adjustments for popover for tvguide channels
      var yoffset = (element.attr("data-popover"))? (-15) : 5;
      var popover_position = ($('.sidebar').hasClass('expand') || $('.tv_guide').hasClass('tv'))? {my:'top left', at:'bottom center'} : {my: 'top center', at: 'bottom center'};
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus',
          },
          position:{
            my: popover_position.my, 
            at: popover_position.at,
            adjust:{
              y: yoffset, 
            }
          },
          style:{
            classes:'popover reminder-popover cside-popover'
          } , 
          events:{
            show:function(){
              element.parent().parent('.thumb').addClass('active');
              element.addClass('active');
            } ,
            hide:function(){
              element.parent().parent('.thumb').removeClass('active');
              element.removeClass('active');
            } 
          }, 
          content: {
            text: '<div class="popover-loader signin-loader"></div>',
            ajax: {
              url: "/user/beforeaction",
              type: 'GET',
              data: {},
              success:function(data, status ) {
                var _this = this;
                // Set the content manually (required!)
                $timeout(function(){
                  _this.set('content.text', $compile(data)($scope));
                  $timeout(function(){
                    _this.reposition();
                  });
                });
                $scope.actionObj = {
                  element: element, 
                  popconfig: qtipConfig, 
                  // after log in display the reminde popover
                  success: function(){
                    $scope.toggleLikeComment(like, comment, e, true);
                    element.qtip('hide').qtip('destroy');
                  },
                  failure: function() {
                    alert('oopss');
                  }
                };
              }
            }
          }, 
        };
      };

      var qtipConfig = resetQtip();
      element.qtip(qtipConfig).qtip('show');
      return false;

    }
    element.qtip('destroy');

    element.addClass("loading");
    loading('show', {element: element});
    var params = {
      LikeStatus : like, 
      contentType : 'thread', 
      threadid : comment.threadid, 
      userid: $rootScope.getUser().userid
    };

    userAPI.toggleCommentLike( params, function(rs) {

      if(forceRefresh) {
        location.reload();
        return false;
      }

      element.removeClass("loading");
      loading('hide', {element: element});
      if(! rs.response.responsestatus ){
        alert(rs.response.message);
        return false;
      }

      // Update the state in the UI
      comment.userlike = ( like ? 1 : 0 );
      comment.userdislike = ( like ? 0 : 1 );
    }); 

  };

  //toggles flag
  $scope.toggleFlagComment = function(comment, e, forceRefresh){
    e.preventDefault();
    var element = $( e.currentTarget );

    if(!$rootScope.isUserLogged()){

      $rootScope.beforeaction.title = "Login to Report Abuse"
      $rootScope.beforeaction.subtitle = "Please login to Report Abuse";
      // adjustments for popover for tvguide channels
      var yoffset = (element.attr("data-popover"))? (-15) : 5;
      var popover_position = ($('.sidebar').hasClass('expand') || $('.tv_guide').hasClass('tv'))? {my:'top left', at:'bottom center'} : {my: 'top center', at: 'bottom center'};
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus',
          },
          position:{
            my: popover_position.my, 
            at: popover_position.at,
            adjust:{
              y: yoffset, 
            }
          },
          style:{
            classes:'popover reminder-popover cside-popover'
          } , 
          events:{
            show:function(){
              element.parent().parent('.thumb').addClass('active');
              element.addClass('active');
            } ,
            hide:function(){
              element.parent().parent('.thumb').removeClass('active');
              element.removeClass('active');
            } 
          }, 
          content: {
            text: '<div class="popover-loader signin-loader"></div>',
            ajax: {
              url: "/user/beforeaction",
              type: 'GET',
              data: {},
              success:function(data, status ) {
                var _this = this;
                // Set the content manually (required!)
                $timeout(function(){
                  _this.set('content.text', $compile(data)($scope));
                  $timeout(function(){
                    _this.reposition();
                  });
                });
                $scope.actionObj = {
                  element: element, 
                  popconfig: qtipConfig, 
                  // after log in display the reminde popover
                  success: function(){
                    $scope.toggleFlagComment(comment, e, true);
                    element.qtip('hide').qtip('destroy');
                  },
                  failure: function() {
                    alert('oopss');
                  }
                };
              }
            }
          }, 
        };
      };

      var qtipConfig = resetQtip();
      element.qtip(qtipConfig).qtip('show');
      return false;

    }
    element.qtip('destroy');

    element.addClass("loading");
    loading('show', {element: element});
    var params = {
      reportabuse : ( comment.userreportabuse == "0" ) ? true : false, 
      contentType : 'thread', 
      threadid : comment.threadid, 
      userid: $rootScope.getUser().userid
    };
    
    userAPI.toggleFlagComment( params, function(rs) {

      if(forceRefresh) {
        location.reload();
        return false;
      }

      element.removeClass("loading");
      loading('hide', {element: element});
      if(! rs.response.responsestatus ){
        alert(rs.response.message);
        return false;
      }

    if(rs.response.responsestatus == "true") {
      comment.userreportabuse = ( comment.userreportabuse == "0" ) ? '1' : '0';
    } else {
      if(console) console.log(rs.response.message);
    }

    }); 
 
  };
  // -- END Comments Actions        
  

  //////////////////////////////////////
  //  Reply Comment/Discussion        //
  //////////////////////////////////////

  $scope.discussion = {reply:{
      forumid: 0,  
      message: "", 
  }};

   var toggleError = function(element, open) {
    if(open) {
      element.stop().queue('fx', []).slideDown();
      element.prev().addClass('error');
    } else {
      element.stop().queue('fx', []).slideUp();
      element.prev().removeClass('error');
    }
   }

  $scope.commentDiscussion = function(forumid, e, callback, parameters){
    e.preventDefault();
    $scope.isComment = true;
    console.log('commentDiscussion', forumid, e, callback, parameters);
    $scope.replyDiscussion(forumid, e, callback, parameters);
  };

  $scope.replyDiscussion = function(forumid, e, callback, parameters, forceRefresh){
    e.preventDefault();

    var errorReferences = $('.errorMessage'),
        comError = $('#trending_comment_error'),
        replyError = $('#trending_reply_error');

    toggleError(comError, false);
    toggleError(replyError, false);

    var element = $( e.currentTarget ),
      elementTextarea = element.parent().find('textarea');

    if($.trim( $scope.discussion.reply.message ) == "") {
      if($scope.isComment) {
        toggleError(comError, true);
      } else {
        toggleError(replyError, true);
      }

      element.parent().find('textarea').focus();
      return false;
    }

    var params = {
      forumid: forumid, 
      commenttext: $scope.discussion.reply.message, 
      userid: $rootScope.getUser().userid,
    };

    if(!$rootScope.isUserLogged()){

      $rootScope.beforeaction.title = "Login to Reply"
      $rootScope.beforeaction.subtitle = "Please login to Reply";
      // adjustments for popover for tvguide channels
      var yoffset = (element.attr("data-popover"))? (-15) : 5;
      var popover_position = ($('.sidebar').hasClass('expand') || $('.tv_guide').hasClass('tv'))? {my:'top left', at:'bottom center'} : {my: 'top center', at: 'bottom center'};
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus',
          },
          position:{
            my: popover_position.my, 
            at: popover_position.at,
            adjust:{
              y: yoffset, 
            }
          },
          style:{
            classes:'popover reminder-popover cside-popover'
          } , 
          events:{
            show:function(){
              element.parent().parent('.thumb').addClass('active');
              element.addClass('active');
            } ,
            hide:function(){
              element.parent().parent('.thumb').removeClass('active');
              element.removeClass('active');
            } 
          }, 
          content: {
            text: '<div class="popover-loader signin-loader"></div>',
            ajax: {
              url: "/user/beforeaction",
              type: 'GET',
              data: {},
              success:function(data, status ) {
                var _this = this;
                // Set the content manually (required!)
                $timeout(function(){
                  _this.set('content.text', $compile(data)($scope));
                  $timeout(function(){
                    _this.reposition();
                  });
                });
                $scope.actionObj = {
                  element: element, 
                  popconfig: qtipConfig, 
                  // after log in display the reminde popover
                  success: function(){
                    $scope.replyDiscussion(forumid, e, null, null, true);
                    element.qtip('hide').qtip('destroy');
                  },
                  failure: function() {
                    alert('oopss');
                  }
                };
              }
            }
          }, 
        };
      };

      var qtipConfig = resetQtip();
      element.qtip(qtipConfig).qtip('show');
      return false;
    }
    element.qtip('destroy');

    element.addClass("loading");
    loading('show', {element: element});

    userAPI.replyDiscussion(params, function(rs) {

      if(forceRefresh) {
        location.reload();
        return false;
      }

      // Hide the loading indicator
      element.removeClass('loading');
      loading('hide', {element:element});
      $scope.openNotification('trendingConfirmation');
      
      // Clear the text in the textarea
      elementTextarea.val('');

      if(!rs.response.responsestatus) {
        alert(rs.reponse.message);
        return false;
      }

      if (callback && typeof(callback) === "function") {
        var item;

        if(parameters) {
          item = parameters;
        } else {
          item = {forumid: forumid};
        }

        callback(item);
      }

    });
    $scope.isComment = false;
  };
  
  $scope.openNotification = function(selector_id) {
    var parentElement = ( selector_id ? $('#' + selector_id) : $('.discussionConfirmation') ),
        adjustElements = parentElement.children('li').children('.dc_check, .dc_close'),
        totalHeight = parentElement.outerHeight();

    adjustElements.height( totalHeight );
    parentElement.fadeIn().slideDown();
    setTimeout( function() {
      $scope.closeNotification(null, parentElement);
    }, 3000);
  }

  $scope.closeNotification = function(e, element) {
    if(e) {
      e.preventDefault();
      var thisElement = $(e.currentTarget),
          parentElement = thisElement.parent().parent();
    } else {
      parentElement = element;
    }

    parentElement.slideUp().fadeOut();
  }

  $scope.openReplyForm = function(e) {
    var element = $(e.currentTarget),
      thisReplyForm = element.parents('.info').find('form.post-reply'),
      openElements = $("form.post-reply.opened");

    // Toggle all open elements, except the one we're focused on right now
    openElements.each(function(){
      if(this != thisReplyForm.get(0)) {
        $(this).slideUp().removeClass('opened');
      }
    });
    
    // Toggle the element we're focusing on. We ignored it earlier to make sure
    // it isn't toggled twice
    thisReplyForm.slideToggle().toggleClass('opened');
  };
  
  
  

  //////////////////////////////////////
  //  Channels actions                //
  //////////////////////////////////////

  // toggles Channel favorite HOME sidebar
  $scope.toggleFavoriteChannel = function(e, c, forceRefresh){

    e.preventDefault();
    var element = $(e.currentTarget);
    if(!$rootScope.isUserLogged()){

      $rootScope.beforeaction.title = "Login to Favorite";
      $rootScope.beforeaction.subtitle = "Please login to favorite";
      // adjustments for popover for tvguide channels
      var yoffset = (element.attr("data-popover"))? (-15) : 5;
      var popover_position = ($('.sidebar').hasClass('expand') || $('.tv_guide').hasClass('tv'))? {my:'top left', at:'bottom center'} : {my: 'top center', at: 'bottom center'};
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus',
          },
          position:{
            my: popover_position.my, 
            at: popover_position.at,
            adjust:{
              y: 2, 
              x: -2
            }
          },
          style:{
            classes:'popover reminder-popover cside-popover'
          } , 
          events:{
            show:function(){
              element.parent().parent('.thumb').addClass('active');
              element.addClass('active');
            } ,
            hide:function(){
              element.parent().parent('.thumb').removeClass('active');
              element.removeClass('active');
            } 
          }, 
          content: {
            text: '<div class="popover-loader signin-loader"></div>',
            ajax: {
              url: "/user/beforeaction",
              type: 'GET',
              data: {},
              success:function(data, status ) {
                var _this = this;
                // Set the content manually (required!)
                $timeout(function(){
                  _this.set('content.text', $compile(data)($scope));
                  $timeout(function(){
                    _this.reposition();
                  });
                });
                $scope.actionObj = {
                  element: element, 
                  popconfig: qtipConfig, 
                  // after log in display the reminde popover
                  success: function(){
                    $scope.toggleFavoriteChannel(e, c, true);
                    element.qtip('hide').qtip('destroy');
                  },
                  failure: function() {
                    alert('oopss');
                  }
                };
              }
            }
          }, 
        };
      };

      var qtipConfig = resetQtip();
      element.qtip(qtipConfig).qtip('show');
      return false;

    }
    element.qtip('destroy');


    // shows loading spinner
    element.addClass("loading");
    loading('show', {element: element});

    var params = {
      channelid: (c.id)? c.id : ( c.channelid ? c.channelid : c.ChannelID ), 
      userid: $rootScope.getUser().userid, 
      like: (c.favorite) ? !c.favorite : ( c.channelfavorite ? ( c.channelfavorite == "1" ? false : true) : (c.ischannelfavorite == "true" ? false : true) )
    };

    userAPI.toggleFavoriteChannel(params, function(rs) {
      if(forceRefresh) {
        location.reload();
        return false;
      }
      element.removeClass('loading');
      loading('hide', {element:element});

      if(rs.response.responsestatus == 'false') {
        alert(rs.response.message);
        return false;
      }

      c.favorite = !c.favorite;
      c.channelfavorite = (c.channelfavorite == "1")? '0' : '1';
      if(c.ischannelfavorite) {
        c.ischannelfavorite = (c.ischannelfavorite == "true" ? "false" : "true");
        if(c.ischannelfavorite == "false") {
          $rootScope.tvGuideVisibleRows--;
          $scope.adjustHeight();
          $rootScope.$broadcast('tvGuide:notEnoughFavorites', {counter: $rootScope.tvGuideVisibleRows, adjust: false});
        }
      }

      if(angular.isDefined(c.nooffans)){
        var tempCount = c.nooffans;
        if(tempCount.toString().indexOf('k') === -1){
         if(c.ischannelfavorite == "true" || c.channelfavorite == "1"){          
            c.nooffans++;
          }else{
            c.nooffans--;
          } 
        }          
      }
    });

  };
  
  // -- END Channels actions
  
  /////////////////////////////////////////////
  //    Login/Signup popover verification    //
  /////////////////////////////////////////////

  /*
   *
   * attr obj:
   *
   *  attr:{
   *    element   : DOM element
   *    popconfig : popover's previous configuration
   *    success   : function
   *    failure   : function
   *  }
   * 
   *
   */
  $scope.loadAuth = function( type, attr){


    attr.element.qtip($.extend(attr.popconfig, {
      content:{
        text: '<div class="popover-loader signin-loader"></div>',
        ajax: {
          url: '/user/'+type,
          type: 'GET',
          data: {}, 
          success: function(data, status) {
            var _this = this;
            // Set the content manually (required!)
            $timeout(function(){
              // sets the callback after the signin is complete 
              $rootScope.callback = attr;
              _this.set('content.text', $compile(data)($scope));
              $timeout(function(){
                _this.reposition();
              });
            });
          }   
        }
      }
    } )).qtip('show');

    return false;
  };
  
  
  // -- end login popover verification    



  //////////////////////////////////////
  //  GotoProgrammeNgClick            //
  //////////////////////////////////////

  $scope.goToProgramme = function(v, e){
    e.preventDefault();
    $location.path('/programme/'+v.programmename);
    
  };
  // -- END GotoProgrammeNgClick    


  //////////////////////////////////////
  //  Toggle Favorite Channel         //
  //////////////////////////////////////

  /*************************************************************
    As of 22/5/2013, this function isn't being used anywhere :P
  *************************************************************/
  $scope.toggleChannelFavorite = function(c, e){
    e.preventDefault();
    e.stopPropagation();
    var element = $(e.currentTarget);

    //// API fix for parameters now are camelCase - Using a temp var to send the API request
    //var inconsistentApiFix = JSON.stringify(p).toLowerCase();
    //var temp = JSON.parse(inconsistentApiFix);

    // shows loading spinner
    element.parent().parent('.thumb').addClass('active');
    element.addClass("loading");
    loading('show', {element: element});


    userAPI.toggleFavoriteChannel({like:(c.channelfavorite == "0"), channelid:c.channelid, userid:$rootScope.getUser().userid}, function(rs){

      // hides loading spinner
      element.removeClass('loading');
      window.setTimeout(function() {
        element.parent().parent('.thumb').removeClass('active');
      }, 1500);
      loading('hide', {element:element});

      // if it fails, display error message
      if(!rs.response.responsestatus){
        alert(rs.response.message);
      } else {
        // change the flag
        c.channelfavorite = (c.channelfavorite == "0") ? "1" : "0";
      }
    });

    location.reload();

  };

  // -- END TOggle Favorite ACTIONS 
  
  
  //////////////////////////////////////
  //  Toggle Favorite Programs        //
  //////////////////////////////////////


  $scope.toggleFavorite = function(p, e, forceRefresh){
    e.preventDefault();
    e.stopPropagation();
    var element = $(e.currentTarget);
    
    var my = ($rootScope.device.isTouch && element.offset().left < 125) ? 'top left' : 'top center';

    // if(element.attr('data-popover-position'))
    //   my = element.attr('data-popover-position');

    // verifies if user is logged
    if(!$rootScope.isUserLogged()){
      $rootScope.beforeaction.title = "Login to Favorite";
      $rootScope.beforeaction.subtitle = "Please login to favorite";
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus'
          },
          position:{
            my: my,
            at: 'bottom center',
            adjust:{
              y:5
            }
          },
          style:{
            classes:'popover reminder-popover cside-popover'
          } , 
          events:{
            show:function(){
              element.parent().parent('.thumb').addClass('active');
              element.parent().parent('.minor-details').addClass('active');
              element.addClass('active');
            } ,
            hide:function(){
              element.parent().parent('.thumb').removeClass('active');
              element.parent().parent('.minor-details').removeClass('active');
              element.removeClass('active');
            } 
          }, 
          content: {
            text: '<div class="top left popover-loader signin-loader"></div>',
            ajax: {
              url: "/user/beforeaction",
              type: 'GET',
              data: {},
              success:function(data, status ) {
                var _this = this;
                // Set the content manually (required!)
                $timeout(function(){
                  _this.set('content.text', $compile(data)($scope));
                  $timeout(function(){
                    _this.reposition();
                  });
                });
                $scope.actionObj = {
                  element: element, 
                  popconfig: qtipConfig, 
                  // after log in display the reminde popover
                  success: function(){
                    $scope.toggleFavorite(p, e, true);
                    element.qtip('hide').qtip('destroy');
                  },
                  failure: function() {
                    alert('oopss');
                  }
                };
              }
            }
          }
        };
      };
      var qtipConfig = resetQtip();
      element.qtip(qtipConfig).qtip('show');

      return false;

    }
    element.qtip('destroy');


    // API fix for parameters now are camelCase - Using a temp var to send the API request
    var inconsistentApiFix = JSON.stringify(p).toLowerCase();
    var temp = JSON.parse(inconsistentApiFix);

    // shows loading spinner
    element.parent().parent('.thumb').addClass('active');
    element.addClass("loading");
    loading('show', {element: element});

    // API fix for parameter programmeid changed to programid
    if(_.isUndefined( temp.programmeid ))
      temp.programmeid = temp.programid;

    userAPI.toggleFavoriteProgramme({like:(temp.isfavorite == "0"), programmeid:temp.programmeid, userid:$rootScope.getUser().userid}, function(rs){
      if(forceRefresh) {
        location.reload();
        return false;
      }

      // hides loading spinner
      element.removeClass('loading');
      window.setTimeout(function() {
        element.parent().parent('.thumb').removeClass('active');
      }, 1500);
      loading('hide', {element:element});

      console.log("toggleFavoriteProgramme");
      // if it fails, display error message
      if(!rs.response.responsestatus){
        alert(rs.response.message);
      } else {
        // change the flag
        p.isfavorite = (p.isfavorite == "0") ? "1" : "0";
        console.log("toggleFavoriteProgramme => Else");
        if(p.isfavorite == "1"){
          $rootScope.$broadcast("watchlist::add",p);         
        }else{
          $rootScope.$broadcast("watchlist::FavRem::Remove",p);         
        }

        if(angular.isDefined(p.nooffans)){
        
          var tempCount = p.nooffans;
          if(tempCount.toString().indexOf('k') === -1){
           if(p.isfavorite == "1"){ 
              p.nooffans++;
            }else{
              p.nooffans--;
            } 
          }          
        }
        
      }
    });

  };

  // -- END TOggle Favorite ACTIONS 


  //////////////////////////////////////
  //  Toggle Reminder ACTION          //
  //////////////////////////////////////


  // -- END Toggle Reminder ACTION  
  
  var toggleReminderOnServer = function(p, e, isRepeated, fromVerification, forceRefresh){
    
    // console.log('------>>>> toggleReminderOnServer === p == ');
    // console.log(p);    

    // console.log('user details .... === ',$rootScope.userInfo);

    var element = $(e.currentTarget);
    var my = 'top center';

    if(element.attr('data-popover-position'))
      my = element.attr('data-popover-position');


      // shows loading spinner
      element.parent().parent('.thumb').addClass('active');
      element.addClass("loading");
      if(!element.hasClass('programme-reminder'))
      {
        loading('show', {element: element});
      } 

      
      var addZero   = $filter('addZero');
      var isoToDate = $filter('isoToDate');

      //console.log('Initially p.isreminder == '+p.isreminder);

      if(angular.isUndefined(isRepeated) || !isRepeated){
        isRepeated = "false";
      }



      if(p.isreminder == "0" || isRepeated == "true" || fromVerification){

        var d = isoToDate(p.starttime);
        console.log('user details ....  ?????? === ',$rootScope.userInfo);
        var contextParam  = "custid=1;headendid=0;applicationname=website;msisdn="+$rootScope.getUser().mobile;
        var smsReminder   = $rootScope.userInfo.isSMSReminder;
        var emailReminder = $rootScope.userInfo.isEmailReminder;

        // console.log("toggleReminderOnServer() .... smsReminder = ",smsReminder);
        // console.log("toggleReminderOnServer() .... emailReminder = ",emailReminder);


        // If both the thing are off, then set email as TRUE
        if(smsReminder.toLowerCase() == "false" && emailReminder.toLowerCase() == "false"){

          emailReminder = "true";

          var params = {

            userid               : $rootScope.getUser().userid,
            updatetype           : "email reminder",
            updatevalue          : true
          };

          userAPI.updateUserSettings(params, function(rs){
            // Let the API update the user settings.
          });
        }
        
        var params = {
          channelid          : p.channelid,
          programmeid        : p.programmeid,
          starttime          : "" + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()),
          userid             : $rootScope.getUser().userid,
          priortimeinminutes : $rootScope.getUser().priortimeinminutes,
          isemailreminder    : emailReminder,
          issmsreminder      : smsReminder,
          isdevicereminder   : false,
          isrecurring        : isRepeated
        };

        console.log('params for adding reminder');
        console.log(params);
        
        userAPI.addReminder(params, function(rs){
          if(forceRefresh) {
            location.reload();
            return false;
          }

          console.log('REMINDEr response');
          console.log(rs);
          // hides loading spinner
          element.removeClass('loading');

          // window.setTimeout(function() {
          //   element.parent().parent('.thumb').removeClass('active');
          // }, 1500);
          
          loading('hide', {element:element});

          // if it fails, display error message
          if(rs.response.responsestatus == "false"){
            $scope.isReminderSet = false;            

            setTimeout(function(){
              alert(rs.response.message);
              if(!element.parent().parent().hasClass('schedule-item'))
                element.qtip('destroy');
              else
                element.qtip('hide');
            });
              
            
            
            //return false;
          } else {
            // change the flag
            //p.isreminder = (p.isreminder == "0") ? "1" : "0";
            console.log('added reminder');
          

            p.isreminder = "1";
            p.reminderid = rs.response.reminderid;
            p.statusMsg  = "Set Reminder";
            $scope.isReminderSet = true;
            $rootScope.$broadcast("watchlist::add",p,$rootScope.reminderList);
            $rootScope.currentItemForReminder.isRepeated = isRepeated;

            // $rootScope.$broadcast("sync:nextSchedulePrograms",$rootScope.reminderList);
            console.log(p);

            // Broadcasting to update the reminders in the nextSchedule section
            $rootScope.$broadcast('programme:syncReminder', {item: p});
          }
        });
      }
    
      // Remove the reminder 
      else {
        //console.log("removing the reminder");
        if($location.path() == "/Watchlist"){
          var elemfc = $(".watchlist-header .btn-group a:first-child")
          var txt = elemfc.text();
          txt = txt.trim();
          txt = txt.toLowerCase()
          if(txt == "reminders" && elemfc.hasClass('active'))
            $('.qtip').hide();
        }

        // hides loading spinner
        element.removeClass('loading');

        // window.setTimeout(function() {
        //   element.parent().parent('.thumb').removeClass('active');
        // }, 1500);
        
        loading('hide', {element:element});
        
        // console.log('reminder id == '+p.reminderid);

        userAPI.removeReminder({reminderid:p.reminderid, repeatReminder: false},function(rs){
          console.log('removed the like');
          console.log(rs);

          if(rs.response.responsestatus == "true"){

            $rootScope.currentItemForReminder.isRepeated = false;
            // You have Removed the reminder
            var itemInList;
            if (!_.isUndefined($rootScope.reminderList))
              _.each($rootScope.reminderList,function(item,index){
                if (p.programmeid == item.programmeid && p.reminderid == item.reminderid) {
                  // item.isreminder = "0";
                  // item.reminderid = "0";      
                  itemInList = index;
                }
              });

            if (!_.isUndefined(itemInList)){
              $rootScope.reminderList[itemInList].isreminder = "0";
              $rootScope.reminderList[itemInList].reminderid = "0";
            }

            p.isreminder = "0";
            p.reminderid = "0";
            $rootScope.$broadcast("watchlist::FavRem::Remove",p,$rootScope.reminderList);
            // $rootScope.$broadcast("sync:nextSchedulePrograms",$rootScope.reminderList);
            $timeout(function(){
              $rootScope.reminderList = undefined;
            });
            p.statusMsg  = "Cancelled Reminder";

            // Broadcasting to update the reminders in the nextSchedule section
            $rootScope.$broadcast('programme:syncReminder', {item: p});
          }
        });
      }

      console.log('END p.isreminder == '+p.isreminder);
  };

  $scope.setRepeatReminder = function(e){

    console.log('setRepeatReminder ----->>>>> p == ');
    console.log($rootScope.currentItemForReminder);

    // The boolean true is to make sure only SET api is called
    toggleReminderOnServer($rootScope.currentItemForReminder, e, "true", true);

  }; 

  $scope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  $scope.toggleReminder = function(p, e, x, reminderList, forceRefresh){

    e.preventDefault();
    e.stopPropagation();

    $scope.userData = $rootScope.getUser();
    
    $rootScope.reminderList = reminderList;

    var popoverClass = 'cside-popover';
    var element = $(e.currentTarget);
    if($location.path().match('Programme') && element.parent().parent().hasClass('schedule-item')){
      popoverClass = 'rside-popover';
    }
    $rootScope.currentItemForReminder = p;

    // to clear the msg
    $scope.safeApply(function(){
      p.statusMsg  = "";
    });
    
    var userDetails = $rootScope.getUser();

    var my = 'top center'

    // if(element.attr('data-popover-position'))
      //my = element.attr('data-popover-position');

    // var my = ($rootScope.device.isTouch && element.offset().left < 125) ? 'top left' : 'top center';
    var my = ($rootScope.device.isTouch && element.offset().left > 600)? 'top right' : (($rootScope.device.isTouch && element.offset().left < 125) ? 'top left' : 'top center');
    if($rootScope.device.isMobile)
      my = ($rootScope.device.isMobile && element.offset().left > 200)? 'top right' : (($rootScope.device.isMobile && element.offset().left < 100) ? 'top left' : 'top center');
    var reminderPopoverClass = '';
    if(my == 'top right'){
      reminderPopoverClass= ' watchlist-hover-popover';
    }
    // verifies if user is logged
    if(!$rootScope.isUserLogged()){
      $rootScope.beforeaction.title = "Login to Set Reminder";
      $rootScope.beforeaction.subtitle = "Please login to set reminder";
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus',
          },
          position:{
            my: my, //(Modernizr.mq("screen and (max-width:640px)")) ? 'top right' : my,
            at: 'bottom center',
            adjust:{
              y:5,
              x: 0//(Modernizr.mq("screen and (max-width:640px)")) ? 55 : 0
            }
          },
          style:{
            classes:'popover reminder-popover cside-popover'+reminderPopoverClass
          } , 
          events:{
            show:function(){
              element.parent().parent('.thumb').addClass('active');
              element.parent().parent('.minor-details').addClass('active');
              element.parent().parent('.schedule-item').addClass('active');
              element.addClass('active');
            } ,
            hide:function(){ 
                element.parent().parent('.thumb').removeClass('active');
                element.parent().parent('.minor-details').removeClass('active');
                element.parent().parent('.schedule-item').removeClass('active');
                element.removeClass('active');
            } ,
            render: function(event, api) {
              contentBox = api.elements.content;
              // if(Modernizr.mq("screen and (max-width:640px)")){
              //   var elem = api.elements.tip;
              //   elem.addClass('tip-watchlist-pos-fix')
              // }
            }
          }, 
          content: {
            text: '<div class="top left popover-loader signin-loader"></div>',
            ajax: {
              url: "/user/beforeaction",
              type: 'GET',
              data: {},
              success:function(data, status ) {
                var _this = this;
                // Set the content manually (required!)
                $timeout(function(){
                  _this.set('content.text', $compile(data)($scope));
                  $timeout(function(){
                    _this.reposition();
                  });
                });
                $scope.actionObj = {
                  element: element, 
                  popconfig: qtipConfig, 
                  // after log in display the reminde popover
                  success: function(){
                    console.log('success.........');
                    if($rootScope.isUserLogged()){
                      console.log("user was logged in");
                      $scope.toggleReminder(p, e, null, true);
                      element.qtip('hide').qtip('destroy');
                    }else{
                      console.log("user was NOT logged in");
                    }
                  },
                  failure: function() {
                    alert('oopss');
                  }
                };
              }
            }
          }, 
        };
      };
      var qtipConfig = resetQtip();
      element.qtip(qtipConfig).qtip('show');

      return false;

    }
    element.qtip('destroy');
    if($rootScope.device.isMobile){
      reminderPopoverClass = reminderPopoverClass + ' mobile-reminder-popup';
    }
    if($rootScope.isUserLogged()){
      $rootScope.beforeaction.title = "Login to Set Reminder";
      $rootScope.beforeaction.subtitle = "Please login to set reminder";
      // alert('my is '+my);
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus',
          },
          position:{
            my: (Modernizr.mq("screen and (max-width:640px)")) ? 'top right' : my,
            at: 'bottom center',
            adjust:{
              y:5,
              x:0 //(Modernizr.mq("screen and (max-width:640px)")) ? 10 : 0
            }
          },
          style:{
            classes:'popover reminder-popover android-tip-fix '+popoverClass +reminderPopoverClass
          } , 
          events:{
            show:function(){
              // element.parent().parent('.thumb').addClass('active');
              element.parent().parent('.minor-details').addClass('active');
              element.parent().parent('.schedule-item').addClass('active');
              // element.addClass('active');
            } ,
            hide:function(){
                element.parent().parent('.thumb').removeClass('active');
                element.parent().parent('.minor-details').removeClass('active');
                if(!$rootScope.isUserLogged() || $rootScope.currentItemForReminder.isreminder == '0'){ 
                  element.parent().parent('.schedule-item').removeClass('active');
                  if(element.parent().parent().hasClass('programme-info')){
                    element.removeClass('active');
                  }
                }
            } 
          }, 
          content: {
            text: '<div class="top left popover-loader signin-loader"></div>',
            ajax: {
              url: "/user/reminders",
              type: 'GET',
              data: {},
              success:function(data, status ) {
                var _this = this;
                // Set the content manually (required!)
                $timeout(function(){
                  _this.set('content.text', $compile(data)($scope));
                  $timeout(function(){
                    _this.reposition();
                  });
                });
                $scope.actionObj = {
                  element: element, 
                  popconfig: qtipConfig, 
                  // after log in display the reminde popover
                  success: function(){
                    console.log('success.........');
                    if($rootScope.isUserLogged()){
                      console.log("user was logged in");
                      $scope.toggleReminder(p, e);
                      element.qtip('hide').qtip('destroy');
                    }else{
                      console.log("user was NOT logged in");
                    }
                  },
                  failure: function() {
                    alert('oopss');
                  }
                };
              }
            }
          }, 
        };
      };
      
      if(angular.isUndefined($rootScope.currentItemForReminder.channelid)
          || $rootScope.currentItemForReminder.channelid == 0
          || $rootScope.currentItemForReminder.channelid == "0" 
          || angular.isUndefined($rootScope.currentItemForReminder.starttime)){
        alert('Reminder can not be set because program is currently not airing on any channel.');

        
        // remove the active class
        element.parent().parent('.thumb').removeClass('active');
        element.parent().parent('.minor-details').removeClass('active');
        element.parent().parent('.schedule-item').removeClass('active');          
        element.removeClass('active');
          
        
        return false;
      }
      
      var qtipConfig = resetQtip();

      if(Modernizr.mq("screen and (max-width:640px)") && (x=="sliderWL" || x=='landingWL')) {
        var cf =  qtipConfig;
        cf.position.my = 'center';
        cf.position.at = 'center';
        cf.position.target = $(window);
      }

      // if(Modernizr.mq("screen and (max-width:640px)") && x=='landingWL') {
      //   var cf1 =  qtipConfig;
      //   cf1.position.my = 'top left';
      //   cf1.position.at = 'bottom right';
      //   cf1.position.adjust.x = 0;
      // }
      element.qtip(qtipConfig).qtip('show');


    }
    if($rootScope.isUserLogged()){

      // Only if the the mobile no. is verified set the Reminder
      if(userDetails.mobilenumberverified == "true"){

        toggleReminderOnServer($rootScope.currentItemForReminder, e, null, null, forceRefresh);
      }

      else{
        // Mobile no. is NOT verified ! The UI is good enough to continue

        // Send on email
        toggleReminderOnServer($rootScope.currentItemForReminder, e, null, null, forceRefresh);
      }
    }

    
  };


  $scope.verifyMobileNumber = function(e){
    
    if(!$scope.mobile_number_verification) { 
      alert('Empty mobile number');
      return false; 
    }

    var element = $(e.currentTarget);

    element.addClass('loading');
    loading('show', {element:element});

    var params = {
      context : "custid=1;headendid=0;applicationname=website;msisdn="+$scope.mobile_number_verification, 
      userid  : $rootScope.getUser().userid
    };

    userAPI.verifyMobileNumber(params, function(rs) {

      element.removeClass('loading');
      loading('hide', {element:element});
      
      if(rs.response.responsestatus =="false") {
         alert(rs.response.message);
         return false;
      }
      else{
         // You are already Verified
      }
    });
  };
  
  $scope.authorizeMobileNumber = function(e){
    // console.log('authorizeMobileNumber p ==== >>>> ==== >>>>');
    // console.log(p);
    // toggleReminderOnServer($rootScope.currentItemForReminder,e);
    // return false; 

    if(!$scope.mobile_number_verification_code) { 
      alert('Please enter a valid verification code.');
      return false; 
    }

    var element = $(e.currentTarget);

    element.addClass('loading');
    loading('show', {element:element});

    var params = {
      context : "custid=1;headendid=0;applicationname=website;msisdn="+$scope.mobile_number_verification, 
      smscode : $scope.mobile_number_verification_code,
      userid  : $rootScope.getUser().userid
    };   

    userAPI.verifyMobileCode(params, function(rs) {

      element.removeClass('loading');
      loading('hide', {element:element});

      if(rs.response.responsestatus =="false") {
        // alert(rs.response.message);
        alert('Please enter a valid verification code.');
        return false;
      }
      else{
        // You have done the verification.
        console.log('you are now verified');

        // Update the cookie
        var userDetails = $rootScope.getUser();

        if(userDetails.userid == -1){
          return false;
        }

        // After verification set the SMS as on.
        var params = {

          userid               : $rootScope.getUser().userid,
          updatetype           : "sms reminder",
          updatevalue          : true
        };

        userAPI.updateUserSettings(params, function(rs){
          // Let the API update the user settings.
          console.log('SMS is set to on = ',rs);

          $rootScope.userInfo.isSMSReminder = "true";

          $rootScope.userInfo.mobilenumberverified = "true";   
          $rootScope.userInfo.mobile               = $scope.mobile_number_verification;
           
          $.cookie('userInfo', JSON.stringify($rootScope.userInfo), {expires:365});

          console.log('updated cookie');
          console.log(JSON.parse($.cookie('userInfo')));


          // set the reminder
          toggleReminderOnServer($rootScope.currentItemForReminder,e,"false",true);
        });

        
      }
    });
  };



  //////////////////////////////////////
  //  Controller Main Flow            //
  //////////////////////////////////////

  $scope.remindVerified =  ($scope.userData.mobilenumberverified) ? true : false;
  var contentBox;
  // -- END Controller Main Flow    
  $scope.addToWatchlist = function(p, e, forceRefresh){
    e.preventDefault();
    e.stopPropagation();
    var element = $(e.currentTarget);
    // var my = 'top center'
    var contentBox;

    // if(element.attr('data-popover-position'))
    //   my = element.attr('data-popover-position');
console.log('..... element == ',element);
console.log(element.offset());

    var my = ($rootScope.device.isTablet && element.offset().left > 600) ? 'top right' : 'top center';
    if($rootScope.device.isMobile)
      my = ($rootScope.device.isMobile && element.offset().left > 200)? 'top right' : (($rootScope.device.isMobile && element.offset().left < 100) ? 'top left' : 'top center');
    
    // var my = ($rootScope.device.isMobile && element.offset().left > 600) ? 'top right' : 'top center';
    var my_video = null;
    // if($location.path().match('Videos') && $('html').hasClass('touch')){
    //    my_video = 'top right';
    // }
    // verifies if user is logged
    if(!$rootScope.isUserLogged()){
      $rootScope.beforeaction.title = "Create Your Watchlist";
      $rootScope.beforeaction.subtitle = "Follow your favorites on TV";
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus',
          },
          position:{
            my: my,//(my_video!=null) ? my_video : (Modernizr.mq("screen and (max-width:640px)")) ? 'top right' : my,
            at: 'bottom center',
            adjust:{
              y: 5,
              x: 0//(my_video!=null) ? 25 : (Modernizr.mq("screen and (max-width:640px)")) ? 25 : 5
            }
          },
          style:{
            classes:'popover reminder-popover cside-popover watchlist-hover-popover'
          } , 
          events:{
            show:function(){
              element.parent().parent('.thumb').addClass('active');
              element.parent().parent('.minor-details').addClass('active');
              element.addClass('active');
            } ,
            hide:function(){
              element.parent().parent('.thumb').removeClass('active');
              element.parent().parent('.minor-details').removeClass('active');
              element.removeClass('active');
            } 
            ,
            render: function(event, api) {
              
              // if(Modernizr.mq("screen and (max-width:640px)")){
              //   var elem = api.elements.tip;
              //   contentBox = api.elements.content;
              //   elem.addClass('tip-watchlist-pos-fix1');
              // }

              
              if(my_video!=null){
                var elem = api.elements.tip;
                contentBox = api.elements.content;
                elem.addClass('tip-watchlist-pos-fix1');
              }
            }
          }, 
          content: {
            text: '<div class="top left popover-loader signin-loader"></div>',
            ajax: {
              url: "/user/beforeaction",
              type: 'GET',
              data: {},
              success:function(data, status ) {
                var _this = this;
                // Set the content manually (required!)
                $timeout(function(){
                  _this.set('content.text', $compile(data)($scope));
                  $timeout(function(){
                    _this.reposition();
                  });
                });
                $scope.actionObj = {
                  element: element, 
                  popconfig: qtipConfig, 
                  // after log in display the reminde popover
                  success: function(){
                    $scope.addToWatchlist(p, e, true);
                    $rootScope.$broadcast("watchlist::fetch",1)
                    element.qtip('hide').qtip('destroy');
                  },
                  failure: function() {
                    alert('oopss');
                  }
                };
              }
            }
          }
        };
      };
      var qtipConfig = resetQtip();
      element.qtip(qtipConfig).qtip('show');
     // contentBox.scrollToMe(65);

      return false;

    }
    element.qtip('destroy');


    // API fix for parameters now are camelCase - Using a temp var to send the API request
    var inconsistentApiFix = JSON.stringify(p).toLowerCase();
    var temp = JSON.parse(inconsistentApiFix);

    // shows loading spinner
    element.parent().parent('.thumb').addClass('active');
    element.addClass("loading");
    loading('show', {element: element});

    // API fix for parameter programmeid changed to programid
    if(_.isUndefined( temp.programmeid ))
      temp.programmeid = temp.programid;

    // userAPI.toggleWatchlist({like:(temp.iswatchlist == "0"), programmeid:temp.programmeid, userid:$rootScope.getUser().userid}, function(rs){
      console.log("temp.iswatchlist" + temp.iswatchlist);
      console.log(temp);
      var iswatchlistStatus = (temp.iswatchlist == "0");
    // userAPI.toggleWatchlist({watchliststatus:iswatchlistStatus, contenttype:"program",contentid: temp.programmeid, userid:$rootScope.getUser().userid}, function(rs){
      $timeout(function(){
        console.log('user id is ');
        console.log($rootScope.getUser().userid);
        var data = {watchliststatus: iswatchlistStatus, userid: $rootScope.getUser().userid};

        if (_.isUndefined(temp.videoid)) {
          data.contenttype = "program";
          data.contentid = temp.programmeid;
          data.videoid = 0;
        } else{
          data.contenttype = "video";
          data.contentid = temp.programmeid;
          data.videoid = temp.videoid;
        };  
        userAPI.toggleWatchlist(data, function (rs) {

          if(forceRefresh) {
            location.reload();
            return false;
          }

          console.log("temp.iswatchlist" + temp.iswatchlist);
        
          // hides loading spinner
          element.removeClass('loading');
          window.setTimeout(function() {
            element.parent().parent('.thumb').removeClass('active');
          }, 1500);
          loading('hide', {element:element});

          // if it fails, display error message
          if(!rs.response.responsestatus){
            alert(rs.response.message);
          } else {
            // change the flag
            p.iswatchlist = (p.iswatchlist == "0") ? "1" : "0";
            if (p.iswatchlist == 1)
              $rootScope.$broadcast("watchlist::add", p);
            else
              $rootScope.$broadcast("watchlist::remove", p.programmeid,true);

        
        // Now change the tooltip message
            if(Number(p.iswatchlist)) {
              element[0].setAttribute('data-original-title', 'Remove from Watchlist');
            } else {
              element[0].setAttribute('data-original-title', 'Add to Watchlist');
            }
          }
        });
    });
    
  };

}]); 
