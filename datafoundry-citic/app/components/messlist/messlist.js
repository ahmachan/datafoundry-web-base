'use strict';

angular.module("console.messlist", [
      {
        files: [
          'components/messlist/messlist.css',
          'components/datepick/datepick.js',
          'components/checkbox/checkbox.js'
        ]
      }
    ])

    .directive('messlist', [function () {
      return {
        restrict: 'EA',
        replace: true,
        scope: {
          name: '=',
          type: '@'
        },
        controller: ['$scope',
          function($scope){
            $scope.grid={
              st:null,
              et:null,
              auto:null,
              page: 1,
              size: 10,
            }
          }],
        templateUrl: 'components/messlist/messlist.html'
      }
    }]);