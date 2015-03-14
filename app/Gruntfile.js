module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'build/css/style.css': ['src/sass/style.scss'],
          'src/css/style.css': ['src/sass/style.scss']
          //'src/css/style.css': ['src/sass/style.scss']
        }
      }
    },
    clean: {
      build: {
        src: [ 'build' ]
      }
    },
    watch: {
      css: {
        files: ['src/sass/*.scss', 'src/js/*.js'],
        tasks: ['clean', 'sass', 'copy']
      }
    },
    copy: {
      main: {
        files: [
          //copying over images
          {expand: true, cwd: 'src/', src: ['imgs/**'], dest: 'build/'},
          //copying over all js
          {expand: true, cwd: 'src/', src: ['js/**'], dest: 'build/'},
          //copying over all templates
          {expand: true, cwd: 'src/', src: ['templates/**'], dest: 'build/'},
          //coping over font-awesome
          {expand: true, cwd: 'src/css/', src: ['font-awesome.min.css'], dest: 'build/css/'},
          {expand: true, cwd: 'src/', src: ['fonts/**'], dest: 'build/'},

          //copying over configuration
          {expand: true, cwd: 'src/', src: ['config/**'], dest: 'build/'},

          //copying over index.html
          {expand: true, cwd: 'src/', src: ['index.html'], dest: 'build/'}
        ]
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.registerTask('default',['watch']);
};