const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const Joi = require('joi');
const { User } = require('../models/User');

// Schéma de validation avec Joi
const userValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required()
});


exports.signup = (req, res, next) => {

    // Extraire  la propriété error de l'objet retourné par la méthode validate (si des erreurs de validation existent, elles seront stockées dans la variable error)
    const { error } = userValidationSchema.validate(req.body);

    if (error) {
      // Vérification des erreurs de validation des données de l'utilisateur
      console.log('Erruer de validation =======>', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }
    // Hashage du mot de passe
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        // Création d'un nouvel utilisateur avec l'email et le mot de passe hashé
        const user = new User({
          email: req.body.email,
          password: hash
        });
        // Sauvegarde de l'utilisateur dans la base de données
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    const { error } = userValidationSchema.validate(req.body);

    if (error) {
      console.log('Erruer de validation =======>', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }
    // Recherche de l'utilisateur dans la base de données par son email 
    User.findOne({ email: req.body.email })
      .then(user => {
        if (user === null) {
           // Si l'utilisateur n'est pas trouvé => retourne un message d'erreur
          return res.status(401).json({ message: 'Paire identifiant et mot de passe incorrecte' });
        } else {
            // Sinon comparaison du mot de passe fourni avec le mot de passe hashé dans la base de données
            bcrypt.compare(req.body.password, user.password)
              .then(valid => {
                if (!valid) {
                  // Si les mots de passe ne correspondent pas => retourne un message d'erreur
                  return res.status(401).json({ message: 'Paire identifiant et mot de passe incorrecte' });
                } else {
                  // Sinon génération du token pour l'utilisateur
                  res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                      { userId: user._id },
                      process.env.TOKEN_SECRET,
                      { expiresIn: '24h' }
                    )
                  });
                }
              })
              .catch(error => res.status(500).json({ error }));
        }
      })
      .catch(error => res.status(500).json({ error }));
};
