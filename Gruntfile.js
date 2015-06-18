// Generated on 2014-08-18 using generator-angular 0.9.5
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: 'public',
    server: 'app',
    dist: 'public/dist'
  };
  var pkgConfig = {
    name: 'ecmaster',
    version: '0_0_2'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: appConfig,
    pkg: pkgConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['./public/app/bower.json'],
        tasks: ['wiredep']
      },
      coffee: {
        files: ['<%= yeoman.app %>/app/**/*.{coffee,litcoffee,coffee.md}'],
        tasks: ['newer:coffee:dist']
      },
      serverCoffee: {
        files: ['<%= yeoman.server %>/**/*.{coffee,litcoffee,coffee.md}'],
        tasks: ['newer:coffee:server']
      },
      coffeeTest: {
        files: ['test/spec/{,*/}*.{coffee,litcoffee,coffee.md}'],
        tasks: ['newer:coffee:test', 'karma']
      },
      recess: {
        files: ['<%= yeoman.app %>/styles/**/*.less'],
        tasks: ['newer:recess']
      },
      styles: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      view: {
        files: ['<%= yeoman.app %>/**/*.html'],
        tasks: ['connect:livereload']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/**/*.html',
          '<%= yeoman.app %>/**/*.css',
          '<%= yeoman.app %>/**/*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 4200,
        hostname: '0.0.0.0',
        livereload: 35729,
        middleware: function(connect, options) {
          return [
            function(req, res, next) {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
              // don't just call next() return it
              return next();
            },
            // add other middlewares here
            connect.static(require('path').resolve('.'))
          ];
    }
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              connect.static('public/app'),
              connect().use(
                '/public/app/bower_components',
                connect.static('./public/app/bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              connect.static('public/app'),
              connect.static('test'),
              connect().use(
                '/public/app/bower_components',
                connect.static('./public/app/bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js'
        ]
      }
    },

    recess: {
      options: {
        compile: true
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/styles',
          src: '**/*.less',
          dest: '<%= yeoman.app %>/styles',
          ext: '.css'
        }]
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= yeoman.dist %>/{,*/}*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: 'dist'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/app/styles/',
          src: '**/*.css',
          dest: '<%= yeoman.app %>/app/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      options: {
        cwd: './public/app/'
      },
      app: {
        src: ['<%= yeoman.app %>/app/index.html'],
        ignorePath:  /\.\.\//
      }
    },

    // Compiles CoffeeScript to JavaScript
    coffee: {
      options: {
        sourceMap: false,
        sourceRoot: ''
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: '**/*.coffee',
          dest: '<%= yeoman.app %>',
          ext: '.js'
        }]
      },
      server: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.server %>/',
          src: '**/*.coffee',
          dest: '<%= yeoman.server %>/',
          ext: '.js'
        }]
      },
      test: {
        files: [{
          expand: true,
          cwd: 'test/spec',
          src: '{,*/}*.coffee',
          dest: '.tmp/spec',
          ext: '.js'
        }]
      }
    },

    // Deploy or update project via ssh to remote server.
    projectPackage: '<%= pkg.name %><%= pkg.version %>',
    serviceScript: 'ecmaster',
    remoteDist: '/opt/ecmaster/',
    secret: grunt.file.readJSON('secret.json'),
    sftp: {
      send: {
        files: {
          "./": "dist/**/*"
        },
        options: {
          path: '<%= remoteDist %><%= projectPackage %>',
          host: '<%= secret.host %>',
          username: '<%= secret.username %>',
          password: '<%= secret.password %>',
          createDirectories: true,
          showProgress: true
        }
      }
    },
    sshconfig: {
      "remote": grunt.file.readJSON('secret.json')
    },
    sshexec: {
      preUpdate: {
        command: [
          'cd <%= remoteDist %>',
          'if [ -d <%= projectPackage %> ]; then rm -rf <%= projectPackage %>; fi'
        ].join(' && '),
        options: {
          config: 'remote'
        }
      },
      update: {
        command: [
          'cd <%= remoteDist %>',
          'if [ -d current_backup ]; then rm -rf current_backup; fi',
          'cp -r current current_backup',
          'cd <%= projectPackage %>/dist',
          'mv * ../',
          'cd ../',
          'rm -rf dist',
          'npm install --production',
          'cd ../',
          'cp -r <%= projectPackage %>/* current/',
        ].join(' && '),
        options: {
          config: 'remote'
        }
      },
      deploy: {
        command: [
          'cd <%= remoteDist %>',
          'mkdir current',
          'cd <%= projectPackage %>/dist',
          'npm install --production',
          'cd ../../',
          'cp -r <%= projectPackage %>/* current/',
          'cd current/dist',
          'mv * ../',
          'cd ../',
          'rm -rf dist/',
          'npm install forever -g'
        ].join(' && '),
        options: {
          config: 'remote'
        }
      },
      rollback: {
        command: [
          'cd <%= remoteDist %>',
          'cp -r current_backup/* current/'
        ].join(' && '),
        options: {
          config: 'remote'
        }
      },
      start: {
        command: [
          '/etc/init.d/<%= serviceScript %> start'
        ],
        options: {
          config: 'remote'
        }
      },
      restart: {
        command: [
          '/etc/init.d/<%= serviceScript %> restart'
        ],
        options: {
          config: 'remote'
        }
      },
      initService: {
        command: [
          'if [ -d /etc/ecmaster ]; then rm -rf /etc/ecmaster; fi',
          'if [ -d /etc/init.d/<%= serviceScript %> ]; then rm -f /etc/init.d/<%= serviceScript %>; fi',
          'mkdir /etc/ecmaster',
          'mkdir /var/run/ecmaster',
          'cd <%= remoteDist %>',
          'cd current',
          'cp etc/*.json /etc/ecmaster/',
          'cp bin/<%= serviceScript %> /etc/init.d/',
          'chmod 766 /etc/init.d/<%= serviceScript %>'
        ].join(' && '),
        options: {
          config: 'remote'
        }
      },
      clean: {
        command: [
          'rm -rf <%= remoteDist %>',
          'rm -rf /etc/ecmaster',
          'rm -rf /var/run/ecmaster',
          'rm -rf /etc/init.d/<%= serviceScript %>'
        ].join(' && '),
        options: {
          config: 'remote'
        }
      }
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= yeoman.dist %>/scripts/{,*/}*.js',
          '<%= yeoman.dist %>/styles/{,*/}*.css',
          '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.dist %>/styles/fonts/*'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/app/index.html',
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>','<%= yeoman.dist %>/images']
      }
    },

    // The following *-min tasks will produce minified files in the dist folder
    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    cssmin: {
      dist: {
        files: {
          '<%= yeoman.dist %>/styles/main.css': [
            '<%= yeoman.app %>/app/styles/**/*.css'
          ]
        }
      }
    },
    concat: {
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/app/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html', 'views/**/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    // ngmin tries to make the code safe for minification automatically by
    // using the Angular long form for dependency injection. It doesn't work on
    // things like resolve or inject so those have to be done manually.
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>/app',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'views/**/*.html',
            'scripts/**/*.html',
            'images/**/*.{webp}',
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: '<%= yeoman.app %>/app/images',
          dest: '<%= yeoman.dist %>/images',
          src: ['*']
        }, {
          expand: true,
          cwd: 'public/app/bower_components/bootstrap/dist',
          src: 'fonts/*',
          dest: '<%= yeoman.dist %>'
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/app/styles',
        dest: '<%= yeoman.dist %>/styles/',
        src: '**/*.css'
      },
      server: {
        files: [{
          expand: true,
          dot: true,
          cwd: '.',
          dest: 'dist',
          src: [
            '*.js',
            'package.json',
            '*.md'
          ]
        }, {
          expand: true,
          cwd: 'etc',
          src: '*',
          dest: 'dist/etc/'
        }, {
          expand: true,
          cwd: 'bin',
          src: '*',
          dest: 'dist/bin/'
        }, {
          expand: true,
          cwd: 'app',
          src: '**/*.js',
          dest: 'dist/app/'
        }, {
          expand: true,
          cwd: 'strategies',
          src: '**/*.js',
          dest: 'dist/strategies/'
        }, {
          expand: true,
          cwd: 'utils',
          src: '**/*.js',
          dest: 'dist/utils/'
        }, {
          expand: true,
          cwd: 'public/dist',
          src: '**/*',
          dest: 'dist/public/'
        }]
      }
    },

    nodemon: {
      dev: {
        script: 'server.js',
        callback: function (nodemon) {
          nodemon.on('restart', function() {
            setTimeout(function() {
              require('fs').writeFileSync('.rebooted', 'rebooted');
            }, 1000) ;
          });
        }
      }
    },

    env: {
      test: {
        NODE_ENV: 'test'
      }
    },
    mochaTest: {
      src:['app/tests/**/*.js'],
      options: {
        reporter: 'spec',
        require: 'server.js'
      }
    },
    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: {
        tasks: [
          'recess:dist',
          'coffee:dist',
          'coffee:server',
          'copy:styles',
          'nodemon',
          'watch'
        ],
        options: {
          logConcurrentOutput: true,
          limit: 6
        }
      },
      test: [
        'coffee',
        'copy:styles'
      ],
      dist: [
        'recess',
        'coffee',
        'copy:styles',
        'imagemin',
        'svgmin'
      ]
    },

    //uglify:{
    // options : {
    //   beautify : true,
    //   mangle   : true
    // }
    //},

    // Test settings
    karma: {
      unit: {
        configFile: 'test/karma.conf.coffee',
        singleRun: true
      }
    }
  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('test', [
    'env:test',
    'mochaTest'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngmin',
    'copy:dist',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'copy:server'
  ]);

  grunt.registerTask('deploy', [
    'sftp',
    'sshexec:deploy',
    'sshexec:initService',
    'sshexec:start'
  ]);
  grunt.registerTask('update', [
    'sshexec:preUpdate',
    'sftp',
    'sshexec:update',
    'sshexec:initService',
    'sshexec:restart'
  ]);
  grunt.registerTask('rollback', [
    'sshexec:rollback',
    'sshexec:restart'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
