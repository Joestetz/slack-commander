'use strict';

angular.module('slackCommanderApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/timer', {
        templateUrl: 'app/timer/timer.html',
        controller: 'TimerCtrl'
      });
  });
