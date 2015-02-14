'use strict';

angular.module('slackDeploymentTrackerApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/commands', {
        templateUrl: 'app/commands/commands.html',
        controller: 'CommandsCtrl'
      });
  });
