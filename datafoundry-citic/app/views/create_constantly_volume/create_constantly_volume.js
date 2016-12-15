'use strict';
angular.module('console.create_constantly_volume', [
    {
        files: []
    }
]).controller('createconvolumeCtrl', ['Tip','checkout','market','Toast','$state', '$rootScope', 'volume', '$scope',
    function (Tip,checkout,market,Toast,$state, $rootScope, volume, $scope) {
        $scope.slider = {
            value: 0,
            options: {
                floor: 0,
                ceil: 200,
                step: 10,
                showSelectionBar: true,
                showTicksValues:50,
                translate: function(value, sliderId, label) {
                    switch (label) {

                        default:
                            return  value + 'GB'
                    }
                }
            }
        };

        $scope.danwei = 'GB';
        $scope.grid = {
            inved: false,
            num: false,
            dianji: false
        }
        $scope.err= {
            blank:false,
            valid:false
        }
        $scope.volume = {
            name: '',
            size: '',
            metadata: {
                annotations: {
                    'dadafoundry.io/create-by': $rootScope.namespace
                }
            }
        }
        //type=persistent_volume
        market.get({region:$rootScope.region,type:'volume'}, function (data) {
            console.log(data.plans);
            $scope.plans = data.plans
        })
        $scope.$watch('slider.value', function (n, o) {
            if (n == o) {
                return
            }
            if (n && n >0) {
                $scope.grid.num=false

            }
        })
        $scope.$watch('volume.name', function (n, o) {
            if (n == o) {
                return
            }
            if (n && n!=="") {
                $scope.err.blank = false;
                $scope.err.valid = false;

            }
        })

        $scope.creat = function () {
            var r =/^[a-z][a-z0-9-]{2,28}[a-z0-9]$/;

            if ($scope.volume.name==='') {
                //alert(1)
                $scope.err.blank = true;
                return
            } else if (!r.test($scope.volume.name)) {
                //alert(2)
                $scope.err.valid = true;
                return
            }

            if ($scope.slider.value === 0) {
                $scope.grid.num=true;
                return
            }
            $scope.volume.size=$scope.slider.value

            angular.forEach($scope.plans, function (plan,i) {
                console.log($scope.slider.value,plan.plan_level*10);
                if ($scope.slider.value === plan.plan_level*10) {
                    $scope.plan_id = plan.plan_id;
                }
            })

            $scope.loaded = true;
            console.log($scope.plan_id);
            checkout.create({
                drytry:0,
                plan_id: $scope.plan_id,
                namespace: $rootScope.namespace,
                region:$rootScope.region,
                parameters:{
                    resource_name:$scope.volume.name
                }
            }, function (data) {
                //console.log(data);
                //volume.create({namespace: $rootScope.namespace}, $scope.volume, function (res) {
                //    //alert(11111)
                //    $scope.loaded = false;
                $state.go('console.resource_management', {index: 1});
                //}, function (err) {
                //    $scope.loaded = false;
                //    Toast.open('构建失败,请重试');
                //})

            }, function (err) {
                $scope.loaded = false;
                if (err.data.code === 3316) {

                    Tip.open('提示', '账户可用余额不足。', '充值', true).then(function () {
                        $state.go('console.pay');
                    })
                } else {

                    Tip.open('提示', '支付失败,请重试', '知道了', true).then(function () {

                    })
                }

            })


        }
    }])