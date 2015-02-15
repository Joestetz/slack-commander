'use strict';

var _ = require('lodash');
var Task = require('./task.model');

// Execute command
exports.index = function(req, res) {
  var parsed = parseCommand(req);
  if(parsed.error) { return handleError(res, 'Expected parameters not found'); }
  
  var commandResponse;
  switch(parsed.command) {
    case 'add':
      commandResponse = cmdAdd(res, parsed);
      break;
    case 'complete':
      commandResponse = cmdComplete(res, parsed);
      break;
    case 'me':
      commandResponse = cmdAssign(res, parsed);
      break;
    case 'assign':
      commandResponse = cmdAssign(res, parsed);
      break;
    case 'delete':
      commandResponse = cmdDelete(res, parsed);
      break;
    case 'list':
      commandResponse = cmdList(res, parsed);
      break;
    case 'done':
      commandResponse = cmdDone(res, parsed);
      break;
    case 'doing':
      commandResponse = cmdDoing(res, parsed);
      break;
    case 'assigned':
      commandResponse = cmdAssigned(res, parsed);
      break;
    case 'unassigned':
      commandResponse = cmdUnassigned(res, parsed);
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
    user: req.body.user_name
  };
  
  var commandArgs = req.body.text.split(' ');
  if(commandArgs.length == 0 || commandArgs[0] === '') {
    res.command = 'list';
  } else {
    res.command = commandArgs[0].toLowerCase();
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

function cmdAdd(res, commandObj) {
  if(commandObj.command !== 'add') return handleError(res, 'Unexpected command');
  if(commandObj.commandArgs.length == 0) {
    return handleError(res, 'You must specify a task name');
  }
  
  var taskName = joinArgs(commandObj.commandArgs, 0);
  
  var task = {
      name: taskName,
      author: commandObj.user,
      token: commandObj.token,
      teamId: commandObj.teamId
  };
  
  Task.create(task, function(err, task) {
    if(err) { return handleError(res, err); }
    return handleSuccess(res, 'Task added with ID of ' + task._id);
  });
}
    
function cmdComplete(res, commandObj) {
  if(commandObj.command !== 'complete') return handleError(res, 'Unexpected command');
  if(commandObj.commandArgs.length == 0) {
    return handleError(res, 'You must specify a task id');
  }
  
  Task.findById(commandObj.commandArgs[0], function (err, task) {
    if(err) { return handleError(res, err); }
    if(!task || task.token !== commandObj.token || task.teamId !== commandObj.teamId) {
      return handleError(res, 'Task not found');
    }
    
    task.completed = Date.now();
    task.save(function (err) {
      if (err) { return handleError(res, err); }
      return handleSuccess(res, 'Task marked as complete');
    });
  });
}
    
function cmdAssign(res, commandObj) {
  if(commandObj.commandArgs.length == 0) {
    return handleError(res, 'You must specify a task id');
  }
  
  var assignedTo = '';
  if(commandObj.command === 'me') {
    assignedTo = commandObj.user;
  } else if(commandObj.command === 'assign') {
    assignedTo = (commandObj.commandArgs.length >= 2) ? commandObj.commandArgs[1] : commandObj.user;
  } else {
    return handleError(res, 'Unexpected command');
  }
  
  Task.findById(commandObj.commandArgs[0], function (err, task) {
    if(err) { return handleError(res, err); }
    if(!task || task.token !== commandObj.token || task.teamId !== commandObj.teamId) {
      return handleError(res, 'Task not found');
    }
    
    task.assignedTo = assignedTo;
    task.save(function (err) {
      if (err) { return handleError(res, err); }
      return handleSuccess(res, 'Task now assigned to ' + assignedTo);
    });
  });
}

function cmdDelete(res, commandObj) {
  if(commandObj.command !== 'delete') return handleError(res, 'Unexpected command');
  if(commandObj.commandArgs.length == 0) {
    return handleError(res, 'You must specify a task id');
  }
  
  Task.findById(commandObj.commandArgs[0], function (err, task) {
    if(err) { return handleError(res, err); }
    if(!task || task.token !== commandObj.token || task.teamId !== commandObj.teamId) {
      return handleError(res, 'Task not found');
    }
    
    task.remove(function(err) {
      if(err) { return handleError(res, err); }
      return handleSuccess(res, 'Task deleted');
    });
  });
}

function cmdInfo(res, commandObj) {
  if(commandObj.command !== 'info') return handleError(res, 'Unexpected command');
  if(commandObj.commandArgs.length == 0) {
    return handleError(res, 'You must specify a task id');
  }
  
  Task.findById(commandObj.commandArgs[0], function (err, task) {
    if (err) { return handleError(res, err); }
    if(!task || task.token !== commandObj.token || task.teamId !== commandObj.teamId) {
      return handleError(res, 'Task not found');
    }
    
    return res.json(200, task);
  });
}

function cmdList(res, commandObj) {
  if(commandObj.command !== 'list') return handleError(res, 'Unexpected command');
  
  Task.find({ token: commandObj.token, teamId: commandObj.teamId }, function (err, tasks) {
    if(err) { return handleError(res, err); }
    if(tasks.length == 0) return handleError(res, 'No tasks found');
    return res.json(200, tasks);
  }); 
}

function cmdDone(res, commandObj) {
  if(commandObj.command !== 'done') return handleError(res, 'Unexpected command');
  
  Task.find({ token: commandObj.token, teamId: commandObj.teamId, completed: { $ne: null } }, function (err, tasks) {
    if(err) { return handleError(res, err); }
    if(tasks.length == 0) return handleError(res, 'No tasks found');
    return res.json(200, tasks);
  }); 
}

function cmdDoing(res, commandObj) {
  if(commandObj.command !== 'doing') return handleError(res, 'Unexpected command');
  
  Task.find({ token: commandObj.token, teamId: commandObj.teamId, completed: null, assignedTo: commandObj.user }, function (err, tasks) {
    if(err) { return handleError(res, err); }
    if(tasks.length == 0) return handleError(res, 'No tasks found');
    return res.json(200, tasks);
  }); 
}

function cmdAssigned(res, commandObj) {
  if(commandObj.command !== 'assigned') return handleError(res, 'Unexpected command');
  
  Task.find({ token: commandObj.token, teamId: commandObj.teamId, completed: null, assignedTo: { $ne: null } }, function (err, tasks) {
    if(err) { return handleError(res, err); }
    if(tasks.length == 0) return handleError(res, 'No tasks found');
    return res.json(200, tasks);
  }); 
}

function cmdUnassigned(res, commandObj) {
  if(commandObj.command !== 'unassigned') return handleError(res, 'Unexpected command');
  
  Task.find({ token: commandObj.token, teamId: commandObj.teamId, completed: null, assignedTo: null }, function (err, tasks) {
    if(err) { return handleError(res, err); }
    if(tasks.length == 0) return handleError(res, 'No tasks found');
    return res.json(200, tasks);
  }); 
}