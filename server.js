const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const authCtrl = require("./controllers/auth.js");
const booksCtrl = require("./controllers/books.js");
const commentsCtrl = require("./controllers/comments.js");
const isSignedIn = require("./middleware/is-signed-in.js");
const passUserToView = require("./middleware/pass-user-to-view.js");
const methodOverride = require("method-override");
const { MongoStore } = require("connect-mongo");

const upload = require("./config/multer");
const cloudinary = require("./config/cloudinary.js");

const session = require("express-session");
const mongoose = require("mongoose");
const express = require("express");
const morgan = require("morgan");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  }),
);

app.use(passUserToView);

app.get("/", authCtrl.home);
// Auth
app.get("/auth/sign-up", authCtrl.showSignUpForm);
app.post("/auth/sign-up", authCtrl.signUp);
app.get("/auth/sign-in", authCtrl.showSignInForm);
app.post("/auth/sign-in", authCtrl.signIn);
app.delete("/auth/sign-out", isSignedIn, authCtrl.signOut);
app.get("/auth/:userId", isSignedIn, authCtrl.showEditUser);
app.put(
  "/auth/:userId/edit",
  isSignedIn,
  upload.single("image"),
  authCtrl.editUser,
);
// Admin only
app.get("/dashboard", isSignedIn, authCtrl.dashboard); //maybe for later 'Wishlist "2"'====================================================================================
// Books
app.get("/books", booksCtrl.showAllBooks); //done
app.get("/books/new", isSignedIn, booksCtrl.showNewBook); //done
app.get("/books/:bookId", booksCtrl.showBook); //done
app.get("/books/:bookId/edit", isSignedIn, booksCtrl.showEditbook); //done
app.post("/books", isSignedIn, upload.single("image"), booksCtrl.addBook); //done
app.put('/books/:bookId',isSignedIn, upload.single("image"), booksCtrl.editBook) 
app.delete('/books/:bookId', isSignedIn, booksCtrl.deleteBook) 
// Interactions
app.put('/books/:bookId/like/:userId', isSignedIn, booksCtrl.addLike)
app.put('/books/:bookId/dislike/:userId', isSignedIn, booksCtrl.addislike)
app.delete('/books/:bookId/like/:userId', isSignedIn, booksCtrl.removelike)
app.delete('/books/:bookId/dislike/:userId', isSignedIn, booksCtrl.removeDislike)
// Comments
app.post('/books/:bookId/comments', isSignedIn, commentsCtrl.newComment)
app.put('/books/:bookId/comments/:commentId',  isSignedIn, commentsCtrl.editComment)
app.delete('/books/:bookId/comments/:commentId',  isSignedIn, commentsCtrl.deleteComment)


// =====================================================
app.get("/*splat", (req, res) => {
  res.render("error.ejs", {
    msg: '404 Not Found',
  });
});
// =====================================================
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log(`Connected to MongoDB: ${mongoose.connection.name}`);

    app.listen(PORT, () => {
      console.log(`Listening on ${PORT}`);
    });
  } catch (error) {
    console.log("MongoDB connection error:", error.message);
  }
};

startServer();
