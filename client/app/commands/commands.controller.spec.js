'use strict';

describe('Controller: CommandsCtrl', function () {

  // load the controller's module
  beforeEach(module('slackDeploymentTrackerApp'));

  var CommandsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CommandsCtrl = $controller('CommandsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
