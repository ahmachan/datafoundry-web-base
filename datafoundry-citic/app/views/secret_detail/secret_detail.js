'use strict';
angular.module('console.secret_detail', [
        {
            files: []
        }
    ])
    .controller('secretDetailCtrl', ['Confirm','Toast','by', '$state', '$http', '$scope', '$rootScope', 'listSecret', 'modifySecret', 'deleteSecret', '$stateParams', 'delSecret',
        function (Confirm,Toast,by, $state, $http, $scope, $rootScope, listSecret, modifySecret, deleteSecret, $stateParams, delSecret) {
            $scope.grid = {
                status: false,

            }
            var Base64 = {
                _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
                encode: function (e) {
                    var t = "";
                    var n, r, i, s, o, u, a;
                    var f = 0;
                    e = Base64._utf8_encode(e);
                    while (f < e.length) {
                        n = e.charCodeAt(f++);
                        r = e.charCodeAt(f++);
                        i = e.charCodeAt(f++);
                        s = n >> 2;
                        o = (n & 3) << 4 | r >> 4;
                        u = (r & 15) << 2 | i >> 6;
                        a = i & 63;
                        if (isNaN(r)) {
                            u = a = 64
                        } else if (isNaN(i)) {
                            a = 64
                        }
                        t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
                    }
                    return t
                },
                decode: function (e) {
                    var t = "";
                    var n, r, i;
                    var s, o, u, a;
                    var f = 0;
                    e = e.replace(/[^A-Za-z0-9+/=]/g, "");
                    while (f < e.length) {
                        s = this._keyStr.indexOf(e.charAt(f++));
                        o = this._keyStr.indexOf(e.charAt(f++));
                        u = this._keyStr.indexOf(e.charAt(f++));
                        a = this._keyStr.indexOf(e.charAt(f++));
                        n = s << 2 | o >> 4;
                        r = (o & 15) << 4 | u >> 2;
                        i = (u & 3) << 6 | a;
                        t = t + String.fromCharCode(n);
                        if (u != 64) {
                            t = t + String.fromCharCode(r)
                        }
                        if (a != 64) {
                            t = t + String.fromCharCode(i)
                        }
                    }
                    t = Base64._utf8_decode(t);
                    return t
                },
                _utf8_encode: function (e) {
                    e = e.replace(/rn/g, "n");
                    var t = "";
                    for (var n = 0; n < e.length; n++) {
                        var r = e.charCodeAt(n);
                        if (r < 128) {
                            t += String.fromCharCode(r)
                        } else if (r > 127 && r < 2048) {
                            t += String.fromCharCode(r >> 6 | 192);
                            t += String.fromCharCode(r & 63 | 128)
                        } else {
                            t += String.fromCharCode(r >> 12 | 224);
                            t += String.fromCharCode(r >> 6 & 63 | 128);
                            t += String.fromCharCode(r & 63 | 128)
                        }
                    }
                    return t
                },
                _utf8_decode: function (e) {
                    var t = "";
                    var n = 0;
                    var r = c1 = c2 = 0;
                    while (n < e.length) {
                        r = e.charCodeAt(n);
                        if (r < 128) {
                            t += String.fromCharCode(r);
                            n++
                        } else if (r > 191 && r < 224) {
                            c2 = e.charCodeAt(n + 1);
                            t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                            n += 2
                        } else {
                            c2 = e.charCodeAt(n + 1);
                            c3 = e.charCodeAt(n + 2);
                            t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                            n += 3
                        }
                    }
                    return t
                }
            }
            //list the detail of current secret
            listSecret.get({namespace: $rootScope.namespace, name: $stateParams.name,region:$rootScope.region}, function (res) {
                $scope.item = res;
                $scope.item.secretarr = [];
                $scope.item.newarr = [];

                //$scope.item.change = false;
                $scope.change = false;
                angular.forEach(res.data, function (res, i) {
                    $scope.item.secretarr.push({key: i, value: res,showLog:false});
                });
                //console.log($scope.item.secretarr);
            })
            $scope.getLog= function (idx) {
                $scope.item.secretarr[idx].showLog=!$scope.item.secretarr[idx].showLog;
            }
            $scope.addSecret = function () {
                $scope.item.newarr.push({key: '', value: ''});
                //$scope.item.newarr.push({key: '', value: ''});
            }

            $scope.$watch('item', function (n, o) {
                if (n == o) {
                    //$scope.gird.status = false;
                    return
                }
                var kong = false;

                var r = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;

                if (!$scope.change) {
                    $scope.change = true;
                    return
                } else {
                    $scope.grid.keychongfu = false;
                    $scope.grid.keynull = false;
                    $scope.grid.keybuhefa = false;
                    if (n.secretarr||n.newarr) {
                        if (n.secretarr.length>0||n.newarr.length>0) {
                            var arr = n.secretarr.concat(n.newarr);
                            //var arr = angular.copy(n.secretarr);
                            //console.log(arr);
                            arr.sort(by.open("key"));
                            angular.forEach(arr, function (item, i) {
                                if (!item.key || !item.value) {
                                    kong = true
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
                            })

                            if (!kong) {
                                $scope.grid.status = true
                            } else {
                                $scope.grid.status = false
                            }
                        }else {
                            $scope.grid.status = false
                        }
                    }


                }

            }, true);
            $scope.getLog= function (idx) {
                console.log($scope.item.secretarr[idx].showLog);
                $scope.item.secretarr[idx].showLog=!$scope.item.secretarr[idx].showLog
            }

            $scope.deletekv = function (idx) {
                $scope.item.secretarr.splice(idx, 1);
            };
            $scope.rmsecret = function (idx) {
                $scope.item.newarr.splice(idx, 1);
                //deleteSecret.delete({namespace: $rootScope.namespace, name:$stateParams.name},function(){
                //    $scope.secretarr.splice(idx,1);
                //    //if($scope.secretarr.length <= 0){
                //    //    $scope.grid.status = false;
                //    //}
                //})
            }
            $scope.updateSecret = function () {
                //console.log('---',$scope.secretarr);
                //for(var i = 0; i < $scope.secretarr.length; i++ ){
                //    for( var j= i+1; j < $scope.secretarr.length; j++ ){
                //        if($scope.secretarr[i].k == $scope.secretarr[j].k){
                //            console.log('key值重了!!!');
                //            $scope.grid.status = false;
                //            return;
                //        }
                //    }
                //    if(!$scope.secretarr[i].k || !$scope.secretarr[i].v){
                //        console.log('err!!!!!!!!!!!!');
                //        $scope.grid.status = false;
                //        return;
                //    }
                //    var k = $scope.secretarr[i].k;
                //    var v = $scope.secretarr[i].v;
                //    $scope.item.data[k] = Base64.encode(v);
                //}
                $scope.item.data={}
                if ($scope.item.secretarr) {
                    var arr = $scope.item.secretarr.concat($scope.item.newarr);
                }else {
                    var arr = $scope.item.newarr.concat($scope.item.secretarr);
                }
                //var arr = $scope.item.secretarr.concat($scope.item.newarr);
                angular.forEach(arr, function (item,i) {
                    $scope.item.data[item.key] = Base64.encode(item.value);
                });
                delete $scope.item.secretarr;
                delete $scope.item.newarr;
                modifySecret.update({
                    namespace: $rootScope.namespace,
                    name: $stateParams.name,
                    region:$rootScope.region
                }, $scope.item, function (res) {
                    //console.log('test the item', res);
                    Toast.open('保存成功')
                    $state.go('console.resource_management', {index: 3})
                })
            }
            $scope.delete = function () {
                //delSecret.del({namespace: $rootScope.namespace}, function () {
                //    $state.go('console.resource_management', {index: 3})
                //})
                Confirm.open("删除密钥", "您确定要删除密钥吗？", "密钥已经挂载在容器中，删除此密钥，容器启动将异常", "stop").then(function(){

                    delSecret.del({namespace: $rootScope.namespace,region:$rootScope.region}, function () {
                        $state.go('console.resource_management', {index: 3})
                    },function (err) {
                        Confirm.open("删除密钥", "删除密钥失败", "持久化卷已经挂载在容器中，您需要先停止服务，         卸载持久化卷后，才能删除。", null,true)
                    })


                })
            }
        }]);