define([
  'underscore',
  'backbone',
  'text!../../../config/config.json'
], function(_, Backbone, appConfig) {
  
  var LinkModel = Backbone.Model.extend({
    urlRoot: '/link',

    initialize: function (options) {
    }
  });

  return LinkModel;
});
