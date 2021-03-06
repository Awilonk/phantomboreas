WeeklySummary = (function(){
	function WeeklySummary(selector, data, dateStart) {
		this.selector = selector;
		this.raw_data = data;
		this.dateStart = dateStart;
		this.data = [{key: "Citations by Day", values: []}];
		this.labels = [];

		this.initializeLabels();
		this.formatData();
	}

	WeeklySummary.prototype.initializeLabels = function() {
		for(var i = 0; i <= 6; i++) {
			this.labels.push(Utils.time.date_x_days_from_y(i, this.dateStart));
		}
	}

	WeeklySummary.prototype.formatData = function() {
		var self = this;

		this.labels.forEach(function(label) {
			self.data[0].values.push({label: label, count: 0})
		});

		this.raw_data.citations.forEach(function(d) {
			var timestamp = d.evidence[0].timestamp,
				label = Utils.time.human_date(timestamp),
				idx;

			if((idx = self.labels.indexOf(label)) > -1) self.data[0].values[idx].count++;
		});
	}

	WeeklySummary.prototype.render = function() {
		var self = this;

		$(self.selector).html("<svg id='weekly-summary' style='width: 100%; min-height:500px'></svg>")

		nv.addGraph(function() {
		  var chart = nv.models.discreteBarChart()
		      .x(function(d) { return d.label; })
		      .y(function(d) { return d.count; });

		  d3.select(self.selector + ' #weekly-summary')
		  	.attr('height', '100%')
			.datum(self.data)
			.call(chart);

		  nv.utils.windowResize(chart.update);

		  return chart;
		});
	}

	return WeeklySummary;
})();

WeeklyAveragesSummary = (function(){
	function WeeklyAveragesSummary(selector, data, dateStart) {
		this.selector = selector;
		this.raw_data = data;
		this.dateStart = dateStart;
		this.data = [{key: "Citations by Day", values: []}];
		this.labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

		this.formatData();

	}

	WeeklyAveragesSummary.prototype.formatData = function() {
		var self = this;

		this.labels.forEach(function(label) {
			self.data[0].values.push({label: label, average: 0})
		});

		this.raw_data.citations.forEach(function(d) {
			var timestamp = d.evidence[0].timestamp,
				label = Utils.time.day_of_week(timestamp),
				idx;

			if((idx = self.labels.indexOf(label)) > -1) self.data[0].values[idx].average++;
		});

		var weeks_elapsed = Utils.time.weeks_elapsed(this.raw_data.citations.map(function(d){ return d.evidence[0].timestamp; }));

		self.data[0].values.forEach(function(d) {
			d.average /= weeks_elapsed;
		});
	}

	WeeklyAveragesSummary.prototype.render = function() {
		var self = this;

		$(self.selector).html("<svg id='weekly-averages-summary' style='width: 100%; min-height:500px'></svg>")

		nv.addGraph(function() {
		  var chart = nv.models.discreteBarChart()
		      .x(function(d) { return d.label; })
		      .y(function(d) { return d.average; });

		  d3.select(self.selector + ' #weekly-averages-summary')
		  	.attr('height', '100%')
			.datum(self.data)
			.call(chart);

		  nv.utils.windowResize(chart.update);

		  return chart;
		});
	}

	return WeeklyAveragesSummary;
})();