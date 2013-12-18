woi.controller('SearchCategoryController', ['$scope', '$rootScope', 'recoAPI', 'userAPI','$routeParams', '$compile', '$timeout' , function($scope, $rootScope, recoAPI, userAPI, $routeParams, $compile, $timeout){

  $rootScope.searchCategories = [
    {label:'All Categories' , param: 'allcategories' , value: 0}  ,
    {label:'Recommended'    , param: 'recommended'   , value: 1}  ,
    {label:'Entertainment'  , param: 'entertainment' , value: 2}  ,
    {label:'Lifestyle'      , param: 'lifestyle'     , value: 3}  ,
    {label:'Kids'           , param: 'childrens'     , value: 4}  ,
    {label:'Sports'         , param: 'sport'         , value: 5}  ,
    {label:'Movies'         , param: 'film'          , value: 6}  ,
    {label:'Kannada'        , param: 'kannada'       , value: 7}  ,
    {label:'News'           , param: 'news'          , value: 8}  ,
    {label:'Music'          , param: 'music'         , value: 9}
  ];

  $scope.searchSort = [
    {label:'Relevance'   , param:'relevance', value: 0}   ,
    {label:'View Count'  , param:'viewcount' , value:1}  ,
    {label:'Airing Time' , param:'airingtime', value:2 } ,
    {label:'Rating'      , param:'rating', value:3}
  ];

  $scope.searchCategoriesCurrent = 0; // freetext default category

  $scope.currentFilter        = $scope.searchCategories[0].label;
  $scope.currentFilterRating  = $scope.searchSort[0].label;
  $scope.paginateGenres       = [];
  $scope.paginateGenresRating = [];

  // Functions for filtering by Categories
  $scope.constructObject = function(){

    $scope.allGenres = $scope.searchCategories;
    if($scope.paginateGenres.length == 0){
      $scope.paginateGenres = $scope.allGenres.slice(0, 8);
    }
  };


  $scope.viewAllOperators = function(){
    $scope.paginateGenres = $scope.allGenres;
  };

  // Category Filter
  $scope.selectedGenre = function(genreObj){
  
    $('div.qtip:visible').qtip('hide');
    
    $scope.currentFilter = genreObj.label;
    $scope.searchCategoriesCurrent = genreObj.value;
    
    var params = {
      filter: $scope.searchCategories[$scope.searchCategoriesCurrent].param
    };
    //calls again the mainSearch API method
    //$rootScope.$emit('search:make', {searchvalue:$rootScope.searchQuery});
    $rootScope.$broadcast('search:categorize', params);
  };

  // Functions to sort by Ratings
  $scope.constructObjectRating = function(){

    $scope.allGenresRating = $scope.searchSort;
    $scope.paginateGenresRating = $scope.allGenresRating.slice(0, 8);
  };


  $scope.viewAllRating = function(){
    $scope.paginateGenres = $scope.allGenresRating;
  };

  // Category Filter
  $scope.selectedRating = function(genreObj){
  
    $('div.qtip:visible').qtip('hide');
    
    $scope.currentFilterRating = genreObj.label;
    $scope.searchSortCurrent = genreObj.value;
    
    var params = {
      filter: $scope.searchSort[$scope.searchSortCurrent].param
    };
    //calls again the ainSearch API method
    $rootScope.$broadcast('search:sort', params);
  };

  $scope.hello = function() {
    alert('Not yet, Waiting for UX/UI VD/Clarification');
  };

}]);

