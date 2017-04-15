var mean = function(vals) {
    var total = 0;
    vals.forEach(function(val) { total += val; })
    return total / vals.length;
}

var nextPow2 = function(x) {
    return Math.pow(2, Math.ceil(Math.log(x) / Math.log(2)));
}
