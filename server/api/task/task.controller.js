'use strict';

var _ = require('lodash');
var Task = require('./task.model');
var Slack = require('slack-notify')('https://hooks.slack.com/services/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');

var _colorAssigned = '#FFA500';
var _colorUnassigned = '#DDDDDD';
var _colorDone = '#00D000';

// Execute command
exports.index = function(req, res) {
  var parsed = parseCommand(req);
  if(parsed.error) { return handleError(res, 'Expected parameters not found'); }
  
  var commandResponse;
  switch(parsed.command) {
    case 'add':
      commandResponse = cmdAdd(res, parsed);
      break;
    case 'edit':
      commandResponse = cmdEdit(res, parsed);
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
    case 'help':
      commandResponse = cmdHelp(res, parsed);
      break;
    default:
      commandResponse = handleError(res, 'Command not recognized');
      break;
      
    return commandResponse;
  }
};

function sendWebhook(commandObj, attachments, msg) {
  var options = {
    username: 'TaskerBot',
    icon_emoji: ':pencil:',
    text: 'Visit http://joestetz.com/showcase/slackCommander/tasker for more details',
    attachments: attachments
  };
  
  if(!commandObj.shout) {
    options.channel = '@' + commandObj.user;
  }
  
  if(!!msg) {
    options.text = msg;
  }
  
  Slack.send(options);
}

function getFormattedTasks(tasks, showAssignedTo, showAuthor, showCompleted) {
  var attachments = []
  for(var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    var status = !t.completed ? (!t.assignedTo ? 'Unassigned' : t.assignedTo) : 'Done';
    var attach = {
      fallback: 'Task ' + t._id + ' - ' + status + ' - ' + t.name,
      text: t.name,
      fields: [{
          title: 'Task ID',
          value: t._id,
          'short': true
      }],
      color: (!t.completed ? (!t.assignedTo ? _colorUnassigned : _colorAssigned) : _colorDone)
    };
    
    if(showAssignedTo) {
      attach.fields.push({
        title: 'Assgned To',
        value: t.assignedTo,
        'short': true
      });
    }
    
    if(showAuthor) {
      attach.fields.push({
        title: 'Created By',
        value: t.author,
        'short': true
      });
    }
    
    if(showCompleted) {
      attach.fields.push({
        title: 'Completed On',
        value: t.completed,
        'short': true
      });
    }
    
    attachments.push(attach);
  }
  
  return attachments;
}

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
    user: req.body.user_name,
    shout: false
  };
  
  var commandArgs = req.body.text.split(' ');
  if(commandArgs.length > 0 && commandArgs[0].toLowerCase() === 'shout') {
    res.shout = true;
    commandArgs.shift();
  }
  
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

