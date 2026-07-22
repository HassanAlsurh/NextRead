const User = require("../models/user");
const Book = require("../models/book");
const Comment = require("../models/comment");

const newComment = async (req, res) => {
  try {
    let toUpload = {};

    if (req.body.commentContent) {
      toUpload.comment = req.body.commentContent;
    } else {
      return res.render("error.ejs", {
        msg: "Comment cannot be empty",
        pageTitle: "Error",
      });
    }

    if (req.session) {
      toUpload.userId = req.session.user.id;
    } else {
      return res.render("error.ejs", {
        msg: "Please log in to comment",
        pageTitle: "Error",
      });
    }

    if (req.params.bookId) {
      toUpload.bookId = req.params.bookId;
    } else {
      return res.render("error.ejs", {
        msg: "An error happened, please refresh the page!",
        pageTitle: "Error",
      });
    }

    await Comment.create(toUpload);
    res.redirect(`/books/${req.params.bookId}`);
  } catch (error) {
    console.log(error);
  }
};

const editComment = async (req, res) => {
  try {
    const commentToEdit = await Comment.findById(req.params.commentId);

    if (req.body.commentContent) {
      commentToEdit.comment = req.body.commentContent;
    } else {
      return res.render("error.ejs", {
        msg: "Comment cannot be empty",
        pageTitle: "Error",
      });
    }

    commentToEdit.save();

    res.redirect(`/books/${req.params.bookId}`);
  } catch (error) {
    console.log(error);
  }
};

const deleteComment = async (req, res) => {
  try {

    const commentToDelete = await Comment.findByIdAndDelete(
      req.params.commentId,
    );
    if (!commentToDelete) {
      return res.render("error.ejs", {
        msg: "Id not found",
        pageTitle: "Error",
      });
    }
    res.redirect(`/books/${req.params.bookId}`);
  } catch (error) {
    console.log(error);
  }
};
module.exports = { newComment, editComment, deleteComment };
