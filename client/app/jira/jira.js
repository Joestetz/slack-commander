'use strict';

angular.module('slackCommanderApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/jira', {
        templateUrl: 'app/jira/jira.html',
        controller: 'JiraCtrl'
      });
  });
