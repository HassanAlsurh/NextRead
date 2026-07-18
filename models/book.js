const mongoose = require("mongoose");

const booktSchema = new mongoose.Schema(
  {
    bookTitle: {
      type: String,
      required: true,
    },
    bookAuthor: {
      type: String,
      required: true,
    },
    bookCover: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
    },
    genre: {
      // type: enum!!,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    userThoughts: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("Book", booktSchema);

module.exports = Book;
