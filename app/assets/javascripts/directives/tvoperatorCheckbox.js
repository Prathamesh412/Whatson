woi.directive('tvoperatorCheckbox', ['$timeout','$compile', function($timeout, $compile) {
    return {
        restrict: 'A',

        link: function(scope, elm, attrs) {

          var op = scope[attrs.tvoperatorCheckbox];
          var dom = $compile('<label for="checkbox'+op.operator_id+'" class="labeloperator">'+op.operator_name+'</label><div class="custom-checkbox radio"><input ng-checked="clickIt(op)" id="checkbox'+op.operator_id+'" ng-click="selectOperator({operator_name: \''+op.operator_name+'\', operator_id: \''+op.operator_id+'\'})" name="tvoperator" type="radio"/><label for="checkbox'+op.operator_id+'"></label></div>')(scope);
          $(elm).html(dom);
          
          $timeout(function(){
            var height = $(elm).find('.labeloperator').outerHeight();
            $(elm).find('.custom-checkbox').css('height',height);
          });
        }
    };
}]);