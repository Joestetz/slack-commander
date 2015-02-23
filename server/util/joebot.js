'use strict';

var JoeBot;
var Slack = require('slack-node');
var Validator = require('./validator');

var validator = new Validator();

JoeBot = (function() {
  function JoeBot(bot_name, bot_emoji, respond_mode) {
    this.botName = bot_name || 'JoeBot';
    this.botEmoji = bot_emoji || ':panda_face:';
    this._respondMode = respond_mode || 2; // 0 = private, 1 = public, 2 = shout-able
  }
  
  JoeBot.prototype.setRespondMode = function(respond_mode) {
    this._respondMode = respond_mode || 2;
  };
  
  JoeBot.prototype.send = function(webhookUrl, channel, msg, attachments) {
    var options = {
      username: this.botName,
      icon_emoji: this.botEmoji,
      channel: channel,
      text: msg,
      attachments: attachments
    };
    
    var slack = new Slack();
    slack.setWebhook(webhookUrl);
    slack.webhook(options, function(err, response) {
      console.log(response);
    });
  };
  
  JoeBot.prototype.parseCommand = function(req) {
    if(!validator.isValidRequest(req)) {
      return false;
    }
    
    var res = {
      token: req.body.token,
      teamId: req.body.team_id,
      userId: req.body.user_id,
      userName: req.body.user_name,
      channel: req.body.channel_name,
      command: req.body.command,
      query: req.body.text
    };
    
    // direct message
    if(this._respondMode === 0) {
      res.channel = '@' + res.userName;
    }
    
    // channel message
    if(this._respondMode === 1) {
      res.channel = '@' + res.userName;
    }
    
    // direct message unless shout
    var commandArgs = req.body.text.split(' ');
    if(this._respondMode === 2) {
      if(commandArgs.length > 0 && commandArgs[0].toLowerCase() === 'shout') {
        commandArgs.shift();
      } else {
        res.channel = '@' + res.userName;
      }
    }
    
    if(commandArgs.length > 0) {
      res.subCommand = commandArgs[0].toLowerCase();
      commandArgs.shift();
    }
    
    res.commandArgs = commandArgs;
    return res;
  };
  
  return str;
}
  
  return JoeBot;
})();

module.exports = JoeBot;