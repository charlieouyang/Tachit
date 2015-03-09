define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/home/homeTemplate.html'
], function($, _, Backbone, SidebarView, homeTemplate){

  var HomeView = Backbone.View.extend({
    el: $("#content"),

    render: function(){
      this.$el.html(homeTemplate);
    }

  });

  return HomeView;
  
});
