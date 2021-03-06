/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/jira', require('./api/jira'));
  app.use('/api/beers', require('./api/beer'));
  app.use('/api/v2/beers', require('./api/v2/beer'));
  app.use('/api/timers', require('./api/timer'));
  app.use('/api/tasks', require('./api/task'));
  
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
