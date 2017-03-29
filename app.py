import os
from flask import Flask, render_template, request, Response, send_from_directory, jsonify
from flask_socketio import SocketIO, emit
from processing import process, ProcessingResult


# Initialize the Flask application
app = Flask(__name__)
socketio = SocketIO(app)

# This is the path to the upload directory
app.config['SCRIPTS_FOLDER'] = 'scripts'
app.config['DATA_FOLDER'] = 'data'
app.config['UPLOAD_FILE'] = 'file.wav'
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
        # TODO: never save to server?
        if not os.path.exists(app.config['DATA_FOLDER']):
            os.makedirs(app.config['DATA_FOLDER'])
        file.save(os.path.join(app.config['DATA_FOLDER'], app.config['UPLOAD_FILE']))
        result = process(file)
        return jsonify(result.serialize())
    else:
        return Response(response="Only the following mimetypes are accepted: {}"
                        .format(str(app.config['ALLOWED_TYPES'])), status=404)


@app.route('/data/<filename>', methods=['GET'])
def data_file(filename):
    return send_from_directory(app.config['DATA_FOLDER'], filename, cache_timeout=1)


@app.route('/scripts/<filename>', methods=['GET'])
def static_file(filename):
    return send_from_directory(app.config['SCRIPTS_FOLDER'], filename)


@socketio.on('connect')
def on_connect():
    # TODO: register user with id, pass id back to user
    print("client connecting...")
    emit('client registered')


@socketio.on('submit')
def on_submit(file):
    # TODO: Socket submission. Assign id to submission
    # TODO: Make sure to only notify user who submitted.
    emit('processing')
    result = process(file)
    emit('processing finished', result.serialize())


if __name__ == '__main__':
    socketio.run(app)
