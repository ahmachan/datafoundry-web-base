'use strict';
angular.module('console.apply_instance', [
        {
            files: [
                'views/dataseverdetail/dataseverdetail.css'
            ]
        }
    ])

    .controller('dataseverdetailCtrl', ['creatapp', 'instance', '$log', '$rootScope', '$scope', 'BackingService', 'BackingServiceInstance', '$stateParams', '$state',
        function (creatapp, instance, $log, $rootScope, $scope, BackingService, BackingServiceInstance, $stateParams, $state) {


            $scope.grid = {
                checked: 0,
                error: false,
                repeat: false,
                blank: false,
                timeout: false
            };

            $scope.name=''

            $scope.secrets = {
                "kind": "BackingServiceInstance",
                "apiVersion": "v1",
                "metadata": {
                    "name": "",
                    "annotations": {

                        "USER-PROVIDED-SERVICE": "true",
                        "label": "integration"

                    }
                },
                "spec": {
                    "provisioning": {
                        "backingservice_name": "USER-PROVIDED-SERVICE",
                        "backingservice_plan_guid": "USER-PROVIDED-SERVICE"
                    },
                    "userprovidedservice": {

                        "credentials": {}

                    }
                },
                "status": {
                    "phase": "Unbound"
                },

            }

            console.log('@@@test bsname', $stateParams.name);
            $scope.plan = $stateParams.plan

            $scope.$watch('name', function (n, o) {
                if (n === o) {
                    return
                }
                ;
                if (n) {
                    $scope.grid.repeat = false;
                    $scope.grid.valid = false;
                    $scope.grid.blank = false;
                    $scope.grid.timeout = false;
                }
            })

            $scope.createInstance = function () {
                if ($scope.secrets.metadata) {

                    $scope.grid.timeout = false;
                    var r = /^[a-z]+$/
                    console.log($scope.name);
                    if ($scope.name==='') {
                        //alert(1)
                        $scope.grid.blank = true;
                        return
                    } else if (!r.test($scope.name)) {
                        //alert(2)
                        $scope.grid.valid = true;
                        return
                    }
                    $scope.secrets.metadata.name = $scope.name


                    instance.create({id: $stateParams.name}, function (data) {
                        console.log('data', data.data);

                        angular.forEach(data.data, function (key, i) {
                            $scope.secrets.spec.userprovidedservice.credentials[i] = key
                        })
                        //console.log($scope.secrets.spec.userprovidedservice.credentials);
                        $scope.secrets.metadata.name = $scope.name
                        creatapp.create({

                            namespace: $rootScope.namespace
                        }, $scope.secrets, function (res) {
                            $state.go('console.backing_service', {index: 4});

                        }, function (res) {
                            if (res.status == 409) {
                                $scope.grid.repeat = true;
                            }
                        })
                    }, function (res) {
                        console.log(res);
                        $scope.grid.timeout = true;
                    })

                }

            };

        }]);