const express = require('express');
const controllerBook = require('../controllers/controller-book')
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const middleJoi = require('../middleware/joimiddl')



const router = express.Router();



router.post('/', auth, multer.upload, multer.resizeImage, middleJoi.validateCreate, controllerBook.createBook);
router.put('/:id', auth, multer.upload, multer.resizeImage, middleJoi.validateModif, controllerBook.modifBook);
router.post('/:id/rating', auth, middleJoi.validateRating, controllerBook.ajouterNote);
router.delete('/:id', auth, controllerBook.deleteBook);
router.get('/bestrating', controllerBook.getBooksByBestRating);
router.get('/:id', controllerBook.getOneBook);
router.get('/',  controllerBook.getAllBook);

module.exports= router;