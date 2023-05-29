const Joi = require('joi');

// Validation pour la création d'un livre
const validateCreate = (req, res, next) => {

    const bookSchemaC = Joi.object({
      userId: Joi.string().required(),
      title: Joi.string().required(),
      author: Joi.string().required(),
      year: Joi.number().required(),
      genre: Joi.string().required(),
      ratings: Joi.array().items(
        Joi.object({
          userId: Joi.string(),
          grade: Joi.number()
        })
      ),
      averageRating: Joi.number(),
    });

    try {
      if (!req.body || req.body.book === undefined || req.body.book === '') {
        console.log("Requête undefined ===========>", req.body.book);
        return res.status(400).json({ error: 'Requête invalide' });
      }
      const bookObject = JSON.parse(req.body.book);
      const { error } = bookSchemaC.validate(bookObject);
      if (error) {
        console.log('Erreur de validation (createBook) =======>', error.details[0].message);
        return res.status(400).json({ error: error.details[0].message });
      }
    } catch (error) {
      console.log('Erreur lors de la validation (createBook) :', error.message);
      return res.status(400).json({ error: 'Données invalides' });
    }
    next();
};

//Validation pour l'ajout d'une note à un livre
const validateRating = (req, res, next) => {

    const ratingSchema = Joi.object({
      userId: Joi.string().required(),
      rating: Joi.number().required()
    });

    const { error } = ratingSchema.validate(req.body);
    if (error) {
      console.log('Erreur de validation (ajouterNote) =======>', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

// Validation pour la modification d'un livre
const validateModif = (req, res, next) => {

    let bookObject;
    if (req.file) {
      // Si un fichier est présent dans la requête, alors on utilise JSON.parse(req.body.book)
      try {
        bookObject = JSON.parse(req.body.book);
      } catch (error) {
        console.log('Erreur dans le champ "book" :', error);
        return res.status(400).json({ error: 'Le champ "book" doit être un objet JSON valide' });
      }
    } else {
      // Si aucun fichier n'est présent, alors utiliser directement req.body
      bookObject = req.body;
    }
    
    const bookSchemaU = Joi.object({
      userId: Joi.string().optional(),
      title: Joi.string().optional(),
      author: Joi.string().optional(),
      imageUrl: Joi.string().optional(),
      year: Joi.number().optional(),
      genre: Joi.string().optional(),
    }).min(1).required();

    const { error } = bookSchemaU.validate(bookObject);
    if (error) {
      console.log('Erreur de validation (modifBook) =======>', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    };
    next();
};

// Validation pour l'inscription et la connexion
const validateSignupLogin = (req, res, next) => {
    const userValidationSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required()
    });
    const { error } = userValidationSchema.validate(req.body);

    if (error) {
        // Vérification des erreurs de validation des données de l'utilisateur
        console.log('Erruer de validation =======>', error.details[0].message);
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}


module.exports = {
  validateSignupLogin,
  validateCreate,
  validateRating,
  validateModif
}