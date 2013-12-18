woi.controller("MyAccountNavController", ['$scope', '$rootScope','$location', '$route', '$filter', 'userAPI' ,'tsmAPI','$timeout', 'autoAPI', function($scope, $rootScope, $location, $route, $filter, userAPI, tsmAPI,$timeout, autoAPI){

	$scope.genreEdit;  
	$scope.allLanguages  = [];
	$scope.languages     = [];
  	$scope.paginate      = [];
  	$scope.amountDefault = 10;
  	$scope.amount        = $scope.amountDefault;
  	$scope.step          = 10;
  	$scope.canUpload	 = true;
  	$scope.selectedLanguages = [];
  	$scope.edit;
	$rootScope.$broadcast('handleResetEmit');
	$scope.allOperators  = [];
	$scope.locationString = null;
	$scope.popoverAttributes = {
		'language': "languagename",
		'genre': "hybridgenre"
	}

	$scope.favoriteAttributes = {
		'language': 'favlanguage',
		'genre': 'favGenre'
	}

	$scope.selectedOperator = null;

	// If the user is not logged in, redirects to home page
	if($rootScope.getUser().userid == -1){
		// alert('You are not logged in');
		$location.path("/home");
		$route.reload();
		return false;
	}

	// To check whether the device supports file upload
	if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
  		$scope.canUpload = false;
 	}

 	// IOs version <=5 does not support file upload
	if (/iP(hone|od|ad)/.test(navigator.platform)) {
	    // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
	    var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
	    var ver = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
		if (ver[0] <= 5) {
		  $scope.canUpload = false;
		}
	}

	
	$scope.activeTab = 'myaccount';

	 $scope.genresFilter = [];
  $scope.currentFilter = "Genre";
  $scope.genresFilter=[];

  // Calls API to get the list of genres
  $scope.constructObject = function(){

  	// Once the list is populated, the API call is not made, whenever the popover is opened
  	if ($scope.genresFilter.length > 0){
  		$scope.populateGenres();
	    return false;
    }
    
    userAPI.getUserGenreList({userid:$rootScope.getUser().userid}, function(rs){
      
      if(!rs.favhybridgenre){
        return false;
      }
      $scope.genresFilter = rs.favhybridgenre.hybridgenrelist;
      _.map($scope.genresFilter, function(item){
			item.label  = item.groupname;
			item.value  = item.displayvalue;
			item.favGenre  = item.genrefavorite;
			item.sortOrder = parseInt(item.displaykey);
      });
      $scope.populateGenres();
    });
  };

  // Populates the genres list and displays the popover
  $scope.populateGenres = function(){

	$scope.allGenres = _.sortBy($scope.genresFilter, function(item){ return item.sortOrder; });
	if(!$scope.genreEdit){
        $scope.allGenres = _.select($scope.allGenres,function(l){
        	return l.favGenre == "1";
        })
	}
  	$scope.paginateGenres = $scope.allGenres.slice(0, 8);
  	if($scope.paginateGenres.length > 0 && $scope.genreEdit)
  		$('.genrePopoverEdit').qtip('show','click');
  	else if($scope.paginateGenres.length > 0 && !$scope.genreEdit)
  		$('.genrePopoverShow').qtip('show','click');
  	if(!$scope.$$phase)
		$scope.$apply();
  }

  // Loads all genres
  $scope.loadMoreGenres = function(){
    $scope.paginateGenres = $scope.allGenres;
  };

  // Displays details based on selected tab --> My account / settings / Edit account
	$scope.changeTab = function(tabname){
		$scope.activeTab = tabname;
		if(tabname=="editaccount"){
			$scope.userAccountDetails = $.extend(true, {}, $scope.showUserDetails);
			$scope.newpassword='';
			$scope.passConfirm='';	
			$firstpwd = $('input.pwd-img-placeholder');
			$secondpwd = $('input.cpwd-img-placeholder');
			if($('html').hasClass('ie9')){
				$firstpwd.attr('placeholder','').css('background',"#fff url('assets/img/newpassword.png') no-repeat 20px center").bind('keyup', function(){
			    	$(this).css('background',"#fff");
			    })
				$secondpwd.attr('placeholder','').css('background',"#fff url('assets/img/confirmpassword.png') no-repeat 20px center").bind('keyup', function(){
			    	$(this).css('background',"#fff");
			    })
			}
			$('input.mobileno').focus().blur();

			if($.browser.msie && ($.browser.version == '9.0')){
				var elem = $('input.input-box');

				$.each(elem, function(k,v){
					if($(v).attr('value') != $(v).attr('placeholder')){
						$(this).css({'color':'#787878'})
					}
				})

				elem.live('blur', function(){
					$(this).css({'color':'#999'})
				})

				elem.live('keypress', function(){
					$(this).css({'color':'#787878'})
				})
			}
		}
	};

	// Favorite / unfavorites thelanguage / genre in edit account
	$scope.toggleLanguageGenre = function(e,data,type,obj){
		var orig = data;
		data = data.toLowerCase();
		if (e.currentTarget.checked) {
			if (_.isNull($scope.userAccountDetails[$scope.popoverAttributes[type]]) || $scope.userAccountDetails[$scope.popoverAttributes[type]] == 'null') 
				$scope.userAccountDetails[$scope.popoverAttributes[type]] = orig;
			 else
			 	$scope.userAccountDetails[$scope.popoverAttributes[type]] = $scope.userAccountDetails[$scope.popoverAttributes[type]] + "," + orig;
			 obj[$scope.favoriteAttributes[type]]="1";
		} else{
			var languageArray = $scope.userAccountDetails[$scope.popoverAttributes[type]].split(",");
			languageArray = _.reject(languageArray,function(item){ return $.trim(item.toLowerCase()) == data; })
			$scope.userAccountDetails[$scope.popoverAttributes[type]] = languageArray.join(",");
			 obj[$scope.favoriteAttributes[type]]="0";
		}
	}

	// API call to retrieve user details
	userAPI.getUserAccountDetails({userid : $rootScope.getUser().userid}, function(rs){

		if(!rs.userprofile)
			return false;

		$scope.userAccountDetails = rs.userprofile.user;
		$rootScope.$broadcast("got-user-details",$scope.userAccountDetails);
		if(!_.isNull(rs.userprofile.user.password)){
			$scope.userAccountDetails.password = Base64.decode(rs.userprofile.user.password);
		}
		if(_.isNull($scope.userAccountDetails.name)){
			$scope.userAccountDetails.name = $scope.userAccountDetails.email.split('@')[0];
		}
		$scope.passConfirm;
		$scope.newpassword;
		$scope.showUserDetails = $.extend(true, {}, $scope.userAccountDetails);
		if(!rs.userprofile.user.headendlist){
			$scope.userOperatorsList = [];	
		}else{

			if(!angular.isArray(rs.userprofile.user.headendlist.headendinfo)){
				if(angular.isObject(rs.userprofile.user.headendlist.headendinfo)){					
				  rs.userprofile.user.headendlist.headendinfo = [rs.userprofile.user.headendlist.headendinfo];
				}
			}
			
			$scope.userOperatorsList  =	rs.userprofile.user.headendlist.headendinfo;
			_.map($scope.userOperatorsList,function(item){
				if(item.pincode == '0'){
					item.pincode = '';
				}
			});
		}
	
		
		

	});

	// sends API request with the upload file name
	$(function(){
		jQuery('#imageUploadForm').ajaxForm(function(data) { 
			imageLoadingIndicator(false);
			data = JSON.parse(data);
            $scope.userImage = "/images/upload/"+data.imageName;
            $("#imageFile").val('');
            $scope.userImagePath = "";
            $scope.userAccountDetails.imagepath = data.imageName;
            $scope.userAccountDetails.userimage = data.imageName;
            $scope.showUserDetails.imagepath = data.imageName;
            $scope.showUserDetails.userimage = data.imageName;
            $scope.$apply();
            var params = {
				userid       : $rootScope.getUser().userid,
				imagepath 	 : $scope.userAccountDetails.userimage
			}
            userAPI.updateUserDetails(params, function(rs){
			});
         }); 
	});

	// Cancels profile pic upload
	$scope.cancelImage = function(){
		$("#imageFile").val("");
		$scope.userImagePath = "";
		$scope.userAccountDetails.userimage = $scope.showUserDetails.userimage;
	}

	// Displays the uploaded picture
	$scope.showProfileImage = function(mode){
			if (mode == "edit") {
				if (_.isUndefined($scope.userAccountDetails) || _.isUndefined($scope.userAccountDetails.userimage) || _.isNull($scope.userAccountDetails.userimage)) {
					return "assets/img/profile-avatar.png";
				}else{
					return "/images/upload/"+$scope.userAccountDetails.userimage ;					
				}
				// return (_.isNull($scope.userAccountDetails.userimage) ? "assets/img/profile-avatar.png" : "/images/upload/"+$scope.userAccountDetails.userimage)
			}else{
				if (_.isUndefined($scope.showUserDetails) || _.isUndefined($scope.showUserDetails.userimage) || _.isNull($scope.showUserDetails.userimage)) {
					return "assets/img/profile-avatar.png";
				}else{
					return "/images/upload/"+$scope.showUserDetails.userimage ;					
				}
				// return (_.isNull($scope.showUserDetails.userimage) ? "assets/img/profile-avatar.png" : "/images/upload/"+$scope.userAccountDetails.userimage)
			}			
	}

	// Submits form to upload the picture
	$scope.uploadPic = function(){
		if ($("#imageFile").val() != "" ) {
			$("#imageUploadForm").submit();
			imageLoadingIndicator(true);
		}else{
			$("#uploadImageMessage").text("Please select an image.").show();
		}
	};

	// Validates the file to be uploaded and uploads the same
	$scope.changedImage = function(e){
		// var file = e.target.files;
		// console.log(file[0].size);
		var fileExt = $("#imageFile").val().match(/^.*\.(.*)$/)[1];

		if (_.isUndefined(fileExt) || $.inArray(fileExt.toLowerCase(),["jpg","jpeg","png","gif","bmp"]) == -1) {
			$scope.userImagePath = ""
			$("#imageFile").val("");
			$scope.$apply();
			$("#uploadImageMessage").text("Only Image file is allowed").show();
			return false;
	// File Type Error
		}
		if (!$('html').hasClass('ie9') && e.target.files[0].size > 2097152) {
	// File Size Error
			$scope.userImagePath = "";
			$("#imageFile").val("");
			$scope.$apply();
			$("#uploadImageMessage").text("maximum file size allowed is 2 MB").show();
			return false;
		}
		$("#uploadImageMessage").hide();
		$scope.userImagePath = $("#imageFile").val();
		$scope.$apply();
	}

	// Displays message for browsers that doesn't support file upload
	$scope.showMessage = function(){
		alert("Your browser doesn't support uploading images");
	}

	// Loading indicator when the image is being uploaded
	var imageLoadingIndicator = function(mode){
		var loading = $filter('loading');
		var $element = $('.upload-btn .spinner');
		var $uploadText = $('span.upload-text');
		var $uploadBtn = $('.upload-btn');
		var uploadTextValue = $uploadText.text();
		console.log('imageLoadingIndicator');
		console.log(uploadTextValue);
		if(uploadTextValue){
			$uploadText.text('');
		}
		else{
			$uploadText.text('Upload');
		}
		if(mode)
			loading('show',{element: $element});
		else
			loading('hide',{element: $element});
		$uploadBtn.toggleClass('active');
	}

	// Validates the password field
	var validatePassword = function(){
		var $errorMsg = $('#changePasswordMsg');
		$errorMsg.hide();
		if($scope.newpassword == $scope.passConfirm){
			// Encode and send password
			// $scope._password = Base64.encode(passConfirm);
			$scope._password = $scope.passConfirm;
			if($scope._password.length < 6){
				$errorMsg.addClass('error-msg').text("Password must be minimum 6 characters").show();
				return false;
			}
		}else{
			$errorMsg.addClass('error-msg').text("Password and Confirm Password doesn't match").show();
			return false;
		}
		return true;
	}

	// Validates the Mobile No field
	var validateMobileNo = function(){
		var $errorMsg = $('#changePasswordMsg');
		$errorMsg.hide();		
		var mobileno = $scope.userAccountDetails.mobile;
		if(!mobileno){
			return true;
		}
		if(isNaN(mobileno) || mobileno.length != 10){
			$errorMsg.addClass('error-msg').text("Please enter valid mobile number").show();
			return false;
		}
		return true;
	}

	// Validates the username field
	var validateUsername = function(){
		var $errorMsg = $('#usernameMessage');
		$errorMsg.hide();	
		var username = $scope.userAccountDetails.name;
		var namePattern = /^[A-Za-z0-9 ]*$/;
		if(!username || !namePattern.test(username)){
			$errorMsg.addClass('error-msg').text("Please enter valid username").slideDown();
			return false;
		}
		return true;
	}

	// Validates the Email ID Field
	var validateEmail = function(){
		var $errorMsg = $('#changePasswordMsg');
		$errorMsg.hide();	
		var $email = $('input[type=email].email');
		if($email.hasClass('ng-invalid-email')){
			$errorMsg.addClass('error-msg').text("Please enter valid Email ID").show();
			return false;
		}
		return true;
	}

	// sends API request to change password
	$scope.changePassword = function(){
		var loading = $filter('loading');
		var $errorMsg = $('#changePasswordMsg');
		var $successMsg = $('#passwordConfirmation');
		if(!validatePassword())
			return false;
		var params = {
			Password     : $scope._password,
			userid       : $rootScope.getUser().userid
		}
		$errorMsg.text('');
		$errorMsg.addClass('account-spinner');
		loading('show',{element: $errorMsg});
		userAPI.updateUserDetails(params, function(rs){
			loading('hide',{element: $errorMsg});
			$errorMsg.removeClass('account-spinner');
			if(rs.response.responsestatus == "true"){
				$successMsg.slideDown();
				setTimeout(function(){
					$successMsg.slideUp();
				},2000);
			}
			else{
				$errorMsg.addClass('error-msg').text('Error in updating password').show();
			}
		});
	};

	// Triggers auto complete for location in addConnection module
	$scope.triggerAutoComplete = function( string, callback){

		if(string.length < 2)
		 return false;

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

		autoAPI.autoCompleteLocation( {placename:string}, function(rs){

		 $scope.safeApply(function() {
		   $scope.autoComplete.data = rs.response.docs;
		 });

		 if (callback && typeof(callback) === "function") {
		   callback($scope.autoComplete.data);
		 }
		});
    };

    // Calls API for adding a Connection
	$scope.addConnection = function(){
		var loading = $filter('loading');
		var $errorMsg = $('#addConnectionMsg');
		var $successMsg = $('#addConnectionConfirmation');
		var $container = $('#editConnectionDetails .outer-connection-wrapper');
		var $contents = $('#editConnectionDetails .connection-wrapper');
		var $inputFields = $contents.find('input:visible').filter(function(){
			return $.trim(this.value) == "";
		});
		var params = {};
		// Fields are not mandatory
		// if($inputFields.length > 0){
		// 	$errorMsg.addClass('error-msg').text("Please fill in all the details").show();
		// 	return false;
		// }
		var pincode_value = $contents.find('input.pincode:visible').val();
		if($.trim(pincode_value) != ""){
			if(isNaN(pincode_value) || pincode_value.length != 6){
				$errorMsg.addClass('error-msg').text("Please enter valid pincode number").show();
				return false;
			}
			else
				params.pincode = pincode_value;
		}
		if(_.isNull($scope.selectedOperator)){
			$errorMsg.addClass('error-msg').text("TV Operator is not specified").show();
			return false;
		}
		var location_value = $contents.find('input.cityname:visible').val();
		if($.trim(location_value) != ""){
			if(_.isNull($scope.locationString)){
				$errorMsg.addClass('error-msg').text("Please select a valid city").show();
				return false;
			}
			else
				params.cityname = location_value;
		}
		var roomname = $contents.find('input.roomname').val();
		if($.trim(roomname) != "" ){
			params.roomname = roomname;
		}
		var contextParam = "applicationname=website;headendid="+$scope.selectedOperator.operator_id;
		// if($inputFields.length == 0){
			additional_params = {
				userid	: $rootScope.getUser().userid,
				headendinfoid	: 0,
				isdelete	: false,
				// cityname	: $contents.find('input.cityname:visible').val(),
				// pincode		: $contents.find('input.pincode:visible').val(),
				// roomname	: $contents.find('input.roomname').val(),
				context     : contextParam 
			}
			params = $.extend(additional_params,params);
			$errorMsg.text('');
			$errorMsg.addClass('account-spinner');
			loading('show',{element: $errorMsg});
			userAPI.updateHeadendInfo(params, function(rs){
				loading('hide',{element: $errorMsg});
				$errorMsg.removeClass('account-spinner');
				if(rs.response.responsestatus == "true"){
					$successMsg.slideDown();
					setTimeout(function(){
						$successMsg.slideUp();
						params.headendinfoid = rs.response.headendinfoid;
						params.headendname = $scope.selectedOperator.operator_name;
						$scope.selectedOperator = null;
						$scope.locationString = null;
						$scope.userOperatorsList.push(params);	
						$scope.$apply();
						$contents.find('input').val('');
						$contents.find('.input-content.operator').text('TV Operator');	
						$('input[name=tvoperator]').attr('checked',false);				
					},2000);
				}
				else{
					$errorMsg.addClass('error-msg').text('Error in updating password').show();
				}
			});
		// }
	};

	// deletes an existing connection
	$scope.deleteConnection = function(c,index){
		var params = {
			userid	: $rootScope.getUser().userid,
			headendinfoid : c.headendinfoid,
			isdelete : true
		}
		$('#connectionsList').find('.connection-wrapper .slide-connection-wrapper').eq(index).slideUp();
		$('#connectionsList').find('.connection-wrapper .close-connection').eq(index).hide();
		userAPI.updateHeadendInfo(params, function(rs){
			$scope.userOperatorsList = _.reject($scope.userOperatorsList,function(item){
		        return item.headendinfoid == c.headendinfoid;
		    });
		});
	}

	// Validates the entered input fields and sends API request to update the same
	$scope.saveChanges = function(){
		var $container = $('.account-edit');
		if(!validateUsername()){
			$('.input-box.username').focus();
			return false;
		}
		if(!validateMobileNo()){
			$('.input-box.mobileno').focus();
			return false;
		}
		if(!validateEmail()){
			$('input[type=email].email').focus();
			return false;
		}
		var returnEmptyStringForNull = function(str){
            return _.isNull(str) ? "" : str;
        }
 		var returnNoneForNull = function(str){
 			if(_.isNull(str))
 				return "none";
 			if($.trim(str)=="")
 				return "none";
 			return $.trim(str);
 		}
		var params = {
			name         : returnEmptyStringForNull($scope.userAccountDetails.name),
			// emailid      : returnEmptyStringForNull($scope.userAccountDetails.email),
			mobilenumber : returnNoneForNull($scope.userAccountDetails.mobile),
			hybridgenre  : returnNoneForNull($scope.userAccountDetails.hybridgenre),
			languages    : returnNoneForNull($scope.userAccountDetails.languagename),
			userid       : $rootScope.getUser().userid,
			Password 	 : $scope.userAccountDetails.password
		};
		if($scope.newpassword || $scope.passConfirm){
			if(!validatePassword()){
				$('.input-box[type=password]').first().focus();
				return false;
			}
			else{
				params.Password = $scope._password;
			}
		}
		if($scope.userAccountDetails.email != $scope.showUserDetails.email){
			params.emailid = returnEmptyStringForNull($scope.userAccountDetails.email);
		}
		if(!_.isNull($scope.selectedOperator)){
			var validation_status = $scope.addConnection();
			if(!_.isUndefined(validation_status) && validation_status == false){
				return false;
			}
		}

		userAPI.updateUserDetails(params, function(rs){
			if (rs.response.responsestatus == "false") {
				$('#changePasswordMsg').addClass('error-msg').text(rs.response.message).slideDown();
				$('body,html').queue('fx', []).animate({
                          scrollTop: $("#changePasswordMsg").offset().top
                      }, 500);
				return false;
			}
			$rootScope.$broadcast('filter:account-language-list', $scope.userAccountDetails.languagename);
			$scope.changeTab('myaccount');
			$('body').scrollTop(0);
			if (returnEmptyStringForNull($scope.userAccountDetails.email) !== "") 
				$rootScope.userInfo.emailaddress = $scope.userAccountDetails.email;
			else
				$scope.userAccountDetails.email  = $rootScope.userInfo.emailaddress;

			$rootScope.userInfo.mobile = params.mobile;
			$rootScope.userInfo.name = params.name;
    		$.cookie('userInfo', JSON.stringify($rootScope.userInfo), {expires:365});
			$scope.showUserDetails = $.extend(true, {}, $scope.userAccountDetails);
		});
	};

	//TV Operator Popover -> Populate
	var tvOperatorParams={};
	$scope.populateOperators = function(){

		if($scope.allOperators.length>0){
			// if(tvOperatorParams.areaid == $rootScope.userInfo.areaid && 
				// tvOperatorParams.cityid == $rootScope.userInfo.cityid &&
				// tvOperatorParams.stateid == $rootScope.userInfo.stateid)
			return false;
		}
		$scope.allOperators = [];

		tvOperatorParams = {
	      userid: $rootScope.getUser().userid,
	      stateid: 0,
	      cityid: 0
	    };

	    // if(angular.isDefined($rootScope.userInfo.areaid)){
	    //   tvOperatorParams.areaid = $rootScope.userInfo.areaid;
	    // }

	    // if(angular.isDefined($rootScope.userInfo.cityid)){
	    //   tvOperatorParams.cityid = $rootScope.userInfo.cityid;
	    // }

	    // if(angular.isDefined($rootScope.userInfo.stateid)){
	    //   tvOperatorParams.stateid = $rootScope.userInfo.stateid;
	    // }

	    //tsmAPI.getOperatorList({userid: $rootScope.getUser().userid, cityid:$scope.cityId, stateid:$scope.stateId}, function(rs) {
	    tsmAPI.getOperatorList(tvOperatorParams, function(rs) {

	      if(!rs.getoperators)
	        return false;
	      $scope.allOperators = rs.getoperators.operatorslist;
	      $scope.allOperators = addData($scope.allOperators);
	      $scope.paginateOps = $scope.allOperators.slice(0, 8);
	    });
	}

	// View all TV Operators

	$scope.viewAllOperators = function(){
		$scope.paginateOps = $scope.allOperators;
	}
	// Select TV Operator

	$scope.selectOperator = function(item){
		$('div.qtip:visible').qtip('hide');
		$scope.selectedOperator = item;
		$('#editConnectionDetails .input-content.operator').text(item.operator_name);
	}


	// Sends API request to retrieve all Languages
	$scope.getLanguages = function(){
		  var userDetails = $rootScope.getUser();
		  var param;

		  if(userDetails.userid == -1){
		      param = {};
		  }else{

		    param = {
		      stateid : 0, 
		      cityid  : 0, 
		      userid  : userDetails.userid
		    };  
		  }
	    if($scope.allLanguages.length > 0){


	      $scope.languages = $scope.allLanguages;
	      if(!$scope.edit){
	        $scope.languages = _.select($scope.allLanguages,function(l){return l.favlanguage==1})
	      }
	      $scope.$apply();
	      $scope.loadMoreLanguages();
	      return false;
	    }
	    userAPI.userFavoriteLanguage(param, function(rs) {

	      if(! rs.favlanguage){
	        $scope.noLanguagesResponse = true;
	        return false;
	      }
	      $scope.allLanguages = rs.favlanguage.languagelist;
	      $scope.languages = rs.favlanguage.languagelist;
	      if(!$scope.edit){
	        $scope.languages = _.select($scope.languages,function(l){return l.favlanguage==1})
	      }
	      $scope.loadMoreLanguages();
	    });
	  };

	  // Sends an API request to sync the language popover at the header with the language popover in edit
	  // account page
	  $scope.getRefreshedLanguageList = function(){
		  var userDetails = $rootScope.getUser();
		  var param;

		  if(userDetails.userid == -1){
		      param = {};
		  }else{

		    param = {
		      stateid : 0, 
		      cityid  : 0
		    };  
		  }
		  userAPI.userFavoriteLanguage(param, function(rs) {
		      $scope.allLanguages = rs.favlanguage.languagelist;
		  });
	  }

	  // Loads all languages
	$scope.loadMoreLanguages = function(){

	    $scope.paginate = $scope.languages.slice(0, $scope.amountDefault);

	    
	    
	    $('.account-language-list').scrollTop($('.account-language-list')[0].scrollHeight);
	    
	    $scope.amount = ($scope.amount> $scope.languages.length) ? $scope.languages.length : $scope.amount;

	    $scope.paginate = $scope.languages.slice(0, $scope.amount);
	    $scope.paginate = $scope.languages.slice(0, $scope.amount+$scope.step);
	    $scope.amount += $scope.step;
	};

	// Syncs the language popover list at the header with the one in the language popover list in edit account language popover
	 $scope.$on('favorite:language-added',function(event){
           userAPI.getUserAccountDetails({userid : $rootScope.getUser().userid}, function(rs){ 
                   if(!rs.userprofile)
                           return false;
                   $scope.showUserDetails.languagename = rs.userprofile.user.languagename;
                   if($scope.activeTab != 'editaccount')
                           $scope.userAccountDetails.languagename = rs.userprofile.user.languagename;
                    $scope.getRefreshedLanguageList();
                    if(!$scope.$$phase)	
	                   $scope.$apply();
           });

   	});


}]);

