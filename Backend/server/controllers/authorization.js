const express = require("express");
const User = require("../src/models/signup");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

///////////////////////////////////////////////
// signup
///////////////////////////////////////////////

exports.postSignup = (req, res, next) => {
  const { name, email, phone_number, password } = req.body;
  if (name.length == 0 || email.length == 0 || phone_number.length == 0) {
    return res
      .status(400)
      .json({ success: false, message: "Please Fill All the Details" });
  } else if (password.length <= 7) {
    return res
      .status(400)
      .json({ success: false, message: "Password Should be at Least 8 Characters Long" });
  }

  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      if (!err) {
        User.create({
          name: name,
          email: email,
          phone_number: phone_number,
          password: hash,
        })
          .then(() => {
            res
              .status(200)
              .json({ success: true, message: "Successfully Created Account" });
          })
          .catch((err) => {
            return res.status(400).json({
              success: false,
              message: "User Already Exists",
              error: err,
            });
          });
      } else {
        res.json({ message: "Password Hashing Problem" });
      }
    });
  });
};

///////////////////////////////////////////////
// login
///////////////////////////////////////////////

function generateAccessToken(id) {
  return jwt.sign(id, process.env.TOKEN_SECRET, { expiresIn: "24h" });
}

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findAll({ where: { email: email } })
    .then((user) => {
      if (user.length != 0) {
        bcrypt.compare(password, user[0].password, (err, result) => {
          if (!err) {
            const token = generateAccessToken({ id: user[0].id });
            return res.status(200).json({
              token: token,
              success: true,
              message: "Successfull Login",
            });
          } else if (err) {
            return res.status(402).json("Something Went Wrong");
          } else {
            return res.status(401).json({
              success: false,
              message: "Invalid Password",
            });
          }
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "User Not Found",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({
        message: "Something Went Wrong While Searching for the User",
        error: err,
      });
    });
};
