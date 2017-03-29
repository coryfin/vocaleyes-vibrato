# README #

VocalEyes Vibrato is a dynamic web app that provides vibrato visualizations for musicians
(both singers and instrumentalists).

### What is this repository for? ###

This repo includes both the front end and back end, which are both served via Flask on top of WSGI.

### How do I get set up? ###

To get started, you need Python 3 and virtualenv. Then follow these steps: 
1. Clone the repository and navigate to the root directory of the project.
2. Set up and activate a virtual environment: `virtualenv env && source env/bin/activate`
3. Install all project dependencies: `pip3 install -r requirements.txt`

#### Deployment ####

The app is set up to be deployed on Heroku, which automatically installs all the needed dependencies via requirements.txt and Procfile.

### Contribution guidelines ###

If you need to add any dependencies, make sure you update the requirements.txt file: `pip3 freeze > requirements.txt`

When adding features or fixing bugs, create a separate branch and then submit a pull request. A team member will review the pull request and accept it, ensuring that everyone is mostly up to date on the latest code changes.

To keep up with changes by other contributors, pull in changes often to avoid merge conflicts.
