'use strict';

var Validator;

Validator = (function() {
  function Validator() {
  }
  
  Validator.prototype.isValidRequest = function(req) {
    if(!req.body.token || !req.body.team_id || !req.body.user_id || !req.body.user_name 
        || !req.body.channel_name || !req.body.command || !req.body.text) {
      return false;
    }
    
    return true;
  };
  
  return Validator;
})();

module.exports = Validator;