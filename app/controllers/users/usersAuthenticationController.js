(function() {
  "use strict";

  /*
  Module dependencies.
   */
  var User, errorHandler, mongoose, passport, _;

  _ = require("lodash");

  errorHandler = require("../errorsController");

  mongoose = require("mongoose");

  passport = require("passport");

  User = mongoose.model("User");


  /*
  Signup
   */

  exports.signup = function(req, res) {
    var message, user;
    delete req.body.roles;
    user = new User(req.body);
    message = null;
    user.provider = "local";
    user.displayName = user.firstName + " " + user.lastName;
    user.save(function(err) {
      if (err) {
        res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        user.password = undefined;
        user.salt = undefined;
        req.login(user, function(err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
        });
      }
    });
  };


  /*
  Signin after passport authentication
   */

  exports.signin = function(req, res, next) {
    passport.authenticate("local", function(err, user, info) {
      if (err || !user) {
        res.status(400).send(info);
      } else {
        user.password = undefined;
        user.salt = undefined;
        req.login(user, function(err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
        });
      }
    })(req, res, next);
  };


  /*
  Signout
   */

  exports.signout = function(req, res) {
    req.logout();
    res.redirect("/");
  };


  /*
  OAuth callback
   */

  exports.oauthCallback = function(strategy) {
    return function(req, res, next) {
      passport.authenticate(strategy, function(err, user, redirectURL) {
        if (err || !user) {
          return res.redirect("/#!/signin");
        }
        req.login(user, function(err) {
          if (err) {
            return res.redirect("/#!/signin");
          }
          return res.redirect(redirectURL || "/");
        });
      })(req, res, next);
    };
  };


  /*
  Helper function to save or update a OAuth user profile
   */

  exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {
    var additionalProviderSearchQuery, mainProviderSearchQuery, searchAdditionalProviderIdentifierField, searchMainProviderIdentifierField, searchQuery, user;
    if (!req.user) {
      searchMainProviderIdentifierField = "providerData." + providerUserProfile.providerIdentifierField;
      searchAdditionalProviderIdentifierField = "additionalProvidersData." + providerUserProfile.provider + "." + providerUserProfile.providerIdentifierField;
      mainProviderSearchQuery = {};
      mainProviderSearchQuery.provider = providerUserProfile.provider;
      mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];
      additionalProviderSearchQuery = {};
      additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];
      searchQuery = {
        $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
      };
      User.findOne(searchQuery, function(err, user) {
        var possibleUsername;
        if (err) {
          done(err);
        } else {
          if (!user) {
            possibleUsername = providerUserProfile.username || (providerUserProfile.email ? providerUserProfile.email.split("@")[0] : "");
            User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
              user = new User({
                firstName: providerUserProfile.firstName,
                lastName: providerUserProfile.lastName,
                username: availableUsername,
                displayName: providerUserProfile.displayName,
                email: providerUserProfile.email,
                provider: providerUserProfile.provider,
                providerData: providerUserProfile.providerData
              });
              user.save(function(err) {
                return done(err, user);
              });
            });
          } else {
            done(err, user);
          }
        }
      });
    } else {
      user = req.user;
      if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
        if (!user.additionalProvidersData) {
          user.additionalProvidersData = {};
        }
        user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;
        user.markModified("additionalProvidersData");
        user.save(function(err) {
          return done(err, user, "/#!/settings/accounts");
        });
      } else {
        done(new Error("User is already connected using this provider"), user);
      }
    }
  };


  /*
  Remove OAuth provider
   */

  exports.removeOAuthProvider = function(req, res, next) {
    var provider, user;
    user = req.user;
    provider = req.param("provider");
    if (user && provider) {
      if (user.additionalProvidersData[provider]) {
        delete user.additionalProvidersData[provider];
        user.markModified("additionalProvidersData");
      }
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
    }
  };

}).call(this);
