function Visualizer(pitchChartName, rateChartName, widthChartName, maxDataPoints) {
    this.pitchChart = initChart(pitchChartName, "Vibrato Width");
    this.rateChart = initChart(rateChartName, "Vibrato Rate");
    this.widthChart = initChart(widthChartName, "Vibrato Width");
    this.maxDataPoints = maxDataPoints;
}

var initChart = function(chartName, chartTitle) {
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
        ]
    });
}

Visualizer.prototype.setMaxDataPoints = function(maxDataPoints) {
    this.maxDataPoints = maxDataPoints;
}

Visualizer.prototype.updatePitchChart = function(pitches, times) {
    this.updateChart(this.pitchChart, 'Pitch', 'Pitch (Hz)', ['blue'], pitches, times);
}

Visualizer.prototype.updateRateChart = function(rates, times) {
    this.updateChart(this.rateChart, 'Vibrato Rate', 'Rate (Hz)', ['green'], rates, times);
}

Visualizer.prototype.updateWidthChart = function(widths, times) {
    this.updateChart(this.widthChart, 'Vibrato Width', 'Width (Hz)', ['red'], widths, times);
}

Visualizer.prototype.updateChart = function(chart, chartTitle, chartLabel, colors, rows, times) {

	if(rows.length > this.maxDataPoints) {
		rows = rows.slice(rows.length - maxDataPoints, rows.length);
		times = times.slice(times.length - maxDataPoints, times.length);
	}

    var min_y = Math.min(...rows);
    var max_y = Math.max(...rows);
    var buffer_y = (max_y - min_y) / 2;

    var dataPoints = [];
    for (var i = 0; i < rows.length; i++) {
        dataPoints.push({ x: i, y: rows[i] })
    }
    chart.options.axisY = {
        minimum: min_y - buffer_y,
        maximum: max_y + buffer_y
    }
    chart.options.data[0] = {
        type: "spline",
        dataPoints: dataPoints
    }

    chart.render();
}
