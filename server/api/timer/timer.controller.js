'use strict';

var _ = require('lodash');
var Slack = require('slack-notify')('https://hooks.slack.com/services/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');

var _timers = [];

exports.index = function(req, res) {
  var parsed = parseCommand(req);
  if(parsed.error) { return handleError(res, 'Expected parameters not found'); }
  
  var commandResponse;
  switch(parsed.command) {
    case 'start':
      commandResponse = cmdStart(res, parsed);
      break;
    case 'edit':
      commandResponse = cmdEdit(res, parsed);
      break;
    case 'stop':
      commandResponse = cmdStop(res, parsed);
      break;
    case 'help':
      commandResponse = cmdHelp(res, parsed);
      break;
    case 'viewall':
      commandResponse = cmdViewAll(res, parsed);
      break;
    default:
      commandResponse = handleError(res, 'Command not recognized');
      break;
      
    return commandResponse;
  }
};

function sendWebhook(commandObj, msg, attachments) {
  var options = {
    username: 'TimerBot',
    icon_emoji: ':clock4:',
    channel: '#' + commandObj.channel,
    text: msg
  };
  
  if(!commandObj.shout) {
    options.channel = '@' + commandObj.user;
  }
  
  if(attachments && attachments.length > 0) {
    options.attachments = attachments;
  }
  
  Slack.send(options);
}

function handleError(res, err) {
  return res.send(500, err);
}

function handleSuccess(res, msg) {
  return res.send(200, msg);
}

