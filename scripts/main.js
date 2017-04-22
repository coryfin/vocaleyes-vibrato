let recordButton = document.getElementById('record');
let audioElem = document.getElementById('audio');

const MAX_WINDOW_WIDTH = 2; // seconds
const VISUAL_FRAME_RATE = 10; // frames per second

let stopped;
let recorder;
let audioProcessor;
let frameSize;
let maxDataPoints;

let intervalFunc;
let previousPitch;

let pitchChartName = 'pitch_chart_div';
let rateChartName = 'rate_chart_div';
let widthChartName = 'width_chart_div';
let visualizer = new Visualizer(pitchChartName, rateChartName, widthChartName, maxDataPoints);

var play = function() {

    stopped = false;
    var context = new AudioContext();
    var sourceNode = context.createMediaElementSource(audioElem);
    sourceNode.connect(context.destination);
    audioSetup(context, sourceNode);
}

var stopPlaying = function() {
    stopped = true;
//    visualize();
    clearInterval(intervalFunc);
}

var record = function() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function(stream) {

        // Begin recording, update state
        stopped = false;
        recordButton.innerHTML = 'Stop';

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

var count = 0;
var audioSetup = function(context, source) {

    audioProcessor = new AudioProcessor(context.sampleRate);

    frameSize = audioProcessor.getFrameSize();
    var frameRate = context.sampleRate / frameSize;
    maxDataPoints = Math.round(MAX_WINDOW_WIDTH * frameRate);
    visualizer.setMaxDataPoints(maxDataPoints);

    var processorNode = context.createScriptProcessor(frameSize, 1, 1);
    processorNode.onaudioprocess = function(e) {
        if (!stopped) {
            count++;
//            console.log("Processing frame " + count);

            // Get the audio buffer and process the frame
            var audioFrame = new Float32Array(frameSize);
            e.inputBuffer.copyFromChannel(audioFrame, 0);
            audioProcessor.process(audioFrame, e.playbackTime);
        }
    }

    // Connect the audio graph
    source.connect(processorNode);
    processorNode.connect(context.destination);

    intervalFunc = setInterval(visualize, 1000 / VISUAL_FRAME_RATE);
}

/**
 * Draws data from AudioProcessor on the charts.
 * The Google charts is a bottleneck, so it needs a slower frame rate that the AudioProcessor.
 */
function visualize() {

    visualizer.updatePitchChart(audioProcessor.getPitches(), audioProcessor.getTimestamps());
    visualizer.updateRateChart(audioProcessor.getVibratoRates(), audioProcessor.getTimestamps());
    visualizer.updateWidthChart(audioProcessor.getVibratoWidths(), audioProcessor.getTimestamps());
//    calcPitch();
}

function loadCharts() {
    visualizer.updatePitchChart([],[]);
    visualizer.updateRateChart([],[]);
    visualizer.updateWidthChart([],[]);
}

function updateData(result) {
	
	if(pitchData.length + result.length < maxDataPoints) {
		for(var i = 0; i < result.length; i++) {
			pitchData.push(result[i]);
		}
	}
	else {
		var revRes = result.reverse();
		var revData = pitchData.reverse();
		var newList = [];
		for(var i = 0; i < pitchData.length; i++) {
			revRes.push(revData[i]);
		}
		
		for(var i = 0; i < maxDataPoints; i++) {
			newList.push(revRes[i]);
		}
		pitchData = newList.reverse();
	}
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
	document.getElementById('pitch_name_element').innerHTML = pitchName(pitch);
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
loadCharts();
