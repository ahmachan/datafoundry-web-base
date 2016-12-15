'use strict';

if (window.__karma__) {
    var allTestFiles = [];
    var TEST_REGEXP = /_test\.js$/;

    var pathToModule = function (path) {
        return path.replace(/^\/base\/app\//, '').replace(/\.js$/, '');
    };

    Object.keys(window.__karma__.files).forEach(function (file) {
        if (TEST_REGEXP.test(file)) {
            // Normalize paths to RequireJS module names.
            allTestFiles.push(pathToModule(file));
        }
    });
}

require.config({
    baseUrl: window.__karma__ ? '/base/app' : './',
    paths: {
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap.min',
        jquery: '../bower_components/jquery/dist/jquery.min',
        moment: '../bower_components/moment/min/moment-with-locales.min',
        angular: '../bower_components/angular/angular.min',
        ngResource: '../bower_components/angular-resource/angular-resource.min',
        ngFileUpload: '../bower_components/ng-file-upload/ng-file-upload-all.min',
        uiBootstrap: '../bower_components/angular-bootstrap/ui-bootstrap-tpls.min',
        uiRouter: '../bower_components/angular-ui-router/release/angular-ui-router.min',
        angularMocks: '../bower_components/angular-mocks/angular-mocks',
        ocLazyLoad: '../bower_components/oclazyload/dist/ocLazyLoad.min',
        angularBase64: '../bower_components/angular-base64/angular-base64.min',
        angularMd: '../bower_components/angular-marked/dist/angular-marked.min',
        angularClipboard: '../bower_components/angular-clipboard/angular-clipboard',
        kubernetesUI: 'pub/terminal',
        term: '../bower_components/term.js/src/term',
        highcharts: '../bower_components/highcharts/highcharts',
        angularSlider: '../bower_components/angularjs-slider/dist/rzslider.min',
        highchartsNg: '../bower_components/highcharts-ng/dist/highcharts-ng.min',
    },
    shim: {
        'angular': {
            deps: ['jquery'],
            exports: 'angular'
        },
        'angularMd': {
            deps: ['angular']
        },
        'angularMocks': {
            deps: ['angular'],
            exports: 'angular.mock'
        },
        'ngResource': {
            deps: ['angular']
        },
        'ngFileUpload': {
            deps: ['angular']
        },
        'uiBootstrap': {
            deps: ['angular']
        },
        'uiRouter': {
            deps: ['angular']
        },
        'ocLazyLoad': {
            deps: ['angular']
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'angularSlider': {
            deps: ['angular','jquery']
        },
        'angularBase64': {
            deps: ['angular']
        },
        'angularClipboard': {
            deps: ['angular']
        },
        'kubernetesUI': {
            deps: ['angular', 'term']
        },
        'highchartsNg': {
            deps: ['angular', 'highcharts']
        }
    },
    priority: [
        "angular"
    ],
    waitSeconds:30,
    deps: window.__karma__ ? allTestFiles : [],
    callback: window.__karma__ ? window.__karma__.start : null,
});

require([
        'app'
    ], function (app) {
        var $html = angular.element(document.getElementsByTagName('html')[0]);
        angular.element().ready(function () {
            // bootstrap the app manually
            angular.bootstrap(document, ['myApp']);
        });
    }
);
