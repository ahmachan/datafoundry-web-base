'use strict';

angular.module("console.datepick", [
        {
            files: ['components/datepick/datepick.css']
        }
    ])

    .directive('datePick', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/datepick/datepick.html',
            scope: {
                st: '=',
                et: '='
            },
            controller: ['$scope', function ($scope) {
                $scope.datePickerOptions = {
                    showWeeks: false,
                    formatDay: 'd',
                    formatDayTitle: 'yyyy年M月',
                    customClass: function (date, mode) {
                        if (!$scope.st || !$scope.et || !date) {
                            return;
                        }
                        if (date.mode != 'day') {
                            return;
                        }
                        if ($scope.st.getMonth() == date.date.getMonth() && $scope.st.getDate() == date.date.getDate()) {
                            return "day-end"
                        }
                        if ($scope.et.getMonth() == date.date.getMonth() && $scope.et.getDate() == date.date.getDate()) {
                            return "day-end"
                        }
                        if ($scope.st.getTime() <= date.date.getTime() && $scope.et.getTime() >= date.date.getTime()) {
                            return "day-selected"
                        }
                    }
                };

                $scope.$watch('dt', function(newVal, oldVal){
                    if (newVal == oldVal || !newVal) {
                        return;
                    }
                    if (!oldVal) {
                        $scope.st = newVal;
                    } else {
                        if (oldVal.getTime() < newVal.getTime()) {
                            $scope.et = newVal;
                        } else {
                            $scope.st = newVal;
                            $scope.et = oldVal;
                        }
                        $scope.dt = null;
                        $scope.opened = false;
                    }
                });
            }]
        };
    }]);

