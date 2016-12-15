'use strict';

angular.module('console.user', [
    'kubernetesUI',
    {
        files: [
            'views/org/org.css',
            'components/datepick/datepick.js',
            'components/timeline/timeline.js',
            'components/checkbox/checkbox.js'

        ]
    }
]).controller('orgCtrl', ['delperpleOrg', 'orgList', '$log', 'Project', '$http', '$rootScope', '$state', '$cacheFactory', 'loadOrg', 'Addmodal', 'Confirm', '$scope', '$stateParams', 'invitation', 'leave', 'Toast',
    function (delperpleOrg, orgList, $log, Project, $http, $rootScope, $state, $cacheFactory, loadOrg, Addmodal, Confirm, $scope, $stateParams, invitation, leave, Toast) {
        $scope.grid = {
            st: null,
            et: null
        }
        //$rootScope.delOrgs = false;
        var loadOrg = function () {
            //console.log('test org name',$stateParams.useorg,$rootScope.namespace)
            orgList.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (data) {
                //console.log(data);
                //$scope.rootmembers = [];
                //$scope.norootmembers = [];
                $scope.orgcan=data
                angular.forEach(data.items, function (item, i) {

                    if (item.roleRef.name === 'admin') {
                        $scope.roottime =item.metadata;
                        $scope.rootmembers=item.subjects
                    }else if(item.roleRef.name === "edit"){
                        $scope.noroottime =item.metadata;
                        $scope.norootmembers=item.subjects
                    }
                })
                angular.forEach($scope.rootmembers, function (item,i) {
                    angular.forEach($scope.roottime.annotations, function (root,k) {
                        if (item.name === k.split('/')[1]) {
                            $scope.rootmembers[i].jointime=root;
                        }
                    })

                })
                angular.forEach($scope.rootmembers, function (item,i) {
                    if (!item.jointime) {
                        $scope.rootmembers[i].jointime=$scope.roottime.creationTimestamp;
                    }

                })
                angular.forEach($scope.norootmembers, function (item, i) {
                    angular.forEach($scope.noroottime.annotations, function (root, k) {
                        if (item.name === k.split('/')[1]) {
                            $scope.norootmembers[i].jointime = root;
                        }
                    })

                })
                angular.forEach($scope.norootmembers, function (item,i) {
                    if (!item.jointime) {
                        $scope.norootmembers[i].jointime=$scope.noroottime.creationTimestamp;
                    }

                })

                console.log($scope.rootmembers, $scope.norootmembers);

            })
            //$http({
            //  url:'/lapi/orgs/'+$stateParams.useorg,
            //  method:'GET'
            //}).success(function(data,header,config,status,orgid){
            //  if (data.id) {
            //    //console.log('load org data',data);
            //    $scope.members=data.members;
            //    $scope.orgcon = data;
            //    $scope.rootmembers=[];
            //    $scope.norootmembers=[];
            //    angular.forEach(data.members,function (item) {
            //      //item.jioned
            //      if (item.status == "joined") {
            //        if (item.privileged) {
            //          $scope.rootmembers.push(item);
            //        }else {
            //          $scope.norootmembers.push(item);
            //        }
            //      }
            //
            //    })
            //  }
            //}).error(function(data,header,config,status){
            //});
        }

        //load project
        var loadProject = function () {
            Project.get({region: $rootScope.region}, function (data) {
                //$rootScope.projects = data.items;
                //console.log('Project', Project);
                //var newprojects = [];
                angular.forEach(data.items, function (item, i) {
                    //console.log($rootScope.user.metadata.name);
                    if (item.metadata.name === $rootScope.user.metadata.name) {
                        //console.log($rootScope.user.metadata.name);
                        data.items.splice(i, 1);
                    } else {
                        data.items[i].sortname = item.metadata.annotations['openshift.io/display-name'] || item.metadata.name;
                    }

                })
                data.items.sort(function (x, y) {
                    return x.sortname > y.sortname ? 1 : -1;
                });
                angular.forEach(data.items, function (project, i) {
                    if (project.metadata.name === $rootScope.namespace) {
                        $scope.myorgname =project.metadata.annotations['openshift.io/display-name']||project.metadata.name;
                    }
                    if (/^[\u4e00-\u9fa5]/i.test(project.metadata.annotations['openshift.io/display-name'])) {
                        //console.log(project.metadata.annotations['openshift.io/display-name']);
                        //data.items.push(project);
                        data.items.unshift(project);

                        data.items.splice(i + 1, 1);
                    }
                });

                $rootScope.projects = data.items;
                //console.log(data.items);


                //$log.info("load project success", data);
            }, function (res) {
                $log.info("find project err", res);
            });
            //$http.get('/oapi/v1/projects', {
            //}).success(function(data){
            //  console.log('test project', data);
            //})
        }
        loadProject();
        $scope.deletezz = function () {
            if ($scope.rootmembers.length == 1 && $scope.norootmembers.length == 0) {
                Confirm.open("删除组织", "您确定要删除组织吗？", "此操作不可撤销", "stop").then(function () {
                    $http.delete('/lapi/orgs/' + $stateParams.useorg, {}).success(function (item) {
                        //console.log('the org has been deelted', item);
                        $rootScope.delOrgs = true;
                        //$rootScope.isorg = false;
                        loadProject();
                        $rootScope.namespace = $rootScope.user.metadata.name;
                        $state.go('console.user', {index: 4});
                        //console.user()
                    })
                })
            } else {
                Confirm.open("离开组织", "删除组织失败", "组织内还有其他成员，您需要先移除其他成员", null, true)
            }
        }

        $scope.addpeople = function () {
            Addmodal.open('邀请新成员', '用户名', '', $stateParams.useorg, 'people').then(function (res) {
                //console.log('test org member', res);
                Toast.open('邀请消息发送成功!');
                //alert('11111')
                //$http.put('/lapi/orgs/'+$stateParams.useorg+'/invite', {
                //  member_name: res,
                //  privileged: false
                //}).success(function(item){
                //  console.log('test invitation', item)
                //  if(item.privileged){
                //    $scope.rootmembers.push(item)
                //  }else{
                //    $scope.norootmembers.push(item)
                //  }
                //   loadOrg();
                //  console.log('adding new memeber',item)
                //})
            })
        }
        $scope.remove = function (idx) {
            Confirm.open("移除", "您确定要删除：" + $scope.rootmembers[idx].name + "吗？", null, "").then(function () {
                //console.log('test root members before remove',$scope.rootmembers )
                delperpleOrg.put({namespace: $rootScope.namespace, region: $rootScope.region}, {
                    member_name: $scope.rootmembers[idx].member_name
                }, function (data) {
                    Toast.open('删除成功');
                    loadOrg();
                }, function (err) {

                })
                //$http.put('/lapi/orgs/'+$stateParams.useorg+'/remove',{
                //  member_name:$scope.rootmembers[idx].member_name
                //}).success(function(data){
                //  Toast.open('删除成功')
                //  //console.log('test rootmember who has been removed', $scope.rootmembers[idx].member_name);
                //  loadOrg();
                //})
            })
        }

        $scope.removenotroot = function (idx) {
            Confirm.open("移除", "您确定要删除：" + $scope.norootmembers[idx].name + "吗？", null, "").then(function () {
                delperpleOrg.put({namespace: $rootScope.namespace, region: $rootScope.region}, {
                    member_name: $scope.norootmembers[idx].name
                }, function (data) {
                    Toast.open('删除成功');
                    loadOrg();
                }, function (err) {

                })
                //console.log('test noroot member before remove', $scope.norootmembers)
                //$http.put('/lapi/orgs/' + $stateParams.useorg + '/remove', {
                //    member_name: $scope.norootmembers[idx].member_name
                //}).success(function () {
                //    Toast.open('删除成功')
                //    //console.log('test noroot who has been removed', $scope.norootmembers[idx].member_name)
                //    loadOrg();
                //})
            })
        }

        $scope.leave = function (res) {
            //for(var i = 0; i < $scope.rootmembers.length; i++){
            //console.log('test how many rootmember',$scope.rootmembers.length )

            if ($scope.rootmembers.length == 1 && $scope.norootmembers == 0) {
                Confirm.open("离开组织", "不能离开！", "您是最后一名管理员请先指定其他管理员，才能离开。", "", true).then(function () {
                    //console.log('the last rootmember', $scope.rootmembers)
                })
            } else {
                //loadOrg(data);
                Confirm.open("离开组织", "您确定要离开 " + $scope.orgcon.name + " 吗？", null, "").then(function () {
                    leave.left({org: $stateParams.useorg}, function () {
                        $rootScope.orgStatus = true;
                        $rootScope.delOrgs = true;
                        $state.go('console.dashboard');
                    })
                })
            }
        }

        $scope.changetomember = function (idx) {
            if ($scope.rootmembers.length == 1) {
                Toast.open('最后一名管理员无法被降权')
            } else {
                $http.put('/lapi/orgs/' + $stateParams.useorg + '/privileged', {
                    member_name: $scope.rootmembers[idx].member_name,
                    privileged: false
                }).success(function (data) {
                    //console.log('test api changetomember', data);
                    $scope.rootmembers[idx].privileged = false;
                    var b = $scope.rootmembers[idx];
                    $scope.rootmembers.splice(idx, 1);
                    //console.log('test changetomemeber', $scope.rootmembers, idx);
                    $scope.norootmembers.push(b);

                }).error(function (err) {
                    //Toast.open(err.message)
                })
            }

        }

        $scope.changetoadmin = function (idx) {
            $http.put('/lapi/orgs/' + $stateParams.useorg + '/privileged', {
                member_name: $scope.norootmembers[idx].member_name,
                privileged: true
            }).success(function (data) {
                //console.log('test member', data);
                //  start from inx and delete one item
                $scope.norootmembers[idx].privileged = true;
                var a = $scope.norootmembers[idx];
                $scope.norootmembers.splice(idx, 1);
                //console.log('test api changetoadmin',$scope.norootmembers, idx);
                $scope.rootmembers.push(a);
            })
        }
        loadOrg();
    }])

