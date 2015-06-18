"use strict"

###
Module dependencies.
###
_ = require("lodash")
errorHandler = require("../errorsController.js")
mongoose = require("mongoose")
passport = require("passport")
User = mongoose.model("User")

###
Update user details
###
exports.update = (req, res) ->
  # Init Variables
  user = req.user
  message = null
  # For security measurement we remove the roles from the req.body object
  delete req.body.roles

  if user
    # Merge existing user
    user = _.extend(user, req.body)
    user.updated = Date.now()
    user.displayName = user.firstName + " " + user.lastName
    user.save (err) ->
      if err
        res.status(400).send message: errorHandler.getErrorMessage(err)
      else
        req.login user, (err) ->
          if err
            res.status(400).send err
          else
            res.json user
          return

      return

  else
    res.status(400).send message: "User is not signed in"
  return


###
Send User
###
exports.me = (req, res) ->
  res.json req.user or null
  return
