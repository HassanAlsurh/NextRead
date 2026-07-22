const User = require("../models/user");

const passRoleToView = async (req, res, next) => {
  let admin = false;
  if (req.session.user) {
    const currentUser = await User.findById(req.session.user.id);
    if (currentUser && currentUser.role === "admin") {
      admin = true;
    }
  }

  res.locals.admin = admin;
  next();
};

module.exports = passRoleToView;
