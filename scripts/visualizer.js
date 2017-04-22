function Visualizer(pitchChartName, rateChartName, widthChartName, maxDataPoints) {
    this.pitchChart = initChart(pitchChartName, "Pitch", MIN_PITCH, MAX_PITCH);
    this.rateChart = initChart(rateChartName, "Vibrato Rate", MIN_RATE, MAX_RATE);
    this.widthChart = initChart(widthChartName, "Vibrato Width", MIN_WIDTH, MAX_WIDTH);
    this.maxDataPoints = maxDataPoints;
}

var initChart = function(chartName, chartTitle, yMin, yMax) {
    return new CanvasJS.Chart(chartName,
    {
        title:{
            text: chartTitle
        },
        data: [
            {
            type: "spline",
            dataPoints: []
            }
        ],
        axisY: {
            minimum: yMin,
            maximum: yMax
        }
    });
}

Visualizer.prototype.setMaxDataPoints = function(maxDataPoints) {
    this.maxDataPoints = maxDataPoints;
}

Visualizer.prototype.updatePitchChart = function(pitches, times) {

    var min_y = Math.min(...pitches);
    var max_y = Math.max(...pitches);
    var buffer_y = (max_y - min_y) / 2;

    this.pitchChart.options.axisY.minimum = min_y - buffer_y;
    this.pitchChart.options.axisY.maximum = max_y + buffer_y;

    this.updateChart(this.pitchChart, 'Pitch', pitches, times);
}

Visualizer.prototype.updateRateChart = function(rates, times) {
    this.updateChart(this.rateChart, 'Vibrato Rate', rates, times);
}

Visualizer.prototype.updateWidthChart = function(widths, times) {
    this.updateChart(this.widthChart, 'Vibrato Width', widths, times);
}

Visualizer.prototype.updateChart = function(chart, chartTitle, rows, times) {

	if(rows.length > this.maxDataPoints) {
		rows = rows.slice(rows.length - maxDataPoints, rows.length);
		times = times.slice(times.length - maxDataPoints, times.length);
	}

    var dataPoints = [];
    for (var i = 0; i < rows.length; i++) {
        dataPoints.push({ x: i, y: rows[i] })
    }
    chart.options.data[0] = {
        type: "spline",
        dataPoints: dataPoints
    }

    chart.render();
}
