let state;
let stopped;
let recorder;
const recordButton = document.getElementById('record');
const statusLabel = document.getElementById('status');
const resultsElem = document.getElementById('results');
const audioElem = document.getElementById('audio');
const visualizationElem = document.getElementById('visualization');

recordButton.addEventListener('click', function() {
    if (stopped) {
        record();
    }
    else {
        stop();
    }
})

var record = function() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function(stream) {

        // Begin recording, update state
        stopped = false;
        recordButton.innerHTML = 'Stop';
        resultsElem.style.display = 'none';

        var context = new AudioContext();
        var mediaStreamSource = context.createMediaStreamSource(stream);
        recorder = new Recorder(mediaStreamSource);
        recorder.record();
    })
}

var stop = function() {
    recorder.stop();
    recorder.exportWAV(function(s) {
        submit(s);
    });
    stopped = true;
    recordButton.innerHTML = 'Record';
}

var submit = function(file) {

    // START A LOADING SPINNER HERE
    statusLabel.innerHTML = 'Processing...';
    statusLabel.style.display = '';
    recordButton.style.display = 'none';

    // Create a formdata object and add the files
    var data = new FormData();
    data.append('file', file);

    $.ajax({
        url: "submit",
        type: "POST",
        data: data,
        processData: false,
        contentType: false,
        success: function(data) {
            visualize(data);
            // TODO: connect recorded audio to audio element
            // Reload audio
//            audioElem.src = '../data/file.wav';
            audioElem.load();
            recordButton.style.display = '';
            statusLabel.innerHTML = '';
            statusLabel.style.display = 'none';
            resultsElem.style.display = '';

        },
        error: function() {
            console.log('Error uploading file');
            statusLabel.innerHTML = 'Error uploading file.';
        }
    });
}

var visualize = function(result) {
    // TODO: load result into visualization
    console.dir(result);
}

// Init
stopped = true;
recordButton.style.display = '';
statusLabel.style.display = 'none';
resultsElem.style.display = 'none';


//var socket = io.connect();
//
//socket.on('client registered', function(clientId) {
//
//})
//
//socket.on('processing', function() {
//
//})
//
//socket.on('processing finished', function(result) {
//
//})
