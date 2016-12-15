'use strict';
angular.module('console.config_detail', [
    {
        files: [

        ]
    }
])
    .controller('configDetailCtrl', ['Confirm','configmaps','secretskey','by','$state', '$http', '$scope', '$rootScope', 'listConfig', '$stateParams',
        function(Confirm,configmaps,secretskey,by,$state, $http, $scope, $rootScope, listConfig, $stateParams){
            $scope.grid = {
                status: false,
            }

            listConfig.get({namespace: $rootScope.namespace, name:$stateParams.name,region:$rootScope.region}, function(res){
                //console.log(res);
                $scope.volume = res;
                $scope.volume.configitems=[];
                $scope.volume.configarr=[];
                $scope.change=false
                angular.forEach($scope.volume.data, function (item,i) {
                    $scope.volume.configarr.push({key:i,value:item,showLog:false});
                })
            })
            function readSingleFile(e) {
                var thisfilename = this.value;
                //console.log(thisfilename);
                if (thisfilename.indexOf('\\')) {
                    var arr = thisfilename.split('\\');
                    thisfilename = arr[arr.length - 1]
                }
                var file = e.target.files[0];
                if (!file) {
                    return;
                }
                var reader = new FileReader();
                reader.onload = function (e) {
                    var content = e.target.result;
                    $scope.volume.configarr.push({key: thisfilename, value: content,showLog:false})
                    //console.log($scope.volume.configarr);
                    $scope.$apply();
                };
                reader.readAsText(file);
            };

            $scope.$watch('volume', function (n, o) {
                if (n == o) {
                    return
                }
                //console.log(n);
                $scope.grid.keychongfu = false;
                $scope.grid.keynull = false;
                $scope.grid.keybuhefa = false;
                if (!$scope.change) {
                    $scope.change = true;
                    return
                }else {
                    if (n.configarr) {
                        var arr = n.configarr.concat(n.configitems);
                        arr.sort(by.open("key"));
                        //console.log(arr);
                        if (arr && arr.length > 0) {
                            var kong = false;
                            var r = /^\.?[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
                            angular.forEach(arr, function (item, i) {
                                if (!item.key || !item.value) {
                                    $scope.grid.keynull = true;
                                    kong = true;
                                }else {
                                    if (arr[i] && arr[i + 1]) {
                                        if (arr[i].key == arr[i + 1].key) {
                                            $scope.grid.keychongfu = true;
                                            kong = true;
                                        }
                                    }
                                    if (!r.test(arr[i].key)) {
                                        $scope.grid.keybuhefa = true;
                                        kong = true;
                                    }
                                }
                            });
                            if (!kong) {
                                $scope.grid.configpost = true
                            } else {
                                $scope.grid.configpost = false
                            }
                        } else {
                            $scope.grid.configpost = false
                        }
                    }
                }


            }, true);
            $scope.getLog= function (idx) {
                $scope.volume.configarr[idx].showLog=!$scope.volume.configarr[idx].showLog
            }

            $scope.add= function () {
                document.getElementById('file-input').addEventListener('change', readSingleFile, false);
            }

            $scope.deletekv = function (idx) {
                $scope.volume.configarr.splice(idx, 1);
            };
            $scope.rmovekv = function (idx) {
                $scope.volume.configitems.splice(idx, 1);
            };
            $scope.addConfig = function () {

                $scope.volume.configitems.push({key: '', value: ''});

            }

            $scope.cearteconfig = function () {
                var arr = $scope.volume.configitems.concat($scope.volume.configarr);
                $scope.volume.data={}
                angular.forEach(arr, function (item, i) {
                    $scope.volume.data[item.key] = item.value;
                })

                delete $scope.volume.configarr;
                delete $scope.volume.configitems;
                configmaps.updata({namespace: $rootScope.namespace,name:$stateParams.name,region:$rootScope.region}, $scope.volume, function (res) {
                    //console.log('createconfig----', res);
                    $state.go('console.resource_management', {index: 2});
                    //$state.go('console.build_detail', {name: name, from: 'create'})
                })
            }

            $scope.delete= function () {

                Confirm.open("删除配置卷", "您确定要删除配置卷吗？", "配置卷已经挂载在容器中，删除此配置卷，容器启动将异常", "stop").then(function(){
                    configmaps.delete({namespace: $rootScope.namespace,name:$stateParams.name,region:$rootScope.region}, $scope.volume, function (res) {
                        //console.log('createconfig----', res);
                        $state.go('console.resource_management', {index: 2});
                        //$state.go('console.build_detail', {name: name, from: 'create'})
                    }, function (err) {
                        Confirm.open("删除密钥", "删除密钥失败", "持久化卷已经挂载在容器中，您需要先停止服务，卸载持久化卷后，才能删除。", null,true)
                    })
                })
            }

            //$scope.delvolume = function (v, idx) {
            //    $scope.volume.data.length--
            //    delete $scope.volume.data[v];
            //    $scope.configarr.splice(idx, 1);
            //
            //}
        }]);