woi.controller("ProgressBarController", ['$scope', '$rootScope' , function($scope, $rootScope){

	$scope.profileCompletion = 0;

	$scope.$on('got-user-details', function(event, userDetails){
		$scope.profileCompletion = userDetails.profilecompleteness;
	});
}]);


woi.controller("SettingsController", ['$scope', '$rootScope','userAPI', function($scope, $rootScope,  userAPI){
    
	// Will be called any time any of the settings is changed
	$scope.$on('user-settings:update', function(event, key, value){

		var params = {} ;
		var updateValue = (value == 'on') ? true : false;

		if(key == 'social_sharing'){
			
			params = {

				userid               : $rootScope.getUser().userid,
				updatetype           : "social sharing",
				updatevalue          : updateValue		
			};
		}
		else if(key == 'language_filter'){

			params = {

				userid               : $rootScope.getUser().userid,
				updatetype           : "language filter",
				updatevalue          : updateValue				
			};

		}
		else if(key == 'sms'){

			params = {

				userid               : $rootScope.getUser().userid,
				updatetype           : "sms reminder",
				updatevalue          : updateValue			
			};

		}
		else if(key == 'email'){

			params = {

				userid               : $rootScope.getUser().userid,
				updatetype           : "email reminder",
				updatevalue          : updateValue
			};

		}
		else if(key == 'reminder'){

			params = {

				userid               : $rootScope.getUser().userid,
				updatetype           : "repeate reminder",
				updatevalue          : updateValue		
			};

		}else if(key == 'profile'){

			params = {

				userid               : $rootScope.getUser().userid,
				updatetype           : "profile settings",
				profileSettings      : value // passed in value public/private/friends
			};

		}else if(key == 'reminder_time'){

			params = {

				userid               : $rootScope.getUser().userid,
				updatetype           : "reminder time",
				priortimeforreminder : value // time in mins
			};
		}
		
	

		(function(params){
				userAPI.updateUserSettings(params, function(rs){

				console.log('the passed in request params were ', params);
				console.log('rootScope user details = ',$rootScope.getUser());

				if(!rs.response.responsestatus){

					// Revert back the switch
					if(params.updatetype == "social sharing"){

						$scope.$broadcast('revert-switch:socialsharing');

					}else if(params.updatetype == "language filter"){

						$scope.$broadcast('revert-switch:languagefilter');

					}else if(params.updatetype == "sms reminder"){

						$scope.$broadcast('revert-switch:sms');

					}else if(params.updatetype == "email reminder"){

						$scope.$broadcast('revert-switch:email');

					}
					else if(params.updatetype == "repeate reminder"){

						$scope.$broadcast('revert-switch:reminder');
						
					}

					return false;
				}

				// Update the rootScope and cookie
				var updateStatus = (params.updatevalue) ? "true" : "false";
				console.log("upated status ... == ",updateStatus);

				if(params.updatetype == "social sharing"){

					$rootScope.userInfo.SocialSharing = updateStatus;

				}else if(params.updatetype == "language filter"){

					$rootScope.userInfo.LanguageFilter = updateStatus;					

				}else if(params.updatetype == "sms reminder"){

					$rootScope.userInfo.isSMSReminder = updateStatus;

				}else if(params.updatetype == "email reminder"){

					$rootScope.userInfo.isEmailReminder = updateStatus;

				}
				// else if(params.updatetype == "repeate reminder"){

				// 	$rootScope.userInfo.isrecurring = updateStatus;
					
				// }

				$.cookie('userInfo', JSON.stringify($rootScope.userInfo), {expires:365});

				console.log('rootScope user details AFTER UPDATION = ',$rootScope.getUser());
				
			});
		})(params);
			
	});

}]);

