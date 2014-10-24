// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngRoute'])

.run(function ($ionicPlatform, DB) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
    
})

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
          url: "/app",
          abstract: true,
          templateUrl: "templates/menu.html",
          controller: 'AppCtrl'
      })

      .state('app.routes', {
          url: "/routes",
          views: {
              'menuContent': {
                  templateUrl: "templates/routelist.html",
                  controller: 'RouteCallerCtrl'
              }
          }
      })
      .state('app.stopsOfARoute', {
          url: "/routes/:routeID",
          views: {
              'menuContent': {
                  templateUrl: "templates/stops.html",
                  controller: "StopCallerCtrl"
              }
          }
      })
      .state('app.stopwithRoute', {
          url: "/routes/stops/:stopID",
          views: {
              'menuContent': {
                  templateUrl: "templates/intersect.html",
                  controller: "MulRouteCallerCtrl"
              }
          }
      })
      .state('app.map', {
          url: "/map",
          views: {
              'menuContent': {
                  templateUrl: "templates/map.html",
                  controller: "FusionCtrl"
              }
          }
      })
      .state('app.favorites',{
          url: "/favorites",
          views:{
              'menuContent':{
                  templateUrl: "templates/favorite.html",
                  controller: "FavoriteCtrl"
              }
          }
      })
      .state('app.setting',{
          url:"/settings",
          views:{
              'menuContent':{
                  templateUrl: "templates/setting.html",
                  controller: "SettingCtrl"
              }
          }
      })
      .state('app.schedule',{
          url:"/schedule",
          views:{
              'menuContent':{
                  templateUrl: "templates/schedule.html",
                  controller: "ScheduleCtrl"
              }
          }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/routes');
});
