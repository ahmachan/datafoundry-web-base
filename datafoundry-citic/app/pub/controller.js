'use strict';

define(['angular'], function (angular) {
    return angular.module('myApp.controller', [])
        .controller('AppCtrl', ['$rootScope', '$state', '$log', 'AUTH_EVENTS', 'Cookie', function ($rootScope, $state, $log, AUTH_EVENTS, Cookie) {
            //console相关全局变量
            $rootScope.console = {};

            $rootScope.$on(AUTH_EVENTS.loginNeeded, function () {
                $log.info(AUTH_EVENTS.loginNeeded);
                Cookie.clear('namespace');
                Cookie.clear('df_access_token');
                Cookie.clear('region');
                $rootScope.region = '';
                $rootScope.user = '';
                $rootScope.namespace = "";
                $state.go('home.index');
            });
            $rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
                $log.info(AUTH_EVENTS.loginSuccess);
            });
            $rootScope.$on(AUTH_EVENTS.httpForbidden, function () {
                $log.info(AUTH_EVENTS.httpForbidden);
                //Cookie.clear('namespace');
                //Cookie.clear('df_access_token');
                //Cookie.clear('region');
                //$rootScope.region = '';
                //$rootScope.user = '';
                //$rootScope.namespace = "";
                //$state.go('home.index');
            });
        }]);
});
