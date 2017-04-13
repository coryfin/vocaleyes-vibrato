from flask import Flask, render_template, request, Response, send_from_directory, jsonify


# Initialize the Flask application
app = Flask(__name__)

# This is the path to the upload directory
app.config['SCRIPTS_FOLDER'] = 'scripts'
app.config['ALLOWED_TYPES'] = {'audio/wav'}


# For a given file, return whether it's an allowed type or not
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in app.config['ALLOWED_TYPES']


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/scripts/<filename>', methods=['GET'])
def static_file(filename):
    return send_from_directory(app.config['SCRIPTS_FOLDER'], filename)


if __name__ == '__main__':
    app.run()
