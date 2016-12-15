'use strict';

angular.module('console.image_Public', [
        {
            files: [
                'components/searchbar/searchbar.js',
            ]
        }
    ])
    .controller('imagePublicCtrl', ['ModalPullImage','$http','$state','$scope',
        function (ModalPullImage,$http,$state,$scope){
            //console.log($state.params.name);
            $scope.name=$state.params.name;
            $scope.lastname=$state.params.name.split('/')[1];
            //
            $http.get('/registry/api/repositories/tags', {params: {repo_name:$state.params.name}})
                .success(function (tags) {
                    //console.log(tags);
                    angular.forEach(tags, function (tag,i) {
                        $http.get('/registry/api/repositories/manifests',
                            {params: {repo_name:$scope.name,tag:tag}})
                            .success(function (tagmessage) {
                                $scope.items=[]
                                $scope.items.push({tag:tag,tagcen:tagmessage});
                                if ($scope.items.length == tags.length) {
                                    //console.log($scope.items);

                                    angular.forEach($scope.items, function (item,i) {
                                        $scope.items[i].sorttime=(new Date(item.tagcen.Created)).getTime()
                                    })
                                    //console.log($scope.items);
                                    $scope.items.sort(function (x, y) {
                                        return x.sorttime > y.sorttime ? -1 : 1;
                                    });
                                    //console.log($scope.items);
                                }
                            })
                    })
                });
            $scope.pull = function(name){

                //var s = $scope.name;

                var str = $scope.name+':'+name
                ModalPullImage.open(str)
                    .then(function(res){
                        //console.log("cmd1", res);
                    });
            };
        }])

