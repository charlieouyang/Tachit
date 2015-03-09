define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/link/linkTemplate.html'
], function($, _, Backbone, linkTemplate){

  var ProjectsView = Backbone.View.extend({
    el: $("#content"),
    render: function(){
      this.$el.html(linkTemplate);
    }
  });

  return ProjectsView;
});
