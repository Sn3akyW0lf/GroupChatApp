const express = require("express");
const User = require("../src/models/signup");
const Message = require("../src/models/message");
const { Op } = require("sequelize");

exports.getUsers = async (req, res, next) => {
  User.findAll({
    where: {
      id: {
        [Op.ne]: req.id,
      },
    },
  }).then((users) => {
    res.status(200).json({
      success: true,
      users: users,
      message: "users send successfully",
    });
  });
};

exports.getChat = async (req, res, next) => {
  const lastMsg = +req.query.lastMsg;

  await Message.findAll({ where: { id: { [Op.gt]: lastMsg } } })
    .then((messages) => {
      res.status(200).json({
        success: true,
        chat: messages,
        message: "Chat Sent Successfully",
      });
    })
    .catch((err) => {
      res
        .status(403)
        .json({ success: true, error: err, message: "Something Went Wrong" });
    });
};

exports.postChat = async (req, res, next) => {
  const id = req.id;
  const msg = req.body.message;

  const user = await User.findOne({ where: { id: id } })
    .then((user) => {
      return user.name;
    })
    .catch(() => {
      console.log("Error in post chat");
    });

  await Message.create({ username: user, message: msg, userId: id }).then(
    (result) => {
      return res
        .status(201)
        .json({ result: result, success: true, message: "Message Saved" });
    }
  );
};
