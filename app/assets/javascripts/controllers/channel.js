function ChannelController($scope, $rootScope){
  $scope.text = "Channel Controller" ;
  $scope.$emit('handleChannelEmit');
}

ChannelController.$inject = ['$scope', '$rootScope'];
