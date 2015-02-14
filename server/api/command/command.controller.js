'use strict';

var _ = require('lodash');
var Command = require('./command.model');

// Get list of commands
exports.index = function(req, res) {
  Command.find(function (err, commands) {
    if(err) { return handleError(res, err); }
    return res.json(200, commands);
  });
};

// Get a single command
exports.show = function(req, res) {
  Command.findById(req.params.id, function (err, command) {
    if(err) { return handleError(res, err); }
    if(!command) { return res.send(404); }
    return res.json(command);
  });
};

// Creates a new command in the DB.
exports.create = function(req, res) {
  Command.create(req.body, function(err, command) {
    if(err) { return handleError(res, err); }
    return res.json(201, command);
  });
};

// Updates an existing command in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Command.findById(req.params.id, function (err, command) {
    if (err) { return handleError(res, err); }
    if(!command) { return res.send(404); }
    var updated = _.merge(command, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, command);
    });
  });
};

// Deletes a command from the DB.
exports.destroy = function(req, res) {
  Command.findById(req.params.id, function (err, command) {
    if(err) { return handleError(res, err); }
    if(!command) { return res.send(404); }
    command.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}