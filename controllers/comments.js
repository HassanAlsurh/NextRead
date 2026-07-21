const User = require("../models/user");
const Book = require("../models/book");
const Comment = require("../models/comment");

const newComment = async (req, res) => {
  res.send("commented");
};
const showEditComment = async (req, res) => {
    res.send('editing')
}
const editComment = async (req, res) => {
    res.send('edited the comment!')
}
module.exports = { newComment, editComment };
