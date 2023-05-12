const Book = require('../models/Book');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._useerId;
    const book = new Book({
        ...bookObject, 
        _useerId: req.auth._useerId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save()
        .then(()=> res.status(201).json({message: 'Livre enregistré'}))
        .catch(error => res.status(400).json({error}));

};
// controllers/livreController.js
exports.ajouterNote = (req, res, next) => {
    console.log('book id:', req.params.id);
    const { userId, rating } = req.body;
  
  
    Book.findOne({ _id: req.params.id })
      .then((book) => {
        console.log('book =====> ' + book);
        console.log({id: req.params.id});
        // Vérifier si l'utilisateur a déjà noté ce livre
        const dejaNoter = book.ratings.some((rating) => rating.userId === userId);
        if (dejaNoter) {
          console.log("Livre déjà noté");
          return res.status(400).json({ message: "Livre déjà noté" });
        }

        // Ajouter la nouvelle notation
        const newRating = {
          userId,
          grade: rating
        };
        book.ratings.push(newRating);
        console.log('rating book ======> ', book.ratings);

        // Calculer la nouvelle note moyenne
        const nbNotation = book.ratings.length;
        const sommeNotes = book.ratings.reduce((sum, ratings) => sum + ratings.grade, 0);
        book.averageRating = sommeNotes / nbNotation;

        book.save()
          .then((newbook) =>{
            console.log('le nouveau livre ======>', newbook)
            console.log('Moyenne des notes =======>', book.averageRating);
            res.status(200).json(newbook);
          })
          .catch(error => res.status(401).json({ error }));
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error });
      });
};

    
exports.modifBook= (req, res, next) =>{
  const bookObject = req.file?{
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  }: {...req.body};

  delete bookObject._useerId;
  Book.findOne({_id: req.params.id})
    .then((book)=>{
      if(book.userId != req.auth.userId){
        res.status(401).json({message: 'Non-autorisé'})
      }else{
        Book.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({message: 'Livre modifié'}))
          .catch(error => res.status(401).json({error}));
      }
    })
    .catch(error => res.status(400).json({error}));
};

exports.deleteBook = (req, res, next) =>{
    Book.deleteOne({_id: req.params.id})
        .then(() => res.status(200).json({message: 'Livre supprimé'}))
        .catch(error => res.status(400).json({error}));
};
exports.getBooksByBestRating = (req, res, next) => {
    Book.find()
      .sort({ averageRating: -1 })
      .limit(3)
      .exec()
      .then((books) => {
        res.status(200).json(books);
      })
      .catch((error) => {
        res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des livres.' });
      });
  };

exports.getOneBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({error}));
};

exports.getAllBook = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({error}))
};