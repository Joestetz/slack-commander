'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TaskSchema = new Schema({
  name: { type: String, required: true },
  created: { type: Date, required: true, default: Date.now },
  author: { type: String, required: true },
  assignedTo: String,
  completed: Date,
  token: { type: String, required: true },
  teamId: { type: String, required: true }
});

module.exports = mongoose.model('Task', TaskSchema);