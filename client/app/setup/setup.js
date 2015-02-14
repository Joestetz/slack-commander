'use strict';

angular.module('slackDeploymentTrackerApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/setup', {
        templateUrl: 'app/setup/setup.html',
        controller: 'SetupCtrl'
      });
  });
