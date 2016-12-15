/**
 * Created by sorcerer on 16/10/8.
 */
angular.module('console.plan', [
        {
            files: [
                'views/plan/plan.css'
            ]
        }
    ])
    .controller('planCtrl', ['balance','amounts', 'by', 'checkout', '$state', 'Tip', '$scope', '$rootScope', 'account', 'Tip', 'market',
        function (balance,amounts, by, checkout, $state, Tip, $scope, $rootScope, account, Tip, market) {
            //console.log('$rootScope.projects', $rootScope.projects);

            balance.get({namespace:$rootScope.namespace,region:$rootScope.region}, function (data) {
                $scope.balance = data
                //console.log('balance', data);
            });
            account.get({namespace:$rootScope.namespace,region:$rootScope.region,status:"consuming"}, function (mydata) {
                //console.log(mydata);
                //mydata.purchased=false;
                //if (mydata.purchased) {
                //    $('.plan_block_main').css("left","200px");
                //}else{
                //    $('.plan_block_main').css("left","0");
                //}
                angular.forEach(mydata.subscriptions, function (data,i) {
                    if (data.type === "resources") {
                      $scope.subscriptions = data;
                    }

                })
                market.get({region:$rootScope.region,type:'resources'}, function (data) {
                    //console.log(data);
                    $scope.plans = [];
                    angular.forEach(data.plans, function (plan, i) {
                        if (plan.region_id === $rootScope.region) {
                            $scope.plans.push(plan);
                        }
                    })
                    $scope.plans = $scope.plans.sort(by.open("price"));
                    angular.forEach($scope.plans, function (myplan, j) {
                        //if (mydata.subscriptions[0].plan_id === myplan.plan_id) {
                        //    //price
                        //}
                        //myplan.description=myplan.description.replace('CPU Core','')
                        //myplan.description2=myplan.description.replace('GB RAM','')

                        if (mydata.subscriptions && $scope.subscriptions.price === myplan.price) {
                            myplan.canbuy = 'check';
                        } else if (!mydata.subscriptions || $scope.subscriptions.price < myplan.price) {
                            myplan.canbuy = 'big';
                        } else {
                            myplan.canbuy = 'small';
                        }
                        myplan.hour = parseInt((myplan.price / 30 / 24) * 100) / 100;
                    });


                })

            })

            //Tip.open('注册账号', '激活邮件发送成功!', '', true).then(function () {
            //    $state.go('home.index');
            //})
            //amounts.get({namespace:$rootScope.namespace}, function (data) {
            //    console.log(data);
            //})
            var canbuy = true
            $scope.buy = function (plan) {
                if (canbuy) {
                    canbuy = false
                    if (plan.canbuy === 'big') {
                        checkout.create({
                            drytry:1,
                            plan_id: plan.plan_id,
                            namespace: $rootScope.namespace,
                            region:$rootScope.region

                        }, function (data) {
                            console.log('data',data);
                            canbuy = true
                            Tip.open('提示', '将从余额中扣取元！', false, true,false,data.money).then(function () {
                                checkout.create({
                                    drytry:0,
                                    plan_id: plan.plan_id,
                                    namespace: $rootScope.namespace,
                                    region:$rootScope.region
                                }, function (data) {
                                    //console.log(data);
                                    Tip.open('提示', '购买成功！', false, true, true).then(function () {
                                        $state.go('console.dashboard')
                                    })

                                }, function (err) {

                                    if (err.data.code === 3316) {
                                        Tip.open('提示', '账户可用余额不足', '充值', true).then(function () {
                                            $state.go('console.pay');
                                        })
                                    } else {
                                        Tip.open('提示', '暂不支持更换套餐', '知道了', true).then(function () {

                                        })
                                    }

                                })
                            })

                        }, function (err) {
                            console.log('data',err);
                        })



                    } else if (plan.canbuy === 'small') {
                        Tip.open('更换失败', '暂不支持更换低套餐', false, true)

                    }
                }

            }

        }]);
