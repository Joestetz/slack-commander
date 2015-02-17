'use strict';

var _ = require('lodash');
var request = require('request');
var Slack = require('slack-notify')('https://hooks.slack.com/services/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');

var _rootUrl = 'https://paylocity.atlassian.net';
var _authCode = 'am9lLnN0ZXR6ZXI6WkFRITJ3c3haQVEhMndzeA==';
var _colorInProgress = '#FFA500';
var _colorToDo = '#DDDDDD';
var _colorDone = '#00D000';

// Execute command
exports.index = function(req, res) {
  var parsed = parseCommand(req);
  if(parsed.error) { return handleError(res, 'Expected parameters not found'); }
  
  var commandResponse;
  switch(parsed.command) {
    case 'info':
      commandResponse = cmdInfo(res, parsed);
      break;
    case 'for':
      commandResponse = cmdFor(res, parsed);
      break;
    case 'top':
      commandResponse = cmdTop(res, parsed);
      break;
    case 'todo':
      commandResponse = cmdTodo(res, parsed);
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
    username: 'JiraBot',
    icon_url: 'https://slack.global.ssl.fastly.net/14542/img/services/jira_128.png',
    text: 'Visit http://joestetz.com/showcase/slackCommander/jira for more details\n' + msg,
    channel: '#' + commandObj.channel,
    attachments: attachments
  };
  
  if(!commandObj.shout) {
    options.channel = '@' + commandObj.user;
  }
  
  Slack.send(options);
}

function getStatusCategory(issue) {
  var statusCategory = issue.fields.status.statusCategory.name;
  
  if(statusCategory === 'In Progress') return 1;
  if(statusCategory === 'Done') return 2;
  return 0;
}

