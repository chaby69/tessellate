'use strict';
var fs = require('fs');
var http = require('http');
var Busboy = require('busboy');
var cloudinary = require('cloudinary');
var guestImageMaker = require('../../db/guestImageMaker');
var util = require('util');


cloudinary.config(require(__dirname + '/../../config/config').cloudinary);

module.exports = {

  getImages : function (req, res) {
    res.json({ image: {} });
  },  

  getImage : function (req, res) {
    res.json({ image: {} });
  },

  postImages : function (req, res, next) {
    // Look for facebookId on headers (Mobile) or
    // in cookies (Desktop)
    var facebookId;
    if (!!req.headers.facebookid){
      facebookId = req.headers.facebookid;
    } else {
      facebookId = req.user.facebookId;
    }
    // Look for image file on body (Mobile) or
    // req.file.path (Desktop)
    var imagePath;
    if (!!req.file.path){
      imagePath = req.file.path;
    } else {
      imagePath = JSON.parse(req.body).image;
    }

    var destinationRGB = JSON.parse(req.body.destinationRGB);

    cloudinary.uploader.upload(imagePath, function (result) {
      var tintedImages = [];
      for (var i = 0; i < destinationRGB.length; i++){ 
        guestImageMaker.analyzeGuestImage(req.params.eventId, facebookId, result, destinationRGB[i].value.originalRGB, function (err, image){
          tintedImages.push(image);
          console.log('tintedImages progress: ', tintedImages);
          console.log('tintedImages length: ', tintedImages.length);
          if (tintedImages.length === destinationRGB.length){
            res.json(tintedImages);
            res.end();
          }
          if (err){
            next(err);
          } 
        });
      }; 
    });

    // var busboy = new Busboy({ headers: req.headers });
    // var stream = cloudinary.uploader.upload_stream(function(result) {
    //   //TODO: write result to db
    //   res.json(result);
    // });

    // busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    //   file.pipe(stream);
    // });
    // busboy.on('finish', function() {
    //   res.writeHead(200, { 'Connection': 'close' });
    //   res.end("That's all folks!");
    // });
    // // return req.pipe(busboy);
    // req.pipe(busboy);

  },

  deleteImage: function (req, res) {
    res.json({ deleted: true });
  }

};