woi.controller("AccountSocialSharingController", ['$scope', '$rootScope', 'userAPI', function($scope, $rootScope, userAPI){    

    $scope.$on('got-user-details', function(event, userDetails){

		if(userDetails.socialsharing.toLowerCase() == "true"){
			$scope.onOffSocialSharingValue = 'on';	
		}else{
			$scope.onOffSocialSharingValue = 'off';	
		}

		$scope.initSwitch($scope.onOffSocialSharingValue.toLowerCase());		
	});
	
	$scope.toggleSwitch = function(newValue){
		$rootScope.$broadcast('user-settings:update', 'social_sharing', newValue);
	};

	$scope.$on('revert-switch:socialsharing', function(event){
		$scope.toggleState();
	});
}]);


woi.controller("ProfileSettingsController", ['$scope', '$rootScope','userAPI', function($scope, $rootScope, userAPI){
    
	$scope.$on('got-user-details', function(event, userDetails){
		$scope.activeChoice = userDetails.profilesettings;
	});
	
	$scope.changeChoice = function(tabname){

		$scope.activeChoice = tabname;

		$rootScope.$broadcast('user-settings:update', 'profile', $scope.activeChoice);
	}
}]);


woi.controller("LanguageFilterController", ['$scope', '$rootScope', 'userAPI', function($scope, $rootScope, userAPI){
    
	$scope.$on('got-user-details', function(event, userDetails){

		if(userDetails.languagefilter.toLowerCase() == "true"){
			$scope.onOffLanguageValue  = 'on';
		}else{
			$scope.onOffLanguageValue  = 'off';	
		}

		$scope.initSwitch($scope.onOffLanguageValue.toLowerCase());
	});

	

	$scope.toggleSwitch = function(newValue){
		$rootScope.$broadcast('user-settings:update', 'language_filter', newValue);
	};

	$scope.$on('revert-switch:languagefilter', function(event){
		$scope.toggleState();
	});
	
}]);	


