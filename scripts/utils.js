var mean = function(vals) {
    var total = 0;
    vals.forEach(function(val) { total += val; })
    return total / vals.length;
}

var nextPow2 = function(x) {
    return Math.pow(2, Math.ceil(Math.log(x) / Math.log(2)));
}

/*
 * Converts a frequency in Hz to number of semitones from A-440
 */
var freq2Semitones = function(freq) {
    return 12 * log2(freq / 440);
}

/*
 * Converts number of semitones from A-440 to frequency in Hz
 */
var semitones2Freq = function(semitones) {
    return 440 * Math.pow(2, semitones / 12);
}

/*
 * log base 2
 */
var log2 = function(x) {
    return Math.log(x) / Math.log(2);
}

/*
 * Normalizes values between -1 and 1
 */
var normalize = function(values) {
    var max = Math.max(...values);
    var min = Math.min(...values);
    return values.map(function(val) { return 2 * (val - min) / (max - min) - 1; });
}