'use strict';

angular.module('slackCommanderApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/tasker', {
        templateUrl: 'app/tasker/tasker.html',
        controller: 'TaskerCtrl'
      });
  });
