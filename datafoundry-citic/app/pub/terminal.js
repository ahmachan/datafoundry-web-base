'use strict';

define(['angular'], function (angular) {
    return angular.module('kubernetesUI', [])
        .provider('kubernetesContainerSocket', function() {
            var self = this;

            /* The default WebSocketFactory */
            self.WebSocketFactory = function() {
                return function ContainerWebSocket(url, protocols) {
                    if (url.indexOf("/") === 0) {
                        var  wsscheme = "wss://";
                        if (window.location.protocol != "https:") {
                            wsscheme = "ws://";
                        }
                        url = wsscheme + window.location.host + '/ws' + url;
                    }
                    return new window.WebSocket(url, protocols);
                };
            };

            function load(injector, name) {
                if (!name)
                    throw "no WebSocketFactory set";
                else if (angular.isString(name))
                    return injector.get(name, "kubernetesContainerSocket");
                else
                    return injector.invoke(name);
            }

            self.$get = [
                "$injector",
                function($injector) {
                    return load($injector, self.WebSocketFactory);
                }
            ];
        })
        .directive('kubernetesContainerTerminal', [
            "$q", "kubernetesContainerSocket", "Cookie",
            function($q, kubernetesContainerSocket, Cookie) {
                return {
                    restrict: 'E',
                    scope: {
                        pod: '&',
                        container: '&',
                        command: '@',
                        prevent: '=',
                        rows: '=',
                        cols: '=',
                        screenKeys: '='
                    },
                    link: function(scope, element, attrs) {
                        /* term.js wants the parent element to build its terminal inside of */
                        var outer = angular.element("<div class='terminal-wrapper'>");
                        element.append(outer);

                        var spinner = angular.element("<div class='spinner spinner-white hidden'>");

                        var button = angular.element("<button class='btn btn-default fa fa-refresh'>");
                        button.on("click", connect).attr("title", "Connect");

                        element.append(angular.element("<div class='terminal-actions'>")
                            .append(spinner).append(button));

                        var alive = null;
                        var ws = null;

                        var term = new Terminal({
                            cols: scope.cols || 80,
                            rows: scope.rows || 24,
                            screenKeys: scope.screenKeys || true
                        });

                        outer.empty();
                        term.open(outer[0]);
                        term.cursorHidden = true;
                        term.refresh(term.x, term.y);

                        term.on('data', function(data) {
                            if (ws && ws.readyState === 1)
                                ws.send("0" + window.btoa(data));
                        });

                        function connect() {
                            disconnect();

                            term.reset();

                            var url = "";

                            var pod = scope.pod();
                            if (pod.metadata)
                                url += pod.metadata.selfLink;
                            else
                                url += pod;
                            url += "/exec";

                            if (url.indexOf('?') === -1)
                                url += '?';
                            url += "stdout=1&stdin=1&stderr=1&tty=1";

                            var container = scope.container ? scope.container() : null;
                            if (container)
                                url += "&container=" + encodeURIComponent(container);

                            var command = scope.command;
                            if (!command)
                                command = [ "/bin/sh", "-i" ];
                            if (typeof (command) === "string")
                                command = [ command ];
                            command.forEach(function(arg) {
                                url += "&command=" + encodeURIComponent(arg);
                            });

                            url += "&access_token=" + Cookie.get('df_access_token');

                            var first = true;
                            spinner.removeClass("hidden");
                            button.addClass("hidden");

                            function fatal(message) {
                                if (!message && first)
                                    message = "Could not connect to the container. Do you have sufficient privileges?";
                                if (!message)
                                    message = "disconnected";
                                if (!first)
                                    message = "\r\n" + message;
                                term.write('\x1b[31m' + message + '\x1b[m\r\n');
                                scope.$apply(disconnect);
                            }

                            $q.when(kubernetesContainerSocket(url, "base64.channel.k8s.io"),
                                function resolved(socket) {
                                    ws = socket;

                                    ws.onopen = function(ev) {
                                        alive = window.setInterval(function() {
                                            ws.send("0");
                                        }, 30 * 1000);
                                    };

                                    ws.onmessage = function(ev) {
                                        var data = ev.data.slice(1);
                                        switch(ev.data[0]) {
                                            case '1':
                                            case '2':
                                            case '3':
                                                term.write(window.atob(data));
                                                break;
                                        }
                                        if (first) {
                                            first = false;
                                            spinner.addClass("hidden");
                                            button.addClass("hidden");
                                            term.cursorHidden = false;
                                            term.showCursor();
                                            term.refresh(term.y, term.y);
                                        }
                                    };

                                    ws.onclose = function(ev) {
                                        fatal(ev.reason);
                                    };
                                },
                                function rejected(ex) {
                                    fatal(ex.message);
                                }
                            );
                        }

                        function disconnect() {
                            spinner.addClass("hidden");
                            button.removeClass("hidden");

                            /* There's no term.hideCursor() function */
                            if (term) {
                                term.cursorHidden = true;
                                term.refresh(term.x, term.y);
                            }

                            if (ws) {
                                ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null;
                                if (ws.readyState < 2) // CLOSING
                                    ws.close();
                                ws = null;
                            }

                            window.clearInterval(alive);
                            alive = null;
                        }

                        scope.$watch("prevent", function(prevent) {
                            if (!prevent)
                                connect();
                        });

                        scope.$on("$destroy", function() {
                            if (term)
                                term.destroy();
                            disconnect();
                        });
                    }
                };
            }
        ]);
});
