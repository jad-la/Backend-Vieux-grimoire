const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');


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


const upload = multer({ storage: storage }).single('image');

// Redimensionner l'image
const resizeImage = (req, res, next) => {
    if (!req.file) {
      console.log('Aucun fichier trouvé.');
      return next();
    }

    // Chemin du fichier d'origine
    const imagePath = req.file.path;
    console.log(imagePath)
    // Modifier le nom de l'image redimentionner
    const resizedImagePath = `images/${Date.now()}-${Math.round(Math.random() * 1000000)}.webp`;

    // traitement de l'image sur le fichier 'imagePath' 
    sharp(imagePath)
      .resize(210, 300)
      .toFormat('webp')
      .toFile( resizedImagePath, (error, info) => {
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
            // Renommer le fichier redimensionné 
          fs.rename(resizedImagePath, imagePath , (error) => {
              if (error) {
                return res.status(500).json({ error });
              }
          console.log('L\'image redimentionnée est renommée.');
            });
          });
        });
        
        next();
};

module.exports = { upload, resizeImage };