woi.controller("SmsController", ['$scope', '$rootScope', 'userAPI', function($scope, $rootScope, userAPI){
    
	$scope.$on('got-user-details', function(event, userDetails){

		if(userDetails.issmsreminder.toLowerCase() == "true"){
			$scope.onOffSmsValue = 'on';
		}else{
			$scope.onOffSmsValue = 'off';	
		}

		$scope.initSwitch($scope.onOffSmsValue.toLowerCase());
	});

	$scope.toggleSwitch = function(newValue){		
		$rootScope.$broadcast('user-settings:update', 'sms', newValue);
	};	

	$scope.$on('revert-switch:sms', function(event){
		$scope.toggleState();
	});
}]);


woi.controller("EmailController", ['$scope', '$rootScope', 'userAPI', function($scope, $rootScope, userAPI){
    
    $scope.$on('got-user-details', function(event, userDetails){

    	if(userDetails.isemailreminder.toLowerCase() == "true"){
			$scope.onOffEmailValue  = 'on';
		}else{
			$scope.onOffEmailValue  = 'off';
		}

		$scope.initSwitch($scope.onOffEmailValue.toLowerCase());
	});

    $scope.toggleSwitch = function(newValue){    	
		$rootScope.$broadcast('user-settings:update', 'email', newValue);
	};	

	$scope.$on('revert-switch:email', function(event){
		$scope.toggleState();
	});
}]);


