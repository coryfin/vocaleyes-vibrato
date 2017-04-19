/*
 * An AudioProcessor object is used to calculate pitch and vibrato rate and width frame by frame.
 * When you get a new frame, call AudioProcessor.prototype.process().
 * You can then get all processed pitches, rates, and widths via getPitches, getVibratoRates, getVibratoWidths
 */

let recentPitch;//global access in case setInterval isn't good enough to use

const MIN_TONE_DURATION = 0.2;
const PITCH_FRAME_DURATION = 0.02; // 2 cycles of 100 Hz tone
const VIBRATO_FRAME_DURATION = 0.2; // 1 cycles of 2 Hz vibrato. See https://en.wikipedia.org/wiki/Vibrato#Typical_rate_and_extent_of_vibrato

function AudioProcessor(sampleRate) {
    this.sampleRate = sampleRate;
    this.frameSize = nextPow2(PITCH_FRAME_DURATION * sampleRate);
    this.pitchSampleRate = this.sampleRate / this.frameSize;
    this.vibratoFrameSize = nextPow2(VIBRATO_FRAME_DURATION * this.pitchSampleRate);

    this.pitchAnalyzer = new PitchAnalyzer(sampleRate);
    this.vibratoAnalyzer = new PitchAnalyzer(this.sampleRate / this.frameSize);

    this.timestamps = [];
    this.frames = [];
    this.pitches = [];
    this.vibratoRates = [];
    this.vibratoWidths = [];
}

AudioProcessor.prototype.getFrameSize = function() {
    return this.frameSize;
}

AudioProcessor.prototype.getTimestamps = function() {
    return this.timestamps;
}

AudioProcessor.prototype.getPitches = function() {
    return this.pitches;
}

AudioProcessor.prototype.getVibratoRates = function() {
    return this.vibratoRates;
}

AudioProcessor.prototype.getVibratoWidths = function() {
    return this.vibratoWidths;
}

AudioProcessor.prototype.currentPitch = function() {
	recentPitch = this.pitches[this.pitches.length - 1];
	return this.pitches[this.pitches.length - 1];
	
}


/*
 * Resets all historical frames, pitches, and vibrato results.
 */
AudioProcessor.prototype.clear = function() {
    this.timestamps = [];
    this.frames = [];
    this.pitches = [];
    this.vibratoRates = [];
    this.vibratoWidths = [];
}

/*
 * Processes a new frame, storing all info in frames, pitches, vibratoRates, and vibratoWidths.
 */
AudioProcessor.prototype.process = function(frame, timestamp) {
    this.timestamps.push(timestamp);
    this.frames.push(frame);
    this.pitchProcess();
    this.vibratoProcess();
}

/*
 * Finds pitch for the latest frame buffer and adds it to the pitch array.
 */
AudioProcessor.prototype.pitchProcess = function() {
    var result = detectPitch(this.frames[this.frames.length - 1]);
    if (result != null && result.freq != -1) {
        this.pitches.push(result.freq);
    }

    this.smoothPitchContour();
}

/*
 * Smooths the latest frame of duration MIN_TONE_DURATION
 */
AudioProcessor.prototype.smoothPitchContour = function() {

    var toneFrameSize = Math.round(MIN_TONE_DURATION * this.pitchSampleRate);
    var end = this.pitches.length - 1;
    var start = end - toneFrameSize;

    // If the bookends of the tone frame are within a quarter tone, average out the intermediate pitch values
    var semitoneDiff = Math.abs(freq2Semitones(this.pitches[start]) - freq2Semitones(this.pitches[end]))
    if (semitoneDiff < 0.5) {
        var avePitch = (this.pitches[start] + this.pitches[end]) / 2;
        for (var i = start + 1; i < end; i++) {

            semitoneDiff = Math.abs(freq2Semitones(avePitch) - freq2Semitones(this.pitches[i]))
            if (semitoneDiff > 1) {
                if (this.pitches[i] > avePitch) {
                    var n = Math.round(this.pitches[i] / avePitch);
                    this.pitches[i] /= n;
                }
                else if (this.pitches[i] < avePitch) {
                    var n = Math.round(avePitch / this.pitches[i]);
                    this.pitches[i] *= n;
                }
            }
        }

        for (var i = start + 1; i < end; i++) {
            // If its still not within a semitone, make it the average of its neighbors
            if (semitoneDiff > 1) {
                this.pitches[i] = (this.pitches[i - 1] + this.pitches[i + 1]) / 2;
            }
        }
    }
}

/*
 * Calculates vibrato parameters from the latest pitch buffer and adds them to their respective arrays.
 * Only call this after calling pitchProcess.
 */
AudioProcessor.prototype.vibratoProcess = function() {

    if (this.pitches.length < this.vibratoFrameSize) {
        this.vibratoRates.push(0);
        this.vibratoWidths.push(0);
    }
    else {
        var pitchFrame = this.pitches.slice(this.pitches.length - this.vibratoFrameSize, this.pitches.length);

        this.vibratoWidths.push(Math.max(...pitchFrame) - Math.min(...pitchFrame));

        // Normalize pitches (zero out the DC offset)
        var normalizedPitchFrame = normalize(pitchFrame);

        // Peak-picking algorithm
        var peakIndices = [];
        for (var i = 1; i < normalizedPitchFrame.length - 1; i++) {
            if (normalizedPitchFrame[i] > normalizedPitchFrame[i - 1] &&
                    normalizedPitchFrame[i] > normalizedPitchFrame[i + 1]) {
                peakIndices.push(i);
            }
        }

        var frameStart = this.frames.length - this.vibratoFrameSize - 1;
        var start = frameStart + peakIndices[0];
        var end = frameStart + peakIndices[peakIndices.length - 1];
        var duration = this.timestamps[end] - this.timestamps[start];
        var rate = (peakIndices.length - 1) / duration;
        this.vibratoRates.push(rate);
    }
}
