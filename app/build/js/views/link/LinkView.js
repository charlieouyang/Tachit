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

    events: {
      "click .mediaContainer": "openMediaModal"
    },

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

          self.mapData(links.toJSON());

          result.data = {
            "picture": [],
            "voice": [],
            "video": [],
            "text": []
          };
          result.link_exist = links.length > 0;
          result.linkUrl = linkUrl;

          links.each(function (model){
            result.data[model.get("media_type")].push(model.toJSON());
          });

          result.data = self.sortMedia(result.data);

          rendered = Mustache.to_html(linkTemplate, result);
          self.$el.html(rendered);
        },
        error: function (err) {
          console.log("Error on fetch...");
        }
      });
    },

    mapData: function(data) {
      var self = this,
          i;

      self.mediaMap = {};

      for (i = 0; i < data.length; i++){
        self.mediaMap[data[i].id] = data[i];
      }
    },

    sortMedia: function(data) {
      var pictures,
          arrLength;

      //Sorting pictures into 2 columns
      pictures = data["picture"];
      if (pictures.length > 0) {
        data["picture"] = {};
        arrLength = pictures.length;

        data["picture"]["column1"] = pictures.splice(0, arrLength / 2);
        data["picture"]["column2"] = pictures;
      }

      return data;
    },

    openMediaModal: function(e) {
      var self = this,
          mediaData;

      mediaData = self.mediaMap[e.currentTarget.id];
      event.preventDefault();

      $(e.currentTarget).find("a").ekkoLightbox();
    }

  });

  return LinkView;
});
