define([
  'jquery',
  'underscore',
  'backbone',
  "jQPlugins/jquery.fullPage",
  'models/EmailModel',
  'models/ClickModel',
  'text!templates/home/homeTemplate.html'
], function($, _, Backbone, FullPage, EmailModel, ClickModel, homeTemplate){

  var HomeView = Backbone.View.extend({
    el: $("#content"),

    events: {
      "click .email-submit-button": "submitEmailClick",

      //This is the registered event handler for all clicks in the landing page
      "click .placement-click": "clickPlacementSubmit"
    },

    render: function(){
      var self = this;

      this.$el.html(homeTemplate);

      //Let's register as soon as someone hits the main page
      self.clickPlacementSubmit();

      $(self.el).find("#fullpage").fullpage();

      self.initialWindowWidth = $(window).width();
      self.initialWindowHeight = $(window).height();
      self.initialLoadOfPage = true;

      self.resizeMainContentSections();
      self.listenForWindowResize();
    },

    listenForWindowResize: function () {
      //This is for listening to the window resize END event
      //Only invocate resizeMainContentSections when the window END event is triggered
      var self = this,
          rtime = new Date(1, 1, 2000, 12,00,00),
          timeout = false,
          delta = 200;

      $(window).resize(function() {
          rtime = new Date();
          if (timeout === false) {
              timeout = true;
              setTimeout(resizeend, delta);
          }
      });

      function resizeend() {
          if (new Date() - rtime < delta) {
              setTimeout(resizeend, delta);
          } else {
              timeout = false;
              self.resizeMainContentSections();
          }               
      }
    },

    resizeMainContentSections: function () {
      var self = this;

      //set the height of the containers
      setTimeout(function(){ 
        // if (self.initialWindowWidth !== $(window).width()) {
        //   var width = $(self.el).find(".section").width();
        //   $.each($(self.el).find(".tachit-steps-img"), function(index, value){
        //     value.width = width;
        //     value.height = undefined;
        //   });
        //   self.initialWindowWidth = width;
        // } else if (self.initialWindowHeight !== $(window).height()) {
        //   var height = $(self.el).find(".section").height();
        //   $.each($(self.el).find(".tachit-steps-img"), function(index, value){
        //     value.height = height;
        //     value.width = undefined;
        //   });
        //   self.initialWindowHeight = height;
        // }

        // if (self.initialLoadOfPage) {
        //   self.initialLoadOfPage = false;
        //   var height = $(self.el).find(".section").height();
        //   $.each($(self.el).find(".tachit-steps-img"), function(index, value){
        //     value.height = height;
        //   });
        // }

        var height = $(self.el).find(".section").height();
        $.each($(self.el).find(".tachit-steps-img"), function(index, value){
          value.height = height;
        });

      }, 500);
    },  

    clickPlacementSubmit: function (e) {
      var self = this,
          cmodel,
          clickPlacement;

      if (e) {
        clickPlacement = e.target.getAttribute("button-data");
      }

      $.when(self.getLocation()).done(function (response){
        cmodel = new ClickModel({
          click_placement: clickPlacement ? clickPlacement : "home-page-load",
          country: response.country,
          region: response.region,
          city: response.city,
          zip_code: response.postal
        });
        cmodel.save();
      });
    },

    getLocation: function(){
      var deferred = $.Deferred();

      $.get("http://ipinfo.io", function(response) {
          deferred.resolve(response);
        }, "jsonp");

      return deferred.promise();
    },

    submitEmailClick: function (e) {
      var self = this,
          emodel,
          emailFormGroup = $(self.el).find(".email-input-group"),
          emailButton = $(self.el).find(".email-submit-button"),
          emailAddress = $(self.el).find(".email-input-text").val(),
          emailError = function() {
            emailFormGroup.removeClass("has-success").addClass("has-error");
            emailFormGroup.parent().removeClass("email-success").addClass("email-error");
            emailButton.removeClass("btn-default").addClass("btn-danger");

            emailFormGroup.popover('destroy');
            setTimeout(function() {
              emailFormGroup.popover({
                "trigger": "focus",
                "placement": "top",
                "content" : "Please enter a valid e-mail address!"
              });
              if (!emailFormGroup.attr("aria-describedby")) {
                emailFormGroup.popover("show");
              }
            }, 200);
          },
          emailSuccess = function() {
            emailFormGroup.removeClass("has-error").addClass("has-success");
            emailFormGroup.parent().removeClass("email-error").addClass("email-success");
            emailButton.removeClass("btn-default btn-danger").addClass("btn-success");

            emailFormGroup.popover('destroy');
            setTimeout(function() {
              emailFormGroup.popover({
                "trigger": "focus",
                "placement": "top",
                "content": "Thank you for registering with us!"
              });
              if (!emailFormGroup.attr("aria-describedby")) {
                emailFormGroup.popover("show");
              }
            }, 200);
          };

      if (emailAddress === "") {
        emailError();
      } else {
        emodel = new EmailModel({email_address: emailAddress});

        emodel.save({}, {
          success: function (model, response) {
            emailSuccess();
          },
          error: function(model, response) {
            emailError();
          }
        });
      }
    }

  });

  return HomeView;
  
});
