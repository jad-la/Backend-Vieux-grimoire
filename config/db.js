const mongoose = require('mongoose');

const connectDB = async()=>{
    mongoose.connect(process.env.MONGO_URI,
        { useNewUrlParser: true,
        useUnifiedTopology: true })
        .then(() => console.log('Connexion à MongoDB réussie !'))
        .catch(() => console.log('Connexion à MongoDB échouée !'));

};


module.exports = connectDB;