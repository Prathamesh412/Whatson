// filter program name
woi.filter('fbActivityLike', function(){
  return function (like){
    return (like == "1") ? "Liked!" : "Like";
  };
});