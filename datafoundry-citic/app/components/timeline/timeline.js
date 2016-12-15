'use strict';

angular.module("console.timeline", [])

    .directive('cTimeline', [function () {
        return {
            restrict: 'EA',
            replace: true,

            scope: {
                name: '=',
                type: '@'
            },
            controller: ['$location', 'ImageStream', '$http', 'platformone', 'platformlist', '$rootScope', '$scope', '$state', '$log', 'BuildConfig', 'Build', 'Confirm', '$stateParams', 'ImageStreamTag', 'Sort', 'ModalPullImage', 'Ws',
            function ($location, ImageStream, $http, platformone, platformlist, $rootScope, $scope, $state, $log, BuildConfig, Build, Confirm, $stateParams, ImageStreamTag, Sort, ModalPullImage, Ws) {
              if ($scope.name) {

                  var namecopy = $scope.name
                  var name = namecopy.split('/');
                }
              // console.log(name)
                // console.log('$scope.name',name.length);
              if (name.length == 2) {
                // console.log('2',$scope.name)
                $scope.isshow=false;
                $scope.data={
                  items:[]
                };
                // console.log('$scope.name',$scope.name);
                platformlist.query({id:$scope.name},function (data) {
                  data.reverse();
                  // console.log('data', data)
                  var arr = [];
                  for (var i = 0; i < data.length; i++) {
                    $scope.data.items.push({name:data[i]})
                    platformone.query({id:$scope.name,tag:data[i]}, function (datalis) {
                      console.log('datalis', datalis)
                      // $scope.data.items[0].list=datalis;/
                      arr.push(datalis);
                      if (arr.length == data.length) {
                        for (var i = 0; i < arr.length; i++) {
                          arr[i].mysort = arr[i].Created;
                          arr[i].mysort = (new Date(arr[i].mysort)).getTime()
                        }
                        arr.sort(function (x, y) {
                          return x.mysort > y.mysort ? -1 : 1;
                        });

                        // console.log(arr);
                        if (arr.length == 0) {
                          $rootScope.testq='finsh';
                        }
                        var namecopy = $scope.name;
                        console.log('namecopy', namecopy)
                        // namecopy=namecopy.split('/')[0];
                        // console.log('namecopy',namecopy)
                        for (var i = 0; i < arr.length; i++) {
                          $scope.data.items[i].list=arr[i];
                          $scope.data.items[i].bsi=namecopy+':'+$scope.data.items[i].name;
                        }
                        // console.log($scope.data.items[0].bsi);
                        // console.log('*&*&*&*&*&*&',$scope.data)
                        $rootScope.loading = false;
                      }
                    })
                    //$http.get('/registry/api/repositories/manifests',
                    //    {params: {repo_name: $scope.name,tag:data[i]}})
                    //    .success(function (datalis) {
                    //      console.log('datalis', datalis)
                    //      // $scope.data.items[0].list=datalis;/
                    //      arr.push(datalis)
                    //    }).then(function () {
                    //  if (arr.length == data.length) {
                    //    for (var i = 0; i < arr.length; i++) {
                    //      arr[i].mysort = arr[i].Created;
                    //      arr[i].mysort = (new Date(arr[i].mysort)).getTime()
                    //    }
                    //    arr.sort(function (x, y) {
                    //      return x.mysort > y.mysort ? -1 : 1;
                    //    });
                    //
                    //    // console.log(arr);
                    //    if (arr.length == 0) {
                    //      $rootScope.testq='finsh';
                    //    }
                    //    var namecopy = $scope.name;
                    //    console.log('namecopy', namecopy)
                    //    // namecopy=namecopy.split('/')[0];
                    //    // console.log('namecopy',namecopy)
                    //    for (var i = 0; i < arr.length; i++) {
                    //      $scope.data.items[i].list=arr[i];
                    //      $scope.data.items[i].bsi=namecopy+':'+$scope.data.items[i].name;
                    //    }
                    //    // console.log($scope.data.items[0].bsi);
                    //    // console.log('*&*&*&*&*&*&',$scope.data)
                    //    $rootScope.loading = false;
                    //  }
                    //})
                  }
                  // if (data.length == arr.length) {
                  //
                  //   //console.log('*&*&*&*&*&*&',data)
                  // }
                })
                $scope.delete = function(idx){
                  var title = "删除构建";
                  var msg = "您确定要删除构建吗？";
                  var tip = "删除构建将清除构建的所有历史数据以及相关的镜像，该操作不能被恢复";
                  if ($scope.type == 'image') {
                    title = "删除镜像版本";
                    msg = "您确定要删除该镜像版本吗？";
                    tip = "";
                  }

                  var name = $scope.data.items[idx].name
                  if (!name) {
                    return;
                  }
                  Confirm.open(title, msg, tip, 'recycle').then(function(){
                    Build.remove({namespace: $rootScope.namespace, name: name}, function(){
                      // $log.info("deleted");
                      for (var i = 0; i < $scope.data.items.length; i++) {
                        if (name == $scope.data.items[i].metadata.name) {
                          $scope.data.items.splice(i, 1)
                        }
                      }
                    }, function(res){
                      //todo 错误处理
                      $log.info("err", res);
                    });
                  });
                };
                $scope.pull = function(name){

                  var s = $scope.name;
                  // var name = $scope.name;
                  var str = $scope.name+':'+s.split('/')[0]+'/'+name
                  ModalPullImage.open(str)
                      .then(function(res){
                        console.log("cmd1", res);
                      });
                };

              }else {
                var urlarr = $location.url().split('/');
                if (urlarr[3] && urlarr[4]) {
                  if (urlarr[3] == urlarr[4]) {
                    $scope.showimage = true
                  }
                } else {
                  $scope.showimage = false
                }
                ImageStream.get({namespace: $rootScope.namespace, name: $scope.name}, function (data) {
                  if (data.status.tags && data.status.tags[0].items) {
                    for (var i = 0; i < data.status.tags.length; i++) {
                      data.status.tags[i].mysort = data.status.tags[i].items[0].created;
                      data.status.tags[i].mysort = (new Date(data.status.tags[i].mysort)).getTime()
                    }
                    data.status.tags.sort(function (x, y) {
                      return x.mysort > y.mysort ? -1 : 1;
                    });
                    for (var i = 0; i < data.status.tags.length; i++) {
                      data.status.tags[i].bsi = $scope.name + ':' + data.status.tags[i].tag;
                    }
                    $scope.date = data;
                    console.log('$scope.date', $scope.date)
                  }
                  if (!data.status.tags) {
                    $rootScope.testq = 'finsh'
                  } else {
                    $rootScope.testq = 'hasver'
                  }
                })
                $scope.isshow=true;
                $scope.gitStore = {};

                $scope.$on('timeline', function(e, type, data){
                  $scope.data.items = $scope.data.items || [];
                  console.log("type", type, "data", data);
                  if (type == 'add') {
                    data.showLog = true;
                    $scope.data.items.unshift(data);
                  }
                });

                //获取build记录
                var loadBuildHistory = function (name) {
                  // console.log('name',name)
                  Build.get({namespace: $rootScope.namespace, labelSelector: 'buildconfig=' + name}, function(data){
                    console.log("history", data);
                    data.items = Sort.sort(data.items, -1); //排序
                    $scope.data = data;

                    fillHistory(data.items);

                    emit(imageEnable(data.items));
                    // if (data.items.length == '0') {
                    //   $rootScope.testq='finsh'
                    // }else {
                    //   $rootScope.testq='hasver'
                    // }
                
                    $scope.resourceVersion = data.metadata.resourceVersion;
                    watchBuilds(data.metadata.resourceVersion);
                  }, function(res){
                    //todo 错误处理
                  });
                };

                var loglast= function () {
                  setTimeout(function () {
                    $('#sa').scrollTop(1000000)
                  },200)
                }

                var fillHistory = function(items){
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
                  angular.forEach(items, function(item){
                    loadImageStreamTag(item);
                  });
                };

                var loadImageStreamTag = function(item){
                  ImageStreamTag.get({namespace: $rootScope.namespace, name: item.spec.output.to.name,region:$rootScope.region}, function(data){
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

                var emit = function(enable){
                  $scope.$emit('image-enable', enable);
                };

                var imageEnable = function(items){
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

                var watchBuilds = function(resourceVersion) {
                  Ws.watch({
                    resourceVersion: resourceVersion,
                    namespace: $rootScope.namespace,
                    type: 'builds',
                    name: ''
                  }, function(res){
                    var data = JSON.parse(res.data);
                    updateBuilds(data);
                  }, function(){
                    $log.info("webSocket start");
                  }, function(){
                    $log.info("webSocket stop");
                    var key = Ws.key($rootScope.namespace, 'builds', '');
                    if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                      return;
                    }
                    watchBuilds($scope.resourceVersion);
                  });
                };

                var updateBuilds = function (data) {
                  if (data.type == 'ERROR') {
                    $log.info("err", data.object.message);
                    Ws.clear();
                    //TODO直接刷新bc会导致页面重新渲染
                     loadBuildHistory($scope.name);
                    return;
                  }

                  $scope.resourceVersion = data.object.metadata.resourceVersion;

                  if (data.type == 'ADDED') {

                  } else if (data.type == "MODIFIED") {
                    //todo  这种方式非常不好,尽快修改
                    angular.forEach($scope.data.items, function(item, i){
                      if (item.metadata.name == data.object.metadata.name) {
                        data.object.showLog = $scope.data.items[i].showLog;
                        if (data.object.status.phase == 'Complete') {
                          emit(true);
                        }
                        Build.log.get({namespace: $rootScope.namespace, name: data.object.metadata.name}, function(res){
                          var result = "";
                          for(var k in res){
                            if (/^\d+$/.test(k)) {
                              result += res[k];
                            }
                          }
                          data.object.buildLog = result;
                          $scope.data.items[i] = data.object;
                          loglast()
                          
                        }, function(){
                          $scope.data.items[i] = data.object;
                        });
                      }
                    });
                  }
                };

                loadBuildHistory($scope.name);

                //如果是新创建的打开第一个日志,并监控
                if ($stateParams.from == "create") {
                  $scope.$watch("data", function(newVal, oldVal){
                    if (newVal != oldVal) {
                      if (newVal.items.length > 0) {
                        $scope.getLog(0);
                      }
                    }
                  });
                }

                $scope.getLog = function(idx){
                  var o = $scope.data.items[idx];
                  o.showLog = !o.showLog;

                  if (o.status.phase == "Pending") {
                    return;
                  }
                  //存储已经调取过的log
                  if (o.buildLog) {
                    loglast()
                    return;
                  }
                  Build.log.get({namespace: $rootScope.namespace, name: o.metadata.name}, function(res){
                    var result = "";
                    for(var k in res){
                      if (/^\d+$/.test(k)) {
                        result += res[k];
                      }
                    }
                    o.buildLog = result;
                    loglast()
                  }, function(res){
                    console.log("res", res);
                    o.buildLog = res.data.message;
                  });
                };

                $scope.pull = function(idx){
                  // console.log(idx)
                  // console.log(idx,$scope.data.status.tags[idx].tag)
                  var name = $scope.name + ':' + $scope.date.status.tags[idx].tag;
                  // var name = $scope.data.items[idx].spec.output.to.name;
                  console.log('name',name);
                  ModalPullImage.open(name, true).then(function (res) {
                    console.log("cmd", res);
                  });
                };

                $scope.delete = function(idx){
                  var title = "删除构建";
                  var msg = "您确定要删除构建吗？";
                  var tip = "删除构建将清除构建的所有历史数据以及相关的镜像，该操作不能被恢复";
                  if ($scope.type == 'image') {
                    title = "删除镜像版本";
                    msg = "您确定要删除该镜像版本吗？";
                    tip = "";
                  }
                  if ($scope.data.items[idx]) {
                    var name = $scope.data.items[idx].metadata.name;
                    if (!name) {
                      return;
                    }
                    Confirm.open(title, msg, tip, 'recycle').then(function () {
                      Build.remove({namespace: $rootScope.namespace, name: name}, function () {
                        $log.info("deleted");
                        for (var i = 0; i < $scope.data.items.length; i++) {
                          if (name == $scope.data.items[i].metadata.name) {
                            $scope.data.items.splice(i, 1)
                          }
                        }

                        $scope.$watch('data', function (n, o) {
                          console.log(n.items.length);
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
                  } else {
                    Confirm.open(title, msg, tip, 'recycle').then(function () {
                      console.log($scope.date)
                      var name = $scope.date.status.tags[idx].tag
                      // alert(name)master
                      if (!name) {
                        return;
                      }
                      ImageStreamTag.delete({
                        namespace: $rootScope.namespace,
                        name: $scope.name + ':' + name,region:$rootScope.region
                      }, function (data) {
                        for (var i = 0; i < $scope.date.status.tags.length; i++) {
                          if (name == $scope.date.status.tags[i].tag) {
                            $scope.date.status.tags.splice(i, 1)
                          }
                        }
                        $scope.$watch('date.status', function (n, o) {
                          console.log(n.tags.length);
                          if (n.tags.length == '0') {
                            $rootScope.testq = 'finsh'
                          }
                        })
                      })

                    })
                  }

                };

                $scope.stop = function(idx){
                  var o = $scope.data.items[idx];
                  o.status.cancelled = true;
                  Confirm.open("终止构建", "您确定要终止本次构建吗？", "", "stop").then(function(){
                    Build.put({namespace: $rootScope.namespace, name: o.metadata.name}, o, function(res){
                      $log.info("stop build success");
                      $scope.data.items[idx] = res;
                    }, function(res){
                      if(res.data.code== 409){
                        Confirm.open("提示信息","初始化中不能终止，请稍后再试",null,144,true);
                      }
                    });
                  });
                };

                $scope.$on('$destroy', function(){
                  Ws.clear();
                });
              }

              // if ($scope.name.length&&$scope.name.indexof('/') != -1) {
              //   console.log("$scope.name1", $scope.name);
              // }else {
              //   console.log("$scope.name2", $scope.name);
              // }

            }],
            templateUrl: 'components/timeline/timeline.html'
        }
    }]);



