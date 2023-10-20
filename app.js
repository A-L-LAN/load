const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');

require('dotenv').config(); // Load environment variables from .env

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB using MongoDB Atlas (replace with your own connection string)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Create a schema for storing image details
const imageSchema = new mongoose.Schema({
  filename: String,
  path: String
});
const Image = mongoose.model('Image', imageSchema);

// Configure storage for image uploads
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 } // 10MB limit
}).single('image');

app.set('view engine', 'ejs');
app.use(express.static('./public'));

app.get('/', (req, res) => {
  Image.find({}, (err, images) => {
    res.render('index', { images });
  });
});

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render('index', { message: err });
    } else {
      if (!req.file) {
        res.render('index', { message: 'No file selected.' });
      } else {
        const image = new Image({
          filename: req.file.filename,
          path: req.file.path
        });
        image.save((err) => {
          if (err) {
            res.render('index', { message: 'Error uploading image.' });
          } else {
            res.redirect('/');
          }
        });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});