function Visualizer(pitchChartName, rateChartName, widthChartName, maxDataPoints) {
    this.pitchChartName = pitchChartName;
    this.rateChartName = rateChartName;
    this.widthChartName = widthChartName;
    this.maxDataPoints = maxDataPoints;
}

Visualizer.prototype.setAudioProcessor = function(audioProcessor) {
    this.audioProcessor = audioProcessor;
}

Visualizer.prototype.updatePitchChart = function(pitches, times) {
    this.updateChart(this.pitchChartName, 'Pitch', 'Pitch (Hz)', ['blue'], pitches, times);
}

Visualizer.prototype.updateRateChart = function(rates, times) {
    this.updateChart(this.rateChartName, 'Vibrato Rate', 'Rate (Hz)', ['green'], rates, times);
}

Visualizer.prototype.updateWidthChart = function(widths, times) {
    this.updateChart(this.widthChartName, 'Vibrato Width', 'Width (Hz)', ['red'], widths, times);
}

Visualizer.prototype.updateChart = function(chartName, chartTitle, chartLabel, colors, rows, times) {

	if(rows.length > this.maxDataPoints) {
		rows = rows.slice(rows.length - maxDataPoints, rows.length);
		times = times.slice(times.length - maxDataPoints, times.length);
	}

	var data = new google.visualization.DataTable();
	data.addColumn('number', 'X');
	data.addColumn('number', '');

	var add = [];
	for(var i = 0; i < maxDataPoints; i++) {
//	    if (rows[i] > 0) {
//		    add.push([times[i], rows[i]]);
//	    }
	    add.push([i, rows[i]]);
	}

	data.addRows(add);

	var options = {
		title: chartTitle,
		vAxis: {
		  title: chartLabel
		},
		legend: 'none',
        colors: colors,
        //use this to smooth line
		curveType: 'function',
	}

	var chart = new google.visualization.LineChart(document.getElementById(chartName));
	chart.draw(data, options);
}
