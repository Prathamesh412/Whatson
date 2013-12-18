woi.directive('discussionFilterPopover', ['$compile', '$timeout', '$rootScope',  function($compile, $timeout, $rootScope){


  var $content;

  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){

      //////////////////////////////////////
      // set popover path according login //
      //////////////////////////////////////
      
      var setPopoverUrl = function() {
        if(!$rootScope.isUserLogged())
          return '/user/beforeaction';
        return '/languages';
      };

      var popoverUrl = setPopoverUrl();

      // -- END 

      //////////////////////////////////////
      //  Generic config for popover Qtip //
      //////////////////////////////////////
      
      var resetQtip = function() {
        return {
          show: 'click',
          hide: {
            fixed: true,
            delay: 750,
            event: 'unfocus click',
          },
          position:{
            my: 'top right',
            at: 'bottom right', 
            adjust:{
              x:-5, 
              y:5
            }
          },
          style:{
            classes:'popover rside-popover language-popover'
          } , 
          events:{
            show:function(){
              element.parent().parent('.thumb').addClass('active');
              element.addClass('active');
            }, 
            hide: function() {
              element.parent().parent('.thumb').removeClass('active');
              element.removeClass('active');
            },
          }, 
          content: {
            text: '<div class="popover-loader signin-loader"></div>',
            ajax: {
              url: popoverUrl,
              type: 'GET',
              data: {}
            }
          }, 
        };
      };
      var qtipConfig = resetQtip();

      // -- END Generic config for popover Qtip



      //////////////////////////////////////
      //  Qtip Content handler            //
      //////////////////////////////////////
      
       var successFn =  function(data, status) {
        var _this = this;
        // Set the content manually (required!)
        $timeout(function(){
          _this.set('content.text', $compile(data)(scope));
          $timeout(function(){
            _this.reposition();
          });
        });

      $rootScope.beforeaction.title = "Login to Set Language";
      $rootScope.beforeaction.subtitle = "Please login to set your languages";
        scope.$apply(function(){
          scope.reminderData = scope.programData;
          scope.$reminder = element;
          scope.actionObj = {
            element: element, 
            popconfig: qtipConfig, 
            // after log in display the reminde popover
            success: function(){
              var config = qtipConfig;
              config.content.ajax.url = setPopoverUrl();
              element.qtip(config).qtip('show');
            },
            failure: function() {
              alert('oopss');
            }
          };
        }); 
      };
      qtipConfig.content.ajax.success = successFn;
      // -- END Qtip Content handler

      qtipConfig.events.hide = function(s){
        element.removeClass('active');
        element.parent().parent('.thumb').removeClass('active');
        var newConfig = resetQtip();
        newConfig.content.ajax.success = successFn;
        element.qtip(newConfig);
      } 


      element.click(function(e){
        if($('#selectLanguage').hasClass("active")){
          $('div.qtip:visible').qtip('hide');
          e.preventDefault();
        }

      // fix for intantiation before auth action
        if($rootScope.isUserLogged()) {
            var newConfig = resetQtip();
            newConfig.content.ajax.success = successFn;
            newConfig.content.ajax.url =  setPopoverUrl()
            element.qtip('disable').qtip(newConfig).qtip('enable').qtip('show');
          }
      });

      element.qtip( qtipConfig);          






      //element.click(function(){
        //if($('#selectLanguage').hasClass("active")){
          //$('div.qtip:visible').qtip('hide');
          //preventDefault();
        //}
      //});
      //element.qtip({
        //show: 'click',
        //hide: {
          //event: 'unfocus'
        //},
        //position:{
          //my: 'top right',
          //at: 'bottom right', 
          //adjust:{
            //x:-5, 
            //y:5
          //}
        //},
        //content:{
          //text: '<div class="popover-loader signin-loader"></div>',
          //ajax: {
            //url: '/languages', 
            //type: 'GET',
            //data: {},
            //success: function(data, status) {
              //var _this = this;
              //// Set the content manually (required!)
              //$timeout(function(){
                //_this.set('content.text', $compile(data)(scope));
                //$timeout(function(){
                  //_this.reposition();
                //});
              //});
            //}
          //}
        //},
        //style:{
          //classes:'popover rside-popover language-popover'
        //} , 
        //events:{
          //show:function(){element.removeClass('active').addClass('active');}, 
          //hide:function(){
            //element.removeClass('active');
          //} 
        //}
      //});
    }
  };
}]);

