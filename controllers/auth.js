const User = require("../models/user");
const bcrypt = require("bcrypt");

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
      username: req.body.username,
      password: hashedPassword,
    };

    const user = await User.create(userData);

    req.session.user = {
      username: user.username,
      id: user.id,
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

const dashboard = (req, res) => {
  res.render("dashboard.ejs", {
    user: req.session.user,
  });
};

module.exports = {
  home,
  showSignUpForm,
  signUp,
  showSignInForm,
  signIn,
  signOut,
  dashboard,
};