function getFormattedIssues(issues, moreInfo) {
  var attachments = []
  for(var i = 0; i < issues.length; i++) {
    var issue = issues[i];
    var statusCat = getStatusCategory(issue);
    var attach = {
      fallback: 'Issue ' + issue.key + ': ' + issue.fields.summary,
      title: 'Issue ' + issue.key + ': ' + issue.fields.summary,
      title_link: _rootUrl + '/browse/' + issue.key,
      text: issue.fields.description,
      color: (statusCat == 0) ? _colorToDo : (statusCat == 1 ? _colorInProgress : _colorDone)
    };
    
    if(moreInfo) {
      attach.fields = [
        {
          title: 'Status',
          value: issue.fields.status.name,
          'short': true
        },{
          title: 'Assignee',
          value: issue.fields.assignee.displayName + '(' + issue.fields.assignee.name + ')',
          'short': true
        }
      ];
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
  if(!req.body.token || !req.body.team_id || !req.body.user_name || !req.body.channel_name || !req.body.user_id || !req.body.text) {
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
  
  if(commandArgs.length <= 0 || commandArgs[0] === '') {
    return { error: true };
  }
  
  res.project = commandArgs[0];

  if(commandArgs[0].toLowerCase() === 'help') {
    res.command = commandArgs[0].toLowerCase();
    return res;
  }
  
  commandArgs.shift();
  if(commandArgs.length <= 0) {
    res.command = '';
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
      fallback: 'Command: `/jira help` - Displays list of available commands',
      text: 'Help',
      fields: [
        {
          title: 'Usage',
          value: '`/jira help`',
          'short': true
        },{
          title: 'Description',
          value: 'Displays list of available commands',
          'short': true
        }
      ],
      mrkdwn_in: ['fallback', 'fields']
    },{
      fallback: 'Command: `/jira [project] info [issueId]` - Displays information on the specified JIRA issue.',
      text: 'Issue Details Task',
      fields: [
        {
          title: 'Usage',
          value: '`/jira [project] info [issueId]`',
          'short': true
        },{
          title: 'Description',
          value: 'Displays information on the specified JIRA issue.',
          'short': true
        }
      ],
      mrkdwn_in: ['fallback', 'fields']
    },{
      fallback: 'Command: `/jira [project] for [jira username]` - Displays all in-progress tasks assigned to username.',
      text: 'View User\'s Assigned Tasks',
      fields: [
        {
          title: 'Usage',
          value: '`/jira [project] for [jira username]`',
          'short': true
        },{
          title: 'Description',
          value: 'Displays all in-progress tasks assigned to username.',
          'short': true
        }
      ],
      mrkdwn_in: ['fallback', 'fields']
    },{
      fallback: 'Command: `/jira [project] top [N] [status]` - Displays the top N priority items, optionally filtered by status.',
      text: 'Top Items',
      fields: [
        {
          title: 'Usage',
          value: '`/jira [project] top [N] [status]`',
          'short': true
        },{
          title: 'Description',
          value: 'Displays the top N priority items, optionally filtered by status.',
          'short': true
        }
      ],
      mrkdwn_in: ['fallback', 'fields']
    },{
      fallback: 'Command: `/jira [project] todo` - Displays all tasks that have not been started.',
      text: 'Unclaimed Items',
      fields: [
        {
          title: 'Usage',
          value: '`/jira [project] todo`',
          'short': true
        },{
          title: 'Description',
          value: 'Displays all tasks that have not been started.',
          'short': true
        }
      ],
      mrkdwn_in: ['fallback', 'fields']
    },{
      fallback: 'Command: `/jira [project] todo qa` - Displays open tasks in "Ready for QA" status.',
      text: 'Unassigned and Ready for QA',
      fields: [
        {
          title: 'Usage',
          value: '`/jira [project] todo qa`',
          'short': true
        },{
          title: 'Description',
          value: 'Displays open tasks in "Ready for QA" status.',
          'short': true
        }
      ],
      mrkdwn_in: ['fallback', 'fields']
    },{
      fallback: 'Command: `/jira [project] todo codereview` - Displays tasks that have not been code reviewed.',
      text: 'Code Review Needed',
      fields: [
        {
          title: 'Usage',
          value: '`/jira [project] todo codereview`',
          'short': true
        },{
          title: 'Description',
          value: 'Displays tasks that have not been code reviewed.',
          'short': true
        }
      ],
      mrkdwn_in: ['fallback', 'fields']
    },{
      fallback: 'Command: `/jira [project] todo po` - Displays all tasks ready for PO acceptance.',
      text: 'Ready for PO Acceptance',
      fields: [
        {
          title: 'Usage',
          value: '`/jira [project] todo po`',
          'short': true
        },{
          title: 'Description',
          value: 'Displays all tasks ready for PO acceptance.',
          'short': true
        }
      ],
      mrkdwn_in: ['fallback', 'fields']
    }
  ];
  sendWebhook(commandObj, attachments, 'Usage: `/jira [project] [command] [args1..N]`');
  
  return res.send(200);
}

function cmdInfo(res, commandObj) {
  if(commandObj.command !== 'info') return handleError(res, 'Unexpected command');
  if(commandObj.commandArgs.length == 0) {
    return handleError(res, 'You must specify an issueId');
  }
  
  var jql = 'Project = ' + commandObj.project + ' AND key = ' + commandObj.commandArgs[0];
  queryJira(res, commandObj, jql);
}

function cmdFor(res, commandObj) {
  if(commandObj.command !== 'for') return handleError(res, 'Unexpected command');
  if(commandObj.commandArgs.length == 0) {
    return handleError(res, 'You must specify a jira username');
  }
  
  var jql = 'Project = ' + commandObj.project + ' AND sprint in openSprints () AND assignee = ' + commandObj.commandArgs[0] + ' AND statusCategory != Done';
  queryJira(res, commandObj, jql);
}

function cmdTop(res, commandObj) {
  if(commandObj.command !== 'top') return handleError(res, 'Unexpected command');
  if(commandObj.commandArgs.length == 0 || isNaN(commandObj.commandArgs[0])) {
    return handleError(res, 'You must specify the number of issues');
  }
  
  var status;
  if(commandObj.commandArgs.length > 1) {
    status = joinArgs(commandObj.commandArgs, 1);
  }
  
  var maxResults = parseInt(commandObj.commandArgs[0]);
  var jql = 'Project = ' + commandObj.project + ' AND sprint in openSprints ()';
  if(status) {
    jql = jql + ' AND status = "' + status + '"';
  } else {
    jql = jql + ' AND statusCategory != Done';
  }
  jql = jql + ' ORDER BY priority';
  
  queryJira(res, commandObj, jql, maxResults);
}

function cmdTodo(res, commandObj) {
  if(commandObj.command !== 'todo') return handleError(res, 'Unexpected command');
  
  var todoType;
  if(commandObj.commandArgs && commandObj.commandArgs.length > 0) {
    todoType = commandObj.commandArgs[0].toLowerCase();
  } else {
    todoType = 'none';
  }
  
  var jql = 'Project = ' + commandObj.project + ' AND sprint in openSprints ()';
  switch(todoType){
    case 'none':
      jql = jql + ' AND status = "To Do"';
      break;
    case 'qa':
      jql = jql + ' AND status in ("Ready for QA", "Ready for QA to Break It!") AND assignee is EMPTY';
      break;
    case 'codereview':
      jql = jql + ' AND status in ("Ready for QA", "Ready for QA to Break It!", "In QA", "PO Accept Me") AND "Code Review" is EMPTY';
      break;
    case 'po':
      jql = jql + ' AND status = "PO Accept Me"';
      break;
    default:
      jql = jql + ' AND status = "To Do"';
      break;
  }
  queryJira(res, commandObj, jql);
}

function queryJira(res, commandObj, jql, maxResults) {
  if(maxResults) {
    maxResults = (maxResults > 50) ? 50 : maxResults;
  } else {
    maxResults = 5;
  }
  
  var options = {
    url: _rootUrl + '/rest/api/2/search',
    headers: {
      'Authorization': 'Basic ' + _authCode
    },
    json: true,
    method: 'post',
    body: {
      jql: jql,
      maxResults: maxResults
    }
  };
  
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      if(body.issues && body.issues.length > 0) {
        var attachments = getFormattedIssues(body.issues);
        sendWebhook(commandObj, attachments, '');
        handleSuccess(res);
      } else {
        handleError(res, 'Issue(s) not found');
      }
    } else {
      handleError(res, 'Unexpected error');
    }
  });
}

