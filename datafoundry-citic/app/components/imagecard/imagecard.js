'use strict';

angular.module("console.imagecard", [
        {
            files: ['components/imagecard/imagecard.css']
        }
    ])

    .directive('imagecard', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/imagecard/imagecard.html'

        };
    }]);

