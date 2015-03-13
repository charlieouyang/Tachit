// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/home/HomeView',
  'views/link/LinkView'
], function($, _, Backbone, HomeView, LinkView) {
  
  var AppRouter = Backbone.Router.extend({
    routes: {
      // Define some URL routes
      "link/:id": "getLink",
      // Default
      '*actions': 'defaultAction'
    }
  });
  
  var initialize = function(){

    var app_router = new AppRouter;

    app_router.on('route:getLink', function (id) {
        // Note the variable in the route definition being passed in here
        var linkView = new LinkView();
        linkView.render({
          linkUrl: id
        });
    });

    app_router.on('route:defaultAction', function (actions) {
     
       // We have no matching route, lets display the home page 
        var homeView = new HomeView();
        homeView.render();
    });

    // Unlike the above, we don't call render on this view as it will handle
    // the render call internally after it loads data. Further more we load it
    // outside of an on-route function to have it loaded no matter which page is
    // loaded initially.
    //var footerView = new FooterView();

    Backbone.history.start();
  };
  return { 
    initialize: initialize
  };
});
