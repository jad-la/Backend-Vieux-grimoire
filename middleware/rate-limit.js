const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, 
  max: 5, 
  message: 'Trop de tentatives de connexion. Veuillez réessayer dans 30 minutes.',
});

module.exports = authLimiter;