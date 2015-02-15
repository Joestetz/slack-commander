'use strict';

var _ = require('lodash');
var Task = require('./task.model');

// // Get list of tasks
// exports.index = function(req, res) {
  // Task.find(function (err, tasks) {
    // if(err) { return handleError(res, err); }
    // return res.json(200, tasks);
  // });
// };

// // Get a single task
// exports.show = function(req, res) {
  // Task.findById(req.params.id, function (err, task) {
    // if(err) { return handleError(res, err); }
    // if(!task) { return res.send(404); }
    // return res.json(task);
  // });
// };

// // Creates a new task in the DB.
// exports.create = function(req, res) {
  // Task.create(req.body, function(err, task) {
    // if(err) { return handleError(res, err); }
    // return res.json(201, task);
  // });
// };

// // Updates an existing task in the DB.
// exports.update = function(req, res) {
  // if(req.body._id) { delete req.body._id; }
  // Task.findById(req.params.id, function (err, task) {
    // if (err) { return handleError(res, err); }
    // if(!task) { return res.send(404); }
    // var updated = _.merge(task, req.body);
    // updated.save(function (err) {
      // if (err) { return handleError(res, err); }
      // return res.json(200, task);
    // });
  // });
// };

// // Deletes a task from the DB.
// exports.destroy = function(req, res) {
  // Task.findById(req.params.id, function (err, task) {
    // if(err) { return handleError(res, err); }
    // if(!task) { return res.send(404); }
    // task.remove(function(err) {
      // if(err) { return handleError(res, err); }
      // return res.send(204);
    // });
  // });
// };

// Execute command
exports.index = function(req, res) {
  var parsed = parseCommand(req);
  if(parsed.error) { return handleError(res, 'Expected parameters not found'); }
  
  var commandResponse;
  switch(parsed.command) {
    case 'add':
      commandResponse = commandAdd(res, parsed);
      break;
    case 'complete':
      break;
    case 'me':
      break;
    case 'assign':
      break;
    case 'delete':
      break;
    case 'list':
      commandResponse = commandList(res, parsed);
      break;
    case 'done':
      break;
    case 'doing':
      break;
    case 'assigned':
      break;
    case 'unassigned':
      break;
    default:
      commandResponse = handleError(res, 'Command not recognized');
      break;
      
    return commandResponse;
  }
};

function handleError(res, err) {
  return res.send(500, err);
}

function handleSuccess(res, msg) {
  return res.send(200, msg);
}

function parseCommand(req) {
  if(!req.body.token || !req.body.team_id || !req.body.user_name) {
    return { error: true };
  }
  
  var res = {
    error: false,
    token: req.body.token,
    teamId: req.body.team_id,
    author: req.body.user_name
  };
  
  var commandArgs = req.body.text.split(' ');
  if(commandArgs.length == 0 || commandArgs[0] === '') {
    res.command = 'list';
  } else {
    res.command = commandArgs[0];
  }
  
  if(commandArgs.length > 1) {
    res.commandArgs = commandArgs.slice(1);
  }
  
  return res;
}

function joinArgs(args, start) {
  if(start >= args.length) return '';

  var str = '';
  for(var i = start; i < args.length; i++) {
    str += args[i];
    if(i < args.length - 1) {
      str += ' ';
    }
  }
  
  return str;
}

function commandAdd(res, commandObj) {
  if(commandObj.commandArgs.length == 0) {
    return handleError(res, 'You must specify a task name');
  }
  
  var taskName = joinArgs(commandObj.commandArgs, 0);
  
  var task = {
      name: taskName,
      author: commandObj.author,
      token: commandObj.token,
      teamId: commandObj.teamId
  };
  
  Task.create(task, function(err, task) {
    if(err) { return handleError(res, err); }
    return handleSuccess(res, 'Task added with ID of ' + task._id);
  });
}

function commandList(res, commandObj) {
  Task.find({ token: commandObj.token, teamId: commandObj.teamId }, function (err, tasks) {
    if(err) { return handleError(res, err); }
    return res.json(200, tasks);
  }); 
}