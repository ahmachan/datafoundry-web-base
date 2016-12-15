'use strict';

define(['angular'], function (angular) {
    return angular.module('myApp.service', ['angular-clipboard', 'base64'])
        .service('Confirm', ['$uibModal', function ($uibModal) {
            this.open = function (title, txt, tip, tp, iscf, nonstop) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/confirm.html',
                    size: 'default',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.title = title;
                        $scope.txt = txt;
                        $scope.tip = tip;
                        $scope.tp = tp;
                        $scope.iscf = iscf;
                        //$scope.nonstop = nonstop;
                        $scope.ok = function () {
                            $uibModalInstance.close(true);
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    }]
                }).result;
            };
        }])
        .service('errcode', ['$uibModal', function ($uibModal) {
            this.open = function (code) {
                var errcode = {
                    '1400': '请求错误',
                    '14000': '组织名称太短',
                    '14001': '名称太短',
                    '14002': '用户名不合法',
                    '14003': '操作不支持',
                    '14004': '不合法的token',
                    '14005': '密码不能为空',
                    '14006': '密码长度必须为8-12位',
                    '14007': '不合法的邮箱地址',
                    '14008': '不合法的用户名',
                    '14009': '该成员仍在组织中',
                    '140010': '超出配额',
                    '140011': '最后一名管理员禁止操作',
                    '140012': '该用户已被邀请过',
                    '140013': '该用户已在组织中',
                    '140014': '该用户还未注册',
                    '1401': '该用户未授权',
                    '1403': '禁止操作',
                    '14030': '没有权限',
                    '1404': '不能找到',
                    '14040': '不能找到组织',
                    '14041': '不能找到该用户',
                    '14090': '组织已存在',
                    '14091': '该用户已存在',
                    '14092': '该用户在LDAP已存在',
                    '2049': '原密码错误'
                }
                return errcode[code] || '内部错误，请通过DaoVoice联系管理员'
            }
        }])
        .service('by', ['$uibModal', function ($uibModal) {
            this.open = function (name,daoxu) {
                //daoxu参数倒序排列
                return function (o, p) {
                    var a, b;
                    if (typeof o === "object" && typeof p === "object" && o && p) {
                        a = o[name];
                        b = p[name];
                        if (a === b) {
                            return 0;
                        }
                        if (typeof a === typeof b) {
                            if (daoxu) {
                                return a < b ? 1 : -1;
                            }else {
                                return a < b ? -1 : 1;
                            }

                        }
                        if (daoxu) {
                            return typeof a < typeof b ? 1 : -1;
                        }else {
                            return typeof a < typeof b ? -1 : 1;
                        }

                    } else {
                        throw ("error");
                    }
                }
            }
        }])
        .service('ansi_ups', ['$uibModal', function ($uibModal) {
            //this.open = function (Date) {
            var ansi_up,
                VERSION = "1.3.0",

            // check for nodeJS
                hasModule = (typeof module !== 'undefined'),

            // Normal and then Bright
                ANSI_COLORS = [
                    [
                        {color: "0, 0, 0", 'class': "ansi-black"},
                        {color: "187, 0, 0", 'class': "ansi-red"},
                        {color: "0, 187, 0", 'class': "ansi-green"},
                        {color: "187, 187, 0", 'class': "ansi-yellow"},
                        {color: "0, 0, 187", 'class': "ansi-blue"},
                        {color: "187, 0, 187", 'class': "ansi-magenta"},
                        {color: "0, 187, 187", 'class': "ansi-cyan"},
                        {color: "255,255,255", 'class': "ansi-white"}
                    ],
                    [
                        {color: "85, 85, 85", 'class': "ansi-bright-black"},
                        {color: "255, 85, 85", 'class': "ansi-bright-red"},
                        {color: "0, 255, 0", 'class': "ansi-bright-green"},
                        {color: "255, 255, 85", 'class': "ansi-bright-yellow"},
                        {color: "85, 85, 255", 'class': "ansi-bright-blue"},
                        {color: "255, 85, 255", 'class': "ansi-bright-magenta"},
                        {color: "85, 255, 255", 'class': "ansi-bright-cyan"},
                        {color: "255, 255, 255", 'class': "ansi-bright-white"}
                    ]
                ],

            // 256 Colors Palette
                PALETTE_COLORS;

            function Ansi_Up() {
                this.fg = this.bg = this.fg_truecolor = this.bg_truecolor = null;
                this.bright = 0;
            }

            Ansi_Up.prototype.setup_palette = function () {
                PALETTE_COLORS = [];
                // Index 0..15 : System color
                (function () {
                    var i, j;
                    for (i = 0; i < 2; ++i) {
                        for (j = 0; j < 8; ++j) {
                            PALETTE_COLORS.push(ANSI_COLORS[i][j]['color']);
                        }
                    }
                })();

                // Index 16..231 : RGB 6x6x6
                // https://gist.github.com/jasonm23/2868981#file-xterm-256color-yaml
                (function () {
                    var levels = [0, 95, 135, 175, 215, 255];
                    var format = function (r, g, b) {
                        return levels[r] + ', ' + levels[g] + ', ' + levels[b]
                    };
                    var r, g, b;
                    for (r = 0; r < 6; ++r) {
                        for (g = 0; g < 6; ++g) {
                            for (b = 0; b < 6; ++b) {
                                PALETTE_COLORS.push(format.call(this, r, g, b));
                            }
                        }
                    }
                })();

                // Index 232..255 : Grayscale
                (function () {
                    var level = 8;
                    var format = function (level) {
                        return level + ', ' + level + ', ' + level
                    };
                    var i;
                    for (i = 0; i < 24; ++i, level += 10) {
                        PALETTE_COLORS.push(format.call(this, level));
                    }
                })();
            };

            Ansi_Up.prototype.escape_for_html = function (txt) {
                return txt.replace(/[&<>]/gm, function (str) {
                    if (str == "&") return "&amp;";
                    if (str == "<") return "&lt;";
                    if (str == ">") return "&gt;";
                });
            };

            Ansi_Up.prototype.linkify = function (txt) {
                return txt.replace(/(https?:\/\/[^\s]+)/gm, function (str) {
                    return "<a href=\"" + str + "\">" + str + "</a>";
                });
            };

            Ansi_Up.prototype.ansi_to_html = function (txt, options) {
                return this.process(txt, options, true);
            };

            Ansi_Up.prototype.ansi_to_text = function (txt) {
                var options = {};
                return this.process(txt, options, false);
            };

            Ansi_Up.prototype.process = function (txt, options, markup) {
                var self = this;
                if (txt) {
                    var raw_text_chunks = txt.split(/\033\[/);
                    var first_chunk = raw_text_chunks.shift(); // the first chunk is not the result of the split

                    var color_chunks = raw_text_chunks.map(function (chunk) {
                        return self.process_chunk(chunk, options, markup);
                    });

                    color_chunks.unshift(first_chunk);

                    return color_chunks.join('');
                }


            };

            Ansi_Up.prototype.process_chunk = function (text, options, markup) {

                // Are we using classes or styles?
                options = typeof options == 'undefined' ? {} : options;
                var use_classes = typeof options.use_classes != 'undefined' && options.use_classes;
                var key = use_classes ? 'class' : 'color';

                // Each 'chunk' is the text after the CSI (ESC + '[') and before the next CSI/EOF.
                //
                // This regex matches four groups within a chunk.
                //
                // The first and third groups match code type.
                // We supported only SGR command. It has empty first group and 'm' in third.
                //
                // The second group matches all of the number+semicolon command sequences
                // before the 'm' (or other trailing) character.
                // These are the graphics or SGR commands.
                //
                // The last group is the text (including newlines) that is colored by
                // the other group's commands.
                var matches = text.match(/^([!\x3c-\x3f]*)([\d;]*)([\x20-\x2c]*[\x40-\x7e])([\s\S]*)/m);

                if (!matches) return text;

                var orig_txt = matches[4];
                var nums = matches[2].split(';');

                // We currently support only "SGR" (Select Graphic Rendition)
                // Simply ignore if not a SGR command.
                if (matches[1] !== '' || matches[3] !== 'm') {
                    return orig_txt;
                }

                if (!markup) {
                    return orig_txt;
                }

                var self = this;

                while (nums.length > 0) {
                    var num_str = nums.shift();
                    var num = parseInt(num_str);

                    if (isNaN(num) || num === 0) {
                        self.fg = self.bg = null;
                        self.bright = 0;
                    } else if (num === 1) {
                        self.bright = 1;
                    } else if (num == 39) {
                        self.fg = null;
                    } else if (num == 49) {
                        self.bg = null;
                    } else if ((num >= 30) && (num < 38)) {
                        self.fg = ANSI_COLORS[self.bright][(num % 10)][key];
                    } else if ((num >= 90) && (num < 98)) {
                        self.fg = ANSI_COLORS[1][(num % 10)][key];
                    } else if ((num >= 40) && (num < 48)) {
                        self.bg = ANSI_COLORS[0][(num % 10)][key];
                    } else if ((num >= 100) && (num < 108)) {
                        self.bg = ANSI_COLORS[1][(num % 10)][key];
                    } else if (num === 38 || num === 48) { // extend color (38=fg, 48=bg)
                        (function () {
                            var is_foreground = (num === 38);
                            if (nums.length >= 1) {
                                var mode = nums.shift();
                                if (mode === '5' && nums.length >= 1) { // palette color
                                    var palette_index = parseInt(nums.shift());
                                    if (palette_index >= 0 && palette_index <= 255) {
                                        if (!use_classes) {
                                            if (!PALETTE_COLORS) {
                                                self.setup_palette.call(self);
                                            }
                                            if (is_foreground) {
                                                self.fg = PALETTE_COLORS[palette_index];
                                            } else {
                                                self.bg = PALETTE_COLORS[palette_index];
                                            }
                                        } else {
                                            var klass = (palette_index >= 16)
                                                ? ('ansi-palette-' + palette_index)
                                                : ANSI_COLORS[palette_index > 7 ? 1 : 0][palette_index % 8]['class'];
                                            if (is_foreground) {
                                                self.fg = klass;
                                            } else {
                                                self.bg = klass;
                                            }
                                        }
                                    }
                                } else if (mode === '2' && nums.length >= 3) { // true color
                                    var r = parseInt(nums.shift());
                                    var g = parseInt(nums.shift());
                                    var b = parseInt(nums.shift());
                                    if ((r >= 0 && r <= 255) && (g >= 0 && g <= 255) && (b >= 0 && b <= 255)) {
                                        var color = r + ', ' + g + ', ' + b;
                                        if (!use_classes) {
                                            if (is_foreground) {
                                                self.fg = color;
                                            } else {
                                                self.bg = color;
                                            }
                                        } else {
                                            if (is_foreground) {
                                                self.fg = 'ansi-truecolor';
                                                self.fg_truecolor = color;
                                            } else {
                                                self.bg = 'ansi-truecolor';
                                                self.bg_truecolor = color;
                                            }
                                        }
                                    }
                                }
                            }
                        })();
                    }
                }

                if ((self.fg === null) && (self.bg === null)) {
                    return orig_txt;
                } else {
                    var styles = [];
                    var classes = [];
                    var data = {};
                    var render_data = function (data) {
                        var fragments = [];
                        var key;
                        for (key in data) {
                            if (data.hasOwnProperty(key)) {
                                fragments.push('data-' + key + '="' + this.escape_for_html(data[key]) + '"');
                            }
                        }
                        return fragments.length > 0 ? ' ' + fragments.join(' ') : '';
                    };

                    if (self.fg) {
                        if (use_classes) {
                            classes.push(self.fg + "-fg");
                            if (self.fg_truecolor !== null) {
                                data['ansi-truecolor-fg'] = self.fg_truecolor;
                                self.fg_truecolor = null;
                            }
                        } else {
                            styles.push("color:rgb(" + self.fg + ")");
                        }
                    }
                    if (self.bg) {
                        if (use_classes) {
                            classes.push(self.bg + "-bg");
                            if (self.bg_truecolor !== null) {
                                data['ansi-truecolor-bg'] = self.bg_truecolor;
                                self.bg_truecolor = null;
                            }
                        } else {
                            styles.push("background-color:rgb(" + self.bg + ")");
                        }
                    }
                    if (use_classes) {
                        return '<span class="' + classes.join(' ') + '"' + render_data.call(self, data) + '>' + orig_txt + '</span>';
                    } else {
                        return '<span style="' + styles.join(';') + '"' + render_data.call(self, data) + '>' + orig_txt + '</span>';
                    }
                }
            };

            // Module exports
            //ansi_up = {

            this.escape_for_html = function (txt) {
                var a2h = new Ansi_Up();
                return a2h.escape_for_html(txt);
            };

            this.linkify = function (txt) {
                var a2h = new Ansi_Up();
                return a2h.linkify(txt);
            };

            this.ansi_to_html = function (txt, options) {
                var a2h = new Ansi_Up();
                return a2h.ansi_to_html(txt, options);
            };

            this.ansi_to_text = function (txt) {
                var a2h = new Ansi_Up();
                return a2h.ansi_to_text(txt);
            };

            this.ansi_to_html_obj = function () {
                return new Ansi_Up();
            }
            //};

            // CommonJS module is defined
            if (hasModule) {
                return ansi_up;
            }
            /*global ender:false */
            if (typeof window !== 'undefined' && typeof ender === 'undefined') {
                window.ansi_up = ansi_up;
            }
            /*global define:false */
            if (typeof define === "function" && define.amd) {
                define("ansi_up", [], function () {
                    return ansi_up;
                });
            }

            //}
        }])
        .service('Addmodal', ['errcode', '$uibModal', function (errcode, $uibModal) {
            this.open = function (title, txt, tip, orgId, isaddpeople) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/addmodal.html',
                    size: 'default',
                    controller: ['addperpleOrg','createOrg','$state', '$rootScope', '$scope', '$uibModalInstance', 'loadOrg', '$http',
                        function (addperpleOrg,createOrg,$state, $rootScope, $scope, $uibModalInstance, loadOrg, $http) {
                            $scope.title = title;
                            $scope.txt = txt;
                            $scope.tip = tip;
                            $scope.orgName = null;
                            var canok = true;
                            $scope.ok = function () {
                                if (canok) {
                                    canok=false;
                                    if (isaddpeople == 'people') {
                                        if (!$scope.orgName) {
                                            $scope.tip = '邮箱不能为空';
                                            return;
                                        } else {
                                            addperpleOrg.put({namespace: $rootScope.namespace,region:$rootScope.region}, {
                                                member_name: $scope.orgName,
                                                admin: false
                                            }, function (item) {
                                                $uibModalInstance.close(item);
                                            }, function (err) {
                                                $scope.tip = errcode.open(res.code)
                                            })

                                        }
                                    } else if (isaddpeople == 'org') {
                                        if (!$scope.orgName) {
                                            $scope.tip = '名称不能为空';
                                            return;
                                        } else {

                                            createOrg.create({region: $rootScope.region,name: $scope.orgName}, function (item) {
                                                //$state.go('console.org', {useorg: item.id})
                                                $uibModalInstance.close(item);
                                                //$rootScope.delOrgs = true;
                                            }, function (err) {
                                                //console.log(err);

                                                if (err.data.code === 400) {
                                                    $scope.tip = '同一账号只可创建一个组织'
                                                }else {
                                                    $scope.tip = errcode.open(err.code)
                                                }

                                            })
                                            //$http.post('/lapi/orgs', {
                                            //    name: $scope.orgName
                                            //}).success(function (item) {
                                            //    //$state.go()
                                            //    $state.go('console.org', {useorg: item.id})
                                            //    $uibModalInstance.close(item);
                                            //
                                            //    $rootScope.delOrgs = true;
                                            //}).error(function (res) {
                                            //    //console.log(res);
                                            //    $scope.tip = errcode.open(res.code)
                                            //    //if(res.code >= 500){
                                            //    //  $scope.tip = '内部错误，请通过DaoVoice联系管理员';
                                            //    //}else{
                                            //    //  $scope.tip = res.message;
                                            //    //}
                                            //})
                                        }
                                    } else {
                                        $uibModalInstance.close($scope.orgName);
                                    }
                                }


                            };
                            $scope.cancel = function () {
                                $uibModalInstance.dismiss();
                            };
                        }]
                }).result;
            };
        }])
        .service('Alert', ['$uibModal', function ($uibModal) {
            this.open = function (title, txt, err, regist, active) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/alert.html',
                    size: 'default',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.title = title;
                        $scope.txt = txt;
                        $scope.err = err;
                        $scope.classify = regist;
                        $scope.activation = active;
                        $scope.ok = function () {
                            $uibModalInstance.close();
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    }]
                }).result;
            };
        }])
        .service('Tip', ['$uibModal', function ($uibModal) {
            this.open = function (title, txt, tip, iscf,colse,isorg,ispay) {
                return $uibModal.open({
                    backdrop: 'static',
                    templateUrl: 'pub/tpl/tip.html',
                    size: 'default',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.title = title;
                        $scope.txt = txt;
                        $scope.tip = tip;
                        $scope.close=colse;
                        //$scope.tp = tp;
                        $scope.iscf = iscf;
                        $scope.isorg =isorg;
                        $scope.ispay =ispay;
                        //$scope.nonstop = nonstop;
                        $scope.ok = function () {
                            $uibModalInstance.close(true);
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    }]
                }).result;
            };
        }])
        .service('simpleAlert', ['$uibModal', function ($uibModal) {
            this.open = function (title, txt) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/simpleAlert.html',
                    size: 'default',
                    controller: ['$scope', '$uibModalInstance', '$sce', function ($scope, $uibModalInstance, $sce) {
                        $scope.title = title;
                        $scope.txt = $sce.trustAsHtml(txt);
                        $scope.ok = function () {
                            $uibModalInstance.close();
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    }]
                }).result;
            };
        }])
        .service('diploma', ['$uibModal', function ($uibModal) {
            this.open = function (obj) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/diploma.html',
                    size: 'default modal-lg',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.diploma = obj;
                        //console.log($scope.diploma, obj);
                        //$scope.err = err;
                        //$scope.classify = regist;
                        //$scope.activation = active;
                        $scope.ok = function () {
                            $uibModalInstance.close();
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    }]
                }).result;
            };
        }])
        .service('Modalbs', ['$uibModal', function ($uibModal) {
            this.open = function (name,plan) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/modalbs.html',
                    size: 'default',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.name = name;
                        $scope.plan = plan;

                        $scope.ok = function () {
                            $uibModalInstance.close();
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    }]
                }).result;
            };
        }])
        .service('Toast', ['$uibModal', function ($uibModal) {
            this.open = function (txt, timeout) {
                return $uibModal.open({
                    template: '<p>{{txt}}</p>',
                    size: 'toast',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.txt = txt;
                        timeout = timeout || 1500;
                        setTimeout(function () {
                            $uibModalInstance.dismiss();
                        }, timeout);
                    }]
                }).result;
            }
        }])
        .service('ChooseSecret', ['$uibModal', function ($uibModal) {
            this.open = function (olength, secretsobj) {
                return $uibModal.open({
                    backdrop: 'static',
                    templateUrl: 'pub/tpl/choosSecret.html',
                    size: 'default',
                    controller: ['by', '$scope', '$uibModalInstance', '$log', 'secretskey', '$rootScope', 'configmaps', 'persistent', '$state',
                        function (by, $scope, $uibModalInstance, $log, secretskey, $rootScope, configmaps, persistent, $state) {
                            $scope.secretarr = secretsobj.secretarr;
                            $scope.configmap = secretsobj.configmap;
                            $scope.persistentarr = secretsobj.persistentarr;
                            //$scope.outerIndex;
                            $scope.isok = false;
                            $scope.grid = {
                                secretarr: {
                                    kong: false,
                                    chongfu: false,
                                    buhefa: false
                                },
                                configmap: {
                                    kong: false,
                                    chongfu: false,
                                    buhefa: false
                                },
                                persistentarr: {
                                    kong: false,
                                    chongfu: false,
                                    buhefa: false
                                }
                            }
                            $scope.obj = {
                                secretarr: $scope.secretarr,
                                configmap: $scope.configmap,
                                persistentarr: $scope.persistentarr
                            }
                            $
                            $scope.$watch('obj', function (n, o) {
                                if (n == o) {
                                    return
                                }
                                if ($scope.grid.change) {
                                    $scope.grid.change = false;
                                    return
                                }
                                var kong = false;
                                var r = /^\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i;
                                var obj = angular.copy(n);
                                angular.forEach(obj, function (items, i) {
                                    items.sort(by.open("mountPath"));
                                    if (!kong) {
                                        angular.forEach(items, function (item, k) {
                                            if (item.secret && item.secret.secretName == '名称') {
                                                $scope.grid[i].kong = true;
                                                kong = true
                                            }
                                            if (item.configMap && item.configMap.name == '名称') {
                                                $scope.grid[i].kong = true;
                                                kong = true
                                            }
                                            if (item.persistentVolumeClaim && item.persistentVolumeClaim.claimName == '名称') {
                                                $scope.grid[i].kong = true;
                                                kong = true
                                            }
                                            if (item.mountPath !== '') {
                                                if (!r.test(item.mountPath)) {
                                                    //alert('bhf')
                                                    $scope.grid[i].buhefa = true;
                                                    kong = true
                                                }
                                                if (items[k] && items[k + 1]) {
                                                    if (items[k].mountPath == items[k + 1].mountPath) {
                                                        //alert('cf')
                                                        $scope.grid[i].chongfu = true;
                                                        kong = true
                                                    }
                                                }
                                            } else {
                                                kong = true
                                            }


                                        })
                                    }
                                    if (!kong) {
                                        $scope.grid[i].chongfu = false;
                                        $scope.grid[i].buhefa = false;
                                        $scope.grid[i].kong = false;
                                    }

                                })
                                if (!kong) {
                                    $scope.isok = true
                                } else {
                                    $scope.isok = false
                                }
                                //console.log('==================nnnnnn',n);
                            }, true)
                            ////添加密钥
                            $scope.addsecretarr = function () {
                                $scope.grid.change = true;
                                $scope.secretarr.push({
                                    "myname": "",
                                    "secret": {
                                        "secretName": '名称'
                                    },
                                    mountPath: ''
                                });
                            }
                            ////删除密钥
                            $scope.delsecretarr = function (idx) {
                                $scope.secretarr.splice(idx, 1);
                            }
                            $scope.changesecrename = function (idx, val) {
                                $scope.secretarr[idx].secret.secretName = val
                            }
                            ////获取密钥列表
                            var loadsecretsList = function () {
                                secretskey.get({namespace: $rootScope.namespace,region:$rootScope.region}, function (res) {
                                    //console.log('-------loadsecrets', res);
                                    if (res.items) {
                                        $scope.loadsecretsitems = res.items;
                                    }
                                })
                            }
                            loadsecretsList();

                            //////配置卷
                            ///获取配置卷列表////
                            var loadconfigmaps = function () {
                                configmaps.get({namespace: $rootScope.namespace,region:$rootScope.region}, function (res) {
                                    if (res.items) {
                                        $scope.configmapitem = res.items;
                                    }
                                })
                            }
                            loadconfigmaps();

                            ///添加配置卷  ///
                            $scope.addconfigmap = function () {
                                $scope.grid.change = true;
                                $scope.configmap.push({
                                    "myname": "",
                                    "configMap": {
                                        "name": '名称'
                                    },
                                    mountPath: ''
                                });
                            }
                            ////////删除配置卷
                            $scope.delconfigmap = function (idx) {
                                $scope.configmap.splice(idx, 1);
                            }
                            $scope.changeconfigname = function (idx, val) {
                                $scope.configmap[idx].configMap.name = val
                            }
                            ////////持久化卷

                            ///获取持久化卷

                            var loadpersistent = function () {

                                persistent.get({namespace: $rootScope.namespace}, function (res) {
                                    if (res.items) {
                                        //console.log(res);
                                        $scope.persistentitem = [];
                                        angular.forEach(res.items, function (item, i) {
                                            if (item.status.phase == "Bound") {
                                                $scope.persistentitem.push(item)
                                            }
                                        })
                                        //$scope.persistentitem = res.items;
                                    }
                                })
                            }
                            loadpersistent();
                            //////添加持久化卷
                            $scope.addpersistent = function () {
                                $scope.grid.change = true;
                                $scope.persistentarr.push({
                                    "myname": "",
                                    "persistentVolumeClaim": {
                                        "claimName": '名称'
                                    },
                                    mountPath: ''
                                });
                            }
                            ///删除持久化卷
                            $scope.delpersistent = function (idx) {
                                $scope.persistentarr.splice(idx, 1);
                            }
                            $scope.changepersistentname = function (idx, val) {
                                $scope.persistentarr[idx].persistentVolumeClaim.claimName = val
                            }
                            $scope.govolume = function (path) {

                                $state.go(path);
                                $uibModalInstance.dismiss();
                            };
                            ///  确定选择所选挂载卷
                            $scope.ok = function () {
                                var thisvolumes = [];
                                var thisvolumeMounts = [];
                                for (var i = 0; i < $scope.secretarr.length; i++) {
                                    var volumeval = {
                                        "name": "volumes" + (i + olength),
                                        "secret": {
                                            "secretName": $scope.secretarr[i].secret.secretName
                                        }

                                    }
                                    var mountsval = {
                                        "name": "volumes" + (i + olength),
                                        "mountPath": $scope.secretarr[i].mountPath
                                    }
                                    if ($scope.secretarr[i].secret.secretName == '名称' || !$scope.secretarr[i].mountPath) {
                                        //alert('密钥不能为空')
                                        return;
                                    }
                                    thisvolumes.push(volumeval);
                                    thisvolumeMounts.push(mountsval)
                                }
                                for (var j = 0; j < $scope.configmap.length; j++) {
                                    var volumeval = {
                                        "name": "volumes" + (j + olength + $scope.secretarr.length),
                                        "configMap": {
                                            "name": $scope.configmap[j].configMap.name
                                        }

                                    }
                                    var mountsval = {
                                        "name": "volumes" + (j + olength + $scope.secretarr.length),
                                        "mountPath": $scope.configmap[j].mountPath
                                    }
                                    if ($scope.configmap[j].configMap.name == '名称' || !$scope.configmap[j].mountPath) {
                                        //alert('2不能为空')
                                        return;
                                    }
                                    thisvolumes.push(volumeval);
                                    thisvolumeMounts.push(mountsval);
                                }
                                for (var j = 0; j < $scope.persistentarr.length; j++) {
                                    var volumeval = {
                                        "name": "volumes" + (j + olength + $scope.secretarr.length + $scope.configmap.length),
                                        "persistentVolumeClaim": {
                                            "claimName": $scope.persistentarr[j].persistentVolumeClaim.claimName
                                        }

                                    }
                                    var mountsval = {
                                        "name": "volumes" + (j + olength + $scope.secretarr.length + $scope.configmap.length),
                                        "mountPath": $scope.persistentarr[j].mountPath
                                    }
                                    //console.log('$scope.persistentarr[j].mountPath', $scope.persistentarr[j].mountPath)
                                    if ($scope.persistentarr[j].persistentVolumeClaim.claimName == '名称' || !$scope.persistentarr[j].mountPath) {
                                        //alert('3不能为空')
                                        return;
                                    }

                                    thisvolumes.push(volumeval);
                                    thisvolumeMounts.push(mountsval);
                                }
                                $uibModalInstance.close({
                                    arr1: thisvolumes,
                                    arr2: thisvolumeMounts,
                                    arr3: {
                                        "secretarr": $scope.secretarr,
                                        "configmap": $scope.configmap,
                                        "persistentarr": $scope.persistentarr
                                    }
                                });
                            }
                            $scope.cancel = function () {
                                //$uibModalInstance.close();
                                //$scope.secretarr=[]
                                //$scope.configmap=[]
                                //$scope.persistentarr=[]
                                $uibModalInstance.dismiss('cancel');
                            };
                        }]
                }).result
            }
        }])
        .service('ModalPullImage', ['$rootScope', '$uibModal', 'clipboard', function ($rootScope, $uibModal, clipboard) {
            this.open = function (name, yuorself) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/modal_pull_image.html',
                    size: 'default',
                    controller: ['$scope', '$uibModalInstance', '$log', function ($scope, $uibModalInstance, $log) {
                        //console.log(name)
                        //if (!yuorself) {
                        //    $scope.name = name.split('/')[1] ? name.split(':')[0] + ':' + name.split(':')[1].split('/')[1] : name;
                        //
                        //} else {

                        var names = name
                        //}
                        if (yuorself == 'project') {
                            $scope.name = name;
                            $scope.cmd = 'docker pull registry.dataos.io/' + $rootScope.namespace + '/' + $scope.name;
                        } else {
                            $scope.name = names.split('/')[1];
                            $scope.cmd = 'docker pull registry.dataos.io/' + name;
                        }

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                        $scope.success = function () {
                            $log.info('Copied!');
                            $uibModalInstance.close(true);
                        };
                        $scope.fail = function (err) {
                            $scope.tip = '该浏览器不支持复制，请手动选中输入框中内容，通过 Ctrl+C 复制';
                            $log.error('Error!', err);
                        };
                    }]
                }).result;
            };
        }])
        .service('ImageSelect', ['$uibModal', function ($uibModal) {
            this.open = function () {
                return $uibModal.open({
                    backdrop: 'static',
                    templateUrl: 'pub/tpl/modal_choose_image.html',
                    size: 'default modal-lg',
                    controller: ['$rootScope', '$scope', '$uibModalInstance', 'images', 'ImageStreamTag', 'ImageStream', '$http', 'platformlist', function ($rootScope, $scope, $uibModalInstance, images, ImageStreamTag, ImageStream, $http, platformlist) {
                        //console.log('images', images);
                        $scope.grid = {
                            cat: 0,
                            image: null,
                            version_x: null,
                            version_y: null
                        };
                        $scope.cansever = false
                        $scope.$watch('grid', function (n,o) {
                            if (n == o) {
                                return
                            }
                            //console.log(n);

                            if (n.image === 0&&!$scope.imageTags) {
                                $scope.isxs = true
                            }else if(n.image&&!$scope.imageTags){
                                $scope.isxs = true
                            }else {
                                $scope.isxs = false
                            }
                            //console.log(n.image,$scope.imageTags,$scope.isxs);
                            if (n.image||n.image===0) {
                                if (n.version_x || n.version_x === 0) {
                                    $scope.cansever = true
                                }else {
                                    $scope.cansever = false
                                }

                            }else {
                                $scope.cansever = false
                            }
                        },true)
                        $scope.test = {
                            'items': []
                        };
                        $scope.imgcon = {
                            items: []
                        }
                        $scope.$watch('imageName', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                newVal = newVal.replace(/\\/g);
                                if ($scope.grid.cat == 0) {
                                    angular.forEach($scope.images.items, function (image) {
                                        image.hide = !(new RegExp(newVal)).test(image.metadata.name);
                                    });
                                } else {
                                    angular.forEach($scope.images.items, function (image) {
                                        image.hide = !(new RegExp(newVal)).test(image.name);
                                    });
                                }
                            }
                        });
                        $scope.$watch('imageVersion', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                newVal = newVal.replace(/\\/g);
                                if ($scope.grid.cat == 0) {
                                    angular.forEach($scope.imageTags, function (item, i) {
                                        item.hide = !(new RegExp(newVal)).test(item.tag);
                                    });
                                } else {
                                    angular.forEach($scope.imageTags, function (item, i) {
                                        item.hide = !(new RegExp(newVal)).test(item.tag);
                                    });
                                }

                            }
                        });

                        $scope.images = images;
                        $scope.selectCat = function (idx) {
                            $scope.imageTags = {};
                            $scope.images = {};
                            $scope.grid.image = null;
                            //console.log("1223", idx);
                            $scope.grid.cat = idx;
                            if (idx == 0) {
                                ImageStream.get({namespace: $rootScope.namespace,region:$rootScope.region}, function (res) {
                                    $scope.images = res;
                                })
                            } else if (idx == 1) {
                                $http.get('/registry/api/projects', {
                                    params: {is_public: 0}
                                }).success(function (data) {
                                    for (var i = 0; i < data.length; i++) {
                                        $http.get('/registry/api/repositories', {params: {project_id: data[i].project_id}})
                                            .success(function (res) {
                                                if (res) {
                                                    for (var j = 0; j < res.length; j++) {
                                                        var str = {
                                                            'name': res[j]
                                                        }
                                                        $scope.test.items.push(str);
                                                    }
                                                    $scope.images = $scope.test;
                                                }
                                            })
                                    }

                                })
                            } else if (idx == 2) {
                                //////镜像中心
                                $http.get('/registry/api/repositories', {params: {project_id: 1}})
                                    .success(function (data) {
                                        var arr2 = data;
                                        $http.get('/registry/api/repositories', {params: {project_id: 58}})
                                            .success(function (msg) {
                                                arr2 = arr2.concat(msg);
                                                for (var j = 0; j < arr2.length; j++) {
                                                    var str2 = {
                                                        'name': arr2[j]
                                                    }
                                                    $scope.imgcon.items.push(str2);
                                                }
                                                $scope.images = $scope.imgcon;
                                            })
                                    })
                                $scope.images = $scope.imgcon
                                //console.log(' $scope.imgcon $scope.imgcon $scope.imgcon', $scope.imgcon)
                            }
                        };
                        $scope.selectImage = function (idx) {
                            $scope.grid.version_x = null;
                            $scope.grid.version_y = null;
                            if ($scope.grid.cat == 0) {
                                $scope.grid.image = idx;
                                var image = $scope.images.items[idx];
                                angular.forEach(image.status.tags, function (item) {
                                    if (image.metadata.name) {
                                        ImageStreamTag.get({
                                            namespace: $rootScope.namespace,
                                            name: image.metadata.name + ':' + item.tag,
                                            region:$rootScope.region
                                        }, function (res) {
                                            item.ist = res;
                                        }, function (res) {
                                            //console.log("get image stream tag err", res);
                                        });
                                    }
                                });
                                //console.log("get image stream tag err", image.status.tags);
                                $scope.imageTags = image.status.tags;
                                //console.log('test tag.items', $scope.imageTags)
                            } else if ($scope.grid.cat == 1) {
                                $scope.grid.image = idx;
                                platformlist.query({id: $scope.test.items[idx].name}, function (data) {
                                    $scope.test.items[idx].status = {};
                                    $scope.test.items[idx].status.tags = [];
                                    for (var i = 0; i < data.length; i++) {
                                        var test2 = {
                                            'tag': data[i],
                                            'items': data,
                                            'ist': {
                                                'imagesname': $scope.test.items[idx].name + '/' + data[i],
                                                'ispublicimage': true,
                                                imagePullSecrets: true
                                            }
                                        };
                                        $scope.test.items[idx].status.tags.push(test2)
                                    }
                                    $scope.imageTags = $scope.test.items[idx].status.tags;
                                })
                            } else if ($scope.grid.cat == 2) {
                                $scope.grid.image = idx;
                                $http.get('/registry/api/repositories/tags', {params: {repo_name: $scope.imgcon.items[idx].name}})
                                    .success(function (tagmsg) {
                                        $scope.imgcon.items[idx].status = {};
                                        $scope.imgcon.items[idx].status.tags = [];
                                        for (var i = 0; i < tagmsg.length; i++) {
                                            var tagmsgobj = {
                                                'tag': tagmsg[i],
                                                'items': tagmsg,
                                                'ist': {
                                                    'imagesname': $scope.imgcon.items[idx].name + '/' + tagmsg[i],
                                                    'ispublicimage': true,
                                                }
                                            };
                                            $scope.imgcon.items[idx].status.tags.push(tagmsgobj)
                                        }
                                        $scope.imageTags = $scope.imgcon.items[idx].status.tags;
                                    });
                            }
                        };

                        $scope.selectVersion = function (x, y) {
                            $scope.grid.version_x = x;
                            $scope.grid.version_y = y;
                        };

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss('cancel');
                        };
                        $scope.ok = function () {
                            //console.log("===", $scope.imageTags);
                            $uibModalInstance.close($scope.imageTags[$scope.grid.version_x].ist);
                        };
                    }],
                    resolve: {
                        images: ['$rootScope', 'ImageStream', function ($rootScope, ImageStream) {
                            return ImageStream.get({namespace: $rootScope.namespace,region:$rootScope.region}).$promise;
                        }]
                    }
                }).result;
            }
        }])
        .service('ModalLogin', ['$rootScope', '$uibModal', function ($rootScope, $uibModal) {
            this.open = function () {
                return $uibModal.open({
                    templateUrl: 'views/login/login.html',
                    size: 'default',
                    controller: ['$scope', 'AuthService', '$uibModalInstance', 'ModalRegist',
                        function ($scope, AuthService, $uibModalInstance, ModalRegist) {
                            // $rootScope.credentials = {};
                            // $scope.login = function () {
                            //   AuthService.login($rootScope.credentials);
                            //   $uibModalInstance.close();
                            // };
                            // $scope.regist = function () {
                            //   $uibModalInstance.close();
                            //   ModalRegist.open();
                            // };
                            // $scope.cancel = function () {
                            //   $uibModalInstance.dismiss();
                            // };
                        }]
                }).result;
            }
        }])
        //registration
        .service('ModalRegist', ['$uibModal', function ($uibModal) {
            this.open = function () {
                return $uibModal.open({
                    templateUrl: 'views/login/regist.html',
                    size: 'default',
                    controller: ['$scope', 'AuthService', '$uibModalInstance', 'registration',
                        function ($scope, AuthService, $uibModalInstance, registration) {
                            $scope.credentials = {};
                            $scope.regist = function () {
                                //注册相关代码...
                                registration.regist({
                                    username: $scope.credentials.username,
                                    password: $scope.credentials.password,
                                    email: $scope.credentials.email
                                }, function (data) {
                                })
                                $uibModalInstance.close();
                            };
                            $scope.cancel = function () {
                                $uibModalInstance.dismiss();
                            };
                        }]
                }).result;
            }
        }])
        .service('ModalPwd', ['$uibModal', function ($uibModal) {
            this.open = function () {
                return $uibModal.open({
                    templateUrl: 'views/user/pwd.html',
                    size: 'default',
                    controller: ['$state','Cookie','Toast','pwdModify','$scope', '$rootScope', '$uibModalInstance',
                        function ($state,Cookie,Toast,pwdModify,$scope, $rootScope, $uibModalInstance) {
                        $scope.credentials = {}
                        //console.log($rootScope);

                            $scope.$watch('credentials.oldpwd', function (n,o) {
                                if (n === o) {
                                   return
                                }
                                if (n) {
                                    $scope.pwderr = false;
                                }
                            })

                        $scope.ok = function () {
                            var possword = {
                                oldpwd: $scope.credentials.oldpwd,
                                pwd: $scope.credentials.pwd
                            }
                            pwdModify.change({new_password: $scope.credentials.pwd, old_password: $scope.credentials.oldpwd}, function (data) {

                                $uibModalInstance.close(possword);
                            }, function (data) {
                                $scope.pwderr = true;
                                //console.log('reseterr', data);
                            })

                        };

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    }]
                }).result;
            };
        }])
        .service('Sort', [function () {
            this.sort = function (items, reverse) {
                if (!reverse || reverse == 0) {
                    reverse = 1;
                }
                items.sort(function (a, b) {
                    if (!a.metadata) {
                        return 0;
                    }
                    return reverse * ((new Date(a.metadata.creationTimestamp)).getTime() - (new Date(b.metadata.creationTimestamp)).getTime());
                });
                return items;
            };
        }])
        .service('UUID', [function () {
            var S4 = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };
            this.guid = function () {
                return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
            };
        }])
        .service('randomWord', [function () {

            this.word = function (randomFlag, min, max) {
                var str = "",
                    range = min,
                    arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

                // 随机产生
                if (randomFlag) {
                    range = Math.round(Math.random() * (max - min)) + min;
                }
                for (var i = 0; i < range; i++) {
                    var pos = Math.round(Math.random() * (arr.length - 1));
                    str += arr[pos];
                }
                return str;
            }


        }])
        .service('Cookie', [function () {
            this.set = function (key, val, expires) {
                var date = new Date();
                date.setTime(date.getTime() + expires);
                document.cookie = key + "=" + val + "; expires=" + date.toUTCString();
            };
            this.get = function (key) {
                var reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
                var arr = document.cookie.match(reg);
                if (arr) {
                    return (arr[2]);
                }
                return null
            };
            this.clear = function (key) {
                this.set(key, "", -1);
            };
        }])
        .service('ServiceSelect', ['$uibModal', function ($uibModal) {
            this.open = function (c) {
                return $uibModal.open({
                    templateUrl: 'views/backing_service/service_select.html',
                    size: 'default modal-foo',
                    controller: ['$log', '$rootScope', '$scope', '$uibModalInstance', 'data', function ($log, $rootScope, $scope, $uibModalInstance, data) {
                        var curdata = angular.copy(data);
                        for (var j = 0; j < data.items.length; j++) {
                            for (var i = 0; i < c.length; i++) {
                                if (data.items[j].metadata.name == c[i].bind_deploymentconfig) {
                                    curdata.items.splice(j, 1);
                                }
                            }
                        }
                        $log.info('curdatacurdata', curdata);
                        $scope.data = curdata;
                        $scope.items = curdata.items;
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                        $scope.ok = function () {
                            var items = [];
                            for (var i = 0; i < $scope.data.items.length; i++) {
                                if ($scope.data.items[i].checked) {
                                    items.push($scope.data.items[i]);
                                }
                            }
                            $uibModalInstance.close(items);
                        };

                        $scope.$watch('txt', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                $scope.search(newVal);
                            }
                        });

                        $scope.search = function (txt) {
                            if (!txt) {
                                $scope.items = $scope.data.items;
                            } else {
                                $scope.items = [];
                                txt = txt.replace(/\//g, '\\/');
                                var reg = eval('/' + txt + '/');
                                angular.forEach($scope.data.items, function (item) {
                                    if (reg.test(item.metadata.name)) {
                                        $scope.items.push(item);
                                    }
                                })
                            }
                        };
                    }],
                    resolve: {
                        data: ['$rootScope', 'DeploymentConfig', function ($rootScope, DeploymentConfig) {
                            return DeploymentConfig.get({namespace: $rootScope.namespace,region:$rootScope.region}).$promise;
                        }]
                    }
                }).result;
            }
        }])
        .service('MetricsService', [function () {
            var midTime = function (point) {
                return point.start + (point.end - point.start) / 2;
            };

            var millicoresUsed = function (point, lastValue) {
                if (!lastValue || !point.value) {
                    return null;
                }

                if (lastValue > point.value) {
                    return null;
                }

                var timeInMillis = point.end - point.start;
                var usageInMillis = (point.value - lastValue) / 1000000;
                return (usageInMillis / timeInMillis) * 1000;
            };

            this.normalize = function (data, metric) {
                var lastValue;
                angular.forEach(data, function (point) {
                    var value;

                    if (!point.timestamp) {
                        point.timestamp = midTime(point);
                    }

                    if (!point.value || point.value === "NaN") {
                        var avg = point.avg;
                        point.value = (avg && avg !== "NaN") ? avg : null;
                    }

                    if (metric === 'CPU') {
                        value = point.value;
                        point.value = millicoresUsed(point, lastValue);
                        lastValue = value;
                    }
                });

                data.shift();
                return data;
            };
        }])
        .service('ImageService', [function () {
            this.tag = function (container) {
                var foo = container.image.replace(/(.*\/)/, '');
                foo = foo.split(':');
                if (foo.length > 1) {
                    return foo[1];
                }
                return '';
            };

        }])
        .service('AuthService', ['account','$timeout', '$q', 'orgList', '$rootScope', '$http', '$base64', 'Cookie', '$state', '$log', 'Project', 'GLOBAL', 'Alert', 'User',
            function (account,$timeout, $q, orgList, $rootScope, $http, $base64, Cookie, $state, $log, Project, GLOBAL, Alert, User) {
                this.login = function (credentials, stateParams) {
                    //console.log("login", credentials);
                    //console.log("login", stateParams);
                    localStorage.setItem('Auth', $base64.encode(credentials.username + ':' + credentials.password))
                    $rootScope.loding = true;
                    var deferred = $q.defer();
                    var req = {
                        method: 'GET',
                        timeout: deferred.promise,
                        url: GLOBAL.signin_uri,
                        headers: {
                            'Authorization': 'Basic ' + $base64.encode(credentials.username + ':' + credentials.password)
                        }
                    };
                    localStorage.setItem('Auth', $base64.encode(credentials.username + ':' + credentials.password))

                    var loadProject = function (name) {
                        // $log.info("load project");
                        Project.get({region:credentials.region},function (data) {
                            //console.log("load project success", data);
                            for (var i = 0; i < data.items.length; i++) {
                                if (data.items[i].metadata.name == name) {
                                    $rootScope.namespace = name;
                                    angular.forEach(data.items, function (item, i) {
                                        if (item.metadata.name === $rootScope.user.metadata.name) {
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
                                    return;
                                }
                            }
                            $log.info("can't find project");
                        }, function (res) {
                            $log.info("find project err", res);
                        });
                    };

                    //try {
                    //    localStorage.getItem("code");
                    //} catch (e) {
                    //    alert(e.message);
                    //    localStorage.setItem('cade',0)
                    //}
                    //localStorage.setItem('codenum','0')
                    function denglu() {

                        $http(req).success(function (data) {
                            //var arrstr = data.join(',');
                            var arr = []
                            //console.log(data);
                            angular.forEach(data, function (token,i) {
                                //arr.push(token.access_token)
                                var index = token.region.split('-')[2]
                                arr[index-1]=token.access_token

                            })

                            var arrstr = arr.join(',');
                            //console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&",arrstr);
                            Cookie.set('df_access_token', arrstr, 10 * 365 * 24 * 3600 * 1000);
                            //console.log(Cookie.get('df_access_token'));
                            Cookie.set('region', credentials.region, 10 * 365 * 24 * 3600 * 1000);
                            $rootScope.region = Cookie.get('region');

                            User.get({name: '~',region:$rootScope.region}, function (res) {

                                $rootScope.user = res;
                                //localStorage.setItem('cade',null)
                                loadProject(credentials.username);
                                localStorage.setItem("code", 1);
                                $rootScope.loginyanzheng = false;
                                if (stateParams) {
                                    $rootScope.loding = false;
                                    if (stateParams.type == 'saas') {
                                        $state.go('console.create_saas', {name: stateParams.name});
                                    } else if (stateParams.type == 'image') {
                                        $state.go('console.service_create', {image: stateParams.name});
                                    } else if (stateParams.type == 'bkservice') {
                                        $state.go('console.apply_instance', {name: stateParams.name});
                                    } else {
                                        //  TODO 查看收藏功能
                                    }
                                } else {
                                    //获取套餐
                                    account.get({namespace:$rootScope.namespace,region:$rootScope.region,status:"consuming"}, function (data) {
                                        //console.log('套餐', data);
                                        //$rootScope.payment=data;
                                        $rootScope.loding = false;
                                        if (data.purchased) {

                                            $state.go('console.dashboard');
                                            //跳转dashboard
                                        }else {
                                            $state.go('console.noplan');
                                            //跳转购买套餐
                                        }
                                    })
                                    //$state.go('console.dashboard');
                                }


                                var inputDaovoice = function () {
                                    daovoice('init', {
                                        app_id: "b31d2fb1",
                                        user_id: "user.metadata.uid", // 必填: 该用户在您系统上的唯一ID
                                        //email: "daovoice@example.com", // 选填:  该用户在您系统上的主邮箱
                                        name: $rootScope.user.metadata.name, // 选填: 用户名
                                        signed_up: parseInt((new Date($rootScope.user.metadata.creationTimestamp)).getTime() / 1000) // 选填: 用户的注册时间，用Unix时间戳表示
                                    });
                                    daovoice('update');
                                }
                                inputDaovoice();
                            });

                        }).error(function (data) {
                            //console.log(data);
                            //if (data.code == 401) {
                            //  //$rootScope.user=false;
                            //  $rootScope.loding = false;
                            //}
                            $state.go('login');
                            console.log('登录报错', data);
                            if (data.code === 1401) {
                                $rootScope.loding = false;
                                Alert.open('请重新登录', '用户名或密码不正确');
                                var codenum = localStorage.getItem("code");
                                //console.log(codenum);
                                if (codenum) {
                                    codenum = parseInt(codenum);
                                    codenum += 1
                                    localStorage.setItem('code', codenum);
                                    if (codenum > 3) {
                                        $rootScope.loginyanzheng = true;
                                    }

                                } else {
                                    localStorage.setItem('code', 1)
                                }
                            }
                            var daovoicefailed = function () {
                                daovoice('init', {
                                    app_id: "b31d2fb1"
                                });
                                daovoice('update');
                            }
                            daovoicefailed();



                            //if (data.indexOf('502') != -1) {
                            //    //$rootScope.loding = false;
                            //    //alert('超时了');
                            //    //denglu();
                            //
                            //    return;
                            //} else {
                            //
                            //
                            //
                            //
                            //}

                        });

                    }

                    denglu()

                };
            }])
        .factory('AuthInterceptor', ['$rootScope', '$q', 'AUTH_EVENTS', 'Cookie', function ($rootScope, $q, AUTH_EVENTS, Cookie) {
            var CODE_MAPPING = {
                401: AUTH_EVENTS.loginNeeded,
                403: AUTH_EVENTS.httpForbidden,
                419: AUTH_EVENTS.loginNeeded,
                440: AUTH_EVENTS.loginNeeded
            };
            return {
                request: function (config) {
                    if (/^\/login/.test(config.url)) {
                        return config;
                    }
                    if (/^\/signin/.test(config.url)) {
                        return config;
                    }
                    //$rootScope.region=
                    var tokens = Cookie.get('df_access_token');
                    var regions = Cookie.get('region');
                    var token='';
                    //console.log(tokens);

                    if (tokens&&regions) {
                        var tokenarr = tokens.split(',');
                        var region = regions.split('-')[2];
                        //if (/^\/lapi\/v1\/orgs/.test(config.url)) {
                        //    console.log(config.url);
                        //}
                        if (/^\/lapi\/v1\/orgs/.test(config.url) || /^\/oapi/.test(config.url) || /^\/api/.test(config.url)||/^\/payment/.test(config.url)) {
                            token = tokenarr[region-1];
                        }else {
                            token = tokenarr[0];
                        }

                        //console.log('tokenarr', tokenarr[region-1]);
                    }else {
                        //console.log('token错误');
                    }
                    //console.log(tokens,token, regions);
                    if (config.headers && token) {
                        config.headers["Authorization"] = "Bearer " + token;
                    }

                    if (/^\/hawkular/.test(config.url)) {
                        config.headers["Hawkular-Tenant"] = $rootScope.namespace;
                    }
                    if (/^\/registry/.test(config.url)) {
                        var Auth = localStorage.getItem("Auth")
                        config.headers["Authorization"] = "Basic " + Auth;
                    }
                    if (config.method == 'PATCH') {
                        config.headers["Content-Type"] = "application/merge-patch+json";
                    }

                    $rootScope.loading = true;
                    return config
                },
                requestError: function (rejection) {
                    $rootScope.loading = false;
                    return $q.reject(rejection);
                },
                response: function (res) {
                    $rootScope.loading = false;
                    return res;
                },
                responseError: function (response) {
                    //alert(11)
                    $rootScope.loading = false;
                    var val = CODE_MAPPING[response.status];
                    if (val) {
                        $rootScope.$broadcast(val, response);
                    }
                    return $q.reject(response);
                }
            };
        }]);
});
