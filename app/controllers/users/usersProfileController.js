(function() {
  "use strict";

  /*
  Module dependencies.
   */
  var User, errorHandler, mongoose, passport, _;

  _ = require("lodash");

  errorHandler = require("../errorsController.js");

  mongoose = require("mongoose");

  passport = require("passport");

  User = mongoose.model("User");


  /*
  Update user details
   */

  exports.update = function(req, res) {
    var message, user;
    user = req.user;
    message = null;
    delete req.body.roles;
    if (user) {
      user = _.extend(user, req.body);
      user.updated = Date.now();
      user.displayName = user.firstName + " " + user.lastName;
      user.save(function(err) {
        if (err) {
          res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          req.login(user, function(err) {
            if (err) {
              res.status(400).send(err);
            } else {
              res.json(user);
            }
          });
        }
      });
    } else {
      res.status(400).send({
        message: "User is not signed in"
      });
    }
  };


  /*
  Send User
   */

  exports.me = function(req, res) {
    res.json(req.user || null);
  };

}).call(this);
