/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Jira = require('./jira.model');

exports.register = function(socket) {
  Jira.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Jira.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('jira:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('jira:remove', doc);
}