'use strict';

angular.module('slackDeploymentTrackerApp')
  .controller('NavbarCtrl', function ($scope, $location) {
    $scope.menu = [{
      'title': 'Home',
      'link': './'
    },{
      'title': 'Setup',
      'link': './setup'
    },{
      'title': 'Commands',
      'link': './commands'
    }];

    $scope.isCollapsed = true;

    $scope.isActive = function(route) {
      if(route[0] == '.') route = route.slice(1);
      return route === $location.path();
    };
  });