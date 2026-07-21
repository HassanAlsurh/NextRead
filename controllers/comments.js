const User = require("../models/user");
const Book = require("../models/book");
const Comment = require("../models/comment");

const newComment = async (req, res) => {
  try {
    let toUpload = {};
    toUpload.comment = req.body.commentContent;
    toUpload.userId = req.session.user.id;
    toUpload.bookId = req.params.bookId;

    await Comment.create(toUpload);
    res.redirect(`/books/${req.params.bookId}`);
  } catch (error) {
    console.log(error);
  }
};

const editComment = async (req, res) => {};
const deleteComment = async (req, res) => {
  try {
    console.log(req.params.commentId);

    const commentToDelete = await Comment.findByIdAndDelete(
      req.params.commentId,
    );
    if (!commentToDelete) {
      return res.render("error.ejs", {
        msg: "Id not found",
      });
    }
    res.redirect(`/books/${req.params.bookId}`);
  } catch (error) {
    console.log(error);
  }
};
module.exports = { newComment, editComment, deleteComment };
