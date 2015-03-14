define([
  'jquery',
  'underscore',
  'backbone',
  'Mustache',
  'text!templates/link/linkTemplate.html',
  'models/link/LinkModel'
], function($, _, Backbone, Mustache, linkTemplate, LinkModel){

  var ProjectsView = Backbone.View.extend({
    el: $("#content"),
    render: function(args){
      var self = this,
          model,
          linkUrl,
          rendered,
          data = {};

      if (!args.linkUrl) {
        console.log('no url...');
      }

      linkUrl = args.linkUrl;
      model = new LinkModel({
        link_url: linkUrl
      });

      model.fetch({
        success: function (link) {
          if (link.get("link_exist")) {

            data = link.toJSON();
            if (link.get("media_type") === "video") {
              data.video = true;
            } else if (link.get("media_type") === "picture") {
              data.picture = true;
            } else if (link.get("media_type") === "voice") {
              data.voice = true;
            } else if (link.get("media_type") === "text") {
              data.text = true;
            }
          } else {
            //Link doesn't exist
          }

          rendered = Mustache.to_html(linkTemplate, data);
          self.$el.html(rendered);
        },
        error: function (err) {
          console.log("Error on fetch...");
        }
      });

      //rendered = Mustache.to_html(linkTemplate, {"video": true});
      //this.$el.html(rendered);
    }
  });

  return ProjectsView;
});
