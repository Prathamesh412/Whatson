'use strict';
woi.directive('customAutocomplete', ['$rootScope', 'autoAPI', function($rootScope, autoAPI){
  return {
    restrict:'A',
    link:function($scope, element, attrs) {
      var APIDelay = 300,
          APITimeout,
          autoText = '',
          autoThreshold = 3,
          maxSelections = 3,
          activeSelection;

      $scope.APILive = false,
      $scope.selectedValues = {};

      element.on('keyup', function(e) {
        if( !attrs.autoSrc ) {
          var thisKey;

          switch( $rootScope.displayedQuestion.questiontype ) {
            case '3':
            case '5': thisKey = $rootScope.displayedQuestion.defaulttext[0];
                    break;
            case '4': thisKey = $rootScope.displayedQuestion.defaulttext[1];
                    break;
          }

          $scope.selectedValues = {};
          $scope.selectedValues[thisKey] = e.target.value;
          $scope.updateAnswer();
          return false;
        }

        var queryText = e.target.value,
            queryUrl = attrs.autoSrc.replace('{ac_key}', queryText);

        $scope.APILive = true;
        $scope.ac_loading = false;
        $scope.selectedValues = {};
        $scope.autocompleteText = [];

        if( queryText.length < autoThreshold ) {
          $scope.$apply(function() {
            $scope.closeAutocomplete();
          });
        }

        if(autoText === queryText || queryText.length < autoThreshold) {
          // Text hasn't changed or is too short, no need to generate another request
          return false;
        }
        
        // Update internal value of the autocompleteText
        autoText = queryText;

        // In case the delay between keystrokes is < APIDelay, clear the timeout to prevent unnecessary requests
        clearTimeout( APITimeout );

        // Set a timeout for API call
        APITimeout = setTimeout(function() {
          $scope.$apply(function() {
            // Display the loading indicator
            $scope.ac_loading = true;

            var queryCall = queryUrl.split('?')[0].split('/').pop(),
                queryParams = queryUrl.split('?')[1].split('&'),
                numberOfParams = queryParams.length,
                queryObj = {
                  call: queryCall
                };

            for(var i = 0; i < numberOfParams; i++) {
              var thisParam = queryParams[i].split('='),
              thisKey = thisParam[0],
              thisValue = thisParam[1];

              queryObj[thisKey] = thisValue;
            }
            
            autoAPI.customAutocomplete( queryObj , function(r) {
              $scope.APILive = false;
              $scope.ac_loading = false;

              if(!r || !r.response) {
                return false;
              }

              var k = r.response.docs;
              var respLength = k.length;

              for(var i = 0; i < respLength; i++) {
                r.response.docs[i]['selected'] = false;
                r.response.docs[i]['active'] = false;
                r.response.docs[i]['index'] = i;
              }

              $scope.autocompleteText = addData( r.response.docs );
              $scope.openAutocomplete();
              // console.log('Response:', $scope.autocompleteText, $scope);
            });
          });
        }, APIDelay);
      });

      $scope.selectValue = function( thisItem ) {
        // Check if multiple answers are permitted
        if( $rootScope.displayedQuestion.multipleselection == "true" ) {
          if( !thisItem.selected ) {
            $scope.selectedValues[thisItem.displayvalue] = thisItem.displaykey;
          } else {
            if( $scope.selectedValues[thisItem.displayvalue] ) {
              delete $scope.selectedValues[thisItem.displayvalue];
            }
          }
          
          thisItem.selected = !thisItem.selected;
        } else {
          $scope.closeAutocomplete();
          $scope.selectedValues = {};
          $scope.selectedValues[thisItem.displayvalue] = thisItem.displaykey;
        }
        
        $scope.updateAnswer();
      }

      var pullValues = function(obj) {
        var keys = Object.keys( obj ),
            keyCount = keys.length,
            returnArray = [];

        for(var i = 0; i < keyCount; i++) {
          returnArray.push( obj[ keys[i] ] );
        }

        return returnArray;
      }

      $scope.updateAnswer = function() {
        var keys = Object.keys( $scope.selectedValues ),
            values = pullValues( $scope.selectedValues );

        // In case of single answer, just pick up the first option
        if( !($rootScope.displayedQuestion.multipleselection == "true") ) {
          $rootScope.displayedQuestion.ac_answer = values[0];
          $rootScope.displayedQuestion.ac_placeholder = keys[0];
          $rootScope.displayedQuestion.answer = values[0];
        } else {
          // Otherwise, concatenate the other answers
          $rootScope.displayedQuestion.ac_answer = values.join('|');
          $rootScope.displayedQuestion.ac_placeholder = keys.join(', ');
          $rootScope.displayedQuestion.answer = values.join('|');
        }

        // Construct the final answer string based on the current question type, and depending on
        // whether the other input is defined
        if( $rootScope.displayedQuestion.dd_answer ) {
          if( $rootScope.displayedQuestion.questiontype == '4' ) {
            $rootScope.displayedQuestion.answer = $rootScope.displayedQuestion.dd_answer + '#' + $rootScope.displayedQuestion.ac_answer;
          } else if ( $rootScope.displayedQuestion.questiontype == '5' ) {
            $rootScope.displayedQuestion.answer = $rootScope.displayedQuestion.ac_answer + '#' + $rootScope.displayedQuestion.dd_answer;
          }
        } else {
          $rootScope.displayedQuestion.answer = $rootScope.displayedQuestion.ac_answer;
        }

        switch( $rootScope.displayedQuestion.questiontype ) {
          case '3':
          case '5': $rootScope.displayedQuestion.placeholder[0] = ( $rootScope.displayedQuestion.ac_placeholder ? $rootScope.displayedQuestion.ac_placeholder : $rootScope.displayedQuestion.defaulttext[0] );
                    break;
          case '4': $rootScope.displayedQuestion.placeholder[1] = ( $rootScope.displayedQuestion.ac_placeholder ? $rootScope.displayedQuestion.ac_placeholder : $rootScope.displayedQuestion.defaulttext[1] );
                    break;
          default : break;
        }

        element.val('');
      }

      $scope.openAutocomplete = function() {
        $scope.ac_open = true;
        $scope.selectedValues = {};
        $scope.attachListeners();
      }

      $scope.closeAutocomplete = function() {
        document.removeEventListener('click', $scope.closingListener, false);
        // document.removeEventListener('keydown', $scope.keyListener, true);
        element.get(0).parentNode.removeEventListener('click', $scope.stopProp, false);
        $scope.ac_open = false;
      }

      $scope.attachListeners = function() {
        document.addEventListener('click', $scope.closingListener, false);
        
        if( $rootScope.displayedQuestion.multipleselection == "true" ) {
          // stopProp only enabled for multiple selection values
          element.get(0).parentNode.addEventListener('click', $scope.stopProp, false);
        } else {
          // Key listeners only enabled for single selection values
          // document.addEventListener('keydown', $scope.keyListener, false);
        }
      }

      $scope.closingListener = function() {
        $scope.$apply(function() {
          $scope.closeAutocomplete();
        });
      }

      $scope.keyListener = function(e) {
        $scope.$apply(function() {
          // console.log('keyListener', e.which, e.target);
          switch(e.which) {
            case 13: // Enter key
                     // Remove this line!

                     $scope.closeAutocomplete();
                     break;

            case 27: // Escape key
                     $scope.closeAutocomplete();
                     break;

            case 32: // Space key
                     // No action associated with this for now: User might be trying to type a space?
                     break;

            case 38: // Up Arrow key
                     $scope.selectPrevious();
                     break;

            case 40: // Down Arrow key
                     $scope.selectNext();
                     break;

            default: // Other key
                     break;
          }
        });
      }

      $scope.selectNext = function() {
        if( !activeSelection || activeSelection >= $scope.autocompleteText.length - 1 ) {
          console.log('activeSelection is undefined or overflowing. Setting as 0.', activeSelection, $scope.autocompleteText.length);
          activeSelection = 0;
        } else {
          console.log('Incrementing activeSelection');
          activeSelection++;
        }

        console.log('Setting index', activeSelection, ' as active of', $scope.autocompleteText, $scope.autocompleteText[ activeSelection ]);
        $scope.autocompleteText[ activeSelection ].active = true;
        // $scope.selectValue( $scope.autocompleteText[ activeSelection ] );
        // scrollTo( activeSelection );
      }

      $scope.stopProp = function(e) {
        e.stopPropagation();
      }
    }
  };
}]);

