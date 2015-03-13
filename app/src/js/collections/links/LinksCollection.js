define([
  'underscore',
  'backbone',
  'models/ilnk/LinkModel'
], function(_, Backbone, LinkModel){

  var ContributorsCollection = Backbone.Collection.extend({
      
      model: LinkModel,

      initialize : function(models, options) {
        this.linkUrl = options.linkUrl;
      },
      
      url : function() {
        return 'http://localhost:8080/api/link/' + this.linkUrl;
      },
    
      parse : function(data) {
          var uniqueArray = this.removeDuplicates(data.data);
          return uniqueArray;
      },
      
      removeDuplicates: function(myArray) {

          //credit: http://newcodeandroll.blogspot.ca/2012/01/how-to-find-duplicates-in-array-in.html  
          // I was hoping underscore's _uniq would work here but it only seems to work for single values not objects               
          var length = myArray.length;
          var ArrayWithUniqueValues = [];
          
          var objectCounter = {};
          
          for (i = 0; i < length; i++) {
          
              var currentMemboerOfArrayKey = JSON.stringify(myArray[i]);
              var currentMemboerOfArrayValue = myArray[i];
            
              if (objectCounter[currentMemboerOfArrayKey] === undefined){
                  ArrayWithUniqueValues.push(currentMemboerOfArrayValue);
                 objectCounter[currentMemboerOfArrayKey] = 1;
              }else{
                 objectCounter[currentMemboerOfArrayKey]++;
              }
          }
      
          return ArrayWithUniqueValues;
      }        
     
  });

  return ContributorsCollection;

});