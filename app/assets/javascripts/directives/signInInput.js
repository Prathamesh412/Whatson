woi.directive('signInInput', ['$compile', '$timeout', function($compile, $timeout){
  var $content;
  return {
    // called in an attribute
    restrict:'A',
    link:function(scope, element, attrs){
      var $this = $(element);

      var prefix_attr = Date.now();
      if($this.hasClass('ios-password')){
        $this.attr('prefixvalue',prefix_attr);
        $this.attr('id',prefix_attr+'signpwd');
        $timeout(function(){
          $this.dPassword({
            // duration: 1,
            prefix: prefix_attr+"_"
          });
        },1)
      }
      $this.keyup(function(){
      	if($this.val() === ''){
          $this.removeClass("filled");
        } else {
       	  $this.addClass("filled");
        }
      });
      $timeout(function(){
          var $signinPwd = $('#'+prefix_attr+"_"+$this.attr('id'));
          $signinPwd.keyup(function(){
            if($signinPwd.val() === ''){
              $signinPwd.removeClass("filled");
            } else {
              $signinPwd.addClass("filled");
            }
          });
          
      },100);
    }
  };
}]);