woi.directive('customDropdown', ['$rootScope', 'userAPI', function($rootScope, userAPI){
  return {
    restrict:'A',
    link:function($scope, element, attrs) {

      $scope.APILive = false;
      $scope.dd_loading = true;
      $scope.dd_selectedValues = {};

      // Get the dropdown contents
      attrs.$observe('contentSrc', function(src) {
        if(!src) {
          return false;
        }
        $scope.APILive = true;
        $scope.dd_loading = true;
        var queryCall = src.split('?')[0].split('/').pop(),
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
          $scope.APILive = false;
          $scope.dd_loading = false;
          if(!r) {
            return false;
          }

          // Get the key of the subobject
          var subObjects = Object.keys(r);

          // Check for sub-subobjects
          if(subObjects.length > 0) {
            var thisSubObject = r[subObjects[0]];
            subObjects = Object.keys(thisSubObject);

            if(subObjects.length > 0) {
              thisSubObject = thisSubObject[subObjects[0]];
              subObjects = thisSubObject;
            }
          }

          $rootScope.displayedQuestion.dropdownValues = addData( subObjects );
          // console.log( $rootScope.displayedQuestion );

        });
      });

      $scope.toggleDropdown = function(e) {
        e.preventDefault();
        e.stopPropagation();

        if( $scope.dd_open ) {
          $scope.closeDropdown();
        } else {
          $scope.openDropdown();
        }
      }

      $scope.openDropdown = function() {
        $scope.dd_open = true;
        $scope.dd_attachListeners();
      }

      $scope.dd_selectValue = function( thisItem ) {
        // Check if multiple answers are permitted
        if( $rootScope.displayedQuestion.multipleselection == "true" ) {
          if( !thisItem.selected ) {
            $scope.dd_selectedValues[thisItem.displayvalue] = thisItem.displaykey;
          } else {
            if( $scope.dd_selectedValues[thisItem.displayvalue] ) {
              delete $scope.dd_selectedValues[thisItem.displayvalue];
            }
          }
          
          thisItem.selected = !thisItem.selected;
        } else {
          $scope.closeDropdown();
          $scope.dd_selectedValues = {};
          $scope.dd_selectedValues[thisItem.displayvalue] = thisItem.displaykey;
        }
        
        $scope.dd_updateAnswer();
      }

      var pullValues = function(obj) {
        var keys = Object.keys( obj ),
            keyCount = keys.length,
            returnArray = [];

        for(var i = 0; i < keyCount; i++) {
          returnArray.push( obj[ keys[i] ] );
        }

        return returnArray;
      }

      $scope.dd_updateAnswer = function() {
        var keys = Object.keys( $scope.dd_selectedValues ),
            values = pullValues( $scope.dd_selectedValues );

        // In case of single answer, just pick up the first option
        if( !($rootScope.displayedQuestion.multipleselection == "true") ) {
          $rootScope.displayedQuestion.dd_answer = values[0];
          $rootScope.displayedQuestion.dd_placeholder = keys[0];
          $rootScope.displayedQuestion.answer = values[0];
        } else {
          // Otherwise, concatenate the other answers
          $rootScope.displayedQuestion.dd_answer = values.join('|');
          $rootScope.displayedQuestion.dd_placeholder = keys.join(', ');
          $rootScope.displayedQuestion.answer = values.join('|');
        }

        // Construct the final answer string based on the current question type, and depending on
        // whether the other input is defined
        if( $rootScope.displayedQuestion.ac_answer ) {
          if( $rootScope.displayedQuestion.questiontype == '5' ) {
            $rootScope.displayedQuestion.answer = $rootScope.displayedQuestion.ac_answer + '#' + $rootScope.displayedQuestion.dd_answer;
          } else if ( $rootScope.displayedQuestion.questiontype == '4' ) {
            $rootScope.displayedQuestion.answer = $rootScope.displayedQuestion.dd_answer + '#' + $rootScope.displayedQuestion.ac_answer;
          }
        } else {
          $rootScope.displayedQuestion.answer = $rootScope.displayedQuestion.dd_answer;
        }

        switch( $rootScope.displayedQuestion.questiontype ) {
          case '2':
          case '4': $rootScope.displayedQuestion.placeholder[0] = ( $rootScope.displayedQuestion.dd_placeholder ? $rootScope.displayedQuestion.dd_placeholder : $rootScope.displayedQuestion.defaulttext[0] );
                    break;
          case '5': $rootScope.displayedQuestion.placeholder[1] = ( $rootScope.displayedQuestion.dd_placeholder ? $rootScope.displayedQuestion.dd_placeholder : $rootScope.displayedQuestion.defaulttext[1] );
                    break;
          default : break;
        }

        element.val('');
      }

      $scope.dd_attachListeners = function() {
        document.addEventListener('click', $scope.dd_closingListener, false);
        if( $rootScope.displayedQuestion.multipleselection == "true" ) {
          element.get(0).parentNode.addEventListener('click', $scope.stopProp, false);
        }
      }

      $scope.dd_closingListener = function() {
        $scope.$apply(function() {
          $scope.closeDropdown();
        });
      }

      $scope.closeDropdown = function() {
        $scope.dd_open = false;
        document.removeEventListener('click', $scope.dd_closingListener, false);
        element.get(0).parentNode.removeEventListener('click', $scope.stopProp, false);
      }
    }
  };
}]);
