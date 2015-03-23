# Tachit Web App

This Web App is built using backboneJS, requireJS, and Mustache. It uses Grunt to build all of the dependencies required for deployment.

## Main App Sections

###Landing Page

**URL**
```
tachitnow.com
```

This is the main page of the web app. The Tachit landing page should live here. Currently contains a string to indicate that it's the landing page.

###View Link

**URL** 
```
tachitnow.com/{link_id}
```

This is the URL where users can go and view the media that they've uploaded. If the link doesn't exist, it just routes to a link doesn't exist page. If it does, it will be smart enough to render the media (whether it's video, voice, picture or text). 

**Examples**

Video
```
tachitnow.com/lego
```

Voice
```
tachitnow.com/al
```

Picture
```
tachitnow.com/ups
```

##Development

**Github**

Fork this repository, and clone it on your local machine.

**npm**

Navigate to the /app folder and run 
```
npm install
```
to install all of the dependencies for the web application.

**grunt**

Staying in the same /app directory, run the command 
```
grunt
```
and this will listen for all changes in the app and compile the necessary files and also run the web server
