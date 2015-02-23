'use strict';

var _ = require('lodash');
var request = require('request');
var Slack = require('slack-notify')('https://hooks.slack.com/services/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');

var _apiUrl = 'http://api.brewerydb.com/v2';
var _apiKey = '2472cc65cb88495708d1130e70db9f56'

exports.index = function(req, res) {
  var parsed = parseCommand(req);
  if(parsed.error) { return handleError(res, 'Expected parameters not found'); }
  
  searchBeer(res, parsed);
};

function sendWebhook(commandObj, attachments, msg) {
  msg = 'Visit http://joestetz.com/showcase/slackCommander/beer for more details\n' + msg;
  var options = {
    username: 'BeerBot',
    icon_emoji: ':beer:',
    channel: '#' + commandObj.channel,
    text: msg
  };
  
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
  if(!req.body.token || !req.body.team_id || !req.body.user_name || !req.body.channel_name || !req.body.user_id || !req.body.text) {
    return { error: true };
  }
  
  var res = {
    error: false,
    token: req.body.token,
    teamId: req.body.team_id,
    user: req.body.user_name,
    channel: req.body.channel_name,
    userId: req.body.user_id,
    query: req.body.text
  };
  
  return res;
}

function searchBeer(res, commandObj) {
  if(!commandObj.query || commandObj.query.length < 5) return handleError(res, 'query must be at least 5 characters');
  
  request(_apiUrl + '/search?p=1&type=beer&q=' + commandObj.query + '&key=' + _apiKey, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var jsonBody = JSON.parse(body);
      if(jsonBody.data && jsonBody.data.length > 0) {
        sendFormattedBeer(commandObj, jsonBody.data[0]);
        handleSuccess(res);
      } else {
        handleError(res, 'Beer not found');
      }
    } else {
      handleError(res, 'Unexpected error');
    }
  });
}

function sendFormattedBeer(commandObj, beerObj) {
  var attachment = {
    fallback: beerObj.name + ' - ' + beerObj.description,
    title: beerObj.name,
    text: beerObj.description,
    fields: [
      {
        title: 'Style',
        value: beerObj.style.name,
        'short': true
      },
      {
        title: 'Category',
        value: beerObj.style.category.name,
        'short': true
      },
      {
        title: 'ABV',
        value: beerObj.abv,
        'short': true
      },{
        title: 'Recommended Glass',
        value: beerObj.glass ? beerObj.glass.name : 'N/A',
        'short': true
      }
    ]
  };
  
  sendWebhook(commandObj, [attachment], '@' + commandObj.user + ' is drinking...');
}
