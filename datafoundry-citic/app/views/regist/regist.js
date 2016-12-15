'use strict';
angular.module('home.regist', [])
    .controller('registCtrl', ['Toast','$rootScope', '$state', 'AuthService', 'registration', '$scope', '$log', 'Alert',
        function (Toast,$rootScope, $state, AuthService, registration, $scope, $log, Alert) {
            $log.info('regist');
            $scope.credentials = {};
            $scope.xieyi = false;
            $scope.regist = function () {
                $scope.sendobj = {
                    username: $scope.credentials.username,
                    password: $scope.credentials.password,
                    email: $scope.credentials.email
                }
                //注册相关代码...
                registration.regist({}, $scope.sendobj, function (data) {
                    Alert.open('注册账号', '注册成功,请登录', '', true).then(function () {
                        $state.go('login');
                    })
                }, function (err) {
                    console.log(err);
                    if (err.data.code === 14091) {
                        Toast.open('用户名重复,请重新输入');
                    }

                })
            };
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
            $scope.$watch('code', function (n,o) {
                if (n == o) {
                    return
                }
                if (n !== $scope.yzcode) {
                    $scope.credentials.codeerror=true
                }else {
                    $scope.credentials.codeerror=false
                }
            })
            $scope.$watch('namespace', function (n, o) {
                //console.log('new1',n);
                if (n == '') {

                    clearInterval($rootScope.timer);
                }
            })
            // $scope.cancel = function () {
            //   $state.go('home.index');
            // };

        }]);