'use strict';

angular.module('slackDeploymentTrackerApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/timer', {
        templateUrl: 'app/timer/timer.html',
        controller: 'TimerCtrl'
      });
  });
