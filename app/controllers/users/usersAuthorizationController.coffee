"use strict"

###
Module dependencies.
###
_ = require("lodash")
mongoose = require("mongoose")
User = mongoose.model("User")

###
User middleware
###
exports.userByID = (req, res, next, id) ->
  User.findOne(_id: id).exec (err, user) ->
    return next(err)  if err
    return next(new Error("Failed to load User " + id))  unless user
    req.profile = user
    next()
    return

  return


###
Require login routing middleware
###
exports.requiresLogin = (req, res, next) ->
  return res.status(401).send(message: "User is not logged in")  unless req.isAuthenticated()
  next()
  return


###
User authorizations routing middleware
###
exports.hasAuthorization = (roles) ->
  _this = this
  (req, res, next) ->
    _this.requiresLogin req, res, ->
      if _.intersection(req.user.roles, roles).length
        next()
      else
        res.status(403).send message: "User is not authorized"

    return
