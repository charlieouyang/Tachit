// Author: Thomas Davis <thomasalwyndavis@gmail.com>
// Filename: main.js

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config({
  paths: {
    jQuery: 'libs/jquery/jquery-min',
    jQPlugins: 'libs/jquery/plugins',
    underscore: 'libs/underscore/underscore-min',
    backbone: 'libs/backbone/backbone-min',
    templates: '../templates',
    Mustache: 'libs/mustache/mustache.min',
  },

  shim: {
        jQuery: {
            attach: "$",
            exports: "jQuery"
        },
        Backbone: {
            exports: "Backbone"
        },
        Underscore: {
            deps: ["jQuery"],
            exports: "_"
        },
        "backbone-relational": {
            deps: ['Backbone']
        },
        "jQPlugins/jquery.fullPage": {
            deps: ["jQuery"]
        }
    }

});

require([
  // Load our app module and pass it to our definition function
  'app',

], function(App){
  // The "app" dependency is passed in as "App"
  // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
  App.initialize();
});
