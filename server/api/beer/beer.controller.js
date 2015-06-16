'use strict';

var _ = require('lodash');
var request = require('request');
var Slack = require('slack-notify')('https://hooks.slack.com/services/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');

var _clientId = 'B1B3E4CDDEA6A1EE1D52FA2990B9D2D1DE79A636';
var _clientSecret = '49A90FC44DA1A142F6816FDCBEFF7ADFF832972B';
var _apiUrl = 'https://api.untappd.com/v4/';

exports.index = function(req, res) {
  var parsed = parseCommand(req);
  if(parsed.error) { return handleError(res, 'Expected parameters not found'); }
  
  searchBeer(res, parsed);
};

function sendWebhook(commandObj, attachments, msg) {
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
  
  request(_apiUrl + 'search/beer?q=' + commandObj.query + '&limit=1&client_id=' + _clientId + '&client_secret=' + _clientSecret, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var jsonBody = JSON.parse(body);
      if(jsonBody && jsonBody.response && jsonBody.response.beers.count > 0) {
        sendFormattedBeer(commandObj, jsonBody.response.beers.items[0]);
        handleSuccess(res);
      } else {
        handleError(res, 'Beer not found');
      }
    } else {
      handleError(res, 'Ooops! Unexpected error');
    }
  });
}

function sendFormattedBeer(commandObj, beerObj) {
  var attachments = [{
    fallback: beerObj.beer.beer_name + ' - ' + beerObj.beer.beer_description,
    title: beerObj.beer.beer_name,
    text: beerObj.beer.beer_description,
    thumb_url: beerObj.brewery.brewery_label,
    fields: [
      {
        title: 'Brewery Name',
        value: formatName(beerObj.brewery),
        'short': true
      },{
        title: 'Brewery Location',
        value: formatLocation(beerObj.brewery.location.brewery_city, beerObj.brewery.location.brewery_state, beerObj.brewery.country_name),
        'short': true
      },{
        title: 'Style',
        value: beerObj.beer.beer_style,
        'short': true
      },{
        title: 'ABV / IBU',
        value: beerObj.beer.beer_abv + ' / ' + beerObj.beer.beer_ibu,
        'short': true
      }
    ]
  },{
    fallback: '',
    title: 'BeerBot - now with untappd potential!',
    text: 'Visit http://joestetz.com/showcase/slackCommander/beer for more details'
  }];
  
  sendWebhook(commandObj, attachments, '@' + commandObj.user + ' is drinking...');
}

function formatLocation(city, state, country) {
  var str = '';
  
  if(city && city !== '') {
    str += city;
  }
  
  if(state && state !== '') {
    if(str.length > 0) str += ', ';
    str += state;
  }
  
  if(country && country !== '') {
    if(str.length > 0) str += ', ';
    str += country;
  }
  
  return str;
}

function formatName(brewery) {
  var str = brewery.brewery_name;
  
  if(brewery.contact && brewery.contact.url) {
    str = '<' + brewery.contact.url + '|' + str + '>';
  }
  
  return str;
}