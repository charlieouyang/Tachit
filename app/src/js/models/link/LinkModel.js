define([
  'underscore',
  'backbone',
  'text!../../../config/config.json'
], function(_, Backbone, appConfig) {
  
  var LinkModel = Backbone.Model.extend({
    urlRoot: '/link',
    defaults: {
      presignedGetUrl: '',
      link_url: '',
      amazon_key: '',
      name: '',
      id: '',
      description: '',
      media_type: '',
      created_at: '',
      updated_at: '',
      user_name: '',
      link_exist: false
    },

    sync: function (method, model, options){
      var config;
      
      if (method == 'read') {
        config = JSON.parse(appConfig);
        options.url = config.api.endpoint + model.url() + model.get('link_url');
      } else {
         options.url = model.url() + '/save'; 
      }
      return Backbone.sync(method, model, options);
    },

    parse: function (response){
      var result;

      if (response.links_found !== 1) {
          //No links found
          this.set("link_exist", false);
          return;
      } 

      result = response.result[0];
      this.set("presignedGetUrl", response.presignedGetURL);
      this.set("amazon_key", result['amazon_key']);
      this.set("name", result['name']);
      this.set("description", result['description']);
      this.set("media_type", result['media_type']);
      this.set("created_at", result['createdAt']);
      this.set("user_name", result['user_name']);
      this.set("updated_at", result['updatedAt']);
      this.set("id", result['id']);
      this.set("link_exist", true);
    }
  });

  return LinkModel;
});
