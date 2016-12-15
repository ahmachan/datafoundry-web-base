'use strict';

angular.module('home.index', [])
    .controller('IndexCtrl', ['$scope', '$log', function ($scope, $log) {
        $log.info('Index');
        var h=document.documentElement.clientHeight
        $('.banner').height(h *0.7);
        var images = new Array()
        function preload() {
            for (var i = 0; i < arguments.length; i++) {
                images[i] = new Image()
                images[i].src = arguments[i]
            }
        };

        preload(
            "pub/img/aws_logo_hover.png",
            "pub/img/jd_logo_hover.png",
            "pub/img/yh_logo_hover.png",
            "pub/img/gbase_logo_hover.png",
            "pub/img/daocloud_logo_hover.png",
            "pub/img/pivotal_logo_hover.png",
            "pub/img/ky_logo_hover.png",
            "pub/img/oscar_logo_hover.png",
            "app/components/header/img/back.png"
        );

    }]);

