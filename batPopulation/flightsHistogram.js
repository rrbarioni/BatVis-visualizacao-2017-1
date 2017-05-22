class FlightsHistogram {
	constructor(width,height) {
		this.margin = { top: 20, right: 20, bottom: 30, left: 50 };
		this.width =  width - this.margin.left - this.margin.right;
		this.height = height - this.margin.top - this.margin.bottom;

		this.verticalZoom = d3.zoom()
			.scaleExtent([1,5])
			.on("zoom", this.zoomArea.bind(this));

		this.svg = d3.select("#flightsHistogram")
			.attr("width",  this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.call(this.verticalZoom);
		this.container = this.svg.append("g")
			.attr("class", "container");

		this.xScale = d3.scaleLinear().range([this.margin.left * 2, this.width + this.margin.left]);
		this.yScale = d3.scaleLinear().range([this.height + this.margin.top, this.margin.top]);
		this.xAxis = d3.axisBottom(this.xScale);
		this.yAxis = d3.axisLeft(this.yScale);
		this.xAxisLine = this.svg.append("g").attr("class", "xAxis");
		this.yAxisLine = this.svg.append("g").attr("class", "yAxis");

		this.enteringBats, this.exitingBats, this.neutralBats;
		this.enteringBatsByFlightDuration, this.exitingBatsByFlightDuration, this.neutralBatsByFlightDuration;
		this.enteringBatsByFlightDurationNodes, this.exitingBatsByFlightDurationNodes, this.neutralBatsByFlightDurationNodes;

		this.selectedHistogramBars, this.selectedBats;

		this.receiveBatListData([], [], []);
	}

	receiveBatListData(enteringBats, exitingBats, neutralBats) {
		this.enteringBats = enteringBats;
		this.exitingBats = exitingBats;
		this.neutralBats = neutralBats;

		this.enteringBatsByFlightDuration = [];
		this.exitingBatsByFlightDuration = [];
		this.neutralBatsByFlightDuration = [];

		this.selectedHistogramBars = [];
		this.selectedBats = [];

		for(var i = 0; i < this.enteringBats.length; i++) {
			if (this.batFlightDuration(this.enteringBats[i]) < 1) { continue; }

			if (this.enteringBatsByFlightDuration[this.batFlightDuration(this.enteringBats[i])] === undefined) {
				this.enteringBatsByFlightDuration[this.batFlightDuration(this.enteringBats[i])] = [this.enteringBats[i]];
			}
			else {
				this.enteringBatsByFlightDuration[this.batFlightDuration(this.enteringBats[i])].push(this.enteringBats[i]);
			}
		}

		for(var i = 0; i < this.exitingBats.length; i++) {
			if (this.batFlightDuration(this.exitingBats[i]) < 1) { continue; }

			if (this.exitingBatsByFlightDuration[this.batFlightDuration(this.exitingBats[i])] === undefined) {
				this.exitingBatsByFlightDuration[this.batFlightDuration(this.exitingBats[i])] = [this.exitingBats[i]];
			}
			else {
				this.exitingBatsByFlightDuration[this.batFlightDuration(this.exitingBats[i])].push(this.exitingBats[i]);
			}
		}

		for(var i = 0; i < this.neutralBats.length; i++) {
			if (this.batFlightDuration(this.neutralBats[i]) < 1) { continue; }

			if (this.neutralBatsByFlightDuration[this.batFlightDuration(this.neutralBats[i])] === undefined) {
				this.neutralBatsByFlightDuration[this.batFlightDuration(this.neutralBats[i])] = [this.neutralBats[i]];
			}
			else {
				this.neutralBatsByFlightDuration[this.batFlightDuration(this.neutralBats[i])].push(this.neutralBats[i]);
			}
		}

		for(var i = 0; i < Math.max(this.enteringBatsByFlightDuration.length, Math.max(this.exitingBatsByFlightDuration.length, this.neutralBatsByFlightDuration.length)); i++) {
			if (this.enteringBatsByFlightDuration[i] === undefined) { this.enteringBatsByFlightDuration[i] = []; }
			if (this.exitingBatsByFlightDuration[i] === undefined)  { this.exitingBatsByFlightDuration[i] = [];  }
			if (this.neutralBatsByFlightDuration[i] === undefined)  { this.neutralBatsByFlightDuration[i] = [];  }

			this.selectedHistogramBars.push(false);
		}

		this.drawHistogram();
	}

	zoomArea() {
		return;

		var newYScale = d3.event.transform.rescaleY(this.yScale);
        this.yAxis
	        .tickValues(newYScale.ticks(10).filter(function(d) { return Number.isInteger(d); }))
	        .tickFormat(d3.format(".0f"));
    	this.yAxisLine
    		.transition()
    		.call(this.yAxis.scale(newYScale));

    	this.enteringBatsByFlightDurationNodes
    		.attr("y",      function(d,i) { return newYScale(d.length); }.bind(this))
			.attr("height", function(d,i) { return newYScale(0) - newYScale(d.length); }.bind(this));
		this.exitingBatsByFlightDurationNodes
    		.attr("y",      function(d,i) { return newYScale(d.length); }.bind(this))
			.attr("height", function(d,i) { return newYScale(0) - newYScale(d.length); }.bind(this));
		this.neutralBatsByFlightDurationNodes
    		.attr("y",      function(d,i) { return newYScale(d.length); }.bind(this))
			.attr("height", function(d,i) { return newYScale(0) - newYScale(d.length); }.bind(this));
	}

	setAxisDomain() {
		// rescale yScale to original form
		// console.log(d3.event);

		var maxBatCountByFlightDuration = 0;
		for(var i = 0; i < Math.max(this.enteringBatsByFlightDuration.length, Math.max(this.exitingBatsByFlightDuration.length, this.neutralBatsByFlightDuration.length)); i++) {
			maxBatCountByFlightDuration = Math.max(maxBatCountByFlightDuration, this.enteringBatsByFlightDuration[i].concat(this.exitingBatsByFlightDuration[i]).concat(this.neutralBatsByFlightDuration[i]).length);
		}

		this.xScale.domain([0, Math.max(1, Math.max(this.enteringBatsByFlightDuration.length, Math.max(this.exitingBatsByFlightDuration.length, this.neutralBatsByFlightDuration.length)))]);
		this.yScale.domain([0, Math.max(1, maxBatCountByFlightDuration)]);
	}

	drawAxis() {
		this.setAxisDomain();

		this.xAxis
			.tickValues(this.xScale.ticks(10).filter(function(d) { return Number.isInteger(d); }))
	        .tickFormat(d3.format(".0f"));
		this.xAxisLine
			.transition()
	        .attr("transform", "translate(0," + (this.height + this.margin.top) + ")")
	        .call(this.xAxis);

	    this.yAxis
        	.tickValues(this.yScale.ticks(10).filter(function(d) { return Number.isInteger(d); }))
        	.tickFormat(d3.format(".0f"));
	    this.yAxisLine
	    	.transition()
	        .attr("transform", "translate(" + this.margin.left + ",0)")
	        .call(this.yAxis);
	}

	drawHistogram() {
		this.drawAxis();

		var nodeOpacity = 1;

		this.enteringBatsByFlightDurationNodes = this.container.selectAll(".enteringBatByFlightDurationNode")
			.data(this.enteringBatsByFlightDuration);
		this.enteringBatsByFlightDurationNodes
			.exit()
			.remove();
		this.enteringBatsByFlightDurationNodes
			.transition()
			.attr("class", "enteringBatByFlightDurationNode")
			.attr("x",      function(d,i) { return this.xScale(i - 0.5); }.bind(this))
			.attr("y",      function(d,i) { return this.yScale(d.length); }.bind(this))
			.attr("width",  this.xScale(1) - this.xScale(0))
			.attr("height", function(d,i) { return this.yScale(0) - this.yScale(d.length); }.bind(this))
			.attr("fill",   function(d,i) { return this.selectNodeColor(i,"entering"); }.bind(this))
			.attr("fill-opacity", nodeOpacity);
		this.enteringBatsByFlightDurationNodes
			.enter()
			.append("rect")
			.transition()
			.attr("class", "enteringBatByFlightDurationNode")
			.attr("x",      function(d,i) { return this.xScale(i - 0.5); }.bind(this))
			.attr("y",      function(d,i) { return this.yScale(d.length); }.bind(this))
			.attr("width",  this.xScale(1) - this.xScale(0))
			.attr("height", function(d,i) { return this.yScale(0) - this.yScale(d.length); }.bind(this))
			.attr("fill", function(d,i) { return this.selectNodeColor(i,"entering"); }.bind(this))
			.attr("fill-opacity", nodeOpacity);
		this.container.selectAll(".enteringBatByFlightDurationNode")
			.on("click", function(d,i) { this.selectHistogramBar(i); }.bind(this));

		this.exitingBatsByFlightDurationNodes = this.container.selectAll(".exitingBatByFlightDurationNode")
			.data(this.exitingBatsByFlightDuration);
		this.exitingBatsByFlightDurationNodes
			.exit()
			.remove();
		this.exitingBatsByFlightDurationNodes
			.transition()
			.attr("class", "exitingBatByFlightDurationNode")
			.attr("x",      function(d,i) { return this.xScale(i - 0.5); }.bind(this))
			.attr("y",      function(d,i) { return this.yScale(d.length + this.enteringBatsByFlightDuration[i].length); }.bind(this))
			.attr("width",  this.xScale(1) - this.xScale(0))
			.attr("height", function(d,i) { return this.yScale(0) - this.yScale(d.length); }.bind(this))
			.attr("fill", function(d,i) { return this.selectNodeColor(i,"exiting"); }.bind(this))
			.attr("fill-opacity", nodeOpacity);
		this.exitingBatsByFlightDurationNodes
			.enter()
			.append("rect")
			.transition()
			.attr("class", "exitingBatByFlightDurationNode")
			.attr("x",      function(d,i) { return this.xScale(i - 0.5); }.bind(this))
			.attr("y",      function(d,i) { return this.yScale(d.length + this.enteringBatsByFlightDuration[i].length); }.bind(this))
			.attr("width",  this.xScale(1) - this.xScale(0))
			.attr("height", function(d,i) { return this.yScale(0) - this.yScale(d.length); }.bind(this))
			.attr("fill", function(d,i) { return this.selectNodeColor(i,"exiting"); }.bind(this))
			.attr("fill-opacity", nodeOpacity);
		this.container.selectAll(".exitingBatByFlightDurationNode")
			.on("click", function(d,i) { this.selectHistogramBar(i); }.bind(this));

		this.neutralBatsByFlightDurationNodes = this.container.selectAll(".neutralBatByFlightDurationNode")
			.data(this.neutralBatsByFlightDuration);
		this.neutralBatsByFlightDurationNodes
			.exit()
			.remove();
		this.neutralBatsByFlightDurationNodes
			.transition()
			.attr("class", "neutralBatByFlightDurationNode")
			.attr("x",      function(d,i) { return this.xScale(i - 0.5); }.bind(this))
			.attr("y",      function(d,i) { return this.yScale(d.length + this.enteringBatsByFlightDuration[i].length + this.exitingBatsByFlightDuration[i].length); }.bind(this))
			.attr("width",  this.xScale(1) - this.xScale(0))
			.attr("height", function(d,i) { return this.yScale(0) - this.yScale(d.length); }.bind(this))
			.attr("fill", function(d,i) { return this.selectNodeColor(i,"neutral"); }.bind(this))
			.attr("fill-opacity", nodeOpacity);
		this.neutralBatsByFlightDurationNodes
			.enter()
			.append("rect")
			.transition()
			.attr("class", "neutralBatByFlightDurationNode")
			.attr("x",      function(d,i) { return this.xScale(i - 0.5); }.bind(this))
			.attr("y",      function(d,i) { return this.yScale(d.length + this.enteringBatsByFlightDuration[i].length + this.exitingBatsByFlightDuration[i].length); }.bind(this))
			.attr("width",  this.xScale(1) - this.xScale(0))
			.attr("height", function(d,i) { return this.yScale(0) - this.yScale(d.length); }.bind(this))
			.attr("fill", function(d,i) { return this.selectNodeColor(i,"neutral"); }.bind(this))
			.attr("fill-opacity", nodeOpacity);
		this.container.selectAll(".neutralBatByFlightDurationNode")
			.on("click", function(d,i) { this.selectHistogramBar(i); }.bind(this));
	}

	selectNodeColor(i,nodeType) {
		if (!this.selectedHistogramBars[i]) { 
			switch(nodeType) {
				case "entering": return "#00FF00"; break;
				case "exiting":  return "#FF0000"; break;
				case "neutral":  return "#0000FF"; break;
			}
		}
		else {
			return "#FFFF00";
		}
	}

	selectHistogramBar(i) {
		if (!this.selectedHistogramBars[i]) {
			this.selectedBats = this.selectedBats
				.concat(this.enteringBatsByFlightDuration[i])
				.concat(this.exitingBatsByFlightDuration[i])
				.concat(this.neutralBatsByFlightDuration[i]);
		}
		else {
			this.selectedBats = this.selectedBats
				.filter(function(d) { return this.batFlightDuration(d) != i; }.bind(this));
		}

		this.selectedHistogramBars[i] = !this.selectedHistogramBars[i];

		this.dispatch.call(
			"histogramBarListChanged",
			{
				"id": "flightsHistogram",
				"batLabels": this.selectedBats.map(function(d) { return d.label; })
			}
		);

		this.drawHistogram();
	}

	batFlightDuration(bat) {
		return bat.f2 - bat.f1;
	}

}