/**
 * Created by jxy on 16/8/30.
 */
angular.module('home.application_saas_detail', [
        {
            files: [
                'views/home/application_saas_detail/application_saas_detail.css'
            ]
        }
    ])
    .controller('application_saas_detailCtrl', ['$scope', '$log','$stateParams','saas','$rootScope','$state',
        function ($scope, $log,$stateParams,saas,$rootScope,$state) {
        //console.log('lalallalal----',$stateParams);
        saas.get({id:$stateParams.id},function(res){
            $scope.saasobj = res.data;
            //console.log('-------cat',res);
        })
        /////创建saas服务
        //$('#application1').($(window).height());
        $("#application1").css("minHeight",$(window).height());
        $scope.createsaas = function(name){
            if(!$rootScope.user){
                $state.go('login',{type : 'saas',name : name});
            }else{
                $state.go('console.create_saas',{name:name});
            }
        }
    }]);
