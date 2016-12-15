'use strict';
angular.module('console.backing_service', [
        {
            files: [
                'views/Integration/Integration.css',
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
    .controller('IntegrationCtrl', ['inservice', 'repositories', '$state', '$log', '$rootScope', '$scope', 'BackingService', 'BackingServiceInstance', 'ServiceSelect', 'BackingServiceInstanceBd', 'Confirm', 'Toast', 'Ws', '$filter',
        function (inservice, repositories, $state, $log, $rootScope, $scope, BackingService, BackingServiceInstance, ServiceSelect, BackingServiceInstanceBd, Confirm, Toast, Ws, $filter) {
            // 数组去重方法
            $scope.isrepoComplete = '';
            if ($state.params.index) {
                $scope.check = $state.params.index
            } else {
                $scope.check = false
            }

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

            var loaditc = function (insclass, inslabel) {

                inservice.query({class: insclass || "", provider: inslabel || ''}, function (insdata) {
                    console.log('instance', insdata);

                    $scope.insclass = [];//insclass
                    $scope.inslabel = [];//inslabel

                    $scope.ins = [];

                    angular.forEach(insdata, function (repo, i) {
                        if (repo.class) {
                            //insdata[i].class = repo.class.toUpperCase();
                        } else {
                            insdata[i].class = '其他';
                        }
                        if (repo.provider) {
                            //insdata[i].provider = repo.provider.toUpperCase();
                        } else {
                            insdata[i].provider = '其他';
                        }
                        $scope.insclass.push(insdata[i].class);
                        $scope.inslabel.push(insdata[i].provider);

                    })
                    $scope.insclass = $scope.insclass.unique();
                    $scope.inslabel = $scope.inslabel.unique();
                    angular.forEach($scope.insclass, function (insclass, i) {
                        $scope.ins.push({class: insclass, items: []});

                        angular.forEach(insdata, function (ins, k) {

                            if (insclass === ins.class) {
                                $scope.ins[i].items.push(ins);
                            }
                        })
                    })
                    $scope.inscopy = angular.copy($scope.ins);
                    console.log('$scope.ins', $scope.ins);
                })

            }
            loaditc()
            // 得到loadBs对象进行分组
            var loadBs = function () {
                repositories.query({}, function (repodata) {
                    console.log('repodata', repodata);
                    $scope.repoclass = [];//repoclass
                    $scope.repolabel = [];//repolabel
                    $scope.reposcopy = angular.copy(repodata);
                    $scope.repos = angular.copy(repodata);
                    //var repoarr = [];
                    //$log.info('newBs', $scope.repos);
                    angular.forEach(repodata, function (repo, i) {
                        if (repo.class) {
                            repodata[i].class = repo.class.toUpperCase();
                        } else {
                            repodata[i].class = '其他';
                        }
                        if (repo.label) {
                            repodata[i].label = repo.label.toUpperCase();
                        } else {
                            repodata[i].label = '其他';
                        }
                        $scope.repoclass.push(repodata[i].class)
                        $scope.repolabel.push(repodata[i].label)

                    })
                    //console.log($scope.repoclass, $scope.repolabel);
                    $scope.repoclass = $scope.repoclass.unique()
                    $scope.repolabel = $scope.repolabel.unique()

                    //angular.forEach($scope.repoclass, function (repoclass,i) {
                    //    repoarr.push({isshow:true,showTab:true,id:i, class:repoclass,item:[]});
                    //   angular.forEach(repodata.data.results, function (repo,j) {
                    //       if (repoclass === repo.class) {
                    //           repo.show=true
                    //           repoarr[i].item.push(repo);
                    //       }
                    //   })
                    //})
                    //$scope.reposcopy=angular.copy(repoarr);
                    //$scope.repos=repoarr;

                    //console.log('$scope.repos', $scope.repos);
                    //label分组

                    BackingService.get({namespace: 'openshift', region: $rootScope.region}, function (data) {
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
                            if (arr[l].spec.metadata&&!arr[l].spec.metadata.providerDisplayName) {
                                arr[l].spec.metadata.providerDisplayName = '其他'
                            }
                            if (arr[l].spec.metadata) {
                                $scope.providers.push(arr[l].spec.metadata.providerDisplayName)
                                $scope.cation.push(arr[l].metadata.annotations.Class)
                            }

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
                                if (arr[j].spec.metadata&&arr[j].spec.metadata.providerDisplayName === $scope.providers[b]) {
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
                        console.log('$scope.market', $scope.market);


                        //我的后端服务json


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
                })

            };
            loadBs();
            $scope.status = {};
            //页面双向绑定数据
            $scope.grid = {
                serviceCat: 'all',
                vendor: 'all',
                txt: '',
                classtxt: '',
                mytxt: ''
            };

            $scope.classgrid = {
                selectclass: 'all',
                selectsclabel: 'all',
            }

            $scope.insgrid = {
                selectclass: 'all',
                selectsclabel: 'all',
            }

            //tab切换分类过滤对象

            //数据分类筛选class classgrid
            $scope.$watch('classgrid', function (n, o) {
                if (n === o) {
                    return
                }

                //console.log(n);
                if (n.selectclass !== 'all' || n.selectsclabel !== 'all') {
                    //
                    //console.log($scope.repoclass[n.selectclass], $scope.repolabel[n.selectsclabel]);
                    //console.log(n.selectclass,n.selectsclabel);
                    var arr = []
                    var classr=$scope.repoclass[n.selectclass];
                    var labelr=$scope.repolabel[n.selectsclabel];

                    angular.forEach($scope.reposcopy, function (repo,i) {
                        if (classr&&labelr) {
                            if (classr === repo.class && labelr === repo.label) {
                                arr.push(repo);
                            }
                        }else if(classr){
                            if (classr === repo.class) {
                                arr.push(repo);
                            }
                        }else if(labelr){
                            if (labelr=== repo.label) {
                                arr.push(repo);
                            }
                        }
                        //console.log(arr);
                        $scope.repos=arr;
                    })
                    //repositories.get({
                    //    class: $scope.repoclass[n.selectclass],
                    //    label: $scope.repolabel[n.selectsclabel]
                    //}, function (repodata) {
                    //    $scope.repos = repodata.data.results;
                    //})
                } else {
                    $scope.repos=angular.copy($scope.reposcopy)
                    //repositories.get({class: '', label: ''}, function (repodata) {
                    //    $scope.repos = repodata.data.results;
                    //})
                }
                $scope.reposcopys = angular.copy($scope.repos);

            }, true)

            $scope.apply = function (id) {
                instance.create({id:id}, function (data) {
                    console.log('iddata', data);
                })
            }

            $scope.$watch('insgrid', function (n, o) {
                if (n === o) {
                    return
                }

                //console.log(n);
                if (n.selectclass !== 'all' || n.selectsclabel !== 'all') {
                    //
                    //console.log($scope.repoclass[n.selectclass], $scope.repolabel[n.selectsclabel]);
                    //console.log(n.selectclass,n.selectsclabel);
                    loaditc($scope.insclass[n.selectclass], $scope.inslabel[n.selectsclabel])
                    //repositories.get({
                    //    class: $scope.repoclass[n.selectclass],
                    //    label: $scope.repolabel[n.selectsclabel]
                    //}, function (repodata) {
                    //    $scope.repos = repodata.data.results;
                    //})
                } else {
                    loaditc()
                }


            }, true)

            $scope.selectclass = function (tp, key) {
                //console.log("tp", tp, 'key', key);
                //class判定
                if (key == $scope.classgrid[tp]) {
                    key = 'all';

                }
                $scope.classgrid[tp] = key;
            };

            //数据标签筛选label
            $scope.selectsclabel = function (tp, key) {

                if (key == $scope.classgrid[tp]) {
                    key = 'all';

                }
                $scope.classgrid[tp] = key;

            }

            //服务分类键盘搜索      $scope.isComplete = '';
            //服务分类筛选
            $scope.select = function (tp, key) {
                // console.log("tp", tp, 'key', $scope.cation[key]);
                //class判定
                if (key === $scope.insgrid[tp]) {
                    key = 'all';

                }

                $scope.insgrid[tp] = key;
                // filter(tp, key);
            };

            //服务提供者筛选
            $scope.selectsc = function (tp, key) {

                // console.log($scope.isComplete);
                if (key == $scope.insgrid[tp]) {
                    key = 'all';

                }
                $scope.insgrid[tp] = key;
                // console.log("$scope.itemsDevop", $scope.itemsDevop)
            }
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



            $scope.keysearch = function (event,search) {

                console.log(event,search);

                if (true) {
                    if ($scope.grid.txt) {
                        var iarr = []
                        //console.log($scope.ins);
                        var str = $scope.grid.txt;
                        str = str.toLocaleLowerCase();

                        angular.forEach($scope.inscopy, function (repo, i) {
                            iarr.push({class: repo.class, items: []});
                            angular.forEach(repo.items, function (item, k) {
                                var nstr = item.display_name;
                                console.log(repo);
                                nstr=nstr.toLocaleLowerCase();

                                if (nstr.indexOf(str) !== -1) {
                                    iarr[i].items.push(item);
                                }
                            })
                            //console.log(repo.instance_data, $scope.grid.txt);

                        })
                        $scope.ins = iarr;

                    } else {
                        //console.log('$scope.inscopy', $scope.inscopy);

                        $scope.ins = angular.copy($scope.inscopy)
                    }
                }
            }

            $scope.keyclasssearch = function (event) {

                if (true) {

                    if ($scope.grid.classtxt) {
                        //console.log($scope.repos);
                        var repoarr = [];
                        var str = $scope.grid.classtxt;
                        str = str.toLocaleLowerCase();

                        angular.forEach($scope.reposcopy, function (repo, i) {
                            //console.log(repo.repoName, $scope.grid.classtxt);
                            var nstr = repo.display_name;

                            nstr=nstr.toLocaleLowerCase();
                            if (nstr.indexOf(str) !== -1) {
                                repoarr.push(repo);
                            }
                        })
                        $scope.repos = repoarr;

                    } else {
                        $scope.repos = angular.copy($scope.reposcopys||$scope.reposcopy)
                    }
                }
            }
            //我的后端服务搜索

            //服务分类搜索


        }])
