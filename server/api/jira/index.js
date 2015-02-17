'use strict';

var express = require('express');
var controller = require('./jira.controller');

var router = express.Router();

router.post('/', controller.jira);

module.exports = router;