woi.controller("ReminderPopoverController", ['$scope', '$rootScope', 'userAPI', function($scope, $rootScope, userAPI){
  
	// called from directive  
  	$scope.constructObject = function(){

	  	$scope.timeDuraions = [
		    { label:'15 minutes'  , value: 15   },
		    { label:'30 minutes'  , value: 30   },
		    { label:'1 hour'      , value: 60   },
		    { label:'2 hours'     , value: 120  },
		    { label:'1 day'       , value: 1440 },
		    { label:'2 days'      , value: 2880 }
	  	];
    };

  $scope.selectedReminderTime = function(obj,event){               

    $('div.qtip:visible').qtip('hide');
    
    $('#selectReminder').html(obj.label);
    $scope.userAccountDetails.priortimeforreminder = obj.value;
    // $('#checkbox'+label.replace(' ','')).parent().siblings('label').toggleClass('selectedLanguage');

    $rootScope.$broadcast('user-settings:update', 'reminder_time', obj.value);
  };	
}]);



woi.controller("RemindersController", ['$scope', '$rootScope', '$filter', '$routeParams','userAPI', function($scope, $rootScope, $filter, $routeParams, userAPI){
    
    $scope.$on('got-user-details', function(event, userDetails){
		
		if(userDetails.reminderrepeatoption.toLowerCase() == "true"){
			$scope.onOffReminderValue  = 'on';
		}else{
			$scope.onOffReminderValue  = 'off';
		}

		$scope.initSwitch($scope.onOffReminderValue.toLowerCase());
	});

	$scope.toggleSwitch = function(newValue){
		$rootScope.$broadcast('user-settings:update', 'reminder', newValue);
	};	

	$scope.$on('revert-switch:reminder', function(event){
		$scope.toggleState();
	});
}]);

