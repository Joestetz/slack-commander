'use strict';

angular.module('slackDeploymentTrackerApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/tasker', {
        templateUrl: 'app/tasker/tasker.html',
        controller: 'TaskerCtrl'
      });
  });
