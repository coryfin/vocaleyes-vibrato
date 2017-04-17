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

        var analyzer = context.createAnalyser();
        var processorNode = context.createScriptProcessor(frameSize, 1, 1);
        processorNode.onaudioprocess = function(e) {

            if (!stopped) {

                // Get the audio buffer
                var audioBuffer = new Float32Array(frameSize);
                analyzer.getFloatTimeDomainData(audioBuffer);

                // Save buffer to frame
                var audioFrame = new Float32Array(frameSize);
                for (var i = 0; i < audioBuffer.length; i++) {
                    audioFrame[i] = audioBuffer[i];
                }

                // Process frame
                audioProcessor.process(audioFrame, context.currentTime);

                // TODO: draw chart for every frame or using setInterval?
                drawChart(audioProcessor.getPitches());
            }
        }

        // Connect the source to the processors
        mediaStreamSource.connect(analyzer);
        mediaStreamSource.connect(processorNode);

        processorNode.connect(context.destination);

		intervalFunc = setInterval(calcPitch,50);
	})
}

var stop = function() {
    recorder.stop();
    recorder.exportWAV(function(blob) {
        audioElem.src = window.URL.createObjectURL(blob);
    });
    intervalFunc.clearInterval();
	stopped = true;
    recordButton.innerHTML = 'Record';
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
    else stop();
})

// Init
stopped = true;
recordButton.style.display = '';
statusLabel.style.display = 'none';
//resultsElem.style.display = 'none';
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(function() { drawChart([0]); });


