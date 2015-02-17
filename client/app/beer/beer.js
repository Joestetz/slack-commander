'use strict';

angular.module('slackCommanderApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/beer', {
        templateUrl: 'app/beer/beer.html',
        controller: 'BeerCtrl'
      });
  });
