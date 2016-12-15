'use strict';

define([
    'angular',
    'uiRouter',
    'ocLazyLoad'
], function (angular) {

    return angular.module('myApp.router', ['ui.router', 'oc.lazyLoad'])
        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

            //$urlRouterProvider.otherwise("/home/index");
            $urlRouterProvider.otherwise("/console/dashboard");
            $stateProvider
                //home
                .state('home', {
                    url: '/home',
                    templateUrl: 'views/home/home.html',
                    controller: 'HomeCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/home.js')
                        }]
                    },
                    abstract: true
                })
                .state('home.recharge', {
                    url: '/recharge',
                    templateUrl: 'views/home/recharge/recharge.html',
                    controller: 'rechargeCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/recharge/recharge.js')
                        }]
                    }
                })
                .state('home.builder', {
                    url: '/builder',
                    templateUrl: 'views/home/builder/builder.html',
                    controller: 'builderCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/builder/builder.js')
                        }]
                    }
                })
                //.state('home.introduce', {
                //    url: '/introduce',
                //    templateUrl: 'views/home/introduce/introduce.html',
                //    controller: 'introduceCtrl',
                //    resolve: {
                //        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                //            return $ocLazyLoad.load('views/home/introduce/introduce.js')
                //        }]
                //    }
                //})
                .state('home.application', {
                    url: '/application',
                    templateUrl: 'views/home/application/application.html',
                    controller: 'applicationCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/application/application.js')
                        }]
                    }
                })
                .state('home.index_backing_service', {
                    url: '/index_backing_service/:region',
                    templateUrl: 'views/home/index_backing_service/index_backing_service.html',
                    controller: 'index_backing_serviceCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/index_backing_service/index_backing_service.js')
                        }]
                    }
                })
                .state('home.index_backing_Sdetail', {
                    url: '/index_backing_Sdetail/:name',

                    templateUrl: 'views/home/index_backing_Sdetail/index_backing_Sdetail.html',
                    controller: 'index_backing_SdetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/index_backing_Sdetail/index_backing_Sdetail.js')
                        }]
                    }
                })
                .state('home.application_image_detail', {
                    url: '/application_image_detail/:name',
                    templateUrl: 'views/home/application_image_detail/application_image_detail.html',
                    controller: 'application_image_detailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/application_image_detail/application_image_detail.js')
                        }]
                    }
                })
                .state('home.application_saas_detail', {
                    url: '/application_saas_detail/:id',
                    templateUrl: 'views/home/application_saas_detail/application_saas_detail.html',
                    controller: 'application_saas_detailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/application_saas_detail/application_saas_detail.js')
                        }]
                    }
                })
                .state('home.index', {
                    url: '/index',
                    templateUrl: 'views/home/introduce/introduce.html',
                    controller: 'introduceCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/introduce/introduce.js')
                        }]
                    }
                })

                .state('login', {
                    url: '/login/:type/:name',
                    templateUrl: 'views/login/login.html',
                    controller: 'loginCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/login/login.js')
                        }]
                    }
                })
                .state('regist', {
                    url: '/regist',
                    templateUrl: 'views/regist/regist.html',
                    controller: 'registCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/regist/regist.js')
                        }]
                    }
                })

                .state('console', {
                    url: '/console',
                    templateUrl: 'views/console/console.html',
                    controller: 'ConsoleCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/console/console.js')
                        }],
                        user: ['creatproject','regions', 'Cookie', '$rootScope', 'User', function (creatproject,regions, Cookie, $rootScope, User) {
                            if ($rootScope.user) {
                                return $rootScope.user;
                            }
                            //$rootScope.region=
                            var region = Cookie.get('region');
                            if (!region) {
                                regions.query({}, function (data) {
                                    //console.log('regions', data);
                                    //$scope.regions = data;
                                    $rootScope.region = data[0].identification;
                                    Cookie.set('region', data[0].identification, 10 * 365 * 24 * 3600 * 1000);
                                    return User.get({name: '~', region: Cookie.get('region')}).$promise;
                                })
                            } else {

                            }

                            User.get({name: '~', region: Cookie.get('region')}, function (user) {
                                console.log('user', user);
                                if (user.metadata&&user.metadata.name) {
                                    return creatproject.create({'metadata':{
                                        name:user.metadata.name
                                    }}).$promise
                                }

                            })
                            //return User.get({name: '~', region: Cookie.get('region')}).$promise;
                        }]

                    },
                    abstract: true

                })
                .state('console.backing_service_detail', {
                    url: '/backing_service/:name',
                    params: {
                        plan: null,
                        update: false,
                        index: null,
                        type: null
                    },
                    templateUrl: 'views/backing_service_detail/backing_service_detail.html',
                    controller: 'BackingServiceInstanceCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/backing_service_detail/backing_service_detail.js'])
                        }]
                    }
                })
                .state('console.apply_instance', {
                    url: '/apply_instance/:name',
                    templateUrl: 'views/apply_instance/apply_instance.html',
                    controller: 'ApplyInstanceCtrl',
                    params: {
                        plan: ''
                    },
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/apply_instance/apply_instance.js'])
                        }]
                    }
                })
                .state('console.dashboard', {
                    url: '/dashboard/:useorg',
                    templateUrl: 'views/dashboard/dashboard.html',
                    controller: 'dashboardCtrl',
                    params: {},
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/dashboard/dashboard.js'])
                        }]
                    }
                })
                .state('console.user', {
                    url: '/user',
                    templateUrl: 'views/user/user.html',
                    controller: 'userCtrl',
                    params: {
                        index: null
                    },
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/user/user.js')
                        }]
                    }
                })
                .state('console.org', {
                    url: '/org/:useorg',
                    templateUrl: 'views/org/org.html',
                    params: {
                        useorg: ''
                    },
                    controller: 'orgCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/org/org.js')
                        }]
                    }
                })
                .state('console.notification', {
                    url: '/notification',
                    templateUrl: 'views/notification/notification.html',
                    controller: 'notificationCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/notification/notification.js')
                        }]
                    }
                })
                //build
                .state('console.build', {
                    url: '/build',
                    templateUrl: 'views/build/build.html',
                    controller: 'BuildCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/build/build.js')
                        }]
                    }
                })

                .state('console.build_create', {
                    url: '/build/create',
                    templateUrl: 'views/build_create/build_create.html',
                    controller: 'BuildCreateCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/build_create/build_create.js')
                        }]
                    }
                })
                .state('console.build_detail', {
                    url: '/build/:name',
                    params: {
                        from: null
                    },
                    templateUrl: 'views/build_detail/build_detail.html',
                    controller: 'BuildDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/build_detail/build_detail.js')
                        }]
                    }
                })
                .state('console.build_create_new', {
                    url: '/construction/create/new',
                    templateUrl: 'views/build_create_new/build_create_new.html',
                    controller: 'BuildcCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/build_create_new/build_create_new.js')
                        }]
                    }
                })
                //image
                .state('console.image', {
                    url: '/image',
                    templateUrl: 'views/image/image.html',
                    controller: 'ImageCtrl',
                    params: {
                        index: null
                    },
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/image/image.js', 'views/image/image.css'])
                        }]
                    }
                })
                .state('console.image_detail', {
                    url: '/image/myimage/:bc/:name',
                    templateUrl: 'views/image_detail/image_detail.html',
                    controller: 'ImageDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/image_detail/image_detail.js'])
                        }]
                    }
                })
                .state('console.image_Public', {
                    url: '/image/imagePublic/:bc/:name',
                    templateUrl: 'views/image_Public/image_Public.html',
                    controller: 'imagePublicCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/image_Public/image_Public.js'])
                        }]
                    }
                })
                .state('console.image_regstry', {
                    url: '/image/image_regstry/:bc/:name',
                    templateUrl: 'views/image_Public/image_regstry.html',
                    controller: 'imagePublicCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/image_Public/image_Public.js'])
                        }]
                    }
                })
                //service
                .state('console.service', {
                    url: '/service',
                    templateUrl: 'views/service/service.html',
                    controller: 'ServiceCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/service/service.js', 'views/service/service.css'])
                        }]
                    }
                })
                .state('console.service_create', {
                    url: '/service/create',
                    templateUrl: 'views/service_create/service_create.html',
                    controller: 'ServiceCreateCtrl',
                    params: {
                        image: null,
                        ports: null
                    },
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/service_create/service_create.js'])
                        }]
                    }
                })
                .state('console.service_detail', {
                    url: '/service/:name',
                    params: {
                        from: null
                    },
                    templateUrl: 'views/service_detail/service_detail.html',
                    controller: 'ServiceDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/service_detail/service_detail.js'])
                        }]
                    }
                })
                .state('console.backing_service', {
                    url: '/backing_service',
                    params: {
                        index: null
                    },
                    templateUrl: 'views/backing_service/backing_service.html',
                    controller: 'BackingServiceCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/backing_service/backing_service.js'])
                        }]
                    }

                })
                .state('console.create_saas', {
                    url: '/create_saas/:name',
                    templateUrl: 'views/create_saas/create_saas.html',
                    controller: 'create_saasCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/create_saas/create_saas.js')
                        }]
                    }
                })
                //resource management
                .state('console.resource_management', {
                    url: '/resource_management',
                    params: {
                        index: null
                    },
                    templateUrl: 'views/resource_management/resource_management.html',
                    controller: 'resmanageCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/resource_management/resource_management.js')
                        }]
                    }
                })
                .state('console.create_constantly_volume', {
                    url: '/resource_create_persistentVolume',
                    templateUrl: 'views/create_constantly_volume/create_constantly_volume.html',
                    controller: 'createconvolumeCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/create_constantly_volume/create_constantly_volume.js')
                        }]
                    }
                })
                .state('console.create_config_volume', {
                    url: '/resource_create_configMap',
                    templateUrl: 'views/create_config_volume/create_config_volume.html',
                    controller: 'createfigvolumeCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/create_config_volume/create_config_volume.js')
                        }]
                    }
                })
                .state('console.create_secret', {
                    url: '/create_secret',
                    templateUrl: 'views/create_secret/create_secret.html',
                    controller: 'createSecretCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/create_secret/create_secret.js')
                        }]
                    }
                })
                .state('console.config_detail', {
                    url: '/resource_management/configMap/:name',
                    templateUrl: 'views/config_detail/config_detail.html',
                    controller: 'configDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/config_detail/config_detail.js')
                        }]
                    }
                })
                .state('console.secret_detail', {
                    url: '/resource_management/secret/:name',
                    templateUrl: 'views/secret_detail/secret_detail.html',
                    controller: 'secretDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/secret_detail/secret_detail.js')
                        }]
                    }
                })
                .state('console.constantly_detail', {
                    url: '/resource_management/persistentVolume/:name',
                    templateUrl: 'views/constantly_detail/constantly_detail.html',
                    controller: 'constDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/constantly_detail/constantly_detail.js')
                        }]
                    }
                })
                //数据集成
                .state('console.Integration', {
                    url: '/Integration',
                    params: {
                        index: null
                    },
                    templateUrl: 'views/Integration/Integration.html',
                    controller: 'IntegrationCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/Integration/Integration.js'])
                        }]
                    }

                })
                .state('console.Integration_detail', {
                    url: '/Integration_detail/:name',
                    params: {
                        plan: null,
                        update: false,
                        index: null,
                        type: null
                    },
                    templateUrl: 'views/Integration_detail/Integration_detail.html',
                    controller: 'IntegrationDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/Integration_detail/Integration_detail.js'])
                        }]
                    }

                })
                .state('console.Integration_dlist', {
                    url: '/Integration_dlist/:name/:plan',
                    params: {},
                    templateUrl: 'views/Integration_dlist/Integration_dlist.html',
                    controller: 'IntegrationDlistCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/Integration_dlist/Integration_dlist.js'])
                        }]
                    }

                })
                .state('console.dataseverdetail', {
                    url: '/dataseverdetail/:name',
                    templateUrl: 'views/dataseverdetail/dataseverdetail.html',
                    controller: 'dataseverdetailCtrl',
                    params: {
                        plan: null
                    },
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/dataseverdetail/dataseverdetail.js'])
                        }]
                    }
                })
                //panment
                .state('console.plan', {
                    url: '/plan',
                    templateUrl: 'views/plan/plan.html',
                    controller: 'planCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/plan/plan.js')
                        }]
                    }
                })
                .state('console.noplan', {
                    url: '/noplan',
                    templateUrl: 'views/noplan/noplan.html',
                    controller: 'noplanCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/noplan/noplan.js')
                        }]
                    }
                })
                .state('console.pay', {
                    url: '/pay',
                    params: {
                        id: null
                    },
                    templateUrl: 'views/pay/pay.html',
                    controller: 'payCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/pay/pay.js')
                        }]
                    }
                })

        }]);

});
