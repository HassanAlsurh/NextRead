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
    res.redirect(`/books/${req.params.bookId}`)
  } catch (error) {
    console.log(error)
  }
};

const editComment = async (req, res) => {
  res.send("edited the comment!");
};
const deleteComment = async (req, res) => {
  res.send("deleted the comment!");
};
module.exports = { newComment, editComment, deleteComment };
