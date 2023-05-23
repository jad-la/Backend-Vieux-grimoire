const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
 
module.exports = (req, res, next) => {
   try {

        // Récupère le jeton d'authentification en utilisant "split" pour divisé l'entete en 2 parties et on récupère la 2ème partie qui est le jeton
       const token = req.headers.authorization.split(' ')[1];
        //Le jeton est vérifié en utilisant la clé secrète TOKEN_SECRET récupérée à partir des variables d'environnement
       const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        // Extrait userId du jeton décodé
       const userId = decodedToken.userId;
        //userId est ajouté à "req.auth" pour qu'il soit disponible dans les prochaines étapes    
       req.auth = {
           userId: userId
       };
       
       // Passe à la prochaine étape 
	    next();
   } catch(error) {
       res.status(401).json({ error });
   }
};