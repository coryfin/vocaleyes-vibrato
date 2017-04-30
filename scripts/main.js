let recordButton = document.getElementById('record');
let audioElem = document.getElementById('audio');
const VISUAL_FRAME_RATE = 10; // frames per second

let windowDuration = 2;
let stopped;
let recorder;
let audioProcessor;
let frameSize;
let frameRate;
let maxDataPoints;

let intervalFunc;
let previousPitch;
let date  = new Date();
let previousTime = 0;

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

var audioSetup = function(context, source) {

    audioProcessor = new AudioProcessor(context.sampleRate);

    frameSize = audioProcessor.getFrameSize();
    frameRate = context.sampleRate / frameSize;
    maxDataPoints = Math.round(windowDuration * frameRate);
    visualizer.setMaxDataPoints(maxDataPoints);

    var processorNode = context.createScriptProcessor(frameSize, 1, 1);
    processorNode.onaudioprocess = function(e) {
        if (!stopped) {
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
    calcPitch();
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
	if(date.getMilliseconds() - previousTime < 250){//only update every 3 seconds
		return;	
	}
	
	
	var current = audioProcessor.getPitches();
	var new_current = current[current.length - 1];
	console.log(new_current);
	previousPitch = new_current;

	if(new_current == -1){
		console.log("got an invalid pitch, about to return");
		return;//do nothing here
	}

	//base case
	if(previousPitch === null){
		drawCurrentPitch(new_current);
		return;
	}

	if(new_current > 1.9 * previousPitch){//catches if fundamental frequency was dropped
		drawCurrentPitch(previousPitch);
		return;
	}


	if(new_current < 0.55 * previousPitch){//catches if fundemental was dropped in the previous function call
		drawCurrentPitch(previousPitch);
		return;
	}

	console.log("about to call drawCurrentPitch()");
	drawCurrentPitch(new_current);
	
	previousTime = d.getMilliseconds();
	return;

}

/*
This function needs to be implemented

It takes in a frequency as a 32 bit float
and should draw this onto the screen somehow
*/
function drawCurrentPitch(pitch){
	var newPitch = pitchName(pitch);
	document.getElementById('pitch_name_element').innerHTML = pitchName(pitch);
	document.getElementById('offset_element').innerHTML = offset;
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

//plugin bootstrap minus and plus
//http://jsfiddle.net/laelitenetwork/puJ6G/
$('.btn-number').click(function(e){
    e.preventDefault();

    fieldName = $(this).attr('data-field');
    type      = $(this).attr('data-type');
    var input = $("input[name='"+fieldName+"']");
    var currentVal = parseInt(input.val());
    if (!isNaN(currentVal)) {
        if(type == 'minus') {

            if(currentVal > input.attr('min')) {
                input.val(currentVal - 1).change();
            }
            if(parseInt(input.val()) == input.attr('min')) {
                $(this).attr('disabled', true);
            }

        } else if(type == 'plus') {

            if(currentVal < input.attr('max')) {
                input.val(currentVal + 1).change();
            }
            if(parseInt(input.val()) == input.attr('max')) {
                $(this).attr('disabled', true);
            }

        }
    } else {
        input.val(0);
    }
});
$('.input-number').focusin(function(){
   $(this).data('oldValue', $(this).val());
});
$('.input-number').change(function() {

    minValue =  parseInt($(this).attr('min'));
    maxValue =  parseInt($(this).attr('max'));
    valueCurrent = parseInt($(this).val());
    windowDuration = valueCurrent;
    maxDataPoints = Math.round(windowDuration * frameRate);
    visualizer.setMaxDataPoints(maxDataPoints);

    name = $(this).attr('name');
    if(valueCurrent >= minValue) {
        $(".btn-number[data-type='minus'][data-field='"+name+"']").removeAttr('disabled')
    } else {
        alert('Sorry, the minimum value was reached');
        $(this).val($(this).data('oldValue'));
    }
    if(valueCurrent <= maxValue) {
        $(".btn-number[data-type='plus'][data-field='"+name+"']").removeAttr('disabled')
    } else {
        alert('Sorry, the maximum value was reached');
        $(this).val($(this).data('oldValue'));
    }


});
$(".input-number").keydown(function (e) {
    // Allow: backspace, delete, tab, escape, enter and .
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
         // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
         // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
             // let it happen, don't do anything
             return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
});
