const User = require("../models/user");
const Book = require("../models/book");
const multer = require("multer");
const cloudinary = require("../config/cloudinary.js");
const upload = require("../config/multer.js");

const showAllBooks = async (req, res) => {
  const foundBooks = await Book.find({});
  console.log(foundBooks);
  res.render("books/index.ejs", { books: foundBooks });
};
const showBook = async (req, res) => {
  console.log("book Id:  >>>", req.params.bookId);

  const currentBook = await Book.findById(req.params.bookId);
  res.render("books/show.ejs", { book: currentBook });
};
const showNewBook = async (req, res) => {
  res.render("books/new.ejs");
};
const showEditbook = async (req, res) => {
  const currentBook = await Book.findById(req.params.bookId);
  res.render("books/edit.ejs", {
    book: currentBook,
  });
};
const addBook = async (req, res) => {
  try {
    if (!req.file) {
      return res.render("error.ejs", {
        msg: "Please select an image.",
      });
    }
    const uploadedImage = await uploadImage(req.file.buffer);

    let toupload = {};

    if (req.body.bookTitle) {
      toupload.bookTitle = req.body.bookTitle;
    } else {
      return res.render("error.ejs", {
        msg: "Please add the Book Title.",
      });
    }
    if (req.body.bookAuthor) {
      toupload.bookAuthor = req.body.bookAuthor;
    } else {
      return res.render("error.ejs", {
        msg: "Please add the Book Author.",
      });
    }

    toupload.genre = [];

    if (req.body.genre) {
      if (Array.isArray(req.body.genre)) {
        req.body.genre.forEach((item) => {
          toupload.genre.push(item);
        });
      } else {
        toupload.genre.push(req.body.genre);
      }
    } else {
      return res.render("error.ejs", {
        msg: "Please select at least 1 genre.",
      });
    }

    if (req.body.summary) {
      toupload.summary = req.body.summary;
    } else {
      return res.render("error.ejs", {
        msg: "Please add the summary.",
      });
    }

    if (req.body.userThoughts) {
      toupload.userThoughts = req.body.userThoughts;
    } else {
      return res.render("error.ejs", {
        msg: "Please add the User Thoughts.",
      });
    }

    toupload.userId = req.session.user.id;

    // bookCover
    toupload.bookCover = {
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    };

    await Book.create(toupload);

    res.redirect("/books");
  } catch (error) {
    console.log(error.message);
  }
};

const editBook = async (req, res) => {
  try {
    let toupload = {};

    if (req.file) {
      const uploadedImage = await uploadImage(req.file.buffer);

      toupload.bookCover = {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      };
    }

    if (req.body.bookTitle) {
      toupload.bookTitle = req.body.bookTitle;
    } else {
      return res.render("error.ejs", {
        msg: "Please add the Book Title.",
      });
    }
    if (req.body.bookAuthor) {
      toupload.bookAuthor = req.body.bookAuthor;
    } else {
      return res.render("error.ejs", {
        msg: "Please add the Book Author.",
      });
    }

    toupload.genre = [];

    if (req.body.genre) {
      if (Array.isArray(req.body.genre)) {
        req.body.genre.forEach((item) => {
          toupload.genre.push(item);
        });
      } else {
        toupload.genre.push(req.body.genre);
      }
    } else {
      return res.render("error.ejs", {
        msg: "Please select at least 1 genre.",
      });
    }

    if (req.body.summary) {
      toupload.summary = req.body.summary;
    } else {
      return res.render("error.ejs", {
        msg: "Please add the summary.",
      });
    }

    if (req.body.userThoughts) {
      toupload.userThoughts = req.body.userThoughts;
    } else {
      return res.render("error.ejs", {
        msg: "Please add the User Thoughts.",
      });
    }

    toupload.userId = req.session.user.id;

    // await Book.create(toupload);
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.bookId,
      toupload,
    );

    res.redirect(`/books/${updatedBook._id}`);
  } catch (error) {
    console.log(error.message);
  }
};
const deleteBook = async (req, res) => {};

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
  editBook,
  deleteBook,
};
