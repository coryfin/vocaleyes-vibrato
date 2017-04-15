/*
 * An AudioProcessor object is used to calculate pitch and vibrato rate and width frame by frame.
 * When you get a new frame, call AudioProcessor.prototype.process().
 * You can then get all processed pitches, rates, and widths via getPitches, getVibratoRates, getVibratoWidths
 */

function AudioProcessor(sampleRate, pitchFrameDuration, vibratoFrameDuration) {
    this.sampleRate = sampleRate;
    this.frameSize = nextPow2(pitchFrameDuration * sampleRate);
    var pitchSampleRate = this.sampleRate / this.frameSize;
    this.vibratoFrameSize = nextPow2(vibratoFrameDuration * pitchSampleRate);

    this.pitchAnalyzer = new PitchAnalyzer(sampleRate);
    this.vibratoAnalyzer = new PitchAnalyzer(this.sampleRate / this.frameSize);

    this.frames = [];
    this.pitches = [];
    this.vibratoRates = [];
    this.vibratoWidths = [];
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

/*
 * Resets all historical frames, pitches, and vibrato results.
 */
AudioProcessor.prototype.clear = function() {
    this.frames = [];
    this.pitches = [];
    this.vibratoRates = [];
    this.vibratoWidths = [];
}

/*
 * Processes a new frame, storing all info in frames, pitches, vibratoRates, and vibratoWidths.
 */
AudioProcessor.prototype.process = function(frame) {
    this.frames.push(frame);
    this.pitchProcess();
    this.vibratoProcess();
}

/*
 * Finds pitch for the latest frame buffer and adds it to the pitch array.
 */
AudioProcessor.prototype.pitchProcess = function() {

    this.pitchAnalyzer.input(this.frames[this.frames.length - 1]);
    this.pitchAnalyzer.process();
    var tone = this.pitchAnalyzer.findTone();

    if (tone === null) {
        this.pitches.push(this.pitches[this.pitches.length - 1]);
    }
    else {
        this.pitches.push(tone.freq);
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

        // Normalize pitches (zero out the DC offset)
        var meanPitch = mean(pitchFrame);
        var normalizedPitchFrame = pitchFrame.map(function(val) { return val - meanPitch; })

        this.vibratoAnalyzer.input(normalizedPitchFrame);
        this.vibratoAnalyzer.process();
        var tone = this.vibratoAnalyzer.findTone();

        if (tone === null) {
            this.vibratoRates.push(0);
            this.vibratoWidths.push(0);
        }
        else {
            this.vibratoRates.push(tone.freq);
            this.vibratoWidths.push(tone.db);
        }
    }
}
