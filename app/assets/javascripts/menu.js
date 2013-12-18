woi.controller('MainMenuController', ['$scope', '$rootScope','$filter', '$location',  'recoAPI', 'userAPI', 'userList', function($scope, $rootScope,$filter, $location, recoAPI, userAPI, userList){

    $scope.$on('highlightChannel', function(event, args) {
        $scope.currentMenuActive = 'channels';
    });

    $scope.$on('highlightMovies', function(event, args) {
        $scope.currentMenuActive = 'movies';
    });

    $scope.$on('highlightTvGuide', function(event, args) {
        $scope.currentMenuActive = 'tv-guide';
    });

    $scope.$on('highlightHome', function(event, args) {
        $scope.currentMenuActive = 'home';
    });

    $scope.$on('highlightApps', function(event, args) {
        $scope.currentMenuActive = 'apps';
    });

    $scope.$on('highlightVideos', function(event, args) {
        $scope.currentMenuActive = 'videos';
    });

    $scope.$on('resetHighlight', function(event, args) {
        $scope.currentMenuActive = 'nil';
    });

    $scope.currentMenuActive = $location.path().replace(/\//g, '') ;

    $scope.goTo = function(location) {

        //if(($('#searchResultsDiv').is(':visible'))){

        $('#mainSearch').css('background-color','transparent');
        if( !$('html').hasClass('ie9') ) {
            $('#mainSearch').val('');
            $('#searchBoxBottom').val('');
        }
        if($.browser.msie && ($.browser.version == '9.0')){
            $('#mainSearch').val($('#mainSearch').attr('placeholder'));
            $('#searchBoxBottom').val($('#searchBoxBottom').attr('placeholder'));
        }
        // }

        $rootScope.showinfo = $rootScope.showinfo || {};
        $rootScope.showinfo.visible = false;
        var descriptionPopover = $('#description-popover');
        if(descriptionPopover) {
            descriptionPopover.hide();
        }

        $scope.currentMenuActive = location;

        // Hide the MORE dropdown
        var moreDropdown = $('.main-nav ul.dropdown-menu');
        moreDropdown.hide();
    };

    $rootScope.stopProp = function(e) {
        e.stopPropagation();
    }

}]);