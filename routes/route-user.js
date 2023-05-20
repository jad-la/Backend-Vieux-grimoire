const express = require('express');
const router = express.Router();
const authLimiter = require('../middleware/rate-limit');
const controllerUser = require('../controllers/controller-user');

router.post('/signup',  controllerUser.signup);
router.post('/login', authLimiter, controllerUser.login);

module.exports = router;