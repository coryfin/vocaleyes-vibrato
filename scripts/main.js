let recordButton = document.getElementById('record');
let statusLabel = document.getElementById('status');
let resultsElem = document.getElementById('results');
let audioElem = document.getElementById('audio');
let visualizationElem = document.getElementById('visualization');

let stopped;
let recorder;
let audioProcessor;
let frameSize;

// Pitch recognition params
let frameDuration = 0.02; // 2 cycles of 100 Hz tone
let vibratoFrameDuration = 1; // 2 cycles of 2 Hz vibrato. See https://en.wikipedia.org/wiki/Vibrato#Typical_rate_and_extent_of_vibrato

var record = function() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function(stream) {

        // Begin recording, update state
        stopped = false;
        recordButton.innerHTML = 'Stop';
//        resultsElem.style.display = 'none';

        var context = new AudioContext();
        var mediaStreamSource = context.createMediaStreamSource(stream);
        recorder = new Recorder(mediaStreamSource);
        recorder.record();

        frameSize = nextPow2(frameDuration * context.sampleRate);
        audioProcessor = new AudioProcessor(context.sampleRate, frameDuration, vibratoFrameDuration);
    })
}

var stop = function() {
    recorder.stop();
    recorder.exportWAV(function(blob) {
        audioElem.src = window.URL.createObjectURL(blob);
    });
    recorder.getBuffer(processBuffers);
    stopped = true;
    recordButton.innerHTML = 'Record';
}

var processBuffers = function(buffers) {

    // START A LOADING SPINNER HERE
    statusLabel.innerHTML = 'Processing...';
    statusLabel.style.display = '';
    recordButton.style.display = 'none';

    // Mix stereo channels to mono
    var buffer = buffers[0].map(function(val, i) {
        return (val + buffers[1][i]) / 2;
    })

    var numFrames = Math.floor(buffer.length / frameSize);
    var frames = [];
    for (var i = 0; i < numFrames; i++) {
        var start = i * frameSize;
        var end = start + frameSize;
        frames.push(buffer.slice(start, end));
    }

    frames.forEach(function(frame) { return audioProcessor.process(frame); })
    drawChart(audioProcessor.getPitches());

//    audioProcessor.getVibratoRates().forEach(function(result) { console.log(result); })

    statusLabel.innerHTML = '';
    statusLabel.style.display = 'none';
    recordButton.style.display = '';
    resultsElem.display = '';
}

function drawChart(pitches) {

    var pitchTuples = [];
    for (var i = 0; i < pitches.length; i++) {
        pitchTuples.push([i, pitches[i]])
    }
    var data = google.visualization.arrayToDataTable([['Time', 'Pitch']].concat(pitchTuples));

    var options = {
        title: 'Pitch',
        curveType: 'function'
    };

    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
    chart.draw(data, options);
}

// Hook up events
recordButton.addEventListener('click', function() {
    if (stopped) record();
    else stop();
})

// Init
stopped = true;
recordButton.style.display = '';
statusLabel.style.display = 'none';
//resultsElem.style.display = 'none';
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(function() { drawChart([0]); });


