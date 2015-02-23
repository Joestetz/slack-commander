'use strict';

exports.joinArgs = function(args, start) {
  if(start >= args.length) return '';

  var str = '';
  for(var i = start; i < args.length; i++) {
    str += args[i];
    if(i < args.length - 1) {
      str += ' ';
    }
  }
};

exports.buildHelpCommand = function(name, usage, description) {
  return {
    fallback: 'Command: `' + usage + '` - ' + description,
    text: name,
    fields: [
      {
        title: 'Usage',
        value: '`' + usage + '`',
        'short': true
      },{
        title: 'Description',
        value: description,
        'short': true
      }
    ],
    mrkdwn_in: ['fallback', 'fields']
  };
};