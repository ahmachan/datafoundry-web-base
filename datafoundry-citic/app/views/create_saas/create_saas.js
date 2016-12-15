/**
 * Created by jxy on 16/8/31.
 */
angular.module('console.create_saas', [
        {
            files: [
                'views/create_saas/create_saas.css'
            ]
        }
    ])
    .controller('create_saasCtrl',['saas','$scope','$rootScope', 'creatapp', '$state','$stateParams',
        function (saas,$scope, $rootScope, creatapp, $state,$stateParams) {
            //console.log('$stateParams', $stateParams.name);
            if ($stateParams.name) {
                //$scope.saasname=$stateParams.name;
                saas.get({id:$stateParams.name}, function (res) {
                    //console.log(res);
                    $scope.saasname=res.data.name;
                    $scope.url=res.data.url;
                })
            }else {
                $scope.saasname=false
            }
            $scope.grid = {
            secreteno: false,
            secretnames: true,
            nameerr: false,
            keychongfu: false,
            keybuhefa: false,
            keynull: false
        }

        //$scope.secrets = {
        //    "kind": "Secret",
        //    "apiVersion": "v1",
        //    "metadata": {
        //        "name": ""
        //    },
        //    "data": {},
        //    "secretsarr": [],
        //    "type": "Opaque"
        //}
        $scope.secrets = {
            "kind": "BackingServiceInstance",
            "apiVersion": "v1",
            "metadata": {
                "name": "",
                "annotations": {
                    "USER-PROVIDED-SERVICE": "true"
                }
            },
            "spec": {
                "provisioning": {
                    "backingservice_name": "USER-PROVIDED-SERVICE",
                    "backingservice_plan_guid": "USER-PROVIDED-SERVICE"
                },
                "userprovidedservice": {
                    "credentials": {
                    }
                }
            },
            "status": {
                "phase": "Unbound"
            },
            "secretsarr":[]
        }

        $scope.addSecret = function () {
            $scope.secrets.secretsarr.push({key: '', value: ''});
        }

        $scope.rmsecret = function (idx) {
            $scope.secrets.secretsarr.splice(idx, 1);

        }
        var by = function (name) {
            return function (o, p) {
                var a, b;
                if (typeof o === "object" && typeof p === "object" && o && p) {
                    a = o[name];
                    b = p[name];
                    if (a === b) {
                        return 0;
                    }
                    if (typeof a === typeof b) {
                        return a < b ? -1 : 1;
                    }
                    return typeof a < typeof b ? -1 : 1;
                } else {
                    throw ("error");
                }
            }
        }

        $scope.$watch('secrets', function (n, o) {
            if (n == o) {
                return
            }
            ;
            //console.log(n);
            $scope.grid.keychongfu = false;
            $scope.grid.keynull = false;
            $scope.grid.keybuhefa = false;

            if (n.metadata.name && n.secretsarr) {
                var arr = angular.copy(n.secretsarr);
                arr.sort(by("key"));
                if (arr && arr.length > 0) {
                    var kong = false;
                    var r = /^[a-zA-Z][a-zA-Z0-9_]{1,20}$/;
                    angular.forEach(arr, function (item, i) {

                        if (!item.key || !item.value) {
                            $scope.grid.keynull = true;
                            kong = true;
                        } else {
                            if (arr[i] && arr[i + 1]) {
                                if (arr[i].key == arr[i + 1].key) {
                                    $scope.grid.keychongfu = true;
                                    kong = true;
                                }
                            }
                            if (!r.test(arr[i].key)) {
                                //console.log(arr[i].key);
                                $scope.grid.keybuhefa = true;
                                kong = true;
                            }
                        }
                    });

                    if (!kong) {
                        $scope.grid.secreteno = true
                    } else {
                        $scope.grid.secreteno = false
                    }
                } else {
                    $scope.grid.secreteno = false
                }
            } else {
                $scope.grid.secreteno = false
            }
        }, true);

        $scope.checknames = function () {
            var r =/^[a-z][a-z0-9-]{2,28}[a-z0-9]$/;
            if (!r.test($scope.secrets.metadata.name)) {
                $scope.grid.secretnames = false;
            } else {
                $scope.grid.secretnames = true;
            }

            //console.log($scope.grid.secretnames)
        }

        $scope.checkedkv = function () {
            var r = /^\.?[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/; // key值的验证;
            for (var i = 0; i < $scope.secretsarr.length; i++) {
                if ($scope.secretsarr[i].key && $scope.secretsarr[i].value && r.test($scope.secretsarr[i].key)) {
                    $scope.grid.secreteno = true;
                } else {
                    $scope.grid.secreteno = false;
                }
            }
        }

        $scope.postsecret = function () {
            $scope.loaded = true;
            angular.forEach($scope.secrets.secretsarr, function (item, i) {
                //console.log(item.key, item.value);
                $scope.secrets.spec.userprovidedservice.credentials[item.key] = item.value
            })
            delete $scope.secrets.secretsarr;
            creatapp.create({namespace: $rootScope.namespace,region:$rootScope.region}, $scope.secrets, function (res) {
                $scope.grid.nameerr = false;
                //console.log('createconfig----',res);
                $scope.loaded = false;

                $state.go('console.backing_service', {index: 3});
            }, function (res) {
                if (res.status == 409) {
                    $scope.grid.nameerr = true;
                }
            })

        }
    }])

