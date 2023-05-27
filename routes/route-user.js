const express = require('express');
const router = express.Router();
const authLimiter = require('../middleware/rate-limit');
const controllerUser = require('../controllers/controller-user');
const middleJoi = require('../middleware/joimiddl')

router.post('/signup', middleJoi.validateSignupLogin, controllerUser.signup);
router.post('/login', middleJoi.validateSignupLogin, authLimiter, controllerUser.login);

module.exports = router;