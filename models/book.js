const BOOK_GENRES = require("../constants/genres");
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
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
      type: [
        {
          type: String,
          enum: {
            values: BOOK_GENRES,
            message: "{VALUE} is not a valid book genre.",
          },
        },
      ],
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
    likedByUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikedByUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
