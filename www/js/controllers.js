angular.module('starter.controllers', ['ngRoute'])

.constant('DB_CONFIG', {
    name: 'DB',
    tables: {
        routes: {
            ID: 'integer',
            name: 'text'
        },
        stops: {
            ID: 'integer',
            name: 'varchar',
            lat: 'numeric',
            lng: 'numeric'
        },
        favorites: {
            SID: 'integer',
            minute: 'numeric',
            lat: 'numeric',
            lng: 'numeric'
        }
    }
})
//create a service that connects to DB with database functions
.factory('DB', function ($q, DB_CONFIG) {
    var self = this;
    self.db = null;
    self.init = function () {
        if (window.sqlitePlugin)
            self.db = window.sqlitePlugin.openDatabase({ name: DB_CONFIG.name });
        else if (window.openDatabase)
            self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);

        for (var tableName in DB_CONFIG.tables) {
            var defs = [];
            var columns = DB_CONFIG.tables[tableName];
            for (var columnName in columns) {
                var type = columns[columnName];
                defs.push(columnName + ' ' + type);
            }
            var sql = 'CREATE TABLE IF NOT EXISTS ' + tableName + ' (' + defs.join(', ') + ')';
            self.query(sql);
        }
    };
    self.insert = function (tableName, data) {
        var columns = [];
        var bindings = [];
        for (var columnName in DB_CONFIG.tables[tableName]) {
            columns.push(columnName);
            bindings.push('?');
        }
        var sql = 'INSERT INTO ' + tableName + ' (' + columns.join(', ') + ') VALUES ('
        + bindings.join(', ') + ')';

        for (var i = 0; i < data.length; i++) {
            var values = [];
            for (var j = 0; j < columns.length; j++) {
                values.push(data[i][columns[j]]);
            }
            self.query(sql, values);
        }
    };
    self.query = function (sql, bindings) {
        bindings = typeof bindings !== 'undefined' ? bindings : [];
        var deferred = $q.defer();

        self.db.transaction(function (transaction) {
            transaction.executeSql(sql, bindings, function (transaction, result) {
                deferred.resolve(result);
            }, function (transaction, error) {
                deferred.reject(error);
            });
        });

        return deferred.promise;
    };

    self.fetchAll = function (result) {
        var output = [];

        for (var i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
        }

        return output;
    };

    return self;
})
.factory('Storage', function ($http, DB) {
    var self = this;
    self.insert = function (table, data) {
        DB.insert(table, data);
    };
    self.getAllData = function (sql) {
        return DB.query(sql).then(function (result) {
            return DB.fetchAll(result);
        });
    }
    return self;
})
.directive('ionSearch', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            getDate: '&source',
            model: '=?',
            search: '=?filter'
        },
        link: function (scope, element, attrs) {
            attrs.minLength = attrs.minLength || 0;
            scope.placeholder = attrs.placeholder || '';
            scope.search = { value: '' };
            if (attrs.class) {
                element.addClass(attrs.class);
            }

            if (attrs.source) {
                scope.$watch('search.value', function (newValue, oldValue) {
                    if (newValue.length > attrs.minLength) {
                        scope.getData({ str: newValue }).then(function (results) {
                            scope.model = results;
                        });
                    } else {
                        scope.model = [];
                    }
                });
            }

            scope.clearSearch = function () {
                scope.search.value = '';
            };

        },
        template: '<div class="item-input-wrapper">' +
                        '<i class="icon ion-android-search"></i>' +
                        '<input type="search" placeholder="{{placeholder}}" ng-model="search.value">' +
                        '<i ng-if="search.value.length > 0" ng-click="clearSearch()" class="icon ion-close"></i>' +
                      '</div>'
    };
})
.run(function (DB) {
    DB.init();
})
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
.controller("MulRouteCallerCtrl", ['$scope', '$http', 'Storage', function ($scope, $http, Storage) {
    //get the stopID
    var index = window.location.href.lastIndexOf('/');
    $scope.stopID = window.location.href.substring(index + 1);
    //save a minute for using in favorite
    $scope.minute = '';
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
            $scope.minutes = data.items[0].minutes;
            $scope.status = status;
        }).error(function (error) {
            alert('cannot make a call');
        });

    })();
    //add to favorite

    $scope.addFavorite = function () {
        Storage.insert('favorites', { SID: $scope.stopID, min: $scope.minute, lat: null, lng: null });

    }   
} ])
//test page to create fusion data
.controller('FusionCtrl', ['$scope', '$http', 'Storage', function ($scope, $http, Storage) {
    $scope.routes = {};
    $scope.stops = {};
    $http.get("http://api.metro.net/agencies/lametro/routes/")
        .success(function (data) {
            $scope.routes = data.items;
            //save routes to database
            Storage.insert('routes', $scope.routes);
            angular.forEach($scope.routes, function (value) {
                $http.get("http://api.metro.net/agencies/lametro/routes/" + value.id + "/sequence/")
                    .success(function (data) {
                        $scope.stops = data.items;

                        //save all stops to database
                        Storage.insert('stops', $scope.stops);
                    })
                    .error(function (error) {
                        alert("cannot make a call");
                    })
            })
        })
        .error(function (error) {
            alert('cannot make a call. check internet connection');
        })
} ])
//this controller allows the search to create an HTTP call to Fusion table
.controller('SearchCtrl', function ($scope, Storage) {

    var searchTerm = $('#search').value;
    $scope.results = {};
    $scope.counter = 0;
    //init sql 
    var sql = 'SELECT * FROM routes AS r, stops AS s WHERE ' +
        r.ID + ' LIKE %' + searchTerm + '% OR ' +
        r.name + ' LIKE %' + searchTerm + '% OR ' +
        s.ID + ' LIKE %' + searchTerm + '% OR ' +
        s.name + ' LIKE %' + searchTerm + '%';

    $scope.results = Storage.fetchAllData(sql)
})
.controller('FavoriteCtrl', function ($scope, Storage) {
    var sql = 'SELECT * FROM stops';
    $scope.visible = false;
    var favorites = Storage.getAllData(sql).then(function (result) { return result; console.log(result); });
    console.log('test favorites result');
    console.log(favorites);
});


