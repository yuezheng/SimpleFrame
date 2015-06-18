SimpleFrame
=======

Init development environment:
    1. Install dependency package for server side:
        npm install
    2. Install dependency package for browser side:
        cd public/app
        bower install
    3. Back base dir, run grunt:
        grunt serve
    4. Visit url: http://<YOUR-IP>:4200 at browser.

NOTE:
    1. The server use port: 4200, make it free;
    2. TODO: Optimize livereload task;
             Add test and build task

Project structure:
    .
    | app.js # The init script for web server
    | etc/   # The config file dir for project
    | package.json # Dependency of web server and dev tools
    | router.js  # Define the router for server
    | routes/  # Implement for each router
    | public/  # The components for browser side, contain:
               # javascript/html/css/image files.


Run unit test:
  grunt test

Run build task:
  grunt build

  The results of build contain: concat and compress js, css file;
  inject dependency for angular module, copy static files into dir:
      public/dist

About Deploy
  You could easy deploy project to remote server by grunt task also:
      grunt build
      grunt deploy
  But, this command is suitable for the initial deploy only, it will copy
  project files and create config file/ service file .etc

  If you want to update version for current deployment, you can do like:
      grunt build
      grunt update

  Support rollback old version of deployment, to run:
      grunt rollback

  NOTE for deploy:
      1. Before do anything at above, you need define the info of remote server,
         at secret.json:
           {
               "host" : "200.21.101.154",
               "username" : "root",
               "password" : "root123."
           }
      2. Make sure the config files at dist/etc is suit to remote server.
