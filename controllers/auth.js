const User = require("../models/user");
const Book = require("../models/book");
const Comment = require("../models/comment");
const bcrypt = require("bcrypt");
const multer = require("multer");
const cloudinary = require("../config/cloudinary.js");

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

const home = (req, res) => {
  res.render("home.ejs", {
    user: req.session.user,
  });
};

const showSignUpForm = (req, res) => {
  res.render("auth/sign-up.ejs", {
    user: req.session.user,
  });
};

const signUp = async (req, res) => {
  const userInDatabase = await User.findOne({
    username: req.body.username,
  });
  const emailInDatabase = await User.findOne({
    email: req.body.email,
  });

  if (userInDatabase || emailInDatabase) {
    if (userInDatabase) {
      return res.render("error.ejs", {
        msg: "This username already exists",
      });
    } else if (emailInDatabase) {
      res.render("error.ejs", {
        msg: "This email already exists",
      });
    }
  } else if (req.body.password === req.body.confirmPassword) {
    console.log(
      `req.body.password: ${req.body.password}  +   req.body.confirmPassword: ${req.body.confirmPassword}`,
    );

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const userData = {
      email: req.body.email,
      username: req.body.username,
      password: hashedPassword,
    };

    const user = await User.create(userData);

    req.session.user = {
      username: user.username,
      id: user.id,
      image: user.profilePicture.url,
    };

    req.session.save(() => {
      res.redirect("/");
    });
  } else {
    console.log(
      `req.body.password: ${req.body.password}  +   req.body.confirmPassword: ${req.body.confirmPassword}`,
    );
    res.render("error.ejs", {
      msg: "Password and confirm password are not the same",
    });
  }
};

const showSignInForm = (req, res) => {
  res.render("auth/sign-in.ejs", {
    user: req.session.user,
  });
};

const signIn = async (req, res) => {
  const userInDatabase = await User.findOne({
    username: req.body.username,
  });

  if (!userInDatabase) {
    return res.send("User does not exist");
  }

  const validPassword = await bcrypt.compare(
    req.body.password,
    userInDatabase.password,
  );

  if (!validPassword) {
    return res.send("Login failed");
  }

  req.session.user = {
    username: userInDatabase.username,
    id: userInDatabase.id,
    image: userInDatabase.profilePicture.url,
  };

  req.session.save(() => {
    res.redirect("/");
  });
};

const signOut = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

const showEditUser = async (req, res) => {
  res.render("auth/edit-user.ejs", { user: req.session.user });
};

const editUser = async (req, res) => {
  try {
    let username;
    let CurrentPassword;
    let NewPassword;
    let confirmNewPassword;

    const currentUser = await User.findById(req.session.user.id);

    if (!currentUser) {
      return res.render("auth/sign-in.ejs");
    }

    if (req.body) {
      username = req.body.username;
      CurrentPassword = req.body.CurrentPassword;
      NewPassword = req.body.NewPassword;
      confirmNewPassword = req.body.confirmNewPassword;

      if (CurrentPassword) {
        const validPassword = bcrypt.compareSync(
          CurrentPassword,
          currentUser.password,
        );

        if (validPassword) {
          if (NewPassword === confirmNewPassword) {
            const newHashedPassword = await bcrypt.hash(NewPassword, 10);

            currentUser.password = newHashedPassword;
          } else {
            return res.render("error.ejs", {
              msg: "password and confirm password are not identical",
            });
          }
        } else {
          return res.render("error.ejs", {
            msg: "invalid password",
          });
        }
      }
    }

    if (username) {
      if (username !== currentUser.username) {
        const usernameExist = await User.findOne({
          username: req.body.username,
        });
        if (!usernameExist) {
          currentUser.username = username;
          req.session.user.username = username;
        } else {
          return res.render("error.ejs", {
            msg: "Username is taken",
          });
        }
      }
    }
    const oldPublicId = currentUser.profilePicture?.publicId;
    if (req.file) {
      const uploadedImage = await uploadImage(req.file.buffer);

      currentUser.profilePicture = {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      };

      req.session.user.image = currentUser.profilePicture.url;

      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId, {
            invalidate: true,
          });
        } catch (cloudinaryError) {
          console.log("Could not delete the old image:", cloudinaryError);
        }
      }
    }

    const print = await currentUser.save();

    req.session.save(() => {
      res.redirect("/");
      console.log("session saved");
    });
  } catch (error) {
    console.log(error);
  }
};

const dashboard = async (req, res) => {
  const allUsers = await User.find();
  const allBooks = await Book.find();
  const allComments = await Comment.find();
  console.log('++=================================++',allUsers);
  console.log('++=================================++',allBooks);
  console.log('++=================================++',allComments);
  
  res.render("dashboard.ejs", {
    allUsers,
    allBooks,
    allComments,
  });
};

module.exports = {
  home,
  showSignUpForm,
  signUp,
  showSignInForm,
  signIn,
  signOut,
  showEditUser,
  editUser,
  dashboard,
};
