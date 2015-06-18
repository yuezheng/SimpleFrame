'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    User = require('mongoose').model('User'),
    path = require('path'),
    fileUtils = require('./utils/getFiles');

/**
 * Module init function.
 */
module.exports = function() {
    // Serialize sessions
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // Deserialize sessions
    passport.deserializeUser(function(id, done) {
        User.findOne({
            _id: id
        }, '-salt -password', function(err, user) {
            done(err, user);
        });
    });

    // Initialize strategies
    fileUtils.getGlobbedFiles('./strategies/**/*.js').forEach(function(strategy) {
        require(path.resolve(strategy))();
    });
};
