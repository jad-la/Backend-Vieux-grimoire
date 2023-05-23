const Book = require('../models/Book');
const fs = require('fs')
const Joi = require('joi');

const bookSchema = Joi.object({
  userId: Joi.string().required(),
  title: Joi.string().required(),
  author: Joi.string().required(),
  imageUrl: Joi.string().when('$method', {
    is: 'PUT',
    then: Joi.string().required(),
    otherwise: Joi.string()
  }),
  year: Joi.number().required(),
  genre: Joi.string().required(),
  ratings: Joi.array().items(
    Joi.object({
      userId: Joi.string(),
      grade: Joi.number()
    })
  ),
  averageRating: Joi.number()
});


exports.createBook = (req, res, next) => {
      console.log("log de req.body.book ===========>", req.body.book);
      const bookObject = JSON.parse(req.body.book);

      delete bookObject._id;
      delete bookObject._userId;


      console.log('Utilisateur actuel :', req.auth.userId);

      const { error } = bookSchema.validate(bookObject);
      if (error) {
        console.log('Erreur de validation <creation> =======>', error.details[0].message);
        return res.status(400).json({ error: error.details[0].message });
      }
      // Vérification si le champ file est rempli ou non
      if (!req.file) {
        return res.status(400).json({ error: "L'image du livre est requise" });
      }
      // Regex pour une recherche insensible à la casse
      const titleRegex = new RegExp(`^${bookObject.title}$`, 'i');

       // Vérifier si le titre du livre existe déjà dans la base de données
      Book.findOne({title: titleRegex })
        .then((Bookexistant) => {
            if (Bookexistant) {
              return res.status(400).json({ error: "Ce livre existe déjà" });
          }
          const book = new Book({
            // Copie toutes les propriétés de l'objet bookObject dans un nouvel objet book
            ...bookObject,
            // Assigner la valeur de la propriété _userId de l'objet 'req.auth' à la propriété '_userId' de l'objet 'book'
            _userId: req.auth._userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
          });
          // Vérifier que le userId correspond à celui de l'utilisateur authentifié
          if (book.userId !== req.auth.userId) {
            return res.status(401).json({ message: 'Non-autorisé' });
          }
          //  Enregistrer du 'book' dans la base de données
          book.save()
            .then(() => res.status(201).json({ message: 'Livre enregistré' }))
            .catch(error => res.status(400).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
        
      
};


exports.ajouterNote = (req, res, next) => {
      // Extrait les valeurs de "userId" et "rating" de la requête
      const { userId, rating } = req.body;
      // Vérification si l'utilisateur connecté est autorisé à noter le livre
      if (userId !== req.auth.userId) {
        return res.status(401).json({ message: "non autorisé!" });
      }
      
      // Ajout de la validation des données de notation avec Joi
      const ratingSchema = Joi.object({
        userId: Joi.string().required(),
        rating: Joi.number().required()
      });

      const { error } = ratingSchema.validate({ userId, rating });

      if (error) {
        console.log('Erreur de validation =======>', error.details[0].message);
        return res.status(400).json({ error: error.details[0].message });
      }
      // Recherche le livre correspondant à l'identifiant spécifié dans les paramètres de la requête
      Book.findOne({ _id: req.params.id })
        .then((book) => {
          console.log('book =====> ' + book);
          console.log({id: req.params.id});
          // Vérifier si l'utilisateur a déjà noté ce livre
          const dejaNoter = book.ratings.some((rating) => rating.userId === userId);

          // Si utilisateur a déja noté alors ==> retourner un message d'erreur
          if (dejaNoter) {
            console.log("Livre déjà noté");
            return res.status(400).json({ message: "Livre déjà noté" });
          }

  
          // Creation de 'newRting' qui contient 'userId' et la note attribué

          const newRating = {
            userId,
            grade: rating
          };
          // Ajout de 'newRating' à book.ratings
          book.ratings.push(newRating);
          console.log("Newrating=====>", newRating);

          // Supprimer la clé "_id" de chaque objet dans book.ratings
          book.ratings.forEach((rating) => {
            console.log('que contient rating.id ========>', rating.id);
            if (rating._id) {
            delete rating._id;
            }
            console.log('que contient rating._id ========>', rating._id);
          
          });
          console.log('Contenu de book.ratings après suppression de _id :', book.ratings);
        
      

          // Calcule de la nouvelle note moyenne
          // Nb de notation dans 'book.ratings'
          const nbNotation = book.ratings.length;
          //  Calcule la somme des notes attribuées par les utilisateurs pour ce livre en ajoutant la note 'rating.grade' donnée par l'utilisateur à la somme 'sum'
          const sommeNotes = book.ratings.reduce((sum, ratings) => sum + ratings.grade, 0);
          // Calcule de la moyenne en divisant la somme des notes par le nb de notation
          book.averageRating = sommeNotes / nbNotation;


          // enregistre le livre mis à jour dans la base de données
          book.save()
            .then((newbook) =>{
              console.log('le nouveau livre ======>', newbook)
              res.status(200).json(newbook);
            })
            .catch(error => res.status(401).json({ error }));
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ error });
        });
};

exports.modifBook = (req, res, next) => {

      // Extration de l'objet
      const bookObject = req.file
      // Si le champ file existe alors on extrait les données de 'req.body.book' en utilisant JSON.parse pour convertir la chaine json en objet JS
        ? {
            ...JSON.parse(req.body.book),
            // 'imageUrl contient l'URL de l'image avec : 
            // -'req.protocol' pour récupérer le protocole de la requête
            // -'req.get('host')' pour obtenir le nom d'hôte 
            // -'req.file.filename' pour obtenir le nom du fichier téléchargé
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
          }
          // Sinon recupere l'objet directement dans le corp de la requete
        : { ...req.body };

        delete bookObject._userId;

        // 'error' contient les erreurs de validation détectées s'il y en a 
        // 'value' contient les données validées du livre
      const { error, value } = bookSchema.validate(bookObject, { context: { $method: req.method } });
      
      if (error) {
        console.log('Erreur de validation <modifier> =======>', error.details[0].message);
        return res.status(400).json({ error: error.details[0].message });
      }


      // Recherche le livre dans la base de données en utilisant l'id
      Book.findOne({ _id: req.params.id })
        .then((book) => {
          console.log("le console log de =====>", book);
          console.log("le log de book pour userId=====>", bookObject._userId);
          // Si userId associer au livre est différente de l'userId l'utilisateur authentifié ===> alors n'est pas autorisé
          if (book.userId !== req.auth.userId) {
            return res.status(401).json({ message: 'Non-autorisé' });
          } else { 
          
            // Sinon alors mettre à jour le livre en utilisant les nouvelles données contenue dans 'value' et conserver l'id du livre
            console.log('value =========>', JSON.stringify(value));
            Book.updateOne({ _id: req.params.id }, { ...value, _id: req.params.id })
              .then(() => res.status(200).json({ message: 'Livre modifié' }))
              .catch((error) => res.status(401).json({ error }));
          }
        })
        .catch((error) => res.status(400).json({ error }));
};


exports.deleteBook = (req, res, next) =>{
    // Extraire l'id du livre à partir des paramètres de la requête
    const { id } = req.params;


    const idSchema = Joi.string().required();

    const { error } = idSchema.validate(id);

    if (error) {
      console.log('Erreur de validation =======>', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

  // Trouver le livre à supprimer
    Book.findOne({_id: id})
        .then(book =>{ 
            // Si userId associer au livre est différente de l'userId l'utilisateur authentifié ===> alors n'est pas autorisé à supprimer le livre
          if(book.userId != req.auth.userId){
            res.status(401).json({message: 'Non-autorisé'})
          }else{
            // On extrait le nom du fichier à partir de l'URL de l'image 
            const filename= book.imageUrl.split('/images/')[1];
            // Supprimer le fichier d'image associé au livre
            fs.unlink(`images/${filename}`, () =>{
              // Suppression du livre de la base de données
              Book.deleteOne({_id: req.params.id})
                .then(() => res.status(200).json({message: 'Livre supprimé'}))
                .catch(error => res.status(401).json({error}))
            })
          }
        }) 
        .catch(error => res.status(500).json({error}));
};
exports.getBooksByBestRating = (req, res, next) => {
    Book.find()
      // Trie les résultats  dans l'ordre décroissant pour obtenir les livres les mieux noté en premier
      .sort({ averageRating: -1 })
      // Limite le résultat rencyé à 3 livres
      .limit(3)
      // Exécute la requête et de retourner les résultats
      .exec()
      .then((books) => {
        res.status(200).json(books);
      })
      .catch((error) => {
        res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des livres.' });
      });
  };

exports.getOneBook = (req, res, next) => {
  // On extrait la valeur de l'id du livre à partir des paramètres de la requête
  const { id } = req.params;
  // Ensuite on cherche le livre correspondant à l'id
    Book.findOne({_id: id})
    // Renvoyer le livre trouvé 
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({error}));
};

exports.getAllBook = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({error}))
};