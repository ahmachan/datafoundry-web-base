'use strict';

angular.module('home', [])
    .controller('HomeCtrl', ['Cookie','regions','account','$state', '$scope', '$rootScope', '$log', 'ModalLogin', 'ModalRegist', 'User',
        function (Cookie,regions,account,$state, $scope, $rootScope, $log, ModalLogin, ModalRegist, User) {
            regions.query({}, function (data) {
                console.log('regions', data);
                $scope.regions = data;
            })
            $log.info('Home');
            //footer底部返回顶部 20161202 jia
            $(".fl_detail").on("click",function(){
                $(document.body).animate({
                    scrollTop:0
                },200);
            })
            $scope.$watch('namespace', function (n, o) {
                //console.log('new1',n);
                if (n == '') {

                    clearInterval($rootScope.timer)
                }
            })
            //$scope.where = function (now) {
            //    //console.log(now)
            //    $scope.whereclick = now
            //}
            $scope.chooseregion = function (regionid) {
                console.log('regionid',regionid);
                $state.go('home.index_backing_service',{region:regionid})
            }
            if ($rootScope.resetpwd) {
                console.log('reset');
                //return
            }else {
                if ($rootScope.user) {
                    return $rootScope.user;
                }
                if ($rootScope.region) {
                    return $rootScope.region
                }else {
                    $rootScope.region = Cookie.get('region');
                }
                User.get({name: '~',region:$rootScope.region}, function (res) {
                    $rootScope.user = res;
                    $rootScope.resetpwd=false;
                });
            }

            //$scope.top = []
            //路由监听事件
            //console.log($state.current.name);

            switch ($state.current.name) {
                //case 'home.index':
                //    $rootScope.whereclick = '首页'
                //
                //    break;
                case 'home.recharge':
                    $rootScope.whereclick = '价格'

                    break;
                case 'home.introduce':
                    $rootScope.whereclick = '首页'

                    break;
                case 'home.application':
                    $rootScope.whereclick = '应用市场'

                    break;
                case 'home.index_backing_service':
                    $rootScope.whereclick = '服务市场'

                    break;
                default:
                    $rootScope.whereclick = '首页'

            }
            var images = new Array()

            function preload() {
                for (var i = 0; i < arguments.length; i++) {
                    images[i] = new Image()
                    images[i].src = arguments[i]
                }
            };
            $scope.consolein= function () {
                account.get({namespace:$rootScope.namespace,region:$rootScope.region,status:"consuming"}, function (data) {
                    //console.log('套餐', data);
                    //$rootScope.payment=data;
                    if (data.purchased) {
                        $state.go("console.dashboard")
                    }else{
                        $state.go("console.noplan")
                    }
                })
            }
            //console.log('$scope$scope$scope$scope',$scope)
            $rootScope.$on('$stateChangeStart',
                function (event, toState, toParams, fromState, fromParams) {
                    //console.log('toState',toState.name);
                    if (toState.name !== "home.index") {
                        $('html').css('overflow', 'auto');
                        $('.foot_main').css('display', 'block');

                        window.onmousewheel = document.onmousewheel = true;
                    } else {
                        $('html').css('overflow', 'hidden');
                        $('.foot_main').css('display', 'none');
                        scrollTo(0,0);
                        preload(
                            "views/home/introduce/img/DF-111.png",
                            "views/home/introduce/img/DF-15.png",
                            "views/home/introduce/img/DF-16.png",
                            "views/home/introduce/img/DF-17.png",
                            "views/home/introduce/img/DF-19.png",
                            "views/home/introduce/img/DF-20.png",
                            "views/home/introduce/img/DF-21.png",
                            "views/home/introduce/img/DF-22.png",
                            "views/home/introduce/img/DF-24.png",
                            "views/home/introduce/img/DF-25.png",
                            "views/home/introduce/img/DF-26.png",
                            "views/home/introduce/img/DF-33.png",
                            "views/home/introduce/img/DF-34.png",
                            "views/home/introduce/img/DF-35.png",
                            "views/home/introduce/img/DF-36.png",
                            "views/home/introduce/img/DF-37.png",
                            "views/home/introduce/img/DF-38.png",
                            "views/home/introduce/img/icon-26.png",
                            "views/home/introduce/img/icon-27.png",
                            "views/home/introduce/img/icon-28.png",
                            "views/home/introduce/img/icon-29.png",
                            "views/home/introduce/img/icon-30.png",
                            "views/home/introduce/img/icon-31.png",
                            "views/home/introduce/img/icon-32.png",
                            "views/home/introduce/img/images_10.png",
                            "views/home/introduce/img/images_16.png",
                            "views/home/introduce/img/images_39.png",
                            "views/home/introduce/img/images_41.png",
                            "views/home/introduce/img/images_43.png",
                            "views/home/introduce/img/images_45.png",
                            "views/home/introduce/img/images_49.png",
                            "views/home/introduce/img/images_67.png",
                            "app/components/header/img/back.png",
                            "app/components/header/img/back-hover.png"
                        );
                    }

                })
//            // stateChangeSuccess  当模板解析完成后触发
//            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
//                //console.log(event);
//                //console.log(toState);
//                //console.log(toParams);
//                //console.log(fromState);
//                //console.log(fromParams);
//            })
//
//            // $stateChangeError  当模板解析过程中发生错误时触发
//            $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
//                //console.log(event);
//                //console.log(toState);
//                //console.log(toParams);
//                //console.log(fromState);
//                //console.log(fromParams);
//            })
//
//            $scope.$watch('$viewContentLoading',function(event, viewConfig){
//                console.log('模板加载完成前');
//            });
//// 当视图加载完成，DOM渲染完成之后触发，视图所在的$scope发出该事件。
//            $scope.$watch('$viewContentLoaded',function(event){
//                console.log('模板加载完成后');
//            });
            $scope.login = function () {
                // ModalLogin.open();
                $state.go('login');
            };

            $scope.regist = function () {
                //ModalRegist.open();
                $state.go('regist');
            };

        }]);

