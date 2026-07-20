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
    
}
module.exports = {
  showAllBooks,
  showBook,
  showNewBook,
  showEditbook,
  addBook,
};
