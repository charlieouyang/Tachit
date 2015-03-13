define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  
  var LinkModel = Backbone.Model.extend({
    urlRoot: '/link',
    defaults: {
      link_url: '',
      amazon_url: '',
      name: '',
      id: '',
      description: '',
      media_type: '',
      created_at: '',
      updated_at: '',
      user_id: ''
    },

    sync: function (method, model, options){
      if (method == 'read') {
        options.url = 'http://localhost:8080/api' + model.url() + model.get('link_url');
      } else {
         options.url = model.url() + '/save'; 
      }
      return Backbone.sync(method, model, options);
    },

    parse: function (response){
        var result;

        if (response.links_found !== 1) {
            //No links found
            return;
        } 

        result = response.result[0];
        this.set("amazon_url", result['amazon_url']);
        this.set("name", result['name']);
        this.set("description", result['description']);
        this.set("media_type", result['media_type']);
        this.set("created_at", result['createdAt']);
        this.set("user_id", result['user_id']);
        this.set("updated_at", result['updatedAt']);
        this.set("id", result['id']);
    }
  });

  return LinkModel;
});
