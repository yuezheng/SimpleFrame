var path = require('path'),
    fileUtils = require('./utils/getFiles');

module.exports.setup = function (app) {
  var routeFiles = fileUtils.getGlobbedFiles('./app/routes/**/*.js');
  routeFiles.forEach(function (routePath) {
    require(path.resolve(routePath))(app);
  });
};
