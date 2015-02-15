'use strict';

describe('Controller: TaskerCtrl', function () {

  // load the controller's module
  beforeEach(module('slackDeploymentTrackerApp'));

  var TaskerCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TaskerCtrl = $controller('TaskerCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
