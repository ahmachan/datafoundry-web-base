'use strict';
angular.module('console.backing_service_detail', [
      {
        files: [
          'views/backing_service_detail/backing_service_detail.css'
        ]
      }
    ])
    .controller('BackingServiceInstanceCtrl', ['delorders','orders','$log', '$scope', '$rootScope', '$stateParams', 'BackingService', 'BackingServiceInstance', 'ServiceSelect', 'Confirm', 'BackingServiceInstanceBd', '$state', 'Toast', 'Ws'
          , function (delorders,orders,$log, $scope, $rootScope, $stateParams, BackingService, BackingServiceInstance, ServiceSelect, Confirm, BackingServiceInstanceBd, $state, Toast, Ws) {
      $scope.grid={}
      var cuename = $stateParams.name;

      console.log('$stateParams', $stateParams)

      $scope.grid.active = $stateParams.index;

      var loadBs = function () {
        BackingService.get({namespace: 'openshift', name: cuename,region:$rootScope.region}, function (data) {
          $log.info('价格', data);

          if (data.metadata.annotations) {
            $scope.ltype = data.metadata.annotations.Class
                      }

          if (data.status&&data.status.phase === "Inactive") {
            data.bianhui = true;
          }else {
            data.biancheng = true;
          }
          $scope.data = data;
          var plans = data.spec.plans;
          //$log.info("plan display", plans);
          for (var i = 0; i < plans.length; i++) {
            if (plans[i].name == $stateParams.plan) {
              $scope.grid.checked = i;
              break;
            }
          }
        })
      };


      $scope.$watch('grid.active', function (newVal, oldVal) {
        if (newVal != oldVal && newVal == 2) {
          $scope.grid.update = false;
        }
      });

      $scope.update = function (idx) {
        var item = $scope.bsi.items[idx];
        $scope.grid.update = true;
        $scope.grid.active = 1;

        //$state.go('console.backing_service_detail', {name: item.spec.provisioning.backingservice_name, plan: item.spec.provisioning.backingservice_plan_name});
      };

      $scope.jump = function (idx) {
        var item = $scope.bsi.items[idx];
        $scope.grid.active = 1;

        var plans = $scope.data.spec.plans;
        $scope.data.spec.plans.free = true;
        //console.log("%%%%%%", $scope.data.spec);
        for (var i = 0; i < plans.length; i++) {
          if (plans[i].name == item.spec.provisioning.backingservice_plan_name) {
            $scope.grid.checked = i;
            break;
          }
        }

        //$state.go('console.backing_service_detail', {name: item.spec.provisioning.backingservice_name, plan: item.spec.provisioning.backingservice_plan_name});
      };

      loadBs();

      var filterBsi = function (bsi) {
        var items = [];
        for (var i = 0; i < bsi.items.length; i++) {
          if (bsi.items[i].spec.provisioning.backingservice_name == $stateParams.name) {
            items.push(bsi.items[i]);
          }
        }
        bsi.items = items;
        return bsi;
      };

      var loadBsi = function () {
        BackingServiceInstance.get({namespace: $rootScope.namespace,region:$rootScope.region}, function (res) {
          $log.info("backingServiceInstance", res);
          $scope.bsi = filterBsi(res);
          $scope.resourceVersion = res.metadata.resourceVersion;
          watchBsi($scope.resourceVersion);
        }, function (res) {
          //todo 错误处理
          $log.info("loadBsi err", res);
        });
      };

      loadBsi();

      $scope.delBsi = function (idx) {
        //console.log('del$scope.bsi.items[idx]', $scope.bsi.items[idx].spec.binding);
        if ($scope.bsi.items[idx].spec.binding) {
          var curlength = $scope.bsi.items[idx].spec.binding.length;
          if (curlength > 0) {
            Confirm.open('删除后端服务实例', '该实例已绑定服务，不能删除', '', 'recycle', true)
          } else {
            Confirm.open('删除后端服务实例', '您确定要删除该实例吗？此操作不可恢复', '', 'recycle', false).then(function () {
              orders.query({region:$rootScope.region,resource_name:$scope.bsi.items[idx].metadata.name}, function (data) {
                //console.log('data',data);
                if (data.length>0&&data[0].order.id) {
                  delorders.delete({id:data[0].order.id,
                    action:"cancel",
                    namespace:$rootScope.namespace
                  }, function (data) {
                    //$state.go('console.resource_management', {index: 1})
                    //$scope.myservice[id].item.splice(idx, 1);
                    Toast.open('删除成功');
                  })
                }else {
                  BackingServiceInstance.del({
                    namespace: $rootScope.namespace,
                    name: $scope.bsi.items[idx].metadata.name,
                    region:$rootScope.region
                  }, function (res) {
                    $scope.bsi.items.splice(idx, 1);

                  }, function (res) {
                    $log.info('err', res);
                  })
                }
              })
              //BackingServiceInstance.del({
              //  namespace: $rootScope.namespace,
              //  name: $scope.bsi.items[idx].metadata.name,
              //  region:$rootScope.region
              //}, function (res) {
              //  $scope.bsi.items.splice(idx, 1);
              //
              //}, function (res) {
              //  $log.info('err', res);
              //})
            });
          }
        } else {
          Confirm.open('删除后端服务实例', '您确定要删除该实例吗？此操作不可恢复', '', 'recycle', false).then(function () {
            BackingServiceInstance.del({
              namespace: $rootScope.namespace,
              name: $scope.bsi.items[idx].metadata.name,
              region:$rootScope.region
            }, function (res) {
              $scope.bsi.items.splice(idx, 1);
            }, function (res) {
              $log.info('err', res);
            })
          });
        }
      };

      var watchBsi = function (resourceVersion) {
        Ws.watch({
          resourceVersion: resourceVersion,
          namespace: $rootScope.namespace,
          type: 'backingserviceinstances',
          name: ''
        }, function (res) {
          var data = JSON.parse(res.data);
          updateBsi(data);
        }, function () {
          $log.info("webSocket start");
        }, function () {
          $log.info("webSocket stop");
          var key = Ws.key($rootScope.namespace, 'backingserviceinstances', '');
          if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
            return;
          }
          watchBsi($scope.resourceVersion);
        });
      };

      var updateBsi = function (data) {
        $log.info("watch bsi", data);

        if (data.type == 'ERROR') {
          $log.info("err", data.object.message);
          Ws.clear();
          loadBsi();
          return;
        }
        $scope.resourceVersion = data.object.metadata.resourceVersion;

        if (data.type == 'ADDED') {
          data.object.showLog = true;
          if ($scope.bsi.items.length > 0) {
            $scope.bsi.items.unshift(data.object);
          } else {
            $scope.bsi.items = [data.object];
          }
        } else if (data.type == "MODIFIED") {
          angular.forEach($scope.bsi.items, function (item, i) {
            if (item.metadata.name == data.object.metadata.name) {
              data.object.show = item.show;
              $scope.bsi.items[i] = data.object;
              $scope.$apply();
            }
          });
        }
      };

      $scope.delBing = function (idx) {
        var name = $scope.bsi.items[idx].metadata.name;
        var bindings = [];
        var binds = $scope.bsi.items[idx].spec.binding || [];
        for (var i = 0; i < binds.length; i++) {
          if (binds[i].checked) {
            bindings.push(binds[i]);
          }
        }
        if (bindings.length == 0) {
          Toast.open('请先选择要解除绑定的服务');
          return;
        }

        angular.forEach(bindings, function (binding) {
          var bindObj = {
            metadata: {
              name: name,
              annotations : {
                "dadafoundry.io/create-by" : $rootScope.user.metadata.name
              }
            },
            resourceName: binding.bind_deploymentconfig,
            bindResourceVersion: '',
            bindKind: 'DeploymentConfig'
          };
          BackingServiceInstanceBd.put({namespace: $rootScope.namespace, name: name,region:$rootScope.region}, bindObj, function (res) {

          }, function (res) {
            //todo 错误处理
            // Toast.open('操作失败');
            if (res.data.message.split(':')[1]) {
              Toast.open(res.data.message.split(':')[1].split(';')[0]);
            }else {
              Toast.open(res.data.message);
            }
            $log.info("del bindings err", res);
          });
        });
      };
        //orders.query({region:$rootScope.region,resource_name:$scope.bsi.items[idx].metadata.name}, function (data) {
        //  //console.log('data',data);
        //  if (data.length>0&&data[0].order.id) {
        //    delorders.delete({id:data[0].order.id,
        //      action:"cancel",
        //      namespace:$rootScope.namespace
        //    }, function (data) {
        //      //$state.go('console.resource_management', {index: 1})
        //      //$scope.myservice[id].item.splice(idx, 1);
        //      Toast.open('删除成功');
        //    })
        //  }else {
        //    BackingServiceInstance.del({
        //      namespace: $rootScope.namespace,
        //      name: $scope.bsi.items[idx].metadata.name,
        //      region:$rootScope.region
        //    }, function (res) {
        //      $scope.bsi.items.splice(idx, 1);
        //
        //    }, function (res) {
        //      $log.info('err', res);
        //    })
        //  }
        //})
      var bindService = function (name, dcs) {
        //console.log('dcs', dcs)
        var bindObj = {
          metadata: {
            name: name,
            annotations : {
              "dadafoundry.io/create-by" : $rootScope.user.metadata.name
            }
          },
          resourceName: '',
          bindResourceVersion: '',
          bindKind: 'DeploymentConfig'
        };
        for (var i = 0; i < dcs.length; i++) {
          bindObj.resourceName = dcs[i].metadata.name;
          BackingServiceInstanceBd.create({namespace: $rootScope.namespace, name: name,region:$rootScope.region}, bindObj, function (res) {

          }, function (res) {
            //todo 错误处理
            // Toast.open('操作失败');
            if (res.data.message.split(':')[1]) {
              Toast.open(res.data.message.split(':')[1].split(';')[0]);
            }else {
              Toast.open(res.data.message);
            }
            $log.info("bind services err", res);
          });
        }
      };

      $scope.bindModal = function (idx) {
        var bindings = $scope.bsi.items[idx].spec.binding || [];
        ServiceSelect.open(bindings).then(function (res) {
          $log.info("selected service", res);
          if (res.length > 0) {
            bindService($scope.bsi.items[idx].metadata.name, res);
          }
        });
      };
    }]);