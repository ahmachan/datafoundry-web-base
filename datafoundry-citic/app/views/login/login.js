'use strict';
angular.module('home.login', [])
    .controller('loginCtrl', ['regions', 'ModalRegist', '$interval', '$state', '$rootScope', 'AuthService', '$scope', '$log', '$stateParams',
        function (regions, ModalRegist, $interval, $state, $rootScope, AuthService, $scope, $log, $stateParams) {
            //console.log("+_+_+_+_+_+_+_+", $stateParams);
            $rootScope.credentials={};
            regions.query({}, function (data) {
                //console.log('regions', data);
                $scope.regionlist = data;
                $scope.copyregionlist=angular.copy(data);
                $rootScope.credentials.region=data[0].identification;
                $scope.curregion=data[0].region_describe
            })
            $('.loginname').focus();
            //$rootScope.credentials = {
            //    region:'cn-north-1'
            //};
            //$scope.curregion = '铸造一区'
            $scope.loginerror = {}
            var flog = localStorage.getItem("code");
            var vm = $scope.vm = {
                code: ''
            }
            if (flog > 3) {
                $rootScope.loginyanzheng = true;
            } else if (flog <= 3 || !flog) {
                $rootScope.loginyanzheng = false;
            }
            //$scope.curregion = '一区一区';
            $scope.checkregion = function (res,regionid) {
                $scope.curregion=res;
                $rootScope.credentials.region = regionid;
            }
            $scope.$watch('curregion', function (n,o) {
                if (n === o) {
                    return
                }
                //$scope.regionlist=$scope.copyregionlist;
                var arr = angular.copy($scope.copyregionlist)
                if ($scope.regionlist) {
                    //console.log($scope.regionlist,$scope.copyregionlist);
                    angular.forEach( $scope.copyregionlist, function (item,i) {
                       if (item.region_describe === n) {
                           //console.log(item.region_describe, $scope.regionlist);
                           arr.splice(i, 1);
                           $scope.regionlist=arr;
                       }
                   })
                }
            })
            //$scope.regionlist = [
            //    {regionname : '一区一区'},
            //    {regionname : '二区二区'}
            //]
            // 进度条暂时不启用
            // var vm = $scope.vm = {};
            // vm.value = 0;
            // vm.style = 'progress-bar-danger';
            // vm.showLabel = true;
            // vm.striped = true;
            //
            // $scope.selectValue = function (){
            //   console.log(vm.style);
            // };
            // var index = 0;
            // var timeId = 100;
            // $scope.count = function(){
            //   var start = $interval(function(){
            //     vm.value =  ++index;
            //     if (index > 99) {
            //       $interval.cancel(start);
            //     }
            //     if (index == 60) {
            //       index = 99;
            //     }
            //   }, timeId);
            // };
            function codenum() {
                var str = [
                    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
                    'o', 'p', 'q', 'r', 's', 't', 'x', 'u', 'v', 'y', 'z', 'w', 'n',
                    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
                ];
                var num = null;
                for (var i = 0; i < 4; i++) {
                    var index = Math.floor(Math.random() * str.length);
                    if (num) {
                        num += str[index];
                    } else {
                        num = str[index]
                    }

                }
                $scope.yzcode = num;
            }

            codenum()
            $scope.changecode = function () {
                codenum()
            };
            //$scope.$watch('aaaa', function (n,o) {
            //    console.log(n);
            //})
            $scope.$watch('vm.code', function (n, o) {
                //console.log(n);
                //console.log($scope.yzcode);
                if (n == o) {
                    return
                }

                if (n !== $scope.yzcode) {
                    $scope.loginerror.codeerror = true
                } else {
                    $scope.loginerror.codeerror = false
                }
            })
            $scope.$watch('namespace', function (n, o) {
                //console.log('new1',n);
                if (n == '') {

                    clearInterval($rootScope.timer);
                }
            })
            $log.info('login');

            $scope.login = function () {
                if ($stateParams.type) {
                    AuthService.login($rootScope.credentials, $stateParams);
                } else {
                    AuthService.login($rootScope.credentials);
                }

            };
            $scope.regist = function () {
                //ModalRegist.open();
                $state.go('regist');
            };
            // $scope.cancel = function () {
            //   $uibModalInstance.dismiss();
            // };
        }]);
