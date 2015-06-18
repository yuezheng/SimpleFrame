"use strict"

###
Module dependencies.
###
_ = require("lodash")
errorHandler = require("../errorsController")
mongoose = require("mongoose")
passport = require("passport")
User = mongoose.model("User")
nodemailer = require("nodemailer")
async = require("async")
crypto = require("crypto")

###
Forgot for reset password (forgot POST)
###
exports.forgot = (req, res, next) ->
  async.waterfall [

    # Generate random token
    (done) ->
      crypto.randomBytes 20, (err, buffer) ->
        token = buffer.toString("hex")
        done err, token
        return

    # Lookup user by username
    (token, done) ->
      if req.body.username
        User.findOne
          username: req.body.username
        , "-salt -password", (err, user) ->
          unless user
            res.status(400).send message: "No account with that username has been found"
          else if user.provider isnt "local"
            res.status(400).send message: "It seems like you signed up using your " + user.provider + " account"
          else
            user.resetPasswordToken = token
            user.resetPasswordExpires = Date.now() + 3600000 # 1 hour
            user.save (err) ->
              done err, token, user
              return

          return

      else
        return res.status(400).send(message: "Username field must not be blank")
    (token, user, done) ->
      res.render "templates/reset-password-email",
        name: user.displayName
        appName: 'ecmaster'
        url: "http://" + req.headers.host + "/auth/reset/" + token
      , (err, emailHTML) ->
        done err, emailHTML, user
        return

    # If valid email, send reset email using service
    (emailHTML, user, done) ->
      smtpTransport = nodemailer.createTransport(config.mailer.options)
      mailOptions =
        to: user.email
        from: config.mailer.from
        subject: "Password Reset"
        html: emailHTML

      smtpTransport.sendMail mailOptions, (err) ->
        res.send message: "An email has been sent to " + user.email + " with further instructions."  unless err
        done err
        return

  ], (err) ->
    next err  if err

  return


###
Reset password GET from email token
###
exports.validateResetToken = (req, res) ->
  User.findOne
    resetPasswordToken: req.params.token
    resetPasswordExpires:
      $gt: Date.now()
  , (err, user) ->
    return res.redirect("/#!/password/reset/invalid")  unless user
    res.redirect "/#!/password/reset/" + req.params.token
    return

  return


###
Reset password POST from email token
###
exports.reset = (req, res, next) ->

  # Init Variables
  passwordDetails = req.body
  async.waterfall [
    (done) ->
      User.findOne
        resetPasswordToken: req.params.token
        resetPasswordExpires:
          $gt: Date.now()
      , (err, user) ->
        if not err and user
          if passwordDetails.newPassword is passwordDetails.verifyPassword
            user.password = passwordDetails.newPassword
            user.resetPasswordToken = `undefined`
            user.resetPasswordExpires = `undefined`
            user.save (err) ->
              if err
                res.status(400).send message: errorHandler.getErrorMessage(err)
              else
                req.login user, (err) ->
                  if err
                    res.status(400).send err
                  else
                    # Return authenticated user
                    res.json user
                    done err, user
                  return

              return

          else
            res.status(400).send message: "Passwords do not match"
        else
          res.status(400).send message: "Password reset token is invalid or has expired."
        return

    (user, done) ->
      res.render "templates/reset-password-confirm-email",
        name: user.displayName
        appName: 'ecmaster'
      , (err, emailHTML) ->
        done err, emailHTML, user
        return

    # If valid email, send reset email using service
    (emailHTML, user, done) ->
      smtpTransport = nodemailer.createTransport(config.mailer.options)
      mailOptions =
        to: user.email
        from: config.mailer.from
        subject: "Your password has been changed"
        html: emailHTML

      smtpTransport.sendMail mailOptions, (err) ->
        done err, "done"
        return

  ], (err) ->
    next err  if err

  return


###
Change Password
###
exports.changePassword = (req, res) ->
  # Init Variables
  passwordDetails = req.body
  if req.user
    if passwordDetails.newPassword
      User.findById req.user.id, (err, user) ->
        if not err and user
          if user.authenticate(passwordDetails.currentPassword)
            if passwordDetails.newPassword is passwordDetails.verifyPassword
              user.password = passwordDetails.newPassword
              user.save (err) ->
                if err
                  res.status(400).send message: errorHandler.getErrorMessage(err)
                else
                  req.login user, (err) ->
                    if err
                      res.status(400).send err
                    else
                      res.send message: "Password changed successfully"
                    return

                return

            else
              res.status(400).send message: "Passwords do not match"
          else
            res.status(400).send message: "Current password is incorrect"
        else
          res.status(400).send message: "User is not found"
        return

    else
      res.status(400).send message: "Please provide a new password"
  else
    res.status(400).send message: "User is not signed in"
  return
