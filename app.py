from flask import Flask, render_template, send_from_directory


# Initialize the Flask application
app = Flask(__name__)

# This is the path to the upload directory
app.config['SCRIPTS_FOLDER'] = 'scripts'
app.config['CSS_FOLDER'] = 'css'
app.config['FONTS_FOLDER'] = 'fonts'
app.config['DATA_FOLDER'] = 'data'


# For a given file, return whether it's an allowed type or not
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in app.config['ALLOWED_TYPES']


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/scripts/<filename>', methods=['GET'])
def script_file(filename):
    return send_from_directory(app.config['SCRIPTS_FOLDER'], filename)


@app.route('/css/<filename>', methods=['GET'])
def css_file(filename):
    return send_from_directory(app.config['CSS_FOLDER'], filename)


@app.route('/fonts/<filename>', methods=['GET'])
def font_file(filename):
    return send_from_directory(app.config['FONTS_FOLDER'], filename)


@app.route('/data/<filename>', methods=['GET'])
def static_file(filename):
    return send_from_directory(app.config['DATA_FOLDER'], filename)


if __name__ == '__main__':
    app.run()
