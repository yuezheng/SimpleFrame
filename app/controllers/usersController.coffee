"use strict"

###
Module dependencies.
###
_ = require("lodash")

###
Extend user's controller
###
module.exports = _.extend(
  require("./users/usersAuthenticationController"),
  require("./users/usersAuthorizationController"),
  require("./users/usersPasswordController"),
  require("./users/usersProfileController")
)
