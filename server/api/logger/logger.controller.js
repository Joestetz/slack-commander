'use strict';

var _ = require('lodash');
var Logger = require('./logger.model');

exports.index = function(req, res) {
  Logger.find(function (err, loggers) {
    if(err) { return handleError(res, err); }
    return res.json(200, loggers);
  });
};

exports.error = function(msg, userId, userName) {
  var logEntry = {
    userId: userId || '',
    userName: userName || '',
    logType: 'Error',
    logMessage: msg || ''
  };
  
  return addEntry(logEntry);
};

exports.warn = function(msg, userId, userName) {
  var logEntry = {
    userId: userId || '',
    userName: userName || '',
    logType: 'Warning',
    logMessage: msg || ''
  };
  
  return addEntry(logEntry);
};

exports.info = function(msg, userId, userName) {
  var logEntry = {
    userId: userId || '',
    userName: userName || '',
    logType: 'Information',
    logMessage: msg || ''
  };
  
  return addEntry(logEntry);
};

function addEntry(logEntry) {
  Logger.create(logEntry, function(err, entry) {
    if(err) { return false; }
    return true;
  });
}

function handleError(res, err) {
  return res.send(500, err);
}