const express = require('express');
const controllerBook = require('../controllers/controller-book')
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');


const router = express.Router();



router.post('/', auth, multer, controllerBook.createBook);
router.put('/:id', auth, multer, controllerBook.modifBook);
router.post('/:id/rating', auth, controllerBook.ajouterNote);
router.delete('/:id', auth, controllerBook.deleteBook);
router.get('/bestrating', controllerBook.getBooksByBestRating);
router.get('/:id', controllerBook.getOneBook);
router.get('/',  controllerBook.getAllBook);

module.exports= router;