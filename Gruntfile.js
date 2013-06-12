module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({});

  var connect = require('connect');
  // Now you can define a "connect" task that starts a webserver, using the
  // connect lib, with whatever options and configuration you need:
  grunt.registerTask('connect', 'Start a custom static web server.', function() {
    var webroot = 'public',
        port    = 9001,
        done    = this.async();
    grunt.log.writeln('Starting static web server in "'+webroot+'" on port '+port+'.');
    connect(connect.static(webroot)).listen(port).on('close',done);
  });

  // Default task(s).
  grunt.registerTask('default', ['connect']);

};