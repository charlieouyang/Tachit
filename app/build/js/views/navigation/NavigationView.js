define([
  'jquery',
  'underscore',
  'backbone',
  'Mustache',
  'text!templates/navigation/navigationTemplate.html'
], function($, _, Backbone, Mustache, navTemplate){

  var NavView = Backbone.View.extend({
    el: $("#header"),

    render: function(){
      this.$el.html(navTemplate);
    }

  });

  return NavView;
});
