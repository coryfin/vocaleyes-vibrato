# README #

VocalEyes Vibrato is a dynamic web app that provides vibrato visualizations for musicians
(both singers and instrumentalists).

### What is this repository for? ###

This repo includes both the front end and back end, which are both served via Flask on top of WSGI.

### How do I get set up? ###

This app uses Flask with a WSGI server. It is written in Python 3 (I'm thinking about switching to Python 2). Other required libraries are included in requirements.txt, which has a lot of extra libraries that aren't actually being used. I'm working on setting it up to use virtualenv and will update requirements.txt and these instructions.

#### Deployment ####

The app is set up to be deployed on Heroku, which automatically installs all the needed dependencies via requirements.txt and Procfile.

### Contribution guidelines ###

When you want to add a new feature or fix a bug, create a separate branch and then submit a pull request. Someone else on the team will review the pull request and accept it. This will ensure that everyone is mostly up to date on the latest code changes.

I recommend that you follow this repository and get notifications whenever any changes are made. Then you can pull in any changes to your local repo. If you don't do this and you are editing the same file as somebody else, it will be a mess when you try to merge the different versions together.

In short, commit often and pull in changes often.

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact
