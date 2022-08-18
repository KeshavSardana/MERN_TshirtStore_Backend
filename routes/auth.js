// 6th

const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const { signout, signup, signin, isSignedIn } = require("../controllers/auth");

router.post(
  "/signup",
  [
    check("name", "name should be atleast 3 chars").isLength({ min: 3 }),
    check("email", "email is not valid").isEmail(),
    check("password", "password should be atleast 5 char").isLength({ min: 5 }),
  ],
  signup
);

router.post(
  "/signin",
  [
    check("email", "email is not valid").isEmail(),
    check("password", "password feild is required").isLength({ min: 2 }),
  ],
  signin
);

router.get("/signout", signout);

router.get("/testroute", isSignedIn, (req, res) => {
  res.send("a protected route");
});

module.exports = router;
