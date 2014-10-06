angular.module('ServiceManager', [])
    .controller('ServiceCallerCtrl','$scope', '$http', function ($scope, $http) {
        //initialize the agency
        $scope.agency = getAgency | 'LaMetro';

        //return all routes
        $scope.routes = [];
        $http({
            method: "get",          
            url: "http://api.metro.net/agencies/lametro/routes/"

        }).success(function (data,status,headers,config) {
            $.each(function (element) {
                $scope.routes = element.items;
            })
        }).error(function (error) {
            alert("cannot get the data " + error.message);
        });
    })