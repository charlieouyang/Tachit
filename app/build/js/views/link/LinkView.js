define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/link/linkTemplate.html',
  'models/link/LinkModel'
], function($, _, Backbone, linkTemplate, LinkModel){

  var ProjectsView = Backbone.View.extend({
    el: $("#content"),
    render: function(args){
      var model = new LinkModel;

      if (args.linkUrl)

      this.$el.html(linkTemplate);
    }
  });

  return ProjectsView;
});
