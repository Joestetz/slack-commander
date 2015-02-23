'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LoggerSchema = new Schema({
  userId: String,
  userName: String,
  timestamp: { type: Date, required: true, default: Date.now },
  logType: { type: String, required: true },
  logMessage: String
});

module.exports = mongoose.model('Logger', LoggerSchema);