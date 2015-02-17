/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Beer = require('./beer.model');

exports.register = function(socket) {
  Beer.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Beer.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('beer:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('beer:remove', doc);
}