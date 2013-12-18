woi.filter('replaceLinks', function(){
  return function (post){

  	// Match the URL

    if (!_.isUndefined(post)) {

    var matchedUrl = post.match(/\b((http(s?):\/\/)?([a-z0-9\-]+\.)+(MUSEUM|TRAVEL|AERO|ARPA|ASIA|EDU|GOV|MIL|MOBI|COOP|INFO|NAME|BIZ|CAT|COM|INT|JOBS|NET|ORG|PRO|TEL|A[CDEFGILMNOQRSTUWXZ]|B[ABDEFGHIJLMNORSTVWYZ]|C[ACDFGHIKLMNORUVXYZ]|D[EJKMOZ]|E[CEGHRSTU]|F[IJKMOR]|G[ABDEFGHILMNPQRSTUWY]|H[KMNRTU]|I[DELMNOQRST]|J[EMOP]|K[EGHIMNPRWYZ]|L[ABCIKRSTUVY]|M[ACDEFGHKLMNOPQRSTUVWXYZ]|N[ACEFGILOPRUZ]|OM|P[AEFGHKLMNRSTWY]|QA|R[EOSUW]|S[ABCDEGHIJKLMNORTUVYZ]|T[CDFGHJKLMNOPRTVWZ]|U[AGKMSYZ]|V[ACEGINU]|W[FS]|Y[ETU]|Z[AMW])(:[0-9]{1,5})?((\/([a-z0-9_\-\.~]*)*)?((\/)?\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)/gi);    
   
    // Check if http:// is prefixed
    var prefixedUrl = String(matchedUrl);
    
    var checkHttp = prefixedUrl.match(/^http:\/\//);
    if(checkHttp == null){
    	prefixedUrl = 'http://'+matchedUrl;
    }

    var res = '<a href='+prefixedUrl+'>'+matchedUrl+'</a>';
    
    return post.replace(matchedUrl,res);
    }
    return post;
  };
});