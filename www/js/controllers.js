angular.module('starter.controllers', ['ngRoute'])

.controller('AppCtrl', function ($scope, $ionicModal, $ionicNavBarDelegate, $timeout, $route) {
    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });
    //refresh when clicking back
    $scope.refresh = function () {
        $ionicNavBarDelegate.back();
        $route.reload();

    }
    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeLogin();
        }, 1000);
    };
})

.controller('PlaylistsCtrl', function ($scope) {
    $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})
//this retrieved all routes 
.controller('RouteCallerCtrl', function ($scope, $http) {
    //initialize the agency
    $scope.agency = 'LaMetro';
    $scope.status = "";
    //return all routes
    $scope.routes = {};
    $http.get('http://api.metro.net/agencies/lametro/routes/')
    .success(function (data, status) {
        $scope.routes = data.items;
        $scope.status = status;
    }).error(function (error) {
        alert("cannot get the data " + error);
    });
})
//this get all stop of a route
.controller('StopCallerCtrl', ['$scope', '$http', '$route', function ($scope, $http, $route) {
    //get the routeID    
    $route.reload();
    var index = window.location.href.lastIndexOf('/');
    $scope.routeID = window.location.href.substring(index + 1);
    $scope.refresh = function () {
        $route.reload();
    };
    $scope.stops = {};
    $scope.status = "";
    //get the stop based on routeID

    $scope.getStop = function () {
        $http.get("http://api.metro.net/agencies/lametro/routes/" + $scope.routeID + "/sequence/")
            .success(function (data, status) {
                $scope.stops = data.items;
                $scope.status = status;
            })
            .error(function (error, status) {
                $route.reload();
                alert("cannot make a call");

            })
    };


} ])
//this will get all routes pass a specific stop
.controller("MulRouteCallerCtrl", ['$scope', '$http', function ($scope, $http) {
    //get the stopID
    var index = window.location.href.lastIndexOf('/');
    $scope.stopID = window.location.href.substring(index + 1);
    //initialize the data
    $scope.routes = {};
    $scope.status = '';
    $scope.refresh = function () {
        $route.reload();
    };
    $scope.getStop = (function () {
        $http.get("http://api.metro.net/agencies/lametro/stops/" + $scope.stopID + "/predictions/")
        //return all routes
        .success(function (data, status) {
            $scope.routes = data.items;
            $scope.status = status;
        }).error(function (error) {
            alert('cannot make a call');
        });

    })();

} ])
//test page to create fusion data
.controller('FusionCtrl', function ($scope, $http) {
    $scope.routes = {};
    $scope.stops = {};
    $http.get("http://api.metro.net/agencies/lametro/routes/")
        .success(function (data) {
            $scope.routes = data.items;
            angular.forEach($scope.routes, function (value) {
                $http.get("http://api.metro.net/agencies/lametro/stops/" + value.id + "/predictions/")
                    .success(function (data) {
                        $scope.stops = data.items;
                    })
                    .error(function (error) {
                        alert("cannot make a call");
                    })
            })
        })
        .error(function (error) {
            alert('cannot make a call. check internet connection');
        })
})
.controller('PlaylistCtrl', function ($scope, $stateParams) {
});

