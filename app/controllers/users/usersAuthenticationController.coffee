"use strict"

###
Module dependencies.
###
_ = require("lodash")
errorHandler = require("../errorsController")
mongoose = require("mongoose")
passport = require("passport")
User = mongoose.model("User")

###
Signup
###
exports.signup = (req, res) ->
  # For security measurement we remove the roles from the req.body object
  delete req.body.roles

  # Init Variables
  user = new User(req.body)
  message = null

  # Add missing user fields
  user.provider = "local"
  user.displayName = user.firstName + " " + user.lastName

  # Then save the user
  user.save (err) ->
    if err
      res.status(400).send message: errorHandler.getErrorMessage(err)
    else
      # Remove sensitive data before login
      user.password = `undefined`
      user.salt = `undefined`
      req.login user, (err) ->
        if err
          res.status(400).send err
        else
          res.json user
        return

    return

  return


###
Signin after passport authentication
###
exports.signin = (req, res, next) ->
  passport.authenticate("local", (err, user, info) ->
    if err or not user
      res.status(400).send info
    else
      # Remove sensitive data before login
      user.password = `undefined`
      user.salt = `undefined`
      req.login user, (err) ->
        if err
          res.status(400).send err
        else
          res.json user
        return

    return
  ) req, res, next
  return


###
Signout
###
exports.signout = (req, res) ->
  req.logout()
  res.redirect "/"
  return


###
OAuth callback
###
exports.oauthCallback = (strategy) ->
  (req, res, next) ->
    passport.authenticate(strategy, (err, user, redirectURL) ->
      return res.redirect("/#!/signin")  if err or not user
      req.login user, (err) ->
        return res.redirect("/#!/signin")  if err
        res.redirect redirectURL or "/"

      return
    ) req, res, next
    return


###
Helper function to save or update a OAuth user profile
###
exports.saveOAuthUserProfile = (req, providerUserProfile, done) ->
  unless req.user
    # Define a search query fields
    searchMainProviderIdentifierField = "providerData." + providerUserProfile.providerIdentifierField
    searchAdditionalProviderIdentifierField = "additionalProvidersData." + providerUserProfile.provider + "." + providerUserProfile.providerIdentifierField

    # Define main provider search query
    mainProviderSearchQuery = {}
    mainProviderSearchQuery.provider = providerUserProfile.provider
    mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField]

    # Define additional provider search query
    additionalProviderSearchQuery = {}
    additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField]

    # Define a search query to find existing user with current provider profile
    searchQuery = $or: [
      mainProviderSearchQuery
      additionalProviderSearchQuery
    ]
    User.findOne searchQuery, (err, user) ->
      if err
        done err
      else
        unless user
          possibleUsername = providerUserProfile.username or ((if (providerUserProfile.email) then providerUserProfile.email.split("@")[0] else ""))
          User.findUniqueUsername possibleUsername, null, (availableUsername) ->
            user = new User(
              firstName: providerUserProfile.firstName
              lastName: providerUserProfile.lastName
              username: availableUsername
              displayName: providerUserProfile.displayName
              email: providerUserProfile.email
              provider: providerUserProfile.provider
              providerData: providerUserProfile.providerData
            )

            # And save the user
            user.save (err) ->
              done err, user

            return

        else
          done err, user
      return

  else

    # User is already logged in, join the provider data to the existing user
    user = req.user

    # Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
    if user.provider isnt providerUserProfile.provider and (not user.additionalProvidersData or not user.additionalProvidersData[providerUserProfile.provider])

      # Add the provider data to the additional provider data field
      user.additionalProvidersData = {}  unless user.additionalProvidersData
      user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData

      # Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified "additionalProvidersData"

      # And save the user
      user.save (err) ->
        done err, user, "/#!/settings/accounts"

    else
      done new Error("User is already connected using this provider"), user
  return


###
Remove OAuth provider
###
exports.removeOAuthProvider = (req, res, next) ->
  user = req.user
  provider = req.param("provider")
  if user and provider

    # Delete the additional provider
    if user.additionalProvidersData[provider]
      delete user.additionalProvidersData[provider]

      # Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified "additionalProvidersData"
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

  return
