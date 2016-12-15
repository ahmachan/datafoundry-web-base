/**
 * Created by jxy on 16/9/6.
 */
angular.module('home.index_backing_service', [
        {
            files: [
                'views/backing_service/backing_service.css',
                'components/bscard/bscard.js'
            ]
        }
    ])
    .filter('myfilter', function () {
        // 分类过滤器
        return function (items, condition) {
            var filtered = [];
            if (condition === undefined || condition === '') {
                return items;
            }
            if (condition.name === '') {
                return items;
            }
            if (condition.name) {
                for (var i = 0; i < items.length; i++) {
                    var str = items[i].metadata.name.toLowerCase();
                    if (str.indexOf(condition.name) != -1) {
                        filtered.push(items[i]);
                    }

                }
                return filtered;
                // angular.forEach(items, function (item) {
                //   var str = item.metadata.name.toLowerCase()
                //   // console.log(condition.name,str)
                //   if (str.indexOf(condition.name)!=-1) {
                //     filtered.push(item);
                //   }
                // });
                // console.log(filtered)
                // return filtered;
            }
            else {
                angular.forEach(items, function (item) {
                    if (condition.providerDisplayName === item.providerDisplayName) {
                        filtered.push(item);
                    }
                });
                return filtered;
            }
        };
    })
    .controller('index_backing_serviceCtrl', ['$state','$scope', '$log','newBackingService','BackingServiceInstance','$rootScope','$filter','$state',
        function ($state,$scope,$log,newBackingService,BackingServiceInstance,$rootScope,$filter,$state) {
            $("#idx-bs").css("minHeight",$(window).height());
            console.log('$state', $state.params.region);
            $scope.myregion = $state.params.region || 'cn-north-1';
            $scope.grid = {
                serviceCat: 'all',
                vendor: 'all',
                txt: '',
                mytxt: ''
            };
            Array.prototype.unique = function () {
                this.sort(); //先排序
                var res = [this[0]];
                for (var i = 1; i < this.length; i++) {
                    if (this[i] !== res[res.length - 1]) {
                        res.push(this[i]);
                    }
                }
                return res;
            }
            $scope.bkservice = true;
            var loadBs = function () {
                newBackingService.get({}, function (data) {
                    $log.info('loadBs', data);
                    $scope.items = data.items;
                    var arr = data.items;
                    //上方两个tab分组数组
                    //服务分类
                    $scope.cation = [];
                    // 服务提供者
                    $scope.providers = [];
                    // 每个item中有几个对象
                    $scope.itemsDevop = [];
                    //将类名变大写
                    for (var l = 0; l < arr.length; l++) {
                        if (arr[l].metadata.annotations && arr[l].metadata.annotations.Class !== undefined) {
                            arr[l].metadata.annotations.Class = arr[l].metadata.annotations.Class.toUpperCase()
                        } else {
                            arr[l].metadata.annotations = {
                                Class: '其他'
                            };
                        }
                        if (!arr[l].spec.metadata.providerDisplayName) {
                            arr[l].spec.metadata.providerDisplayName = '其他'
                        }
                        $scope.providers.push(arr[l].spec.metadata.providerDisplayName)
                        $scope.cation.push(arr[l].metadata.annotations.Class)
                    }
                    //将分类去重
                    $scope.cation = $scope.cation.unique()
                    $scope.providers = $scope.providers.unique()
                    //服务分类属性
                    // item.metadata.annotations.Class
                    // 服务提供者属性
                    // item.spec.metadata.providerDisplayName
                    //服务提供者分组
                    for (var j = 0; j < arr.length; j++) {

                        for (var b = 0; b < $scope.providers.length; b++) {
                            if (arr[j].spec.metadata.providerDisplayName === $scope.providers[b]) {
                                arr[j].providerDisplayName = $scope.providers[b];
                            }
                        }
                    }
                    //服务分类分组
                    for (var i = 0; i < $scope.cation.length; i++) {
                        $scope.itemsDevop.push([])
                        for (var m = 0; m < arr.length; m++) {
                            if (arr[m].metadata.annotations && arr[m].metadata.annotations.Class === $scope.cation[i]) {
                                $scope.itemsDevop[i].push(arr[m]);
                            }
                        }
                    }
                    // 设置渲染到页面的数据market市场
                    $scope.market = [];
                    for (var s = 0; s < $scope.cation.length; s++) {
                        $scope.market.push({})
                        $scope.market[s].name = $scope.cation[s];
                        for (var q = 0; q < $scope.itemsDevop.length; q++) {
                            if (s == q) {
                                $scope.market[s].item = $scope.itemsDevop[q]
                                $scope.market[s].isshow = true;
                                $scope.market[s].showTab = true;
                                $scope.market[s].id = q;
                            }
                        }
                    }
                    // 划分出market的其他分类
                    var other = null;
                    for (var o = 0; o < $scope.market.length; o++) {
                        if ($scope.market[o].name == '其他') {
                            other = $scope.market[o];
                            $scope.market.splice(o, 1);
                        }
                    }
                    // 把market根据item多少进行排序
                    $scope.market.sort(function (x, y) {
                        return x.item.length > y.item.length ? -1 : 1;
                    });
                    // 如果有other把other放到最后
                    if (other) {
                        $scope.market.push(other)
                    }
                    // 从新将服务分类提取
                    var lins = [];
                    for (var x = 0; x < $scope.market.length; x++) {
                        lins.push($scope.market[x].name)
                    }
                    // 将上面的服务分类顺序排列的与下方一致
                    $scope.cation = lins;
                    // 第一栏分类
                    var fiftobj = {};
                    var fiftmanobj = {}
                    for (var q = 0; q < data.items.length; q++) {
                        fiftobj[data.items[q].metadata.name] = data.items[q].metadata.annotations.Class
                        fiftmanobj[data.items[q].metadata.name] = data.items[q].providerDisplayName
                    }
                    // console.log('fiftobj',fiftobj)
                    // console.log('fiftmanobj',fiftmanobj)

                    for (var r = 0; r < $scope.market.length; r++) {
                        for (var u = 0; u < $scope.market[r].item.length; u++) {
                            // console.log($scope.market[r].item[u].status.phase);
                            if ($scope.market[r].item[u].status.phase === 'Active') {
                                $scope.market[r].item[u].biancheng = true;
                            } else {
                                $scope.market[r].item[u].bianhui = true;
                            }

                        }
                    }
                    //console.log("$scope.market", $scope.market)
                    $scope.data = data.items;
                    filter('serviceCat', 'all');
                    filter('vendor', 'all');

                })
            };
            loadBs();
            // 正则方式过滤器
            var filter = function (tp, key) {
                var reg = null;
                if ($scope.grid.txt) {
                    var txt = $scope.grid.txt.replace(/\//g, '\\/');
                    reg = eval('/' + txt + '/ig');
                }
                angular.forEach($scope.items, function (item) {
                    if (tp == 'serviceCat') {
                        item.show = item.metadata.labels.cat == key || key == 'all';
                    }
                    if (tp == 'vendor') {
                        item.show = item.spec.metadata.providerDisplayName == key || key == 'all';
                    }
                    if (reg) {
                        item.show = item.show && reg.test(item.metadata.name)
                    }
                });
            };
            //服务分类筛选
            $scope.select = function (tp, key) {
                // console.log("tp", tp, 'key', $scope.cation[key]);
                //class判定
                if (key == $scope.grid[tp]) {
                    key = 'all';
                    for (var k in $scope.market) {
                        $scope.market[k].isshow = true;
                        //$scope.myservice[k].isshow = true;
                    }
                } else {
                    for (var k in $scope.market) {
                        if (key == k) {
                            $scope.market[k].isshow = true;
                            //$scope.myservice[k].isshow = true;
                        } else {
                            $scope.market[k].isshow = false;
                            //$scope.myservice[k].isshow = false;
                        }
                    }
                }
                $scope.grid[tp] = key;
                // filter(tp, key);
            };
            //服务提供者筛选
            $scope.selectsc = function (tp, key) {
                for (var i = 0; i < $scope.cation.length; i++) {
                    $scope.market[i].showTab = true;
                    //$scope.myservice[i].showTab = true;
                    $scope.isComplete = {providerDisplayName: $scope.providers[key]};
                    //把渲染数组做二次筛选;
                    var arr = $filter("myfilter")($scope.market[i].item, $scope.isComplete);
                    if (arr.length == 0) {
                        $scope.market[i].showTab = false
                    }
                    //var arr1 = $filter("myfilter")($scope.myservice[i].item, $scope.isComplete);
                    //if (arr1.length == 0) {
                    //    //$scope.myservice[i].showTab = false
                    //}

                }
                // console.log($scope.isComplete);
                if (key == $scope.grid[tp]) {
                    key = 'all';
                    $scope.isComplete = '';

                    for (var k in $scope.market) {
                        $scope.market[k].showTab = true;
                        //$scope.myservice[k].showTab = true;
                    }
                    //for (var d = 0; d < $scope.cation.length; d++) {
                        //var arr1 = $filter("myfilter")($scope.myservice[d].item, $scope.isComplete);
                        //if (arr1.length == 0) {
                            //$scope.myservice[d].showTab = false
                        //}
                    //}
                }
                $scope.grid[tp] = key;
                // console.log("$scope.itemsDevop", $scope.itemsDevop)
            }
            //服务分类搜索
            $scope.search = function () {
                $scope.isComplete = {name: $scope.grid.txt};
                for (var s = 0; s < $scope.market.length; s++) {
                    $scope.market[s].showTab = true;
                }
                var sarr = [];
                if ($scope.grid.txt) {
                    for (var s = 0; s < $scope.market.length; s++) {
                        sarr = $filter("myfilter")($scope.market[s].item, $scope.isComplete);
                        if (sarr.length === 0) {
                            $scope.market[s].showTab = false;
                        }
                    }
                } else {
                    for (var s = 0; s < $scope.market.length; s++) {
                        sarr = $filter("myfilter")($scope.market[s].item, $scope.isComplete)
                        $scope.market[s].showTab = true;
                    }
                }
            };
            //服务分类键盘搜索
            $scope.keysearch = function (event) {
                if (event.keyCode === 13) {
                    for (var s = 0; s < $scope.market.length; s++) {
                        $scope.market[s].showTab = true;
                    }
                    $scope.isComplete = {name: $scope.grid.txt};
                    var sarr = [];
                    if ($scope.grid.txt) {
                        for (var s = 0; s < $scope.market.length; s++) {
                            sarr = $filter("myfilter")($scope.market[s].item, $scope.isComplete);
                            // console.log(sarr.length)
                            if (sarr.length === 0) {
                                $scope.market[s].showTab = false;
                            }
                        }
                    } else {
                        for (var s = 0; s < $scope.market.length; s++) {
                            sarr = $filter("myfilter")($scope.market[s].item, $scope.isComplete);
                            $scope.market[s].showTab = true;
                        }
                    }
                }
            }
            $scope.apply_instance = function(name){
                if(!$rootScope.user){
                    $state.go('login',{type : 'bkservice',name : name});
                }else{
                    $state.go('console.apply_instance',{name:name});
                }
            }
        }]);