function cmdHelp(res, commandObj) {
  if(commandObj.command !== 'help') return handleError(res, 'Unexpected command');
  
  var attachments = [
    {
      fallback: 'Command: /tasker help - Displays list of available tasker commands',
      text: 'Help',
      fields: [
        {
          title: 'Usage',
          value: '/tasker help',
          'short': true
        },{
          title: 'Description',
          value: 'Displays list of available tasker commands',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /tasker add [task] - Adds a task for your team',
      text: 'Add Task',
      fields: [
        {
          title: 'Usage',
          value: '/tasker add [task]',
          'short': true
        },{
          title: 'Description',
          value: 'Adds a task for your team',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /tasker edit [task id] [task] - Edits the task name',
      text: 'Edit Task',
      fields: [
        {
          title: 'Usage',
          value: '/tasker edit [task id] [task]',
          'short': true
        },{
          title: 'Description',
          value: 'Edits the task name',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /tasker complete [task id] - Marks the specified task as complete',
      text: 'Edit Task',
      fields: [
        {
          title: 'Usage',
          value: '/tasker complete [task id]',
          'short': true
        },{
          title: 'Description',
          value: 'Marks the specified task as complete',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /tasker me [task id] - Assigns the specific task to you',
      text: 'Grab Task',
      fields: [
        {
          title: 'Usage',
          value: '/tasker me [task id]',
          'short': true
        },{
          title: 'Description',
          value: 'Assigns the specific task to you',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /tasker assign [task id] [user name] - Assigns the specific task to the specified user. A blank user name is the same as the \'me\' command',
      text: 'Assign Task',
      fields: [
        {
          title: 'Usage',
          value: '/tasker assign [task id] [user name]',
          'short': true
        },{
          title: 'Description',
          value: 'Assigns the specific task to the specified user. A blank user name is the same as the \'me\' command',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /tasker delete [task id] - Deletes the specific task for your team',
      text: 'Delete Task',
      fields: [
        {
          title: 'Usage',
          value: '/tasker delete [task id]',
          'short': true
        },{
          title: 'Description',
          value: 'Deletes the specific task for your team',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /tasker [shout] info [task id] - Displays information about a specific task',
      text: 'Task Info',
      fields: [
        {
          title: 'Usage',
          value: '/tasker [shout] info [task id]',
          'short': true
        },{
          title: 'Description',
          value: 'Displays information about a specific task. If shout is added, it will broadcast to default channel.',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /tasker [shout] [list] - Displays a list of tasks for your team',
      text: 'Show All Tasks',
      fields: [
        {
          title: 'Usage',
          value: '/tasker [shout] [list]',
          'short': true
        },{
          title: 'Description',
          value: 'Displays a list of tasks for your team. If shout is added, it will broadcast to default channel.',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /tasker [shout] done - Displays all completed tasks for your team',
      text: 'Show Completed Tasks',
      fields: [
        {
          title: 'Usage',
          value: '/tasker [shout] done',
          'short': true
        },{
          title: 'Description',
          value: 'Displays all completed tasks for your team. If shout is added, it will broadcast to default channel.',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /tasker [shout] doing - Displays a list of tasks assigned to you',
      text: 'Show My Tasks',
      fields: [
        {
          title: 'Usage',
          value: '/tasker [shout] doing',
          'short': true
        },{
          title: 'Description',
          value: 'Displays a list of tasks assigned to you. If shout is added, it will broadcast to default channel.',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /tasker [shout] assigned - Displays a list of in progress tasks',
      text: 'Show Assigned Tasks',
      fields: [
        {
          title: 'Usage',
          value: '/tasker [shout] assigned',
          'short': true
        },{
          title: 'Description',
          value: 'Displays a list of in progress tasks. If shout is added, it will broadcast to default channel.',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /tasker [shout] unassigned - Displays a list of available tasks',
      text: 'Show Assigned Tasks',
      fields: [
        {
          title: 'Usage',
          value: '/tasker [shout] unassigned',
          'short': true
        },{
          title: 'Description',
          value: 'Displays a list of available tasks. If shout is added, it will broadcast to default channel.',
          'short': true
        }
      ]
    }
  ];
  sendWebhook(commandObj, attachments, 'Usage: /tasker [shout] [command] [args1..N]');
  
  return res.send(200);
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
    
function cmdEdit(res, commandObj) {
  if(commandObj.command !== 'edit') return handleError(res, 'Unexpected command');
  if(commandObj.commandArgs.length == 0) {
    return handleError(res, 'You must specify a task id');
  }
  
  Task.findById(commandObj.commandArgs[0], function (err, task) {
    if(err) { return handleError(res, err); }
    if(!task || task.token !== commandObj.token || task.teamId !== commandObj.teamId) {
      return handleError(res, 'Task not found');
    }
    
    task.name = joinArgs(commandObj.commandArgs, 1);
    task.save(function (err) {
      if (err) { return handleError(res, err); }
      return handleSuccess(res, 'Task updated');
    });
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
    assignedTo = '@' + commandObj.user;
  } else if(commandObj.command === 'assign') {
    assignedTo = (commandObj.commandArgs.length >= 2) ? commandObj.commandArgs[1] : '@' + commandObj.user;
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
    
    var tasks = [];
    tasks.push(task);
    var attachments = getFormattedTasks(tasks, true, true, true);
    sendWebhook(commandObj, attachments);
    
    return res.send(200);
  });
}

function cmdList(res, commandObj) {
  if(commandObj.command !== 'list') return handleError(res, 'Unexpected command');
  
  Task.find({ token: commandObj.token, teamId: commandObj.teamId }, function (err, tasks) {
    if(err) { return handleError(res, err); }
    if(tasks.length == 0) return handleError(res, 'No tasks found');
    
    var attachments = getFormattedTasks(tasks, true, false, false);
    sendWebhook(commandObj, attachments);
    
    return res.send(200);
  });
}

function cmdDone(res, commandObj) {
  if(commandObj.command !== 'done') return handleError(res, 'Unexpected command');
  
  Task.find({ token: commandObj.token, teamId: commandObj.teamId, completed: { $ne: null } }, function (err, tasks) {
    if(err) { return handleError(res, err); }
    if(tasks.length == 0) return handleError(res, 'No tasks found');
    
    var attachments = getFormattedTasks(tasks, false, false, true);
    sendWebhook(commandObj, attachments);
    
    return res.send(200);
  }); 
}

function cmdDoing(res, commandObj) {
  if(commandObj.command !== 'doing') return handleError(res, 'Unexpected command');
  
  Task.find({ token: commandObj.token, teamId: commandObj.teamId, completed: null, assignedTo: '@' + commandObj.user }, function (err, tasks) {
    if(err) { return handleError(res, err); }
    if(tasks.length == 0) return handleError(res, 'No tasks found');
    
    var attachments = getFormattedTasks(tasks, false, false, false);
    sendWebhook(commandObj, attachments);
    
    return res.send(200);
  }); 
}

function cmdAssigned(res, commandObj) {
  if(commandObj.command !== 'assigned') return handleError(res, 'Unexpected command');
  
  Task.find({ token: commandObj.token, teamId: commandObj.teamId, completed: null, assignedTo: { $ne: null } }, function (err, tasks) {
    if(err) { return handleError(res, err); }
    if(tasks.length == 0) return handleError(res, 'No tasks found');
    
    var attachments = getFormattedTasks(tasks, true, false, false);
    sendWebhook(commandObj, attachments);
    
    return res.send(200);
  }); 
}

function cmdUnassigned(res, commandObj) {
  if(commandObj.command !== 'unassigned') return handleError(res, 'Unexpected command');
  
  Task.find({ token: commandObj.token, teamId: commandObj.teamId, completed: null, assignedTo: null }, function (err, tasks) {
    if(err) { return handleError(res, err); }
    if(tasks.length == 0) return handleError(res, 'No tasks found');
    
    var attachments = getFormattedTasks(tasks, false, true, false);
    sendWebhook(commandObj, attachments);
    
    return res.send(200);
  }); 
}
