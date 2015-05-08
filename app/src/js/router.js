// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/home/HomeView',
  'views/link/LinkView',
  'views/navigation/NavigationView',
  'views/footer/FooterView',
  'views/error/404View'
], function($, _, Backbone, HomeView, LinkView, NavView, FooterView, error404View) {
  
  var AppRouter = Backbone.Router.extend({
    routes: {
      //Landing Page
      "": "homePage",

      //Admin page
      "admin/:user_id": "adminPage",
      "admin/:user_id/": "adminPage",

      //Tachit links pages
      ":myId": "linkPage",
      ":myId/": "linkPage",

      //404
      '*actions': 'undefinedRoutes'
    }
  });
  
  var initialize = function(){

    var app_router = new AppRouter;

    app_router.on('route:homePage', function (id) {
        console.log("Hit home page: /");
        var navView = new NavView();
        var footerView = new FooterView();
        var homeView = new HomeView();
        navView.render();
        footerView.render();
        homeView.render();
    });

    app_router.on('route:adminPage', function (id) {
        console.log("Hit admin page: admin/:user_id and user ID: " + id);
    });

    app_router.on('route:linkPage', function (id) {
        var linkView = new LinkView();
        linkView.render({
          linkUrl: id
        });
    });

    app_router.on('route:undefinedRoutes', function (actions) {
       // We have no matching route, lets display the home page 
        var errorView = new error404View();
        errorView.render({
          action: actions
        });
    });

    Backbone.history.start({pushState: true, root: '/'});
  };
  return { 
    initialize: initialize
  };
});
