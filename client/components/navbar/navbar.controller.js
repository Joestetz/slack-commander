'use strict';

angular.module('slackCommanderApp')
  .controller('NavbarCtrl', function ($scope, $location) {
    $scope.menu = [{
      'title': 'Home',
      'link': './'
    },{
      'title': 'Setup',
      'link': './setup'
    },{
      'title': 'Tasker',
      'link': './tasker'
    },{
      'title': 'Timer',
      'link': './timer'
    }];

    $scope.isCollapsed = true;

    $scope.isActive = function(route) {
      if(route[0] == '.') route = route.slice(1);
      return route === $location.path();
    };
  });