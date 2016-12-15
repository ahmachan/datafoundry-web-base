'use strict';

angular.module('console.user', ['kubernetesUI',
    {
        files: [
            'views/user/user.css',
            'components/datepick/datepick.js',
            'components/timeline/timeline.js',
            'components/checkbox/checkbox.js'

        ]
    }
]).controller('userCtrl', ['$log','Project','orders','amounts', 'market', 'createOrg', '$rootScope', '$state', '$stateParams', 'Cookie', 'Toast', '$scope', 'ModalPwd', 'Addmodal', 'profile', 'pwdModify', '$http', 'Confirm', 'leave', 'orgList', 'Alert',
    function ($log,Project,orders,amounts, market, createOrg, $rootScope, $state, $stateParams, Cookie, Toast, $scope, ModalPwd, Addmodal, profile, pwdModify, $http, Confirm, leave, orgList, Alert) {
        $scope.credentials = {};
        $scope.grid = {
            st: null,
            et: null,
            hpay: true,
            coupon: false,
            page:1,
            size:10
        }
        $scope.$watch('grid.page', function(newVal, oldVal){
            if (newVal != oldVal) {
                refresh(newVal);
            }
        });
        function clientTimeZone() {
            var munites = new Date().getTimezoneOffset();
            var hour = parseInt(munites / 60);
            var munite = munites % 60;
            var prefix = "-";
            if (hour < 0 || munite < 0) {
                prefix = "+";
                hour = -hour;
                if (munite < 0) {
                    munite = -munite;
                }
            }
            hour = hour + "";
            munite = munite + "";
            if (hour.length == 1) {
                hour = "0" + hour;
            }
            if (munite.length == 1) {
                munite = "0" + munite;
            }
            return prefix + hour + munite;
        }

        $scope.clientTimeZone = clientTimeZone()
        //console.log("timezone=" + clientTimeZone());
        var refresh = function(page) {
            var skip = (page - 1) * $scope.grid.size;
            $scope.myamounts = $scope.amountdata.slice(skip, skip + $scope.grid.size);
            $(document.body).animate({
                scrollTop:0
            },200);

        };
        //console.log($stateParams);
        if ($stateParams.index) {
            $scope.check = $stateParams.index
        }
        $scope.orgName = "seferfe";

        market.get({region:$rootScope.region}, function (data) {
            //console.log('套餐详情', data);
        })

        //load project
        var loadProject = function () {
            //$http.get('/oapi/v1/projects', {}).success(function (data) {
            //    console.log('test project', data);
            //})
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
        }

        loadProject()
        //创建组织
        $scope.addOrg = function () {
            Addmodal.open('创建组织', '组织名称', '', $stateParams.useorg, 'org').then(function (res) {
                //createOrg.create({name:res},function (data) {
                //  console.log(data);
                //  if(data) {
                //    $scope.orgList.push(data);
                //    loadOrg();
                //    $rootScope.orgStatus = true;
                //  }
                //})
                //({useorg:org.id})
                //loadOrg();
                loadProject();
                //$state.go('console.org', {useorg:res.id})
                //console.log('zuzhi',res);

            })
        }

        $scope.updatePwd = function () {
            ModalPwd.open().then(function (password) {
                //console.log(password);
                Toast.open('更改密码成功');
                setTimeout(function () {
                    Cookie.clear('namespace');
                    $rootScope.resetpwd = true;
                    //Cookie.clear('region');
                    //Cookie.clear('df_access_token');
                    $rootScope.user = null;
                    //$rootScope.region = '';
                    $rootScope.namespace = "";
                    $state.go('login');
                }, 2000)
                //pwdModify.change({new_password: password.pwd, old_password: password.oldpwd}, function (data) {
                //    Toast.open('更改密码成功');
                //    setTimeout(function () {
                //        Cookie.clear('namespace');
                //        $rootScope.resetpwd = true;
                //        //Cookie.clear('region');
                //        //Cookie.clear('df_access_token');
                //        $rootScope.user = null;
                //        //$rootScope.region = '';
                //        $rootScope.namespace = "";
                //        $state.go('login');
                //    }, 2000)
                //})
            })

        };

        $scope.updateToken = function () {
            Addmodal.open('更新私有token', '私有token', '信息错误').then(function (res) {
            })
        }

        var a;

        var keep = function () {
            a = setTimeout($scope.showpop, 1000);
        }

        $scope.showpop = function () {
            keep();
            document.getElementById("pop").style.display = "block";
            clearTimeout(a);
        }
        $scope.hidepop = function () {
            document.getElementById("pop").style.display = "none";
        }
        $scope.showbig = function () {
            keep();
            document.getElementById("pop").style.display = "block";
            clearTimeout(a);
        }
        var loadInfo = function () {
            profile.get({}, function (data) {
                $scope.curUserInfo = data;
            })
        }

        //var loadOrg = function () {
        //    //list entire orgs
        //    orgList.get({}, function (data) {
        //        $scope.orgList = data.orgnazitions;
        //        if ($scope.orgList) {
        //            for (var i = 0; i < $scope.orgList.length; i++) {
        //                for (var j = 0; j < $scope.orgList[i].members.length; j++) {
        //                    if ($scope.orgList[i].members[j].member_name == $rootScope.user.metadata.name) {
        //                        $scope.orgList[i].privileged = $scope.orgList[i].members[j].privileged;
        //                    }
        //                }
        //            }
        //            if (!data.orgnazitions) {
        //                $scope.orgList = [];
        //            }
        //            for (var i = 0; i < $scope.orgList.length; i++) {
        //                for (var j = 0; j < $scope.orgList[i].members.length; j++) {
        //                    if ($scope.orgList[i].members[j].member_name == $rootScope.user.metadata.name) {
        //                        $scope.orgList[i].privileged = $scope.orgList[i].members[j].privileged;
        //                    }
        //                }
        //            }
        //        }
        //        //console.log('list entire orgs', data);
        //    })
        //}

        $scope.leaveOrg = function (idx, orgid, oname, privilegeds) {
           // var privilegednum = 0;
            loadProject();
            //for (var i = 0; i < $scope.orgList[idx].members.length; i++) {
            //    if ($scope.orgList[idx].members[i].privileged) {
            //        privilegednum++;
            //    }
            //}
            //console.log('privilegeds', privilegeds);
            //console.log('privilegednum', privilegednum);
            //console.log('$rootScope.user.metadata.name', $rootScope.user.metadata.name);
            //if ((privilegeds && privilegednum > 1) || !privilegeds) {
            //    Confirm.open("离开组织", "您确定要离开" + oname + "吗？", "", "").then(function () {
            //        leave.left({org: orgid}, function () {
            //            loadProject();
            //            //console.log('test leave', res);
            //            //$scope.orgList.splice(idx, 1)
            //            //$rootScope.orgStatus = true;
            //            //$rootScope.delOrgs = true;
            //            //loadOrg();
            //        })
            //    })
            //}
            //if (privilegeds && privilegednum == 1) {
            //    Confirm.open("离开组织", "不能离开！", "您是最后一名管理员请先指定其他管理员，才能离开", "", true).then(function () {
            //    })
            //}
        }
        //orders.get({}, function (orders) {
        //    console.log(orders);
        //})

        amounts.get({size:500,page:1,namespace:$rootScope.namespace,status:'O',region:$rootScope.region}, function (data) {
            console.log(data);
            if (data.amounts) {
                data.amounts.reverse()
                angular.forEach(data.amounts, function (amount,i) {
                    data.amounts[i].creation_time = amount.creation_time.replace(/Z/,$scope.clientTimeZone)
                    if (amount.description === "recharge") {
                        data.amounts[i].description='充值'
                    }else {
                        data.amounts[i].description='扣费'
                    }
                })

                $scope.myamounts = data.amounts||[];
                //console.log('creation_time',data.amounts[0].creation_time);
                $scope.amountdata =angular.copy(data.amounts)
                $scope.grid.total = data.amounts.length;
                refresh(1);
            }


        })
        $scope.sendemail = function (item) {
            $http.post('/lapi/send_verify_email', {}).success(function () {
                //alert('激活邮件已发送!')
                Toast.open('激活邮件发送成功！');
                //console.log('test send email', item);
            })
        }

        loadInfo();
        //loadOrg();
    }])