woi.controller("AccountSideBarController", ['$scope', '$rootScope', '$filter', '$location','userAPI', function($scope, $rootScope, $filter, $location, userAPI){

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

	$scope.activeTab = 'friends';

	$scope.changeTab = function(tabname){
		$scope.activeTab = tabname;
	}


	// Frineds List 
	$scope.paginateFriendList = [];
	$scope.paginateFriendList = []; 
    $scope.amountFriendList   = 0;
    $scope.stepFriendList     = 5;

    $scope.showMoreFriendList = true;

    $scope.loadMoreFriends = function(){

      if($scope.friendsList.length ==  $scope.paginateFriendList.length)
        return false;

      $scope.amountFriendList= $scope.amountFriendList + $scope.stepFriendList;

      if($scope.amountFriendList >= $scope.friendsList.length){ 
        $scope.showMoreFriendList = false;
        $scope.amountFriendList = $scope.friendsList.length;
      }

      $scope.paginateFriendList = $scope.friendsList.slice(0, $scope.amountFriendList);
        console.log("*******************************ssss") ;
        console.log($scope.paginateFriendList);
      if($scope.paginateFriendList.length == 0){
      	$scope.changeTab('popular');
      }
    };


	userAPI.facebookActivity({userid: $rootScope.getUser().userid},function(rs){ 

    	$scope.friendsList = rs.getfacebookactivity.facebookactivitylist;

    	// for api inconsistency
    	_.each($scope.friendsList, function(item) {
	      item.totalLikes = item.totallikes;
	    });

    	$scope.loadMoreFriends();
  	});

	
	//////////////////////////////////////////////////////////////////////////////////
	
	// Popular List 
	$scope.paginatePopularList = [];
	$scope.popularList         = [];
    $scope.amountPopularList   = 0;
    $scope.stepPopularList     = 5;

    $scope.showMorePopularList = true;

    $scope.loadMorePopular = function(){

      if($scope.popularList.length ==  $scope.paginatePopularList.length)
        return false;

      $scope.amountPopularList= $scope.amountPopularList + $scope.stepPopularList;

      if($scope.amountPopularList >= $scope.popularList.length){ 
        $scope.showMorePopularList = false;
        $scope.amountPopularList = $scope.popularList.length;
      }

      $scope.paginatePopularList = $scope.popularList.slice(0, $scope.amountPopularList);
    };

   
	var userDetails = $rootScope.getUser();
	var params;

	if(userDetails.userid == -1){
        $scope.popularList = [];
     
     	params = {

			userid    : 0,
			countryid : 0,
			stateid   : 0,
			cityid    : 0,
			areaid    : 0
		};   

    }else{

    	var countryid_ = (angular.isDefined(userDetails.countryid)) ? userDetails.countryid : 0;
    	var stateid_   = (angular.isDefined(userDetails.stateid))   ? userDetails.stateid   : 0;
    	var cityid_    = (angular.isDefined(userDetails.cityid))    ? userDetails.cityid    : 0;
    	var areaid_    = (angular.isDefined(userDetails.areaid))    ? userDetails.areaid    : 0;
    
		params = {

			userid    : userDetails.userid,
			countryid : countryid_,
			stateid   : stateid_,
			cityid    : cityid_,
			areaid    : areaid_
		};
	}


	userAPI.getPopularFeed(params, function(rs){

		if(!rs.getpopularfeed){
			$scope.popularList = [];
			return false;
		}

		$scope.popularList = rs.getpopularfeed.popularfeedlist;
		$scope.loadMorePopular();
	});


	$scope.facebookShare = function(item, event, flag){
		var shareURL;
		console.log('ITEM----.....',item);
		if(flag){
			// shareURL = item;	
			// event.target.innerHTML = "Liked!";
			
			var url = "#!/programme/"+item.programmeid+"/channel/";
			if(angular.isDefined(item.channelid)){
				url = url + item.channelid;
			}else{
				url = url + '0';
			}
			
			shareURL = $location.host() +'/'+url;	
			console.log('-------shareURL NEW === ',shareURL);
		}else{
			var makeURL = $filter('makeURL');
			var url = makeURL(item.contenttype, item.contentid);

			shareURL = $location.host() +'/'+url;	
			console.log('-------shareURL === ',shareURL);
		}

		if(item.isliked=='0'){
	      
			var params = {
				contenttype  : 'program',
				// Adding case for item.programmeid, Popular section doesn't have a contentid as of now
				contentid    : (item.contentid ? item.contentid : item.programmeid),
				removelike   : true,
				videoid      : (item.contentid ? item.contentid : item.videoid)
			};

		    userAPI.addRemoveLike(params, function(rs){
		        
		        if(!rs.response.responsestatus){
		          alert("Error sending request");
		          return false;
		        }
		     

				item.totalLikes++;
				item.isliked = '1';

				
				var params = {
					method              : 'stream.publish',
		            link                : shareURL,
		            user_message_prompt : 'Post this to your wall?',
				}

				var sharePic = item.imageurl || item.imagefilepath;
				if(angular.isDefined(sharePic)){
					params.picture = sharePic
				}

				var shareName = item.forumtitle || item.programmename;
				if(angular.isDefined(shareName)){
					params.name = shareName;
				}

				var shareCaption = item.contentname || item.channelname;
				if(angular.isDefined(shareCaption)){
					params.caption = shareCaption;
				}

				var shareText = item.feeddescription || item.contextualtext;
				if(angular.isDefined(shareText)){
					params.description = shareText;
				}
				console.log('params....',params);
		        FB.ui(params);        
	  		});
    	}
    	// Remove the like
	    else{

	    	var params = {
	          contenttype   : 'program',
	          contentid     : (item.contentid ? item.contentid : item.programmeid),
	          removelike    : false,
	          videoid       : (item.contentid ? item.contentid : item.videoid)
	        };

	        userAPI.addRemoveLike(params, function(rs){
	          
	            if(!rs.response.responsestatus){
	              alert("Error sending request");
	              return false;	            
	            }
	          
				item.totalLikes--;

				item.isliked = '0';	            
	      	});
	    }
	};

}]);

