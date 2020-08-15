const express = require('express');
const router = express.Router();

const users = require('./controllers/users');
const tweets = require('./controllers/tweets');
const weather = require('./controllers/weather');

const looger = require('./middlewares/logger');

router.use(looger);
router.use('/users', users);
router.use('/tweets', tweets);
router.use('/weather', weather);

module.exports = router;
