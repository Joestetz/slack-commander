'use strict';

describe('Controller: BeerCtrl', function () {

  // load the controller's module
  beforeEach(module('slackCommanderApp'));

  var BeerCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    BeerCtrl = $controller('BeerCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
