'use strict';

angular.module("console.checkbox", [
        {
            files: ['components/checkbox/checkbox.css']
        }
    ])

    .directive('cCheckbox', [function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                checked: '=',
                text: '@'
            },
            templateUrl: 'components/checkbox/checkbox.html'
        }
    }]);

