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
      description: '',
      media_type: '',
      created_at: '',
      user_id: ''
    }
  });

  return LinkModel;

});
