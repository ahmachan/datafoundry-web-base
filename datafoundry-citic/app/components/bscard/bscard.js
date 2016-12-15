'use strict';
angular.module("console.bscard", [
    {
        files: ['components/bscard/bscard.css']
    }
])

.directive('bsCard', [function () {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'components/bscard/bscard.html'
    };
}])
