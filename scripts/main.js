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
            visualizePitch(audioProcessor.getPitches());
				    visualizeRate(audioProcessor.getVibratoRates());
				    visualizeWidth(audioProcessor.getVibratoWidths());
        }
    }

    // Connect the audio graph
    source.connect(processorNode);
    processorNode.connect(context.destination);

    intervalFunc = setInterval(calcPitch,50);
}


var pitchChartName = 'pitch_chart_div';
var rateChartName = 'rate_chart_div';
var widthChartName = 'width_chart_div';
var maxDataPoints = 70;
function visualizePitch(pitches) {
	if(pitches.length <= maxDataPoints) {
		updatePitchChart(pitches, audioProcessor.getTimestamps());
	}
	else {
		var boundedPitch = pitches.slice(pitches.length - maxDataPoints, pitches.length);
		updatePitchChart(boundedPitch, audioProcessor.getTimestamps());
	}
}

function updatePitchChart(rows, times) {
	var data = new google.visualization.DataTable();
	data.addColumn('number', 'X');
	data.addColumn('number', '');
	
	var add = [];
	for(var i = 0; i < maxDataPoints; i++) {
		add.push([i, rows[i]]);
	}
	
	data.addRows(add);

	var options = {
		title: 'Pitch',
		hAxis: {
		  title: 'Time'
		},
		vAxis: {
		  title: 'Pitch (Hz)'
		},
		//use this to smooth line
		//curveType: 'function'
	}

	var chart = new google.visualization.LineChart(document.getElementById(pitchChartName));
	chart.draw(data, options);
}

function visualizeRate(rates) {
	if(rates.length <= maxDataPoints) {
		updateRateChart(rates, audioProcessor.getTimestamps());
	}
	else {
		var boundedPitch = rates.slice(rates.length - maxDataPoints, rates.length);
		updateRateChart(boundedPitch, audioProcessor.getTimestamps());
	}
}

function updateRateChart(rows, times) {
	var data = new google.visualization.DataTable();
	data.addColumn('number', 'X');
	data.addColumn('number', '');
	
	var add = [];
	for(var i = 0; i < maxDataPoints; i++) {
		add.push([i, rows[i]]);
	}
	
	data.addRows(add);

	var options = {
		title: 'Vibrato Rate',
		hAxis: {
		  title: 'Time'
		},
		vAxis: {
		  title: 'Rate'
		},
		colors: ['green'],
		//use this to smooth line
		curveType: 'function'
	}

	var chart = new google.visualization.LineChart(document.getElementById(rateChartName));
	chart.draw(data, options);
}

function visualizeWidth(widths) {
	if(widths.length <= maxDataPoints) {
		updateWidthChart(widths, audioProcessor.getTimestamps());
	}
	else {
		var boundedPitch = widths.slice(widths.length - maxDataPoints, widths.length);
		updateWidthChart(boundedPitch, audioProcessor.getTimestamps());
	}
}

function updateWidthChart(rows, times) {
	var data = new google.visualization.DataTable();
	data.addColumn('number', 'X');
	data.addColumn('number', '');
	
	var add = [];
	for(var i = 0; i < maxDataPoints; i++) {
		add.push([i, rows[i]]);
	}
	
	data.addRows(add);

	var options = {
		title: 'Vibrato Width',
		hAxis: {
		  title: 'Time'
		},
		vAxis: {
		  title: 'Width'
		},
		colors: ['red'],
		//use this to smooth line
		curveType: 'function'
	}

	var chart = new google.visualization.LineChart(document.getElementById(widthChartName));
	chart.draw(data, options);
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



