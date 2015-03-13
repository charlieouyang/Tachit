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
      var model,
          linkUrl;

      if (!args.linkUrl) {
        console.log('no url...');
      }

      linkUrl = args.linkUrl;
      model = new LinkModel({
        link_url: linkUrl
      });

      model.fetch({
        success: function (link) {
          console.log("Finished fetching link!");
        }
      });

      this.$el.html(linkTemplate);
    }
  });

  return ProjectsView;
});
