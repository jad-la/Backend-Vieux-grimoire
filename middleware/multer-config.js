const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const { Console } = require('console');


// associe les types MIME des images à leurs extensions correspondantes
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};
// Configuration du stockage des fichiers avec Multer
const storage = multer.diskStorage({
  // Répertoire de destination des fichiers
  destination: 'images/', 
  filename: (req, file, cb) =>{
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1000000);
    const fileName = `${uniqueSuffix}.webp`;
    cb(null, fileName);
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
    console.log(imagePath)
    // Modifier le nom de l'image redimentionner en ajoutant '.resized'
    const resizedImagePath = `images/${Date.now()}-${Math.round(Math.random() * 1000000)}.webp`;

    // traiter l'image sur le fichier 'imagePath' et la redimensionner avec .resize() et l'enregistrer avec .toFile()
    sharp(imagePath)
      .resize(210, 300)
      .toFormat('webp')
      .toFile( resizedImagePath, (error, info) => {
        console.log('format image:', imagePath);
        if (error) {
          console.log('Erreur lors du redimensionnement de l\'image:', error);
          return res.status(500).json({ error });
        }
        console.log('Image redimensionnée avec succès.', info);

        // Supprimer l'image originale
        fs.unlink(imagePath, (error) => {
          if (error) {
            console.log('Erreur lors de la suppression de l\'image originale:', error);
            return res.status(500).json({ error });
          }
          console.log('Image originale supprimée.');
            // Renommer le fichier redimensionné en supprimant l'extension ".resized"
          fs.rename(resizedImagePath, imagePath , (error) => {
              if (error) {
                return res.status(500).json({ error });
              }
          console.log('L\'image redimentionnée est renommée.');
              // req.file.filename = imagePath + ".webp";
            });
          });
        });
        next();
};

module.exports = { upload, resizeImage };