function parseCommand(req) {
  if(!req.body.token || !req.body.team_id || !req.body.user_name || !req.body.channel_name || !req.body.user_id) {
    return { error: true };
  }
  
  var res = {
    error: false,
    token: req.body.token,
    teamId: req.body.team_id,
    user: req.body.user_name,
    channel: req.body.channel_name,
    userId: req.body.user_id,
    shout: false
  };
  
  var commandArgs = req.body.text.split(' ');
  if(commandArgs.length > 0 && commandArgs[0].toLowerCase() === 'shout') {
    res.shout = true;
    commandArgs.shift();
  }
  
  res.command = commandArgs[0].toLowerCase();
  
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

function cmdStart(res, commandObj) {
  if(commandObj.command !== 'start') return handleError(res, 'Unexpected command');
  if(!commandObj.commandArgs || commandObj.commandArgs.length <= 1) return handleError(res, 'Missing arguments');
  if(!isValidTime(commandObj.commandArgs[0])) return handleError(res, 'Time argument is invalid');
  
  var description = joinArgs(commandObj.commandArgs, 1);
  var howLong = getDelay(commandObj.commandArgs[0]);
  
  var timer = {
    id: commandObj.userId + new Date().getTime(),
    description: description,
    howLongStr: commandObj.commandArgs[0],
    howLong: howLong,
    currentTimeLeft: howLong,
    startTime: new Date(),
    commandObj: commandObj
  };
  
  _timers.push(timer);
  sendWebhook(timer.commandObj, 'Timer Started: ' + timer.description + '\nTime Remaining: ' + formatTimer(timer.currentTimeLeft));
  processTimer(timer);
  
  return handleSuccess(res);
}

function cmdEdit(res, commandObj) {
  if(commandObj.command !== 'edit') return handleError(res, 'Unexpected command');
  if(!commandObj.commandArgs || commandObj.commandArgs.length <= 1) return handleError(res, 'Missing arguments');
  if(!isValidTime(commandObj.commandArgs[1])) return handleError(res, 'Time argument is invalid');
  
  var timer = findTimer(commandObj.commandArgs[0]);
  if(!timer || !timer.timeoutObj) return handleError(res, 'Timer not found');
  
  clearTimeout(timer.timeoutObj);
  
  var howLong = getDelay(commandObj.commandArgs[1]);
  timer.howLongStr = commandObj.commandArgs[1],
  timer.howLong = howLong;
  timer.currentTimeLeft = howLong;
  
  sendWebhook(timer.commandObj, 'Timer Edited: ' + timer.description + '\nNew Time: ' + timer.howLongStr);
  processTimer(timer);
  
  return handleSuccess(res);
}

function cmdStop(res, commandObj) {
  if(commandObj.command !== 'stop') return handleError(res, 'Unexpected command');
  if(!commandObj.commandArgs || commandObj.commandArgs.length <= 0) return handleError(res, 'Missing arguments');
  
  var timer = findTimer(commandObj.commandArgs[0]);
  if(!timer || !timer.timeoutObj) return handleError(res, 'Timer not found');
  
  clearTimeout(timer.timeoutObj);
  var res = _.remove(_timers, function(t){
    return t.id === timer.id;
  });
  
  if(res && res.length == 1) {
    sendWebhook(timer.commandObj, 'Timer Forced Stop: ' + timer.description);
  } else {
    sendWebhook(timer.commandObj, 'Timer force stop encountered an error');
  }
  
  return handleSuccess(res);
}

function cmdHelp(res, commandObj) {
  if(commandObj.command !== 'help') return handleError(res, 'Unexpected command');
  
  var attachments = [
    {
      fallback: 'Command: /timer help - Displays the list of available commands.',
      text: 'Help',
      fields: [
        {
          title: 'Usage',
          value: '/tasker help',
          'short': true
        },{
          title: 'Description',
          value: 'Displays the list of available commands.',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /timer [shout] start h&#58;m&#58;s description - Starts a timer, optionally displayed for entire channel with "shout" option.',
      text: 'Start Timer',
      fields: [
        {
          title: 'Usage',
          value: '/timer [shout] start h&#58;m&#58;s description',
          'short': true
        },{
          title: 'Description',
          value: 'Starts a timer, optionally displayed for entire channel with "shout" option.',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /timer edit timerId h&#58;m&#58;s - Edits the specified timer.',
      text: 'Edit Timer',
      fields: [
        {
          title: 'Usage',
          value: '/timer edit timerId h&#58;m&#58;s',
          'short': true
        },{
          title: 'Description',
          value: 'Edits the specified timer.',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /timer stop timerId - Stops and removes the specified timer.',
      text: 'Stop Timer',
      fields: [
        {
          title: 'Usage',
          value: '/timer stop timerId',
          'short': true
        },{
          title: 'Description',
          value: 'Stops and removes the specified timer.',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /timer viewall - Displays all active timers.',
      text: 'View All Timers',
      fields: [
        {
          title: 'Usage',
          value: '/timer viewall',
          'short': true
        },{
          title: 'Description',
          value: 'Displays all active timers.',
          'short': true
        }
      ]
    }
  ];
  sendWebhook(commandObj, 'Usage: /timer [shout] [command] [args1..N]', attachments);
  
  return res.send(200);
}

function cmdViewAll(res, commandObj) {
  if(commandObj.command !== 'viewall') return handleError(res, 'Unexpected command');

  var attachments = [];
  _.forEach(_timers, function(t) {
    attachments.push({
      fallback: 'Timer ' + t.id + ' - ' + t.description + ' - ' + formatTimer(t.currentTimeLeft) + 'remaining.',
      text: t.description,
      fields: [
        {
          title: 'Timer Id',
          value: t.id,
          'short': true
        },{
          title: 'Time Remaining',
          value: formatTimer(t.currentTimeLeft),
          'short': true
        }
      ]
    });
  });
  
  sendWebhook(commandObj, 'Active Timers', attachments);
  
  return res.send(200);
}

function isValidTime(time) {
  if(!time) return false;
  
  var timeArr = time.split(':');
  if(!timeArr || timeArr.length != 3) return false;
  if(isNaN(timeArr[0]) || isNaN(timeArr[1]) || isNaN(timeArr[2])) return false;
  if(timeArr[0] > 12 || (timeArr[0] == 12 && timeArr[1] != 0 && timeArr[2] != 0)) return false;
  
  return true;
}

function getDelay(time) {
  var timeArr = time.split(':');
  return timeArr[0] * 3600000 + timeArr[1] * 60000 + timeArr[2] * 1000;
}

function processTimer(timer) {
  if(timer.currentDelay) {
    timer.currentTimeLeft = timer.currentTimeLeft - timer.currentDelay;
  }
  
  if(timer.currentTimeLeft <= 0) {
    var res = _.remove(_timers, function(t){
      return t.id === timer.id;
    });
    console.log(_timers);
    console.log(res);
    
    if(res && res.length == 1) {
      sendWebhook(timer.commandObj, 'Timer complete: ' + timer.description);
    } else {
      sendWebhook(timer.commandObj, 'Timer complete encountered an error');
    }
    return;
  }
  
  sendWebhook(timer.commandObj, 'Timer Update: ' + timer.description + '\nTime Remaining: ' + formatTimer(timer.currentTimeLeft));
  
  var delay = nextUpdate(timer.currentTimeLeft);
  timer.currentDelay = delay;
  timer.timeoutObj = setTimeout(processTimer, delay, timer);
}

function nextUpdate(currentTimeLeft) {
  if(currentTimeLeft <= 0) return 0;
  if(currentTimeLeft <= 5000) return 1000; // 5s.. 4s... 3s...
  if(currentTimeLeft <= 60000) return 15000; // 60s... 45s.. 30s..
  if(currentTimeLeft <= 300000) return 60000; // 5m... 4m... 3m...
  if(currentTimeLeft <= 3600000) return 300000; // 60m... 55m... 50m...
  return 900000; // 3h... 2h45m... 2h30m...
}

function findTimer(timerId) {
  return _.find(_timers, function(t) {
    return t.id == timerId;
  });
}

function formatTimer(timeLeft) {
  var seconds = parseInt((timeLeft/1000) % 60)
  var minutes = parseInt((timeLeft/(1000 * 60)) % 60)
  var hours = parseInt((timeLeft/(1000 * 60 * 60)) % 24);
  
  var str = '';
  if(hours > 0) {
    str = hours + 'h ' + minutes + 'm';
  } else if(minutes > 0) {
    str = minutes + 'm';
  } else {
    str = seconds + 's';
  }

  return str;
}

