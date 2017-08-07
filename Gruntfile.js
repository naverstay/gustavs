module.exports = function (grunt) {

  grunt.initConfig({
    watch: {
      templates: {
        files: ['jade/*.jade', 'jade/*.pug'],
        tasks: ['pug'],
        options: {
          spawn: false
        }
      },
      styles: {
        files: ['sass/*.scss'],
        tasks: ['sass'],
        options: {
          spawn: false
        }
      }
    },
    uglify: {
      options: {
        mangle: false
      },
      my_target: {
        files: {
          'js/all.min.js': [
            'js/jquery1.10.js',
            'js/jquery-ui-1.11.4.js',
            'js/jquery.mCustomScrollbar.min.js',
            'js/jquery.inputmask.bundle.js',
            'js/jquery.validationEngine.js',
            'js/jquery.validationEngine-ru.js',
            'js/script.js'
          ]
        }
      }
    },
    sass: {
      dist: {
        options: {
          sourcemap: 'none',
          style: 'compressed'
        },
        files: {
          'styles/main_global.css': 'sass/main_global.scss'
        }
      }
    },
    pug: {
      //debug: {
      //    options: {
      //        data: {
      //            client: false,
      //            debug: true,
      //            pretty: true
      //        }
      //    },
      //    files: [{
      //        cwd: "jade/",
      //        src: "*.jade",
      //        dest: "",
      //        expand: true,
      //        ext: ".html"
      //    }]
      //},
      release: {
        options: {
          data: {
            client: true,
            debug: false,
            pretty: false
          }
        },
        files: [{
          cwd: "jade/",
          src: "*.jade",
          dest: "",
          expand: true,
          ext: ".html"
        }]
      }
    },
    jade: {
      compile: {
        options: {
          client: false,
          pretty: true
        },
        files: [{
          cwd: "jade/",
          src: "*.jade",
          dest: "",
          expand: true,
          ext: ".html"
        }]
      }
    }

  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['watch']);
};
