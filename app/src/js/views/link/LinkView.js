define([
  'jquery',
  'underscore',
  'backbone',
  'Mustache',
  'text!templates/link/linkTemplate.html',
  'collections/LinksCollection'
], function($, _, Backbone, Mustache, linkTemplate, LinkCollection){

  var LinkView = Backbone.View.extend({
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

      collection = new LinkCollection({
        linkUrl: linkUrl
      });

      collection.fetch({
        success: function (links) {
          var result = {},
              data;

          result.data = [];
          result.link_exist = links.length > 0;

          links.each(function (model){
            data = {};
            if (model.get("media_type") === "video") {
              data.video = true;
            } else if (model.get("media_type") === "picture") {
              data.picture = true;
            } else if (model.get("media_type") === "voice") {
              data.voice = true;
            } else if (model.get("media_type") === "text") {
              data.text = true;
            }
            result.data.push($.extend(model.toJSON(), data));
          });

          rendered = Mustache.to_html(linkTemplate, result);
          self.$el.html(rendered);

        },
        error: function (err) {
          console.log("Error on fetch...");
        }
      });
    }
  });

  return LinkView;
});
