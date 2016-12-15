'use strict';
angular.module('console.build_create_new', [
        {
            files: []
        }
    ])
    .controller('BuildcCtrl', ['randomWord', '$rootScope', '$scope', '$state', '$log', 'Owner', 'Org', 'Branch', 'labOwner', 'psgitlab', 'laborgs', 'labBranch', 'ImageStream', 'BuildConfig', 'Alert', '$http', 'Cookie', '$base64', 'secretskey',
        function (randomWord, $rootScope, $scope, $state, $log, Owner, Org, Branch, labOwner, psgitlab, laborgs, labBranch, ImageStream, BuildConfig, Alert, $http, Cookie, $base64, secretskey) {
            $('input[ng-model="buildConfig.metadata.name"]').focus();
            $scope.labrunning = false;
            $scope.runninghub = false;

            $scope.buildConfig = {
                metadata: {
                    name: "",
                    annotations: {
                        'datafoundry.io/create-by': $rootScope.user.metadata.name,
                        repo: ''
                    },
                },
                spec: {
                    triggers: [
                        {
                            type: "GitHub",
                            github: {
                                secret: randomWord.word(false, 25)
                            }
                        }, {
                            type: "Generic",
                            generic: {
                                secret: randomWord.word(false, 20)
                            }
                        }
                    ],
                    source: {
                        type: 'Git',
                        git: {
                            uri: '',
                            ref: ''
                        },
                        contextDir: '/',
                        sourceSecret: {
                            name: ''
                        }
                    },
                    strategy: {
                        type: 'Docker'
                    },
                    output: {
                        to: {
                            kind: 'ImageStreamTag',
                            name: ''
                        }
                    },
                    completionDeadlineSeconds: 1800
                }
            };
            var loadBuildConfigs = function () {
                BuildConfig.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (data) {
                    $log.info('buildConfigs', data.items);
                    $scope.buildConfiglist = data.items

                }, function (res) {
                    //todo 错误处理
                });
            };
            loadBuildConfigs()
            // 实时监听按钮点亮
            $scope.namerr = {
                nil: false,
                rexed: false,
                repeated: false
            }
            $scope.urlerr = false;
            $scope.repoerr = false;
            $scope.completionDeadlineMinutes = 30;
            $scope.nameblur = function () {
                //console.log($scope.buildConfig.metadata.name);
                if (!$scope.buildConfig.metadata.name) {
                    $scope.namerr.nil = true
                } else {
                    $scope.namerr.nil = false
                }
            }
            $scope.namefocus = function () {
                $scope.namerr.nil = false
            }

            var r =/^[a-z][a-z0-9-]{2,28}[a-z0-9]$/;
            $scope.$watch('buildConfig.metadata.name', function (n, o) {
                if (n === o) {
                    return;
                }
                if (n && n.length > 0) {
                    if (r.test(n)) {
                        $scope.namerr.rexed = false;
                        if ($scope.buildConfiglist) {
                            angular.forEach($scope.buildConfiglist, function (build, i) {
                                if (build.metadata.name === n) {
                                    $scope.namerr.rexed = true;
                                } else {
                                    $scope.namerr.rexed = false;
                                }
                            })
                        }

                    } else {
                        $scope.namerr.rexed = true;
                    }
                } else {
                    $scope.namerr.rexed = false;
                }
            })
            $scope.$watch('check', function (n, o) {
                if (n === o) {
                    return
                }
                if (n) {
                    //console.log(n);
                    $scope.urlerr = false;
                }

            })

            $scope.$watch('completionDeadlineMinutes', function (n,o) {
                if (n === o) {
                    return
                }
                if (n) {
                    if (parseInt(n) > 60 || parseInt(n) < 1) {
                        $scope.timeouted = true
                    }else {
                        $scope.timeouted = false
                    }
                }
            })
            $scope.$watch('buildConfig.spec.source.git.uri', function (n, o) {
                if (n === o) {
                    return
                }
                if (n) {
                    //console.log(n);
                    $scope.repoerr = false;
                }

            })





            $scope.$watch('buildConfig.metadata.name', function (n, o) {
                if (n == o) {
                    return
                }
                if (n) {
                    if (!r.test(n)) {
                        //console.log('no');
                        $scope.nameerr = true
                    } else {
                        //console.log('yes');
                        $scope.nameerr = false
                    }
                }
            })

            var thisindex = 0;

            var createBC = function () {
                if ($scope.buildConfig.spec.source && $scope.buildConfig.spec.source.contextDir == '') {
                    delete $scope.buildConfig.spec.source.contextDir;
                }
                if ($scope.buildConfig.spec.source.git && $scope.buildConfig.spec.source.git.ref == '') {
                    delete $scope.buildConfig.spec.source.git.ref;
                }
                //$scope.buildConfig.region=$rootScope.region;
                BuildConfig.create({
                    namespace: $rootScope.namespace,
                    region: $rootScope.region
                }, $scope.buildConfig, function (res) {
                    $log.info("buildConfig", res);
                    createBuild(res.metadata.name);
                    $scope.creating = false;
                }, function (res) {
                    $scope.creating = false;
                    if (res.data.code == 409) {
                        Alert.open('错误', "构建名称重复", true);
                    } else {
                       // Alert.open('错误', res.data.message, true);
                    }
                });
            }
            //console.log('随机数',randomWord.word(false,25).length,randomWord.word(false,25));
            var createBuildConfig = function (labsecret) {
                if ($scope.grid.ishide == false) {
                    $scope.buildConfig.spec.completionDeadlineSeconds = $scope.completionDeadlineMinutes * 60;
                    $scope.buildConfig.spec.source.git.ref = $scope.branch[$scope.grid.branch].name;
                    $scope.buildConfig.spec.source.sourceSecret.name = $scope.owner.secret;
                    $scope.buildConfig.spec.source.git.uri = $scope.usernames[$scope.grid.user].repos[$scope.grid.project].clone_url;
                    $scope.buildConfig.spec.output.to.name = $scope.buildConfig.metadata.name + ":" + $scope.branch[$scope.grid.branch].name;
                    $scope.buildConfig.metadata.annotations.repo = $scope.usernames[$scope.grid.user].repos[$scope.grid.project].name;
                    $scope.buildConfig.metadata.annotations.user = $scope.usernames[$scope.grid.user].login;
                    createBC();
                } else if ($scope.grid.labcon == true) {

                    $scope.buildConfig.spec.completionDeadlineSeconds = $scope.completionDeadlineMinutes * 60;
                    $scope.buildConfig.spec.source.git.ref = $scope.labBranchData.msg[$scope.grid.labbranch].name;
                    $scope.buildConfig.spec.source.sourceSecret.name = labsecret;
                    //console.log($scope.labusername,$scope.grid.labusers);
                    $scope.buildConfig.spec.source.git.uri = $scope.labobjs[$scope.grid.labproject].ssh_url_to_repo;
                    $scope.buildConfig.spec.output.to.name = $scope.buildConfig.metadata.name + ":" + $scope.labBranchData.msg[$scope.grid.labbranch].name;
                    $scope.buildConfig.metadata.annotations.repo = $scope.labobjs[$scope.grid.labproject].id.toString();
                    createBC();
                } else if ($scope.grid.ishide == true && $scope.grid.labcon == false) {

                    $scope.buildConfig.spec.completionDeadlineSeconds = $scope.completionDeadlineMinutes * 60;
                    $scope.buildConfig.spec.output.to.name = $scope.buildConfig.metadata.name + ':latest';
                    $scope.buildConfig.spec.triggers = [];
                    //console.log(secret);
                    var baseun = $base64.encode($scope.gitUsername);
                    var basepwd = $base64.encode($scope.gitPwd);
                    $scope.secret = {
                        "kind": "Secret",
                        "apiVersion": "v1",
                        "metadata": {
                            "name": "custom-git-builder-" + $rootScope.user.metadata.name + '-' + $scope.buildConfig.metadata.name
                        },
                        "data": {
                            username: baseun,
                            password: basepwd

                        },
                        "type": "Opaque"
                    }
                    secretskey.create({
                        namespace: $rootScope.namespace,
                        region: $rootScope.region
                    }, $scope.secret, function (item) {
                        //alert(11111)
                        $scope.buildConfig.spec.source.sourceSecret.name = $scope.secret.metadata.name;
                        createBC();
                    }, function (res) {
                        if (res.status == 409) {
                            $scope.buildConfig.spec.source.sourceSecret.name = $scope.secret.metadata.name;
                            createBC();
                        }
                    })
                }
            };


            var createBuild = function (name) {
                var buildRequest = {
                    metadata: {
                        annotations: {
                            'datafoundry.io/create-by': $rootScope.user.metadata.name
                        },
                        name: name
                    }
                };

                BuildConfig.instantiate.create({
                    namespace: $rootScope.namespace,
                    name: name,
                    region: $rootScope.region
                }, buildRequest, function () {
                    $log.info("build instantiate success");
                    $state.go('console.build_detail', {name: name, from: 'create/new'})
                }, function (res) {
                    //console.log("uildConfig.instantiate.create",res);
                    //todo 错误处理
                });
            };

            $scope.usernames = [];

            var hubobj = {};

            $scope.owner = null;

            $scope.loadOwner = function (cache) {
                //console.log(cache);
                Owner.query({namespace: $rootScope.namespace, cache: cache}, function (res) {
                    $log.info("owner", res);
                    $scope.owner = res.msg;
                    hubobj = res.msg.infos[0];
                    for (var i = 0; i < res.msg.infos.length; i++) {
                        for (var j = 0; j < res.msg.infos[i].repos.length; j++) {
                            res.msg.infos[i].repos[j].loginname = res.msg.infos[i].login;
                        }
                    }
                    $scope.loadOrg();
                    $log.info("userProject", $scope.login);
                }, function (data) {
                    //$log.info('-=-=-=-=', data);
                    if (data.status == 400) {
                        var tokens = Cookie.get('df_access_token');
                        var tokenarr = tokens.split(',');
                        if (data.data.code == 1401) {
                            // var authurl = data.data.msg + "?namespace=" + $rootScope.namespace
                            // + "%26bearer=" + Cookie.get("df_access_token")
                            // + "%26redirect_url=" + window.location.href ;
                            var authurl = "namespace=" + $rootScope.namespace
                                + "&bearer=" + tokenarr[0]
                                + "&redirect_url=" + window.location.href;
                            $log.info(authurl);
                            if ($scope.grid.isfirst == 2) {
                                window.location = data.data.msg + "?" + encodeURIComponent(authurl);
                            }
                        }
                    } else {
                        if (data.data && data.data.msg) {
                            //Alert.open('错误', data.data.msg, true);
                            $scope.grid.ishide = true;
                            $scope.runninghub = false;
                        }
                    }
                });
            };

            $scope.loadOrg = function (cache) {
                Org.get({cache: cache}, function (data) {
                    $log.info("org", data);
                    $scope.usernames = [];
                    $scope.usernames[0] = hubobj;
                    for (var i = 0; i < data.msg.length; i++) {
                        $scope.usernames.push(data.msg[i]);
                        for (var j = 0; j < data.msg[i].repos.length; j++) {
                            data.msg[i].repos[j].loginname = data.msg[i].login;
                        }
                    }
                    $scope.runninghub = false;
                });
            };

            $scope.refresh = function () {
                $scope.runninghub = true;
                $scope.grid.ishide = false;
                $scope.loadOwner('false');
                $scope.loadOrg('false');
            };

            var getlabsecret = function (ht, pjId) {
                var objJson = {
                    "host": ht,
                    "project_id": pjId
                }
                $http.post('/v1/repos/gitlab/authorize/deploy', objJson, {headers: {'namespace': $rootScope.namespace}}).success(function (data) {
                    $scope.grid.labsecret = data.msg.secret;
                    createBuildConfig(data.msg.secret)
                })
            };

            $scope.chooseUser = null;

            $scope.chooseProject = null;

            $scope.chooseBranch = null;

            $scope.selectUser = function (idx, choose) {
                //console.log($scope.grid.project, $scope.grid.branch);
                if ($scope.chooseUser && $scope.grid.user == idx) {
                    $scope.grid.user = null;
                    $scope.chooseUser = null;
                    $scope.grid.project = null;
                    $scope.branch = null;
                    $scope.grid.branch = null;
                    $scope.reposobj = null;
                    // return false;
                } else {
                    $scope.grid.user = idx;
                    $scope.chooseUser = choose;
                    $scope.grid.project = null;
                    $scope.branch = null;
                    $scope.grid.branch = null;
                    $scope.reposobj = $scope.usernames[idx].repos;
                    var newarr = $scope.reposobj;
                    var names = [];
                    for (var i = 0; i < newarr.length; i++) {
                        $scope.reposobj[i]['names'] = newarr[i].name.toUpperCase();
                    }
                    newarr.sort(function (x, y) {
                        return x.names > y.names ? 1 : -1;
                    })
                    $scope.githubarr = angular.copy(newarr)
                    thisindex = idx;
                }
                // $scope.grid.dian=dian;
                // $scope.grid.user = idx;
            };

            $scope.selectProject = function (idx, choose) {
                if ($scope.chooseProject && $scope.grid.project == idx) {
                    $scope.grid.project = null;
                    $scope.chooseProject = null;
                    $scope.branch = null;
                    $scope.grid.branch = null;
                } else {
                    $scope.chooseProject = choose;
                    $scope.grid.project = idx;
                    $scope.branch = null;
                    var selectUsername = $scope.usernames[thisindex].login;
                    var selectRepo = $scope.usernames[thisindex].repos[idx].name;
                    $log.info("user and repos", selectUsername + selectRepo);
                    Branch.get({users: selectUsername, repos: selectRepo}, function (info) {
                        $log.info("branch", info);
                        $scope.branch = info.msg;
                    });
                }
            };

            $scope.selectBranch = function (idx, choose) {
                if ($scope.chooseBranch && $scope.grid.branch == idx) {
                    $scope.chooseBranch = null;
                    $scope.grid.branch = null;
                } else {
                    $scope.grid.branch = idx;
                    $scope.chooseBranch = choose;
                }
            };

            $scope.psgitlab = {
                host: "",
                user: "",
                private_token: ""
            }

            //$scope.labusername = [];

            $scope.labrepos = [];

            $scope.grid = {
                users: null,
                project: null,
                branch: null,
                labusers: null,
                labproject: null,
                labbranch: null,
                gitlabbox: false,
                ishide: true,
                labcon: false,
                labsecret: "",
                cdm: false,
                creatlaberr: '',
                isfirst: 1
            };

            var thisowner = null;

            $scope.checkdTab = function (val) {
                if (val == 1) {
                    if (!$scope.labowner) {
                        $scope.grid.labcon = true;
                        $scope.grid.ishide = true;
                    } else {
                        $scope.grid.labcon = true;
                        $scope.grid.ishide = true;
                    }
                } else if (val == 2) {
                    $scope.grid.isfirst = 2;
                    if ($scope.owner) {
                        $scope.grid.ishide = false;
                        $scope.grid.labcon = false;

                    } else {
                        $scope.grid.ishide = false;
                        $scope.grid.labcon = false;
                    }
                }
                else if (val == 4) {
                    $scope.grid.ishide = true;
                    $scope.grid.labcon = false;
                }
            };

            //$scope.search= function (txt) {
            //    //reposobj
            //}

            $scope.$watch('txt', function (newVal, oldVal) {
                if (newVal != oldVal && $scope.reposobj) {
                    //console.log($scope.githubarr,$scope.reposobj,newVal);
                    newVal = newVal.replace(/\\/g);
                    var arr = [];
                    angular.forEach($scope.githubarr, function (image) {
                        if (RegExp(newVal).test(image.name)) {
                            //console.log(image.name);

                            arr.push(image)
                        }
                    });
                    //console.log(arr);
                    //$scope.grid.project = null;
                    //console.log($scope.grid.labproject, $scope.choooseProject, $scope.grid.labbranch);
                    $scope.grid.labproject = null;
                    $scope.choooseProject = null;
                    $scope.grid.labbranch = null;
                    //$scope.labBranchData.msg = null;
                    $scope.grid.project = null;
                    $scope.chooseProject = null;
                    $scope.branch = null;
                    $scope.grid.branch = null;
                    $scope.reposobj = arr;
                    $scope.usernames[thisindex].repos = arr;
                }
            });

            $scope.$watch('text', function (newVal, oldVal) {
                if (newVal != oldVal && $scope.labobjs) {
                    //console.log($scope.labarr,$scope.labobjs,newVal);
                    newVal = newVal.replace(/\\/g);
                    var arr = [];
                    angular.forEach($scope.labarr, function (image) {
                        if (RegExp(newVal).test(image.name)) {
                            //console.log(image.name);
                            arr.push(image);

                        }
                    });
                    //console.log(arr);
                    //console.log($scope.grid.labproject, $scope.choooseProject, $scope.grid.labbranch);
                    $scope.grid.labproject = null;
                    $scope.choooseProject = null;
                    $scope.grid.labbranch = null;
                    //$scope.labBranchData.msg = null;
                    $scope.grid.project = null;
                    $scope.chooseProject = null;
                    $scope.branch = null;
                    $scope.grid.branch = null;
                    $scope.labobjs = arr;
                }
            });

            $scope.labowner = null;

            $scope.loadlabOwner = function (click) {
                $scope.grid.labcon = true;

                if (!click) {
                    $scope.labrunning = true;
                    labOwner.get({cache: 'false'}, function (data) {
                        //$log.info("labOwner", data)
                        for (var i = 0; i < data.msg.infos.length; i++) {
                            thisowner = data.msg.infos[0];
                            $scope.labowner = data.msg;
                            for (var j = 0; j < data.msg.infos[i].repos.length; j++) {
                                data.msg.infos[i].repos[j].objsname = data.msg.infos[i].owner.name;
                            }
                        }
                        //if (!click) {
                        laborgs.get({cache: 'false'}, function (data) {
                            $scope.labHost = data.msg.host;
                            $scope.labrunning = false;
                            $scope.labusername = [];
                            //console.log("thisowner0-0-0-0-",thisowner);
                            if (thisowner) {
                                $scope.labusername[0] = thisowner;
                            }

                            //$log.info("laborgs", data)
                            for (var i = 0; i < data.msg.infos.length; i++) {
                                $scope.labusername.push(data.msg.infos[i]);
                                for (var j = 0; j < data.msg.infos[i].repos.length; j++) {
                                    data.msg.infos[i].repos[j].objsname = data.msg.infos[i].org.name;
                                }
                            }
                            //$log.info("0-0-0-00-0-$scope.labusername",$scope.labusername);
                        }, function (data) {
                            $scope.labrunning = false;
                            $log.info("laborgs-------err", data)
                        });
                        //}

                        //$log.info(' $scope.grid0-0-0', $scope.grid)
                    }, function (data) {
                        $log.info("labOwner-------err", data);
                        $scope.labrunning = false;
                        if (data.status == 400 && data.data.code == 1401) {
                            $scope.grid.labcon = false;
                            //$scope.grid.gitlabbox = true;
                            //Alert.open('错误', data.data.msg, true);
                        }
                    });
                } else {
                    labOwner.get({}, function (data) {
                        //$log.info("labOwner", data)
                        for (var i = 0; i < data.msg.infos.length; i++) {
                            thisowner = data.msg.infos[0];
                            $scope.labowner = data.msg;
                            for (var j = 0; j < data.msg.infos[i].repos.length; j++) {
                                data.msg.infos[i].repos[j].objsname = data.msg.infos[i].owner.name;
                            }
                        }
                        //if (!click) {
                        laborgs.get({}, function (data) {
                            $scope.labHost = data.msg.host;
                            $scope.labusername = [];
                            //console.log("thisowner0-0-0-0-",thisowner);
                            if (thisowner) {
                                $scope.labusername[0] = thisowner;
                            }

                            $log.info("laborgs", data)
                            for (var i = 0; i < data.msg.infos.length; i++) {
                                $scope.labusername.push(data.msg.infos[i]);
                                for (var j = 0; j < data.msg.infos[i].repos.length; j++) {
                                    data.msg.infos[i].repos[j].objsname = data.msg.infos[i].org.name;
                                }
                            }
                            //$log.info("0-0-0-00-0-$scope.labusername",$scope.labusername);
                        }, function (data) {
                            $log.info("laborgs-------err", data)
                        });
                        //}

                        //$log.info(' $scope.grid0-0-0', $scope.grid)
                    }, function (data) {
                        $log.info("labOwner-------err", data);
                        $scope.labrunning = false;
                        if (data.status == 400 && data.data.code == 1401) {
                            $scope.grid.labcon = false;
                            //$scope.grid.gitlabbox = true;
                           // Alert.open('错误', data.data.msg, true);
                        }
                    });
                }

            };

            var loadlaborgs = function () {
                laborgs.get({}, function (data) {
                    $scope.labHost = data.msg.host;
                    $scope.labusername = [];
                    //console.log("thisowner0-0-0-0-",thisowner);
                    if (thisowner) {
                        $scope.labusername[0] = thisowner;
                    }

                    $log.info("laborgs", data)
                    for (var i = 0; i < data.msg.infos.length; i++) {
                        $scope.labusername.push(data.msg.infos[i]);
                        for (var j = 0; j < data.msg.infos[i].repos.length; j++) {
                            data.msg.infos[i].repos[j].objsname = data.msg.infos[i].org.name;
                        }
                    }
                    //$log.info("0-0-0-00-0-$scope.labusername",$scope.labusername);
                }, function (data) {
                    $log.info("laborgs-------err", data)
                });
            };

            $scope.choooseUser = null;

            $scope.choooseProject = null;

            $scope.choooseBranch = null;

            $scope.selectlabUser = function (idx, chooose) {
                if ($scope.choooseUser && $scope.grid.user == idx) {
                    $scope.grid.user = null;
                    $scope.choooseUser = null;
                    $scope.grid.labproject = null;
                    $scope.grid.labbranch = null;
                    $scope.labobjs = null;
                    $scope.labBranchData.msg = null;
                } else {
                    $scope.grid.user = idx;
                    $scope.choooseUser = chooose;
                    $scope.labobjs = $scope.labusername[idx].repos;
                    var labproject = $scope.labobjs;
                    var projecrnames = [];
                    for (var i = 0; i < labproject.length; i++) {
                        $scope.labobjs[i]['projecrnames'] = labproject[i].name.toUpperCase();
                    }
                    labproject.sort(function (x, y) {
                        return x.projecrnames > y.projecrnames ? 1 : -1;
                    })
                    $scope.labarr = angular.copy($scope.labobjs);
                    $scope.grid.labusers = idx;
                }
            };

            $scope.selectLabProject = function (idx, chooose) {
                //console.log('_+_+_+_+_+_+_+', $scope.labobjs[idx]);
                var labId = $scope.labobjs[idx].id;
                labBranch.get({repo: labId}, function (data) {
                    if ($scope.choooseProject && $scope.grid.labproject == idx) {
                        $scope.grid.labproject = null;
                        $scope.choooseProject = null;
                        $scope.grid.labbranch = null;
                        $scope.labBranchData.msg = null;
                    } else {
                        $scope.labBranchData = data;
                        $scope.grid.labproject = idx;
                        $scope.choooseProject = chooose;
                    }
                }, function (data) {
                    $log.info("selectLabProject--=-=err", data)
                })
            };

            $scope.selectlabBranch = function (idx, chooose) {
                if ($scope.choooseBranch && $scope.grid.labbranch === idx) {
                    $scope.choooseBranch = null;
                    $scope.grid.labbranch = null;
                } else {

                    $scope.grid.labbranch = idx;
                    $scope.choooseBranch = chooose;
                }
            };

            $scope.creatgitlab = function () {

                psgitlab.create({}, $scope.psgitlab, function (res) {
                    //$log.info('psgitlab-----0000',res);
                    $scope.loadlabOwner('click');
                    $scope.grid.labcon = true;
                    //$scope.grid.gitlabbox = false;
                    $scope.grid.cdm = false;
                }, function (res) {
                    $log.info('psgitlab-----err', res);
                    $scope.grid.cdm = true;
                    $scope.grid.creatlaberr = res.data.msg;
                })
            };

            $scope.grid.labcon = true;

            $scope.grid.ishide = true;

            $scope.loadlabOwner('click');

            $scope.loadOwner();


            $scope.create = function() {
                $scope.creating = true;
                console.log('check',$scope.check);
                if ($scope.check === 1) {

                    if ($scope.grid.user === null || $scope.grid.labbranch === null || $scope.grid.labproject === null) {
                        $scope.urlerr = true;
                        return
                    }else {
                        $scope.urlerr = false;
                    }
                    //console.log($scope.urlerr);
                }else if($scope.check === 2){
                    console.log('grid',$scope.grid);
                    if ($scope.grid.user === null || $scope.grid.project === null || $scope.grid.branch === null) {
                        $scope.urlerr = true;
                        return
                    }else {
                        $scope.urlerr = false;
                    }
                }else if($scope.check === 3){
                    //console.log('grid',$scope.grid);
                    if (!$scope.buildConfig.spec.source.git.uri) {
                        $scope.repoerr = true;
                        return
                    }else {
                        $scope.repoerr = false;
                    }
                }


                if (!$scope.namerr.nil && !$scope.namerr.rexed && !$scope.namerr.repeated&&!$scope.timeouted) {

                }else {
                    return
                }

                var imageStream = {
                    metadata: {
                        annotations: {
                            'datafoundry.io/create-by':$rootScope.user.metadata.name,
                        },
                        name: $scope.buildConfig.metadata.name
                    }
                };
                ImageStream.create({namespace: $rootScope.namespace,region:$rootScope.region}, imageStream, function (res) {
                    $log.info("imageStream", res);
                    if($scope.grid.labcon == true){
                        getlabsecret($scope.labHost,$scope.labobjs[$scope.grid.labproject].id);
                    }else if($scope.grid.ishide == false){
                        createBuildConfig();
                    }else if($scope.grid.ishide == true && $scope.grid.labcon == false){
                        createBuildConfig('a');
                    }

                },function(res){
                    $log.info("err", res);
                    if (res.data.code == 409) {
                        if($scope.grid.labcon == true){
                            getlabsecret($scope.labHost,$scope.labobjs[$scope.grid.labproject].id);
                        }else if($scope.grid.ishide == false){
                            createBuildConfig();
                        }
                        $scope.creating = false;
                    } else {
                       // Alert.open('错误', res.data.message, true);
                        $scope.creating = false;
                    }
                });
            };

        }]);

