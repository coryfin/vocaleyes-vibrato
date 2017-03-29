# README #

VocalEyes Vibrato is a dynamic web app that provides vibrato visualizations for musicians
(both singers and instrumentalists).

### What is this repository for? ###

This repo includes both the front end and back end, which are both served via Flask on top of WSGI.

### How do I get set up? ###

#### Initial set up ####

To get started, you need Python 3 and virtualenv. Then do the following:
1. Clone the repository and navigate to the root directory of the project.
2. Set up and activate a virtual environment: `virtualenv env && source env/bin/activate`
3. Install all project dependencies: `pip3 install -r requirements.txt`

If any dependencies change throughout the course of the project, do step 3 to update the dependencies in your virtual environment.

When you want to work on other projects, don't forget to deactivate the virtual environment: `deactivate`

#### Running the app ####

1. Activate the virtual environment: `source env/bin/activate`
2. Run the app: `python3 app.py`

#### Deployment ####

The app is set up to be deployed on Heroku, which automatically installs all the needed dependencies via requirements.txt and Procfile.

### Contribution guidelines ###

If you need to add any dependencies, make sure you update requirements.txt: `pip3 freeze > requirements.txt`

When adding features or fixing bugs, create a separate branch and then submit a pull request. A team member will review the pull request and accept it, ensuring that everyone is mostly up to date on the latest code changes.

To keep up with changes by other contributors, pull in changes often to avoid merge conflicts.
