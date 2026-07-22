const User = require("../models/user");
const Book = require("../models/book");
const Comment = require("../models/comment");
const multer = require("multer");
const cloudinary = require("../config/cloudinary.js");
const upload = require("../config/multer.js");

const showAllBooks = async (req, res) => {
  const foundBooks = await Book.find({});
  const allUsers = await User.find();
  console.log(foundBooks);
  res.render("books/index.ejs", {
    books: foundBooks,
    allUsers,
    pageTitle: "Index",
  });
};
const showBook = async (req, res) => {
  console.log("book Id:  >>>", req.params.bookId);

  const currentBook = await Book.findById(req.params.bookId);
  const poserDetails = await User.findById(currentBook.userId);
  const postComments = await Comment.find({
    bookId: req.params.bookId,
  }).populate("userId");

  const dislikedByUser = false;
  const likedByUser = false;

  if (req.session.user) {
    const likedByUser = await currentBook.likedByUsers.some((user) => {
      return user.equals(req.session.user.id);
    });
    const dislikedByUser = await currentBook.dislikedByUsers.some((user) => {
      return user.equals(req.session.user.id);
    });
  }

  res.render("books/show.ejs", {
    book: currentBook,
    poster: poserDetails,
    comments: postComments,
    userHasLiked: likedByUser,
    userHasDisliked: dislikedByUser,
    pageTitle: currentBook.bookTitle,
  });
};
const showNewBook = async (req, res) => {
  res.render("books/new.ejs", { pageTitle: "Create a post" });
};
const showEditbook = async (req, res) => {
  const currentBook = await Book.findById(req.params.bookId);
  res.render("books/edit.ejs", {
    book: currentBook,
    pageTitle: `Edit ${currentBook.bookTitle}`,
  });
};
const addBook = async (req, res) => {
  try {
    if (!req.file) {
      return res.render("error.ejs", {
        msg: "Please select an image.",
        pageTitle: "Error",
      });
    }
    const uploadedImage = await uploadImage(req.file.buffer);

    let toupload = {};

    if (req.body.bookTitle) {
      toupload.bookTitle = req.body.bookTitle;
    } else {
      return res.render("error.ejs", {
        msg: "Please add the Book Title.",
        pageTitle: "Error",
      });
    }
    if (req.body.bookAuthor) {
      toupload.bookAuthor = req.body.bookAuthor;
    } else {
      return res.render("error.ejs", {
        msg: "Please add the Book Author.",
        pageTitle: "Error",
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
        pageTitle: "Error",
      });
    }

    if (req.body.summary) {
      toupload.summary = req.body.summary;
    } else {
      return res.render("error.ejs", {
        msg: "Please add the summary.",
        pageTitle: "Error",
      });
    }

    if (req.body.userThoughts) {
      toupload.userThoughts = req.body.userThoughts;
    } else {
      return res.render("error.ejs", {
        msg: "Please add the User Thoughts.",
        pageTitle: "Error",
      });
    }

    toupload.userId = req.session.user.id;

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
    const foundBook = await Book.findById(req.params.bookId);
    if (!foundBook) {
      return res.render("error.ejs", {
        msg: "Unable to find post.",
        pageTitle: "Error",
      });
    }
    console.log("book owner id:>>>>>>>>>>>>>>>>>>", foundBook.userId);
    console.log("session id:>>>>>>>>>>>>>>>>>>", req.session.user.id);

    if (!foundBook.userId.equals(req.session.user.id)) {
      return res.render("error.ejs", {
        msg: "You do not have the permission to edit this post.",
        pageTitle: "Error",
      });
    }

    let toupload = {};

    const oldPublicId = foundBook.bookCover?.publicId;

    if (req.file) {
      const uploadedImage = await uploadImage(req.file.buffer);

      foundBook.bookCover = {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      };
    }

    if (req.body.bookTitle) {
      foundBook.bookTitle = req.body.bookTitle;
    } else {
      return res.render("error.ejs", {
        msg: "Please add the Book Title.",
        pageTitle: "Error",
      });
    }
    if (req.body.bookAuthor) {
      foundBook.bookAuthor = req.body.bookAuthor;
    } else {
      return res.render("error.ejs", {
        msg: "Please add the Book Author.",
        pageTitle: "Error",
      });
    }

    foundBook.genre = [];

    if (req.body.genre) {
      if (Array.isArray(req.body.genre)) {
        req.body.genre.forEach((item) => {
          foundBook.genre.push(item);
        });
      } else {
        foundBook.genre.push(req.body.genre);
      }
    } else {
      return res.render("error.ejs", {
        msg: "Please select at least 1 genre.",
        pageTitle: "Error",
      });
    }

    if (req.body.summary) {
      foundBook.summary = req.body.summary;
    } else {
      return res.render("error.ejs", {
        msg: "Please add the summary.",
        pageTitle: "Error",
      });
    }

    if (req.body.userThoughts) {
      foundBook.userThoughts = req.body.userThoughts;
    } else {
      return res.render("error.ejs", {
        msg: "Please add the User Thoughts.",
        pageTitle: "Error",
      });
    }

    await foundBook.save();

    if (req.file && oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, {
          invalidate: true,
        });
      } catch (cloudinaryError) {
        console.log("Could not delete the old image:", cloudinaryError);
      }
    }

    res.redirect(`/books/${req.params.bookId}`);
  } catch (error) {
    console.log(error.message);
  }
};
const deleteBook = async (req, res) => {
  try {
    const bookToDelete = await Book.findById(req.params.bookId);
    const currentUser = await User.findById(req.session.user.id);
    if (!bookToDelete) {
      return res.render("error.ejs", {
        msg: "Post does not exist.",
        pageTitle: "Error",
      });
    }

    console.log("Current user is: >>>>>>>>>>>>>>>>>>>", currentUser);

    if (currentUser.role !== "admin") {
      if (!bookToDelete.userId.equals(req.session.user.id)) {
        return res.render("error.ejs", {
          msg: "You do not have permission to delete this post.",
          pageTitle: "Error",
        });
      }
    }

    if (bookToDelete.bookCover?.publicId) {
      await cloudinary.uploader.destroy(bookToDelete.bookCover.publicId, {
        invalidate: true,
      });
    }
    await bookToDelete.deleteOne();
    res.redirect("/books");
  } catch (error) {
    console.log(error);
    res.render("error.ejs", {
      msg: "The Post could not be deleted.",
      pageTitle: "Error",
    });
  }
};
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
const addLike = async (req, res) => {
  await Book.findByIdAndUpdate(req.params.bookId, {
    $push: { likedByUsers: req.params.userId },
  });

  res.redirect(`/books/${req.params.bookId}`);
};
const addislike = async (req, res) => {
  await Book.findByIdAndUpdate(req.params.bookId, {
    $push: { dislikedByUsers: req.params.userId },
  });

  res.redirect(`/books/${req.params.bookId}`);
};
const removelike = async (req, res) => {
  await Book.findByIdAndUpdate(req.params.bookId, {
    $pull: { likedByUsers: req.params.userId },
  });
  res.redirect(`/books/${req.params.bookId}`);
};
const removeDislike = async (req, res) => {
  await Book.findByIdAndUpdate(req.params.bookId, {
    $pull: { dislikedByUsers: req.params.userId },
  });
  res.redirect(`/books/${req.params.bookId}`);
};

module.exports = {
  showAllBooks,
  showBook,
  showNewBook,
  showEditbook,
  addBook,
  editBook,
  deleteBook,
  addLike,
  addislike,
  removelike,
  removeDislike,
};
