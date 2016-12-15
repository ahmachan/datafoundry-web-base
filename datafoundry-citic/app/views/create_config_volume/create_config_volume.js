'use strict';
angular.module('console.create_config_volume', [
    {
        files: []
    }
]).controller('createfigvolumeCtrl', ['$state', '$rootScope', '$scope', 'configmaps', function ($state, $rootScope, $scope, configmaps) {
    $scope.volume = {
        "kind": "ConfigMap",
        "apiVersion": "v1",
        "metadata": {
            "name": ""
        },
        "data": {},
        "configitems": [],
        "configarr": []

    }
    $scope.grid = {
        configpost: false,
        keychongfu: false,
        keybuhefa: false,
        keynull: false
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


    function readSingleFile(e) {
        var thisfilename = this.value;
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

            $scope.$apply();
        };
        reader.readAsText(file);
    };

    $scope.getLog= function (idx) {
        $scope.volume.configarr[idx].showLog=!$scope.volume.configarr[idx].showLog
    }

    $scope.deletekv = function (idx) {
        $scope.volume.configarr.splice(idx, 1);
    };

    $scope.$watch('volume', function (n, o) {
        if (n == o) {
            return
        }
        //console.log(n);
        $scope.grid.keychongfu = false;
        $scope.grid.keynull = false;
        $scope.grid.keybuhefa = false;
        if (n.metadata.name && n.configitems) {

            var arr = n.configitems.concat(n.configarr);
            arr.sort(by("key"));

            if (arr && arr.length > 0) {
                var kong = false;
                var r =/^[a-z][a-z0-9-]{2,28}[a-z0-9]$/;
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
        } else {
            $scope.grid.configpost = false
        }

    }, true);

    $scope.rmovekv = function (idx) {
        $scope.volume.configitems.splice(idx, 1);
    }

    $scope.add = function () {
        document.getElementById('file-input').addEventListener('change', readSingleFile, false);
    }


    $scope.delvolume = function (v, idx) {
        $scope.volume.data.length--
        delete $scope.volume.data[v];
        $scope.configarr.splice(idx, 1);

    }

    /////手动配置

    $scope.addConfig = function () {

        $scope.volume.configitems.push({key: '', value: ''});

    }


    $scope.cearteconfig = function () {
        $scope.loaded=true;
        var arr = $scope.volume.configitems.concat($scope.volume.configarr);
        angular.forEach(arr, function (item, i) {
            $scope.volume.data[item.key] = item.value;
        })


        delete $scope.volume.configitems;
        delete $scope.volume.configarr;
        configmaps.create({namespace: $rootScope.namespace,region:$rootScope.region}, $scope.volume, function (res) {
            //console.log('createconfig----', res);
            $scope.loaded=false;
            $state.go('console.resource_management', {index: 2});
            //$state.go('console.build_detail', {name: name, from: 'create'})
        }, function (res) {
            $state.go('console.create_config_volume');
        })
    }
}])