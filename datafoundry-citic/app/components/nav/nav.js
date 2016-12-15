'use strict';

angular.module("components.nav", [])

    .directive('myNav', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/nav/nav.html'
        }
    }]);