woi.controller('AccountSliderController', ['$rootScope', '$location' ,'$scope','userAPI',  function($rootScope,$location, $scope,  userAPI){

    $scope.changeurl= function(url,element){
       var  str = url.replace(/\-/g, "~").replace(/\s/g, "-").replace(/\//g, "$");
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

	$scope.trendings    = [];
	$scope.currentSlide = 0;
	$scope.noOfItems    = 0;

	var $element   =  $("#trending"),
		$container =  $element.find(".recommended-container"),
	    $slide     =  $element.find(".recommended-slider");

	var initialLeftPosition = $slide.position().left;

	function setActive(index){

		var itemNo = index + $scope.noOfItems;
		$element.find(".item").removeClass('active').eq(itemNo).addClass('active');
	}

	$scope.slide = function(forward){

		var newSlide = forward ? $scope.currentSlide + 1 : $scope.currentSlide - 1;
		var slideWidth = $slide.find('.item').outerWidth();

		// check if current slide can be displayed
		if(newSlide == ($scope.trendings.length-($scope.noOfItems-1)) || newSlide < 0){
		  return false;
	}

	// update current slide
	$scope.currentSlide = newSlide;

	setActive($scope.currentSlide);
		$slide.animate({left:-((newSlide * slideWidth) - initialLeftPosition)+ "px"}, 500);
	};


	userAPI.yourRecs({userid: $rootScope.getUser().userid}, function(rs){

		if(!rs.getrecommendationpreferences)
	  		return false;

		$scope.trendings = rs.getrecommendationpreferences.recommendationlist;

		setTimeout(function(){
			
		  var $containerWidth = $element.find('.recommended-wrapper').outerWidth();
		  var $itemWidth      = $slide.find('.item').outerWidth();

		  $scope.noOfItems    = Math.floor($containerWidth/$itemWidth);
		   
		  setActive(0);
		},5);
	});

}]);



