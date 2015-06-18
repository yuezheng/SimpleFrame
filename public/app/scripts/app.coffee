'use strict'

app = angular.module("SimpleFrame", [
  "ui.router"
])

app.config ($stateProvider, $httpProvider, $urlRouterProvider) ->
  $httpProvider.default.useXDomain = true
  $httpProvider.defaults.withCredentials = true
  delete $httpProvider.defaults.headers.common["X-Requested-With"]
  $urlRouterProvider.otherwise "/home"
  $stateProvider
    .state "index"
      url: "/"
      redirectTo: "/home"
    .state "Home"
      url: "/home"
      templateUrl: "views/home.html"
      controller: "SimepleFrameHome"
  return
