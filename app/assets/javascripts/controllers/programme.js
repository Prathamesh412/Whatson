function ProgrammeController($scope, $rootScope){

  $scope.text = "Programme Controller" ;
  $scope.$emit('handleResetEmit');
}

ProgrammeController.$inject = ['$scope', '$rootScope'];
