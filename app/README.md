# Tachit Web App

This Web App is built using backboneJS, requireJS, and Mustache. It uses Grunt to build all of the dependencies required for deployment.

## Main App Sections

###Landing Page

**URL** - tachitnow.com

This is the main page of the web app. The Tachit landing page should live here. Currently contains a string to indicate that it's the landing page.

###View Link

**URL** - tachitnow.com/#link/{link_id}

This is the URL where users can go and view the media that they've uploaded. If the link doesn't exist, it just routes to a link doesn't exist page. If it does, it will be smart enough to render the media (whether it's video, voice, picture or text). 

**Examples**

tachitnow.com/#link/lego - Shows video

tachitnow.com/#link/al - Shows voice

tachitnow.com/#link/ups - Shows picture