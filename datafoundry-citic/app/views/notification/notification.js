'use strict';

angular.module('console.notification', [
  'kubernetesUI',
  {
    files: [
      'views/notification/notification.css',
      'components/datepick/datepick.js',
      'components/messlist/messlist.js',
      'components/checkbox/checkbox.js'

    ]
  }
]) .controller('notificationCtrl', ['$http','Addmodal','Confirm','$scope','$rootScope',
  function ($http,Addmodal,Confirm,$scope,$rootScope) {
    $scope.grid={
      st:null,
      et:null,
      auto:null,
      page: 1,
      size: 10,
    }
    $scope.sitenotifycheck=[];
    $scope.sitenotifydelarr=[];
    $http({
      url:'/lapi/inbox',
      method:'GET',
      params:{
        'type':'sitenotify',
        'page':1,
        'size':10,
      }
    }).success(function(data){
        console.log('inbox',data);
      $scope.sitenotify=data;
    }).error(function(data,header,config,status){

    });

    $scope.sitenotifycheckeds=function () {
      if (!$scope.sitenotifychecked) {
        for (var i = 0; i < $scope.sitenotify.data.results.length; i++) {
          $scope.sitenotifycheck[$scope.sitenotify.data.results[i].messageid]=true
          $scope.sitenotifydelarr.push($scope.sitenotify.data.results[i].messageid)
        }
      }else {
        for (var i = 0; i < $scope.sitenotify.data.results.length; i++) {
          $scope.sitenotifycheck[$scope.sitenotify.data.results[i].messageid]=false
          $scope.sitenotifydelarr=[];
        }
      }

      $scope.sitenotifychecked=!$scope.sitenotifychecked
    }
    $scope.chenked=function (idx) {
      // $scope.sitenotify.data.results[ind].messageid
      $scope.sitenotifycheck[$scope.sitenotify.data.results[idx].messageid]=!$scope.sitenotifycheck[$scope.sitenotify.data.results[idx].messageid]
      $scope.sitenotifydelarr.push($scope.sitenotify.data.results[idx].messageid)
    }
    // 删除接口
    $scope.sitenotifydel=function () {
      $scope.arr = angular.copy($scope.sitenotifydelarr)
      for (var i = 0; i < $scope.sitenotifydelarr.length; i++) {
        
        // $scope.sitenotifydelarr[i];

        $http({
          url:'/lapi/inbox/'+$scope.sitenotifydelarr[i],
          method:'DELETE',
        }).success(function(data){
          // alert(1)
          for (var j = 0; j < $scope.sitenotify.data.results.length; j++) {
            for (var k = 0; k < $scope.arr.length; k++) {
              // console.log('messageid',$scope.sitenotify.data.results[j].messageid);
              // console.log('sitenotifydelarr',$scope.arr[j]);
              if ($scope.arr[k] == $scope.sitenotify.data.results[j].messageid) {
                $scope.sitenotify.data.results.splice(j,1)
              }

            }


          }
          // console.log($scope.sitenotifydelarr[i])
          // $scope.sitenotify.data.results[ind].status=true;
        }).error(function(data,header,config,status){
        });
      }
    }
    //接受加入组织
    $scope.accept=function (ind,orgid,messid) {
      // console.log('orgid',orgid)
      // console.log(messid);
      // $http({
      //   url:'/lapi/inbox/'+messid,
      //   method:'PUT',
      //   params:{
      //     action:'accept_org_invitation',
      //   }
      // }).success(function(data){
      //
      // }).error(function(data,header,config,status){
      // });
      //$http.put('/lapi/inbox/'+messid, {action:'accept_org_invitation'})
      //    .success(function(data){
      //
      //    })
      //    .error(function(){
      //      // console.error("Failed to save.");
      //    });
      //$http({
      //  url:'/lapi/orgs/'+orgid+'/accept',
      //  method:'PUT',
      //}).success(function(data){
      //  $scope.sitenotify.data.results[ind].data.accepted=true;
      //  $rootScope.delOrgs = true;
      //}).error(function(data,header,config,status){
      //});

    }
  }])

