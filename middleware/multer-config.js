const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');


// associe les types MIME des images à leurs extensions correspondantes
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};
// Configuration du stockage des fichiers avec Multer
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      // Répertoire de destination des fichiers
      callback(null, 'images');
    },
    filename: (req, file, callback) => {
      const name = file.originalname.split(' ').join('_');
      const extension = MIME_TYPES[file.mimetype];
      // Nom du fichier final avec une date pour éviter les doublons
      callback(null, name + Date.now() + '.' + extension);
    }
});

//téléchargement d'un seul fichier
const upload = multer({ storage: storage }).single('image');

// Redimensionner l'image avant de la stocker
const resizeImage = (req, res, next) => {
  if (!req.file) {
    console.log('Aucun fichier trouvé.');
    return next();
  }

  // Chemin du fichier d'origine
  const imagePath = req.file.path;
  // Modifier le nom de l'image redimentionner en ajoutant '.resized'
  const resizedImagePath = imagePath + '.resized';

    // traiter l'image sur le fichier 'imagePath' et la redimensionner avec .resize() et l'enregistrer avec .toFile()
  sharp(imagePath)
    .resize(210, 300)
    .toFile(resizedImagePath, (error, info) => {
      if (error) {
        console.log('Erreur lors du redimensionnement de l\'image:', error);
        return res.status(500).json({ error });
      }
      console.log('Image redimensionnée avec succès.');

      // Supprimer l'image originale
      fs.unlink(imagePath, (error) => {
        if (error) {
          console.log('Erreur lors de la suppression de l\'image originale:', error);
          return res.status(500).json({ error });
        }
        console.log('Image originale supprimée.');
          // Renommer le fichier redimensionné en supprimant l'extension ".resized"
          fs.rename(resizedImagePath, imagePath, (error) => {
            if (error) {
              return res.status(500).json({ error });
            }
            console.log('L\'image redimentionnée est renommée.');
        next();
      });
      });
    });
};

module.exports = { upload, resizeImage };


