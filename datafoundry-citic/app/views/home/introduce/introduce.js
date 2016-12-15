angular.module('home.introduce', [
        {
            files: [
                'views/home/introduce/css/introduce.css',
            ]
        }
    ])
    .controller('introduceCtrl',['$scope','$rootScope','$state',function ($scope,$rootScope,$state) {
          $scope.grid = {
              cxjcidx : '',
              hdfw : '',
              yytg: ''
          }
          $scope.tabchange = function(objname,idx){
              if(objname == 'cxjc'){
                  $scope.grid.cxjcidx = idx
              }else if(objname == 'hdfw'){
                  $scope.grid.hdfw = idx
              }else if(objname == 'yytg'){
                  $scope.grid.yytg = idx
              }

          }

          $scope.cxjc = [
              {fun:'提升应用交付效率',funcon:'生成随时随地可交付的镜像',img:'views/home/introduce/img/icon-27.png',mg:true,bigimg:'views/home/introduce/img/DF-36.png'},
              {fun:'自动测试',funcon:'与代码仓库的无缝对接，能够自动触发代码测试，提高产品质量',img:'views/home/introduce/img/icon-29.png',bigimg:'views/home/introduce/img/DF-37.png'}
          ]
        $scope.hdfw = [
            {fun:'计费灵活',funcon:'即买即用，按需提供',img:'views/home/introduce/img/icon-30.png',bigimg:'views/home/introduce/img/DF-33.png'},
            {fun:'多样化后端服务',funcon:'预置计算、存储、分布式协调等24种后端服务',img:'views/home/introduce/img/icon-31.png',bigimg:'views/home/introduce/img/DF-34.png'},
            {fun:'使用方便',funcon:'应用开发者既可以在界面上申请，也可以通过编排来生成',img:'views/home/introduce/img/icon-32.png',bigimg:'views/home/introduce/img/DF-38.png'}
        ]
        $scope.yytg = [
            {fun:'保障应用高可用',funcon:'弹性伸缩，合理分配资源，保障应用访问的连续性',img:'views/home/introduce/img/icon-26.png',bigimg:'views/home/introduce/img/DF-35.png'},
        ]
        $('.accordion li').mouseover(function(){
            $(this).stop().animate({
                width: 480,
            }, 200 );
            $(this).siblings().stop().animate({
                width: 200,
            }, 200 );
        })
        $scope.experience = function(){
            window.onmousewheel = document.onmousewheel=true;
            if(!$rootScope.user){
                $state.go('login');
            }else{
                $state.go('console.dashboard');
            }
        }
        $('.imgover').mouseover(function(){
            $(this).siblings('.imgdown').stop().slideDown(200);
        }).mouseout(function(){
            $(this).siblings('.imgdown').stop().slideUp(200);
        })

    }]);
