/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Timer = require('./timer.model');

exports.register = function(socket) {
  Timer.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Timer.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('timer:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('timer:remove', doc);
}