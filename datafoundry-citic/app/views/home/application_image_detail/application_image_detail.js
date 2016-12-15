/**
 * Created by jxy on 16/8/31.
 */
/**
 * Created by jxy on 16/8/30.
 */
angular.module('home.application_image_detail', [
        {
            files: [
                'views/home/application_image_detail/application_image_detail.css'
            ]
        }
    ])
    .controller('application_image_detailCtrl', ['ModalPullImage','$http','$state','$scope','$rootScope',function (ModalPullImage,$http,$state,$scope,$rootScope) {
        $scope.name=$state.params.name;
        $scope.lastname=$state.params.name;
        $scope.items=[]
        $("#application2").css("minHeight",$(window).height());
        $http.get('/registry/api/repositories/tags', {params: {repo_name:$state.params.name}})
            .success(function (tags) {
                //console.log(tags);
                angular.forEach(tags, function (tag,i) {
                    $http.get('/registry/api/repositories/manifests',
                        {params: {repo_name:$scope.name,tag:tag}})
                        .success(function (tagmessage) {

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
                            $scope.firsttag = $scope.items[0].tag;
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
        $scope.deployimg = function(obj){
            if(!$rootScope.user){
                $state.go('login',{type : 'image',name : obj});
            }else{
                $state.go('console.service_create',{image:obj});
            }
        }
    }]);
