// 7th

// exports is for exporting more than one thing and export.modules is for exporting just a module

const User = require("../models/user");
const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");

exports.signup = (req, res) => {
  const { email } = req.body;
  // result of validations we did via check

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
      incorrect_feild: errors.array()[0].param,
    });
  }

  // lets check for email existence in db
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      const user = new User(req.body);
      user.save((err, user) => {
        if (err) {
          return res.status(400).json({
            message: "Not able to store user in DB",
            error: err,
          });
        }
        res.json({
          name: user.name,
          email: user.email,
          _id: user._id,
        });
      });
      // console.log(req.body);
      // res.json({
      //   message: "singup route works!",
      // });
    }
    if (user) {
      return res.status(400).json({
        error: "Email Already Exists in our Database",
      });
    }
  });
};

exports.signin = (req, res) => {
  // destructure or extract what we need from req.body
  const { email, password } = req.body;
  const errors = validationResult(req);

  // result of validations we did via check
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
      incorrect_feild: errors.array()[0].param,
    });
  }

  // lets check for email existence in db
  User.findOne({ email }, (err, user) => {
    if (err) {
      return res.status(400).json({
        error: "User Email does not exits . please sign up first...",
      });
    }
    if (!user) {
      return res.status(400).json({
        error: "No such user is present in our Database",
      });
    }

    // now lets check that password is correct or not
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error:
          "Email and Password does not match . Please provide correct Email and Password",
      });
    }

    // after al those checks means user is genuine
    // create token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);

    // put this token as cookie into users browser
    res.cookie("token", token, { expire: new Date() + 9999 });

    // send response to front end
    const { _id, name, email, role } = user;
    res.status(200).json({ token, user: { _id, name, email, role } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    learning: "This is how apis send json message from thier server",
    acheivements: "This is our own server which is behaving like an api",
    status: "user signed out successfully",
  });
};

// protected routes

// isSignedIn is like a middleware given by expressjst to check if the user is signed in or not via checking the req that it have the same authorization  provided by jwt based on the secret value or not
// if user is signedin then it allows to go through the routes mentioned next to it.
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  algorithms: ["HS256"],
  userProperty: "auth",
});

// custom middlewares ( we will code these by ourself )

exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};
exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "You are not Admin , ACCESS DENIED",
    });
  }
  next();
};
