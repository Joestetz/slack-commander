'use strict';

angular.module('slackCommanderApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/setup', {
        templateUrl: 'app/setup/setup.html',
        controller: 'SetupCtrl'
      });
  });
