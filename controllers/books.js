const User = require("../models/user");
const multer = require("multer");
const cloudinary = require("../config/cloudinary.js");

const showAllBooks = async (req, res) => {
  res.render("books/index.ejs");
};
const showBook = async (req, res) => {
  res.render("books/show.ejs");
};
const showNewBook = async (req, res) => {
  res.render("books/new.ejs");
};
const showEditbook = async (req, res) => {
  res.render("books/edit.ejs");
};
const addBook = async (req,res) => {
    try {
        let toupload = {}

        toupload.bookTitle = req.body.bookTitle
        toupload.bookAuthor = req.body.bookAuthor
        toupload.genre = []

        if (req.body.genre && req.body.genre.length > 1) {
            req.body.genre.forEach((item) => {
                toupload.genre.push(item)
            });
            
        }

        toupload.summary= req.body.summary
        toupload.userThoughts= req.body.userThoughts
        toupload.userId = req.session.user.id;


        // bookCover

        console.log(toupload)


    } catch (error) {
        console.log(error.message);
    }
}



const uploadImage = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "open-house/listings",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  showAllBooks,
  showBook,
  showNewBook,
  showEditbook,
  addBook,
};
