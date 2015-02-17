'use strict';

describe('Controller: JiraCtrl', function () {

  // load the controller's module
  beforeEach(module('slackCommanderApp'));

  var JiraCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    JiraCtrl = $controller('JiraCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
