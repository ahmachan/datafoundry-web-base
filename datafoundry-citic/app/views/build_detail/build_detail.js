'use strict';

angular.module('console.build.detail', [
        {
            files: [
                'components/checkbox/checkbox.js',
                'views/build_detail/build_detail.css'
            ]
        }
    ])
    .controller('BuildDetailCtrl', ['ImageStreamTag','deleteSecret', 'Ws', 'Sort', 'GLOBAL', '$rootScope', '$scope', '$log', '$state', '$stateParams', '$location', 'BuildConfig', 'Build', 'Confirm', 'UUID', 'WebhookLab', 'WebhookHub', 'WebhookLabDel', 'WebhookHubDel', 'ImageStream', 'WebhookLabget', 'WebhookGitget'
        , function (ImageStreamTag,deleteSecret, Ws, Sort, GLOBAL, $rootScope, $scope, $log, $state, $stateParams, $location, BuildConfig, Build, Confirm, UUID, WebhookLab, WebhookHub, WebhookLabDel, WebhookHubDel, ImageStream, WebhookLabget, WebhookGitget) {
            $scope.grid = {};

            //console.log('路由',$state);
            //$scope.grid.checked = false;

            $scope.bcName = $stateParams.name;

            $scope.$on('image-enable', function (e, enable) {
                $scope.imageEnable = enable;
            });

            var loadBuildConfig = function () {
                BuildConfig.get({namespace: $rootScope.namespace, name: $stateParams.name,region:$rootScope.region}, function (data) {
                    $log.info('data', data);
                    //$log.info('labsecrect is',data.spec.source.sourceSecret.name);
                    $scope.data = data;
                    var host = $scope.data.spec.source.git.uri;
                    if (data.spec.source.git.uri.split(':')[0] == 'ssh') {
                        var host = data.spec.source.git.uri.replace('git@', '').replace('.git', '');

                        //console.log(host.split('/'));

                        var parser = document.createElement('a');

                        parser.href = host;

                        parser.protocol = 'http:';

                        var post = parser.host.split(':')[0];
                        parser.host = post;
                        //console.log(parser.href);
                        //console.log(parser.hostname);
                        //console.log(parser.pathname);
                        data.spec.source.git.uri = 'https://' + parser.hostname + parser.pathname
                    }

                    //var parser = document.createElement('a');
                    //
                    //parser.href = host;
                    //
                    //console.log(parser.protocol); // => "http:"
                    //console.log(parser.hostname); // => "example.com"
                    //console.log(parser.port);     // => "3000"
                    //console.log(parser.pathname); // => "/pathname/"
                    //console.log(parser.hash);     // => "#hash"
                    //console.log(parser.host);     // => "example.com:3000"
                    //$log.info("printhost%%%%", host);

                    if (data.spec && data.spec.completionDeadlineSeconds) {
                        $scope.grid.completionDeadlineMinutes = parseInt(data.spec.completionDeadlineSeconds / 60);
                    }
                    if (data.spec.triggers.length) {
                        //$scope.grid.checked = 'start';
                        //$scope.grid.checkedLocal = true;
                    }
                    checkWebStatus();

                }, function (res) {
                    //错误处理
                });
            };

            loadBuildConfig();
            //开始构建
            $scope.startBuild = function () {
                var name = $scope.data.metadata.name;
                var buildRequest = {
                    metadata: {
                        name: name
                    }
                };
                BuildConfig.instantiate.create({
                    namespace: $rootScope.namespace,
                    name: name,
                    region:$rootScope.region
                }, buildRequest, function (res) {
                    $log.info("build instantiate success", res);
                    $scope.active = 1;  //打开记录标签
                    $scope.$broadcast('timeline', 'add', res);
                    createWebhook();
                    //deleteWebhook();
                }, function (res) {
                    //todo 错误处理
                });
            };

            $scope.deletes = function () {
                var name = $scope.data.metadata.name;
                Confirm.open("删除构建", "您确定要删除构建吗？", "删除构建将删除构建的所有历史数据以及相关的镜像，且该操作不能恢复", 'recycle').then(function () {
                    BuildConfig.remove({namespace: $rootScope.namespace, name: name,region:$rootScope.region}, {}, function () {
                        $log.info("remove buildConfig success");

                        deleteSecret.delete({
                            namespace: $rootScope.namespace,
                            name: "custom-git-builder-" + $rootScope.user.metadata.name + '-' + name,
                            region:$rootScope.region
                        }), {}, function (res) {

                        }
                        removeIs($scope.data.metadata.name);
                        removeBuilds($scope.data.metadata.name);
                        var host = $scope.data.spec.source.git.uri;
                        if (!$scope.grid.checked) {
                            if (getSourceHost(host) === 'github.com') {
                                WebhookHubDel.del({
                                    namespace: $rootScope.namespace,
                                    build: $stateParams.name,
                                    user: $scope.data.metadata.annotations.user,
                                    repo: $scope.data.metadata.annotations.repo
                                }, function (item1) {

                                })
                            } else {
                                WebhookLabDel.del({
                                    host: 'https://code.dataos.io',
                                    namespace: $rootScope.namespace,
                                    build: $stateParams.name,
                                    repo: $scope.data.metadata.annotations.repo
                                }, function (data2) {

                                });
                            }
                        }
                        $state.go("console.build");
                    }, function (res) {
                        //todo 错误处理
                    });
                });
            };

            var removeBuilds = function (bcName) {
                if (!bcName) {
                    return;
                }
                Build.remove({namespace: $rootScope.namespace, labelSelector: 'buildconfig=' + bcName}, function () {
                    $log.info("remove builds of " + bcName + " success");
                }, function (res) {
                    $log.info("remove builds of " + bcName + " error");
                });
            };

            var removeIs = function (name) {
                ImageStream.delete({namespace: $rootScope.namespace, name: name,region:$rootScope.region}, {}, function (res) {
                    //console.log("yes removeIs");
                }, function (res) {
                    //console.log("err removeIs");
                })
            }

            $scope.$watch('grid.checked', function (newVal, oldVal) {
                if (newVal == "start") {
                    return;
                }
                if ($scope.selection) {
                    $scope.selection = false;
                    return;
                }
                if (newVal != oldVal) {
                    $scope.saveTrigger();
                }
            });

            $scope.saveTrigger = function () {
                var name = $scope.data.metadata.name;
                //if ($scope.grid.checked) {
                //    $scope.data.spec.triggers = [
                //        {
                //            type: 'GitHub',
                //            github: {
                //                secret: UUID.guid().replace(/-/g, "")
                //            }
                //        }
                //    ];
                //} else {
                //    $scope.data.spec.triggers = [];
                //}
                //$scope.data.region=$rootScope.region;
                BuildConfig.put({namespace: $rootScope.namespace, name: name,region:$rootScope.region}, $scope.data, function (res) {
                    $log.info("put success", res);
                    $scope.data = res;
                    $scope.deadlineMinutesEnable = false;
                    $scope.grid.checkedLocal = $scope.grid.checked;
                    deleteWebhook();
                    createWebhook();

                }, function (res) {
                    //todo 错误处理
                    $log.info("put failed");
                });
            };

            $scope.save = function () {
                if (!$scope.deadlineMinutesEnable) {
                    $scope.deadlineMinutesEnable = true;
                    return;
                }
                var name = $scope.data.metadata.name;
                $scope.data.spec.completionDeadlineSeconds = $scope.grid.completionDeadlineMinutes * 60;
                //$scope.data.region=$rootScope.region;
                BuildConfig.put({namespace: $rootScope.namespace, name: name,region:$rootScope.region}, $scope.data, function (res) {
                    $log.info("put success", res);
                    $scope.data = res;
                    $scope.deadlineMinutesEnable = false;
                }, function (res) {
                    //todo 错误处理
                    $log.info("put failed");
                });
            };

            var getSourceHost = function (href) {
                var l = document.createElement("a");
                l.href = href;
                return l.hostname;
            };

            var getConfig = function (triggers, type) {
                //console.log(triggers)
                var str = ''
                if (type == 'github'&&triggers[0].github) {
                    str = GLOBAL.host_webhooks + '/namespaces/' + $rootScope.namespace + '/buildconfigs/' + $scope.data.metadata.name + '/webhooks/' + triggers[0].github.secret + '/github'
                    return str;
                }else if(type == 'gitlab'&&triggers[1].generic){
                    str = GLOBAL.host_webhooks + '/namespaces/' + $rootScope.namespace + '/buildconfigs/' + $scope.data.metadata.name + '/webhooks/' + triggers[1].generic.secret + '/generic'
                    return str;
                }


                //var str = "";
                //for (var k in triggers) {
                //    if (triggers[k].type == 'GitHub') {
                //        str = GLOBAL.host_webhooks + '/namespaces/' + $rootScope.namespace + '/buildconfigs/' + $scope.data.metadata.name + '/webhooks/' + triggers[k].github.secret + '/github'
                //        return str;
                //    }
                //}
            };

            var checkWebStatus = function () {
                var host = $scope.data.spec.source.git.uri;
                if (getSourceHost(host) === 'github.com') {
                    WebhookGitget.get({namespace: $rootScope.namespace, build: $stateParams.name}, function (res) {
                        //console.log('666',res);
                        if (res.code == 1200) {
                            $scope.grid.checked = true;
                        }

                    }, function (res) {
                        //console.log('666',res);
                        if (res.data.code == 1404) {
                            $scope.grid.checked = false;
                        }
                    })
                } else {
                    WebhookLabget.get({namespace: $rootScope.namespace, build: $stateParams.name}, function (res) {

                        if (res.code == 1200) {
                            $scope.grid.checked = true;
                        }


                    }, function (res) {

                        if (res.data.code == 1404) {
                            $scope.grid.checked = false;
                        }
                    });
                }
                $scope.selection = true
            }

            var createWebhook = function () {
                var host = $scope.data.spec.source.git.uri;
                var triggers = $scope.data.spec.triggers;
                //console.log('triggers', triggers);


                if ($scope.grid.checked) {
                    var config = getConfig(triggers, 'github');
                    if (getSourceHost(host) === 'github.com') {
                        //$log.info("user is", $scope.data.metadata.annotations.user);
                        WebhookHub.check({
                            host: 'https://github.com',
                            namespace: $rootScope.namespace,
                            build: $stateParams.name,
                            user: $scope.data.metadata.annotations.user,
                            repo: $scope.data.metadata.annotations.repo,
                            spec: {"active":true,events: ['push', 'pull_request', 'status'], config: {url: config}}
                        }, function (item) {
                        });
                    } else {
                        var config = getConfig(triggers, 'gitlab');
                        WebhookLab.check({
                            host: 'https://code.dataos.io',
                            namespace: $rootScope.namespace,
                            build: $stateParams.name,
                            repo: $scope.data.metadata.annotations.repo,
                            spec: {url: config}
                        }, function (data) {
                            //console.log("test repo", $scope.data.metadata.annotations.repo)
                        });
                    }
                }
            };

            var deleteWebhook = function () {
                var host = $scope.data.spec.source.git.uri;
                if (!$scope.grid.checked) {
                    if (getSourceHost(host) === 'github.com') {
                        WebhookHubDel.del({
                            namespace: $rootScope.namespace,
                            build: $stateParams.name,
                            user: $scope.data.metadata.annotations.user,
                            repo: $scope.data.metadata.annotations.repo
                        }, function (item1) {

                        })
                    } else {
                        WebhookLabDel.del({
                            host: 'https://code.dataos.io',
                            namespace: $rootScope.namespace,
                            build: $stateParams.name,
                            repo: $scope.data.metadata.annotations.repo
                        }, function (data2) {

                        });
                    }
                }
            }

            $scope.isshow = true;
            $scope.gitStore = {};

//获取build记录
            var loadBuildHistory = function (name) {
                //console.log('name',name)
                Build.get({namespace: $rootScope.namespace, labelSelector: 'buildconfig=' + name,region:$rootScope.region}, function (data) {
                    //console.log("history", data);
                    data.items = Sort.sort(data.items, -1); //排序
                    $scope.databuild = data;
                    //console.log($scope.databuild);
                    if ($stateParams.from == "create/new") {
                        $scope.databuild.items[0].showLog = true;
                    }
                    //console.log($scope.databuild);
                    //fillHistory(data.items);

                    //emit(imageEnable(data.items));
                    $scope.resourceVersion = data.metadata.resourceVersion;
                    watchBuilds(data.metadata.resourceVersion);
                }, function (res) {
                    //todo 错误处理
                });
            };

            var loglast = function () {
                setTimeout(function () {
                    $('#sa').scrollTop(1000000)
                }, 200)
            }

            var fillHistory = function (items) {
                var tags = [];
                for (var i = 0; i < items.length; i++) {
                    if (!items[i].spec.output || !items[i].spec.output.to || !items[i].spec.output.to.name) {
                        continue;
                    }
                    if (tags.indexOf(items[i].spec.output.to.name) != -1) {
                        continue;
                    }
                    tags.push(items[i].spec.output.to.name);
                }
                angular.forEach(items, function (item) {
                    loadImageStreamTag(item);
                });
            };

            var loadImageStreamTag = function (item) {
                ImageStreamTag.get({namespace: $rootScope.namespace, name: item.spec.output.to.name,region:$rootScope.region}, function (data) {
                    item.bsi = data;
                    if (data.image.dockerImageMetadata.Config.Labels) {
                        $scope.gitStore[item.spec.output.to.name] = {
                            id: data.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.id'],
                            ref: data.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.ref']
                        }
                    }


                }, function (res) {
                    //todo 错误处理
                });
            };

            var emit = function (enable) {
                $scope.$emit('image-enable', enable);
            };

            var imageEnable = function (items) {
                if (!items || items.length == 0) {
                    return false;
                }
                for (var i = 0; i < items.length; i++) {
                    if (items[i].status.phase == 'Complete') {
                        return true;
                    }
                }
                return false;
            };

            var watchBuilds = function (resourceVersion) {
                Ws.watch({
                    resourceVersion: resourceVersion,
                    namespace: $rootScope.namespace,
                    type: 'builds',
                    name: ''
                }, function (res) {
                    var data = JSON.parse(res.data);
                    updateBuilds(data);
                }, function () {
                    $log.info("webSocket start");
                }, function () {
                    $log.info("webSocket stop");
                    var key = Ws.key($rootScope.namespace, 'builds', '');
                    //console.log(key, $rootScope);
                    if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                        return;
                    }
                    watchBuilds($scope.resourceVersion);
                });
            };

            var updateBuilds = function (data) {
                //console.log('ws状态', data);
                if (data.type == 'ERROR') {
                    $log.info("err", data.object.message);
                    Ws.clear();
                    //TODO直接刷新bc会导致页面重新渲染
                    loadBuildHistory($state.params.name);
                    return;
                }

                $scope.resourceVersion = data.object.metadata.resourceVersion;

                if (data.type == 'ADDED') {
                    data.object.showLog = true;
                    $scope.databuild.items.unshift(data.object);

                } else if (data.type == "MODIFIED") {
                    // 这种方式非常不好,尽快修改
                    angular.forEach($scope.databuild.items, function (item, i) {
                        if (item.metadata.name == data.object.metadata.name) {
                            data.object.showLog = $scope.databuild.items[i].showLog;
                            if (data.object.status.phase == 'Complete') {
                                emit(true);
                            }
                            Build.log.get({
                                namespace: $rootScope.namespace,
                                name: data.object.metadata.name,
                                region:$rootScope.region
                            }, function (res) {
                                var result = "";
                                for (var k in res) {
                                    if (/^\d+$/.test(k)) {
                                        result += res[k];
                                    }
                                }
                                data.object.buildLog = result;
                                $scope.databuild.items[i] = data.object;
                                loglast()

                            }, function () {
                                $scope.databuild.items[i] = data.object;
                            });
                        }
                    });
                }
            };

            loadBuildHistory($state.params.name);

//如果是新创建的打开第一个日志,并监控
            if ($stateParams.from == "create") {
                $scope.$watch("databuild", function (newVal, oldVal) {
                    //console.log(newVal);

                    if (newVal != oldVal) {
                        if (newVal.items.length > 0) {

                            $scope.getLog(0);
                            $scope.databuild.items[0].object.showLog = true;
                        }
                    }
                });
            }

            $scope.getLog = function (idx) {
                var o = $scope.databuild.items[idx];
                o.showLog = !o.showLog;

                if (o.status.phase == "Pending") {
                    return;
                }
                //存储已经调取过的log
                if (o.buildLog) {
                    loglast()
                    return;
                }
                Build.log.get({namespace: $rootScope.namespace, name: o.metadata.name,region:$rootScope.region}, function (res) {
                    var result = "";
                    for (var k in res) {
                        if (/^\d+$/.test(k)) {
                            result += res[k];
                        }
                    }
                    o.buildLog = result;
                    loglast()
                }, function (res) {
                    //console.log("res", res);
                    o.buildLog = res.data.message;
                });
            };

//$scope.pull = function(idx){
//    // console.log(idx)
//    // console.log(idx,$scope.data.status.tags[idx].tag)
//    var name = $scope.name + ':' + $scope.date.status.tags[idx].tag;
//    // var name = $scope.data.items[idx].spec.output.to.name;
//    console.log('name',name);
//    ModalPullImage.open(name, true).then(function (res) {
//        console.log("cmd", res);
//    });
//};

            $scope.delete = function (idx) {
                var title = "删除构建";
                var msg = "您确定要删除构建吗？";
                var tip = "删除构建将清除构建的所有历史数据以及相关的镜像，该操作不能被恢复";

                var name = $scope.databuild.items[idx].metadata.name;
                if (!name) {
                    return;
                }
                Confirm.open(title, msg, tip, 'recycle').then(function () {
                    Build.remove({namespace: $rootScope.namespace, name: name}, function () {
                        $log.info("deleted");
                        for (var i = 0; i < $scope.databuild.items.length; i++) {
                            if (name == $scope.databuild.items[i].metadata.name) {
                                $scope.databuild.items.splice(i, 1)
                            }
                        }

                        $scope.$watch('databuild', function (n, o) {
                            //console.log(n.items.length);
                            if (n.items.length == '0') {
                                $rootScope.testq = 'finsh'
                            }
                        })
                        // if (idx == '0') {
                        //   $rootScope.testq.type = 'delete';
                        //   $rootScope.testq.git = $scope.data.items[0].spec.revision.git.commit;
                        // }
                    }, function (res) {
                        //todo 错误处理
                        $log.info("err", res);
                    });
                });
            }

            $scope.stop = function (idx) {
                var o = $scope.databuild.items[idx];
                o.status.cancelled = true;
                //o.region=$rootScope.region
                Confirm.open("终止构建", "您确定要终止本次构建吗？", "", "stop").then(function () {
                    Build.put({namespace: $rootScope.namespace, name: o.metadata.name,region:$rootScope.region}, o, function (res) {
                        $log.info("stop build success");
                        $scope.databuild.items[idx] = res;
                    }, function (res) {
                        if (res.data.code == 409) {
                            Confirm.open("提示信息", "初始化中不能终止，请稍后再试", null, 144, true);
                        }
                    });
                });
            };

            $scope.$on('$destroy', function () {
                Ws.clear();
            });

        }])
;

