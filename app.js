const express = require('express');
const helmet = require('helmet');
const routeBook = require('./routes/route-book');
const routeUser = require('./routes/route-user');
const path = require('path');


const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use('/api/books', routeBook);
app.use('/api/auth', routeUser);
app.use('/images', express.static(path.join(__dirname, 'images')));




module.exports = app;
