class FlightsHistogram {
	constructor(width,height) {
		this.margin = { top: 20, right: 20, bottom: 30, left: 50 };
		this.width =  width - this.margin.left - this.margin.right;
		this.height = height - this.margin.top - this.margin.bottom;

		this.svg = d3.select("#flightsHistogram")
			.attr("width",  this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom);
		this.container = this.svg.append("g")
			.attr("class", "container");

		this.xScale = d3.scaleLinear().range([this.margin.left * 2, this.width + this.margin.left]);
		this.yScale = d3.scaleLinear().range([this.height + this.margin.top, this.margin.top]);
		this.xAxis = this.svg.append("g").attr("class", "xAxis");
		this.yAxis = this.svg.append("g").attr("class", "yAxis");

		this.enteringBats, this.exitingBats, this.neutralBats;
		this.enteringBatsByFlightDuration, this.exitingBatsByFlightDuration, this.neutralBatsByFlightDuration;
		this.enteringBatsByFlightDurationNodes, this.exitingBatsByFlightDurationNodes, this.neutralBatsByFlightDurationNodes;

		this.receiveBatListData([], [], []);
	}

	receiveBatListData(enteringBats, exitingBats, neutralBats) {
		this.enteringBats = enteringBats;
		this.exitingBats = exitingBats;
		this.neutralBats = neutralBats;

		this.enteringBatsByFlightDuration = [];
		this.exitingBatsByFlightDuration = [];
		this.neutralBatsByFlightDuration = [];

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
		}

		this.drawHistogram();
	}

	setAxisDomain() {
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
			.transition()
	        .attr("transform", "translate(0," + (this.height + this.margin.top) + ")")
	        .call(d3.axisBottom(this.xScale)
	        	.tickValues(this.xScale.ticks(10).filter(function(d) { return Number.isInteger(d); }))
	        	.tickFormat(d3.format(".0f")));

	    this.yAxis
	    	.transition()
	        .attr("transform", "translate(" + this.margin.left + ",0)")
	        .call(d3.axisLeft(this.yScale)
	        	.tickValues(this.yScale.ticks(10).filter(function(d) { return Number.isInteger(d); }))
	        	.tickFormat(d3.format(".0f")));
	}

	drawHistogram() {
		this.drawAxis();

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
			.attr("fill", "#00FF00");
		this.enteringBatsByFlightDurationNodes
			.enter()
			.append("rect")
			.transition()
			.attr("class", "enteringBatByFlightDurationNode")
			.attr("x",      function(d,i) { return this.xScale(i - 0.5); }.bind(this))
			.attr("y",      function(d,i) { return this.yScale(d.length); }.bind(this))
			.attr("width",  this.xScale(1) - this.xScale(0))
			.attr("height", function(d,i) { return this.yScale(0) - this.yScale(d.length); }.bind(this))
			.attr("fill", "#00FF00");

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
			.attr("fill", "#FF0000");
		this.exitingBatsByFlightDurationNodes
			.enter()
			.append("rect")
			.transition()
			.attr("class", "exitingBatByFlightDurationNode")
			.attr("x",      function(d,i) { return this.xScale(i - 0.5); }.bind(this))
			.attr("y",      function(d,i) { return this.yScale(d.length + this.enteringBatsByFlightDuration[i].length); }.bind(this))
			.attr("width",  this.xScale(1) - this.xScale(0))
			.attr("height", function(d,i) { return this.yScale(0) - this.yScale(d.length); }.bind(this))
			.attr("fill", "#FF0000");

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
			.attr("fill", "#0000FF");
		this.neutralBatsByFlightDurationNodes
			.enter()
			.append("rect")
			.transition()
			.attr("class", "neutralBatByFlightDurationNode")
			.attr("x",      function(d,i) { return this.xScale(i - 0.5); }.bind(this))
			.attr("y",      function(d,i) { return this.yScale(d.length + this.enteringBatsByFlightDuration[i].length + this.exitingBatsByFlightDuration[i].length); }.bind(this))
			.attr("width",  this.xScale(1) - this.xScale(0))
			.attr("height", function(d,i) { return this.yScale(0) - this.yScale(d.length); }.bind(this))
			.attr("fill", "#0000FF");
	}

	batFlightDuration(bat) {
		return bat.f2 - bat.f1;
	}

}