'use strict';
angular.module('console.constantly_detail', [
        {
            files: [

            ]
        }
    ])
    .controller('constDetailCtrl', ['delorders','orders','Confirm','delvolume','volume','DeploymentConfig','persistent','$stateParams','$state', '$http', '$scope', '$rootScope',
        function(delorders,orders,Confirm,delvolume,volume,DeploymentConfig,persistent,$stateParams,$state, $http, $scope, $rootScope){
            //console.log($stateParams.name);
            $scope.name=$stateParams.name
            persistent.get({namespace: $rootScope.namespace,name:$stateParams.name,region:$rootScope.region}, function (res) {
                //console.log('chijiu',res);
                res.arr=[];
                DeploymentConfig.get({namespace: $rootScope.namespace,region:$rootScope.region}, function (dcres) {
                    angular.forEach(dcres.items, function (dcitem,i) {
                        angular.forEach(dcitem.spec.template.spec.volumes, function (item,i) {
                            if (item.persistentVolumeClaim&&res.metadata.name == item.persistentVolumeClaim.claimName) {
                                res.arr.push(dcitem.metadata.name)
                            }
                        })
                    })
                    $scope.persistents=res;
                    //console.log('chijiu',res);
                })
            }, function (err) {

            })
            $scope.delete= function () {

                Confirm.open("删除持久化卷", "您确定要删除持久化卷吗？", "持久化卷中的数据将被删除", "stop").then(function(){

                    if ($scope.persistents.arr.length > 0) {
                        Confirm.open("删除持久化卷", "删除持久化卷失败", "持久化卷已经挂载在容器中，您需要先停止服务，卸载持久化卷后，才能删除。", null,true)

                    }else {
                        orders.query({region:$rootScope.region,resource_name:$stateParams.name}, function (data) {
                            console.log('data',data);
                            if (data.length>0&&data[0].order.id) {
                                delorders.delete({id:data[0].order.id,action:"cancel",namespace:$rootScope.namespace}, function (data) {
                                    $state.go('console.resource_management', {index: 1})
                                })

                            }else {
                                delvolume.del({namespace: $rootScope.namespace,name:$stateParams.name}, function (res) {
                                    //console.log(res);
                                    $state.go('console.resource_management', {index: 1})
                                }, function (err) {

                                })
                            }
                        })

                    }



                })


            }


        }]);