/**
 * Created by jxy on 16/9/6.
 */
angular.module('home.index_backing_Sdetail', [
        {
            files: [
                'views/backing_service/backing_service.css'
            ]
        }
    ])
    .controller('index_backing_SdetailCtrl', ['$scope', '$log','newBackingService','$stateParams','$state','$rootScope',
        function ($scope,$log,newBackingService,$stateParams,$state,$rootScope) {
            var bsname = $stateParams.name
            var loadBs = function () {
                newBackingService.get({name: bsname}, function (data) {
                    $log.info('价格', data);
                    if (data.metadata.annotations) {
                        $scope.ltype = data.metadata.annotations.Class
                    }

                    //if (data.status.phase === "Inactive") {
                    //    data.bianhui = true;
                    //}else {
                    //    data.biancheng = true;
                    //}
                    $scope.data = data;

                })
            };
            loadBs();
            $scope.apply_instance = function(name){
                if(!$rootScope.user){
                    $state.go('login',{type : 'bkservice',name : name});
                }else{
                    $state.go('console.apply_instance',{name:name});
                }
            }
        }]);