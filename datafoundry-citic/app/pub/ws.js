'use strict';

// Provide a websocket implementation that behaves like $http
//调用时好像￥http
// Methods:
//   $ws({
//     url: "...", // required
//     method: "...", // defaults to WATCH
//   })
//   returns a promise to the opened WebSocket
//  返回一个打开的具有promise规范的 ws
//   $ws.available()
//   $ws调用available（）时如果ws可用返回ture
//   returns true if WebSockets are available to use
//
define(['angular'], function (angular) {
    return angular.module('myApp.webSocket', [])
        .provider('$ws', ['$httpProvider', function($httpProvider) {

            // $get method is called to build the $ws service
            // 调用$get构建ws服务
            this.$get = ['$q', '$injector', function($q, $injector) {
                // Build list of interceptors from $httpProvider when constructing the $ws service
                // 当ws正在工作时在$httpProvider中创建一个构建列表
                // Build in reverse-order, so the last interceptor added gets to handle the request first
                //构建在相反的顺序最后一个拦截机在第一个位置
              var _interceptors = [];
                angular.forEach($httpProvider.interceptors, function(interceptorFactory) {
                    if (angular.isString(interceptorFactory)) {
                        _interceptors.unshift($injector.get(interceptorFactory));
                    } else {
                        _interceptors.unshift($injector.invoke(interceptorFactory));
                    }
                });

                // Implement $ws()
              //执行ws
                var $ws = function(config) {
                    config.method = angular.uppercase(config.method || "WATCH");

                    var serverRequest = function(config) {
                        var ws = new WebSocket(config.url, config.protocols);
                        if (config.onclose)   { ws.onclose   = config.onclose;   }
                        if (config.onmessage) { ws.onmessage = config.onmessage; }
                        if (config.onopen)    { ws.onopen    = config.onopen;    }
                        if (config.onerror)   { ws.onerror    = config.onerror;  }
                        return ws;
                    };

                    // Apply interceptors to request config
                    // 应用拦截器在相应设置
                    var chain = [serverRequest, undefined];
                    var promise = $q.when(config);
                    angular.forEach(_interceptors, function(interceptor) {
                        if (interceptor.request || interceptor.requestError) {
                            chain.unshift(interceptor.request, interceptor.requestError);
                        }
                        // TODO: figure out how to get interceptors to handle response errors from web sockets
                        // 怎么用拦截器去解决ws的错误
                      // if (interceptor.response || interceptor.responseError) {
                        //   chain.push(interceptor.response, interceptor.responseError);
                        // }
                    });
                    while (chain.length) {
                        var thenFn = chain.shift();
                        var rejectFn = chain.shift();
                        promise = promise.then(thenFn, rejectFn);
                    }
                    return promise;
                };

                // Implement $ws.available()
                 // 执行
                $ws.available = function() {
                    try {
                        return !!WebSocket;
                    }
                    catch(e) {
                        return false;
                    }
                };

                return $ws;
            }];
        }]);
});

