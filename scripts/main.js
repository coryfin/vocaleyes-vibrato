let recordButton = document.getElementById('record');
let statusLabel = document.getElementById('status');
let resultsElem = document.getElementById('results');
let audioElem = document.getElementById('audio');
let visualizationElem = document.getElementById('visualization');

let stopped;
let recorder;
let audioProcessor;
let frameSize;

let intervalFunc;
let previousPitch;

var play = function() {

    stopped = false;
    var context = new AudioContext();
    var sourceNode = context.createMediaElementSource(audioElem);
    sourceNode.connect(context.destination);
    audioSetup(context, sourceNode);
}

var stopPlaying = function() {
    stopped = true;
}

var record = function() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function(stream) {

        // Begin recording, update state
        stopped = false;
        recordButton.innerHTML = 'Stop';
//        resultsElem.style.display = 'none';

        var context = new AudioContext();
        var sourceNode = context.createMediaStreamSource(stream);
        audioSetup(context, sourceNode);

        recorder = new Recorder(sourceNode);
        recorder.record();
	})
}

var stopRecording = function() {
    recorder.stop();
    recorder.exportWAV(function(blob) {
        audioElem.src = window.URL.createObjectURL(blob);
    });
    clearInterval(intervalFunc);
	stopped = true;
    recordButton.innerHTML = 'Record';
}

var audioSetup = function(context, source) {

    audioProcessor = new AudioProcessor(context.sampleRate);

    frameSize = audioProcessor.getFrameSize();

    var processorNode = context.createScriptProcessor(frameSize, 1, 1);
    processorNode.onaudioprocess = function(e) {

        if (!stopped) {

            // Get the audio buffer
            var audioFrame = new Float32Array(frameSize);
            e.inputBuffer.copyFromChannel(audioFrame, 0);

            // Process frame
            audioProcessor.process(audioFrame, context.currentTime);

            // TODO: draw chart for every frame or using setInterval?
            drawChart(audioProcessor.getPitches());
        }
    }

    // Connect the audio graph
    source.connect(processorNode);
    processorNode.connect(context.destination);

    intervalFunc = setInterval(calcPitch,50);
}

function drawChart(pitches) {

    var pitchTuples = [];
    for (var i = 0; i < pitches.length; i++) {
        pitchTuples.push([i, pitches[i]])
    }
    var data = google.visualization.arrayToDataTable([['Time', 'Pitch']].concat(pitchTuples));

    var options = {
        title: 'Pitch',
        curveType: 'function',
        legend: 'none'
    };

    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
//    var chart = new google.visualization.ScatterChart(document.getElementById('curve_chart'));
    chart.draw(data, options);
}

function calcPitch(){
	//get most recent pitch
	var currentPitch = audioProcessor.currentPitch();

	//base case
	if(previousPitch === null){
		previousPitch = currentPitch.freq;
		drawCurrentPitch(currentPitch.freq);
		return;
	}

	if(currentPitch > 1.9 * previousPitch){//catches if fundamental frequency was dropped
		drawCurrentPitch(previousPitch);
		previousPitch = currentPitch.freq;
	}


	if(currentPitch < 0.55 * previousPitch){//catches if fundemental was dropped in the previous function call
		drawCurrentPitch(previousPitch);
		previousPitch = currentPitch.freq;
	}

}

/*
This function needs to be implemented

It takes in a frequency as a 32 bit float
and should draw this onto the screen somehow
*/
function drawCurrentPitch(pitch){
	return true;
}

// Hook up events
recordButton.addEventListener('click', function() {
    if (stopped) record();
    else stopRecording();
})

audioElem.onplay = play;
audioElem.onended = stopPlaying;
audioElem.onpause = stopPlaying;

// Init
stopped = true;
recordButton.style.display = '';
statusLabel.style.display = 'none';
//resultsElem.style.display = 'none';
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(function() { drawChart([0]); });


