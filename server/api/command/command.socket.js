/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Command = require('./command.model');

exports.register = function(socket) {
  Command.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Command.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('command:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('command:remove', doc);
}