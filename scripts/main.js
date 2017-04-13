let state;
let stopped;
let recorder;
const recordButton = document.getElementById('record');
const statusLabel = document.getElementById('status');
const resultsElem = document.getElementById('results');
const audioElem = document.getElementById('audio');
const visualizationElem = document.getElementById('visualization');
let sampleRate;
let frameDuration = 0.02; // 2 cycles of 100 Hz tone
let frameSize;
let pitchAnalyzer;
let pitchSampleRate;
let vibratoFrameDuration = 1; // 2 cycles of 2 Hz vibrato. See https://en.wikipedia.org/wiki/Vibrato#Typical_rate_and_extent_of_vibrato
let vibratoFrameSize;
let vibratoAnalyzer;

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

        // Set up pitch analyzer
        sampleRate = context.sampleRate;
        frameSize = nextPow2(frameDuration * sampleRate);
        pitchAnalyzer = new PitchAnalyzer(sampleRate);

        // Set up vibrato analyzer
        pitchSampleRate = sampleRate / frameSize;
        vibratoFrameSize = nextPow2(vibratoFrameDuration * pitchSampleRate);
        vibratoAnalyzer = new PitchAnalyzer(pitchSampleRate);
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

    var pitches = frames.map(function(frame) { return processFrame(frame); })

    numFrames = pitches.length - vibratoFrameSize + 1;
    frames = [];
    for (var i = 0; i < numFrames; i++) {
        frames.push(pitches.slice(i, i + vibratoFrameSize));
    }

    var vibratos = frames.map(function(frame) { return processPitchFrame(frame); })
    var rates = vibratos.map(function(result) { return result.rate; })
    var widths = vibratos.map(function(result) { return result.width; })
    vibratos.forEach(function(result) { console.log(result.rate); })
}

var processFrame = function(buffer) {

    /* Copy samples to the internal buffer */
    pitchAnalyzer.input(buffer);

    /* Process the current input in the internal buffer */
    pitchAnalyzer.process();

    var tone = pitchAnalyzer.findTone();

    if (tone === null) {
        return 0;
    }
    else {
        return tone.freq;
    }
}

var processPitchFrame = function(frame) {

    // Offset the mean pitch
    var meanPitch = mean(frame);
    frame = frame.map(function(val) { return val - meanPitch; })

    vibratoAnalyzer.input(frame);

    /* Process the current input in the internal buffer */
    vibratoAnalyzer.process();

    var tone = vibratoAnalyzer.findTone();

    if (tone === null) {
        return {
            rate: 0,
            width: 0
        }
    }
    else {
        return {
            rate: tone.freq,
            width: tone.db
        }
    }
}

var mean = function(vals) {
    var total = 0;
    vals.forEach(function(val) { total += val; })
    return total / vals.length;
}

var nextPow2 = function(x) {
    return Math.pow(2, Math.ceil(Math.log(x) / Math.log(2)));
}

var visualize = function(result) {
    // TODO: load result into visualization
//    console.dir(result);
}



// Init
stopped = true;
recordButton.style.display = '';
statusLabel.style.display = 'none';
resultsElem.style.display = 'none';
