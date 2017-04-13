from flask import Flask, render_template, request, Response, send_from_directory, jsonify


# Initialize the Flask application
app = Flask(__name__)
# socketio = SocketIO(app)

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


@app.route('/results', methods=['GET'])
def results():
    return render_template('sing-results.html')


@app.route('/submit', methods=['POST'])
def submit():
    file = request.files['file']
    if file and file.content_type in app.config['ALLOWED_TYPES']:
        result = process(file)
        return jsonify(result.serialize())
    else:
        return Response(response="Only the following mimetypes are accepted: {}"
                        .format(str(app.config['ALLOWED_TYPES'])), status=404)


@app.route('/scripts/<filename>', methods=['GET'])
def static_file(filename):
    return send_from_directory(app.config['SCRIPTS_FOLDER'], filename)


if __name__ == '__main__':
    app.run()
    # socketio.run(app)
