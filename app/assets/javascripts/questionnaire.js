woi.controller('QuestionnaireController', ['$rootScope', '$scope', '$filter', 'userAPI', function($rootScope, $scope, $filter, userAPI) {
	/*
	 *	Execution begins with initQuestionbank(), but this is only called by default if the 
	 *  $rootScope.questionnaireModel object doesn't exist or if the questionnaireLoaded
	 *  property of the object is false. Otherwise, it uses the data that has already been loaded.
	 *  
	 *  Data can be forcefully loaded again by calling initQuestionbank() or getQuestionbank()
	 *
	 *  Question Types:
	 *	===============
	 *	Development considers 5 question types:
	 *		1. Yes/No
	 *		2. Single Dropdown
	 *		3. Single Textbox
	 *		4. Dropdown + Textbox
	 *		5. Textbox + Dropdown
	 *
	 *	DOM structure remains the same, but respective elements are displayed/hidden based on the question type,
	 *	which is applied as a class to the parent container. This class follows the structure
	 *	qType + questionType. If the type is invalid, the entire element is hidden.
	 *
	 *	We'll be adding extra parameters to the main model, along with the API response data, in order to
	 *	form a generic structure.
	 */

	var enableLog = true,
      loading = $filter('loading'),
      $questionnaire = $('.questionnaireContainer'),
      $uiblock = $('<div id="uiblock"></div>'),
      $errorblock = $('<div class="errorMessage"></div>'),
      errorMessage = '',
      errorType = 'error';

  if( angular.isUndefined($rootScope.currentQuestion) ) {
  	$rootScope.currentQuestion = 0;
  }

  // Append the notifier/blocker div
  $questionnaire.append( $uiblock );

	// Load the data if it doesn't already exist
	if(!$rootScope.questionnaireModel || !$rootScope.questionnaireModel.questionnaireLoaded) {
		initQuestionbank();
	}

	/* Main controller variables */
			// QuestionTypes (1, 2, 3...) of the questions that have mutiple fields
			// EDIT: Looks like we won't be needing this, but it's left here for historical purposes :P
	var multiQTypes = [],
			// Valid question types, used to construct the question classes so invalid types are hidden
			validQTypes = ['1', '2', '3', '4', '5'];

	/* Main controller functions */
	// Starts execution by initializing the appropriate variables
	function initQuestionbank() {
		// Main model to store all data
		$rootScope.questionnaireModel = {
			questionnaireLoaded: false,
			questionBank: []
		};

		// Model to store the displayed question
		$rootScope.displayedQuestion = {};

		getQuestionbank();
	};

	// Contains the API call and model assignment
	function getQuestionbank() {
		userAPI.getQuestionnaireQuestions({}, function(r) {
			$rootScope.questionnaireModel.questionnaireLoaded = true;
			if(!r || !r.userfeedbackquestions) {
				return false;
			}

			$rootScope.questionnaireModel.questionBank = addData( r.userfeedbackquestions.questionnaire );

			$rootScope.displayedQuestion = $rootScope.questionnaireModel.questionBank[$rootScope.currentQuestion];
			preprocessQbank();
		});
	};

	// Adds additional data to each question, necessary to properly display and manage the questions and response
	function preprocessQbank() {
		angular.forEach( $rootScope.questionnaireModel.questionBank, function(question, key) {
			// Split the placeholder texts in case of questions with multiple fields
			if(question.defaulttext) {
				$rootScope.questionnaireModel.questionBank[key].defaulttext = question.defaulttext.split(',');
			} else {
				$rootScope.questionnaireModel.questionBank[key].defaulttext = "";
			}

			// Set the question type class for each question
			if( validQTypes.indexOf( question.questiontype ) > -1 ) {
				$rootScope.questionnaireModel.questionBank[key].displayClass = "qType_" + question.questiontype;
			}

			// Adds userid to each question, to support generic API response function
			$rootScope.questionnaireModel.questionBank[key].userid = $rootScope.getUser().userid;

			// Adds applicationname as sourcebits to each question, to support generic API response function
			$rootScope.questionnaireModel.questionBank[key].applicationname = 'sourcebits';

			// Preprocess the Autocomplete API URL, if it exists
			if( question.autocompleteurl ) {
				$rootScope.questionnaireModel.questionBank[key].autocompleteurl = normalizeAutocomplete('autocompleteurl', question);
			}

			// Replicates the placeholder so we can preserve it's value even after options have been selected
			(function(value) {
				$rootScope.questionnaireModel.questionBank[key].placeholder = value.concat();
			})($rootScope.questionnaireModel.questionBank[key].defaulttext);

			// Substitute parameters into the getapiurl, if it exists
			if( question.getapiurl ) {
				$rootScope.questionnaireModel.questionBank[key].getapiurl = substituteParams('getapiurl', question);
			}

			// Adding regular expressions for validation. This is temporary, until the API is updated with the validator field
			// question.validator = /^[\d]*$/gi;
		});
	}

	// Replaces {parameterName} with it's corresponding parameterValue from the displayedQuestion Object
	function substituteParams(targetAPIKey, Q) {

		/*
		 * Dynamic properties are present in the string as {propertyName}, where propertyName matches a key in
		 * the question model. We just check for key matches and replace it with it's corresponding value in the 
		 * active question. In some cases, multiple values may need to be concatenated, so we split using a [,]
		 * as the delimiter and create and string based on the values corresponding to each key.
		 */

		// Get the selected API string from the selected question
		var APIString = Q[targetAPIKey],
				validKeys = Object.keys( Q ),

				// Get the indices of the opening and closing braces
				startMarkers = indicesOf( '{', APIString ),
				endMarkers = indicesOf( '}', APIString ),

				// Get delimiters using the two arrays obtained above
				delimiters = magnetize( startMarkers, endMarkers ),

				// Pick up the requested keys from the APIString
				requestedKeys = extraditeStrings( delimiters, APIString ),

				// Isolate the values corresponding to the requestedKeys
				keyValues = assignValues( requestedKeys, Q ),

				// Inject the isolated values to construct the finalAPIString
				finalAPIString = injectValues( requestedKeys, keyValues, APIString );

		return finalAPIString;
	}

	// Normalizes the Autocomplete URL, replacing any {parameterName} with {ac_key}, because we're
	// expecting only one dynamic value in the URL, and replacement will be easier later if we have 
	// only one expected input value, which is this case is {ac_key}
	function normalizeAutocomplete( targetAPIKey, QObj ) {
		var Q = QObj || $rootScope.displayedQuestion,
				autoString = Q[ targetAPIKey ],

				// Get the indices of the opening and closing braces
				startMarkers = indicesOf( '{', autoString ),
				endMarkers = indicesOf( '}', autoString ),

				// Get delimiters using the two arrays obtained above
				delimiters = magnetize( startMarkers, endMarkers ),

				// Pick up the requested keys from the autoString
				requestedKeys = extraditeStrings( delimiters, autoString ),

				// Inject the isolated values to construct the finalAPIString
				finalAPIString = injectValues( requestedKeys, ['{ac_key}'], autoString );

		return finalAPIString;
	};

	/* Helper Functions */
	// Returns indices of a character in a string as an array
	function indicesOf(needle, haystack) {
		var size = haystack.length,
				indices = [];

		for(var i = 0; i < size; i++) {
			if(haystack[i] == needle) { 
				indices.push(i)
			}
		}

		// TODO: Might need to return -1 if indices.length == 0 instead of an empty array.
		return indices;
	}

	// Returns an array of arrays of elements having the same indices from two input arrays
	function magnetize(positive, negative) {

		// Lengths of the arrays much match
		if( !(positive.length == negative.length) ) return false;

		var matchedArray = [],
				size = positive.length;

		for(var i = 0; i < size; i++) {
			matchedArray[i] = [ positive[i], negative[i] ];
		}

		return matchedArray;
	}

	// Returns an array of strings, extracted according to the indices provided by indicesOf() and magnetize()
	function extraditeStrings(keys, string) {
		var size = keys.length,
				returnArray = [];

		for( var i = 0; i < size; i++ ) {
			var subString = string.substring( keys[i][0] + 1, keys[i][1] );

			if(subString.length) {
				returnArray[i] = subString;
			}
		}

		return returnArray;
	}

	// Assigns values based on keys
	function assignValues(keys, obj) {
		var size = keys.length,
				returnArray = [];

		for( var i = 0; i < size; i++ ) {
			// Check if multiple replies are expected
			if( keys[i].indexOf(',') > -1 ) {

				/*
				 * We need to do a couple of things here:
				 *	Step 1: Split keys[i] and get the individual keys we need to gather
				 *	Step 2: Gather values corresponding to these keys
				 *	Step 3: Concatenate the gathered values into a single string
				 *	Step 4: Return the concatenated string
				 */

				// Step 1: Let's get started....Initializing appropriate variables
				var expectedKeys = keys[i].split(','),
						numberOfKeys = expectedKeys.length,
						keyValues		 = [],
						keyString		 = '';

				// Step 2: Okay, now let's get the corresponding values...
				for( var j = 0; j < numberOfKeys; j++ ) {
					if( obj[ expectedKeys[j] ] ) {
						keyValues[j] = obj[ expectedKeys[j] ];
					}
				}

				// Step 3: Now concatenating....
				keyString = keyValues.join(',');

				// Now store the string into the returnArray
				if( keyString ) {
					returnArray[i] = keyString;
				}
			} else {
			// Otherwise, assign the appropriate value
				returnArray[i] = obj[ keys[i] ];
			}
		}

		return returnArray;
	}

	// Injects values returned by assignValues() into the positions from magnetize
	function injectValues(keys, values, string) {
		var size = keys.length,
				returnString = string;

		for( var i = 0; i < size; i++ ) {
			var keyString = '{' + keys[i] + '}';

			returnString = returnString.replace( keyString, values[i] );
		}

		return returnString;
	}

	// Manages the display of error messages and loading indicators
	function toggleUI(block) {
		if(block) {
			if(errorMessage) {
				// Remove any existing indicators
				loading('hide', {element: $uiblock});

				$errorblock.html( errorMessage );
				$uiblock.append( $errorblock );
				errorMessage = '';
			} else {
				// Remove any existing indicators
				loading('hide', {element: $uiblock});
				$errorblock.html('');
				// Load the loading indicator
  			loading('show', {element: $uiblock});
			}
			
  		$uiblock.fadeIn(50);
		} else {
			$uiblock.fadeOut(200);
			errorMessage = '';
			// Hide the loading indicator
  		loading('hide', {element: $uiblock});
		}
	}

	// Function to generate a regex object from the API validator parameter
	function makeRegex(string) {
		if(!string) return false;

		var blocks = string.split('/'),
				modifiers = blocks.pop();

				blocks.shift(); // Remove the leading slash

		var	regexp = blocks.join('/');

		return new RegExp( regexp, modifiers );
	}

	/* Scope functions for interaction in the view */
	$scope.submitAns = function() {
		var hasBlankFields = false,
				validatorExp = $rootScope.displayedQuestion.validator,
				validatorObj = makeRegex( validatorExp ),
				isValid = true;

		// console.log('Validator expression for this question:', validatorExp);

		// Check for blank fields
		switch( $rootScope.displayedQuestion.questiontype ) {
			case '2': if( !$rootScope.displayedQuestion.dd_answer ) {
								hasBlankFields = true;
							}
							break;
			case '3': if( !$rootScope.displayedQuestion.ac_answer ) {
								hasBlankFields = true;
							}
							break;
			case '4':
			case '5': if(!$rootScope.displayedQuestion.ac_answer || !$rootScope.displayedQuestion.dd_answer) {
								hasBlankFields = true;
							}
							break;
			default:break;
		}

		if( hasBlankFields ) {
			errorMessage = "All fields are required";
    	toggleUI(true);
    	setTimeout(function() {
    		toggleUI(false);
    	}, 1000);
    	return false;
		} else if(validatorExp) {
			// If fields are filled in, check if the values are valid according to the API validator field
			var thisTextbox,
					thisValue = '';
			switch( $rootScope.displayedQuestion.questiontype ) {
				case '3':
				case '5':	
								thisTextbox = $('.customTextbox input[type="text"]').eq(1);
								thisValue = thisTextbox.val() || thisTextbox.attr('placeholder');
								break;
				case '4':	
								thisTextbox = $('.customTextbox input[type="text"]').eq(0);
								thisValue = thisTextbox.val() || thisTextbox.attr('placeholder');
								break;
				default	:
								break;
			}
			// console.log('Final value being submitted:', thisValue, validatorObj, validatorObj.test( thisValue ));
			if(thisValue && !validatorObj.test( thisValue )) {
				errorMessage = 'Please enter valid values';
				toggleUI(true);
		  	setTimeout(function() {
		  		toggleUI(false);
		  	}, 1000);
				return false;
			}
		}

		// Block the UI while loading
		toggleUI(true);

		var src = substituteParams('updateapiurl', $rootScope.displayedQuestion),
				queryCall = src.split('?')[0].split('/').pop(),
        queryParams = src.split('?')[1].split('&'),
        numberOfParams = queryParams.length,
        queryObj = {
          call: queryCall
        };

    for(var i = 0; i < numberOfParams; i++) {
      var thisParam = queryParams[i].split('='),
      thisKey = thisParam.shift(),
      thisValue = thisParam.join('=');

      if(thisKey && thisValue) {
        queryObj[thisKey] = thisValue;
      }
    }

    userAPI.customAPI( queryObj, function(r) {
      var timeoutSet = false;
      if(!r || !r.response || !r.response.message || r.response.responsestatus != 'true') {
      	errorMessage = "Looks like something went wrong!";
      	toggleUI(true);

      	// Unblock the UI after a timeout
      	timeoutSet = true;
      	var thisTimeout = setTimeout(function() {
      		toggleUI(false);
      	}, 4000);
      }

			$rootScope.displayedQuestion = $rootScope.questionnaireModel.questionBank[++$rootScope.currentQuestion];

			// Clear the answers
			$scope.selectedValues = {};
			$scope.dd_selectedValues = {};

			// Unblock the UI
			if( !timeoutSet ) {
				setTimeout(function() {
					toggleUI(false);
				}, 500);
			}
    });
	}

	$scope.submitYes = function() {
		$rootScope.displayedQuestion.answer = 'Yes';
		$scope.submitAns();
	}

	$scope.submitNo = function() {
		$rootScope.displayedQuestion.answer = 'No';
		$scope.submitAns();
	}

	$scope.clearForm = function() {
		(function(value){
			$rootScope.displayedQuestion.placeholder = value.concat();
		})($rootScope.displayedQuestion.defaulttext);
		
		$rootScope.displayedQuestion.answer = '';
		$scope.selectedValues = {};
		$scope.dd_selectedValues = {};
		$rootScope.displayedQuestion.ac_answer = '';
		$rootScope.displayedQuestion.dd_answer = '';

		angular.forEach( $rootScope.displayedQuestion.dropdownValues, function(value, key) {
			value.selected = false;
		});

		angular.forEach( $rootScope.displayedQuestion.autocompleteText, function(value, key) {
			value.selected = false;
		});

		$questionnaire.find('input').val('');
	}

	$scope.nextQuestion = function() {
		toggleUI(true);
		$rootScope.displayedQuestion = $rootScope.questionnaireModel.questionBank[++$rootScope.currentQuestion];
  	setTimeout(function() {
  		toggleUI(false);
  	}, 200);
	}

}]);