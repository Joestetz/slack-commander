'use strict';

var _ = require('lodash');
var schedule = require('node-schedule');
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
    case 'end':
      commandResponse = cmdEnd(res, parsed);
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
  if(!req.body.token || !req.body.team_id || !req.body.user_name || !req.body.channel_name) {
    return { error: true };
  }
  
  var res = {
    error: false,
    token: req.body.token,
    teamId: req.body.team_id,
    user: req.body.user_name,
    channel: req.body.channel_name,
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

function cmdStart(commandObj, res) {

}

function cmdEdit(commandObj, res) {

}

function cmdEnd(commandObj, res) {

}

function cmdHelp(commandObj, res) {
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
      fallback: 'Command: /timer [shout] start h:m:s description - Starts a timer, optionally displayed for entire channel with "shout" option.',
      text: 'Start Timer',
      fields: [
        {
          title: 'Usage',
          value: '/timer [shout] start h:m:s description',
          'short': true
        },{
          title: 'Description',
          value: 'Starts a timer, optionally displayed for entire channel with "shout" option.',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /timer edit timerId h:m:s - Edits the specified timer.',
      text: 'Edit Timer',
      fields: [
        {
          title: 'Usage',
          value: '/timer edit timerId h:m:s',
          'short': true
        },{
          title: 'Description',
          value: 'Edits the specified timer.',
          'short': true
        }
      ]
    },{
      fallback: 'Command: /timer end timerId - Ends the specified timer.',
      text: 'End Timer',
      fields: [
        {
          title: 'Usage',
          value: '/timer end timerId',
          'short': true
        },{
          title: 'Description',
          value: 'Ends the specified timer.',
          'short': true
        }
      ]
    }
  ];
  sendWebhook(commandObj, 'Usage: /timer [shout] [command] [args1..N]', attachments);
  
  return res.send(200);
}

