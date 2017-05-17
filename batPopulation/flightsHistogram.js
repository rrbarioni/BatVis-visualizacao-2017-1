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
		this.svg.append("g").attr("class", "xAxis");
		this.svg.append("g").attr("class", "yAxis");

		this.enteringBats, this.exitingBats;
		this.enteringBatsByFlightDuration, this.exitingBatsByFlightDuration;
		this.enteringBatsByFlightDurationNodes, this.exitingBatsByFlightDurationNodes;
	}

	receiveBatListData(enteringBats, exitingBats) {
		this.enteringBats = enteringBats;
		this.exitingBats = exitingBats;

		this.enteringBatsByFlightDuration = [];
		this.exitingBatsByFlightDuration = [];

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

		for(var i = 0; i < Math.max(this.enteringBatsByFlightDuration.length, this.exitingBatsByFlightDuration.length); i++) {
			if (this.enteringBatsByFlightDuration[i] === undefined) { this.enteringBatsByFlightDuration[i] = []; }
			if (this.exitingBatsByFlightDuration[i] === undefined)  { this.exitingBatsByFlightDuration[i] = [];  }
		}

		this.drawHistogram();
	}

	setAxisDomain() {
		var maxBatCountByFlightDuration = 0;
		for(var i = 0; i < Math.max(this.enteringBatsByFlightDuration.length, this.exitingBatsByFlightDuration.length); i++) {
			maxBatCountByFlightDuration = Math.max(maxBatCountByFlightDuration, this.enteringBatsByFlightDuration[i].concat(this.exitingBatsByFlightDuration[i]).length)
		}

		this.xScale.domain([0, Math.max(this.enteringBatsByFlightDuration.length, this.exitingBatsByFlightDuration.length)]);
		this.yScale.domain([0, maxBatCountByFlightDuration]);
	}

	drawAxis() {
		this.setAxisDomain();

		this.svg.selectAll(".xAxis")
			.transition()
	        .attr("transform", "translate(0," + (this.height + this.margin.top) + ")")
	        .call(d3.axisBottom(this.xScale));

	    this.svg.selectAll(".yAxis")
	    	.transition()
	        .attr("transform", "translate(" + this.margin.left + ",0)")
	        .call(d3.axisLeft(this.yScale));
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
			.attr("fill", "green");
		this.enteringBatsByFlightDurationNodes
			.enter()
			.append("rect")
			.transition()
			.attr("class", "enteringBatByFlightDurationNode")
			.attr("x",      function(d,i) { return this.xScale(i - 0.5); }.bind(this))
			.attr("y",      function(d,i) { return this.yScale(d.length); }.bind(this))
			.attr("width",  this.xScale(1) - this.xScale(0))
			.attr("height", function(d,i) { return this.yScale(0) - this.yScale(d.length); }.bind(this))
			.attr("fill", "green");

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
			.attr("fill", "red");
		this.exitingBatsByFlightDurationNodes
			.enter()
			.append("rect")
			.transition()
			.attr("class", "exitingBatByFlightDurationNode")
			.attr("x",      function(d,i) { return this.xScale(i - 0.5); }.bind(this))
			.attr("y",      function(d,i) { return this.yScale(d.length + this.enteringBatsByFlightDuration[i].length); }.bind(this))
			.attr("width",  this.xScale(1) - this.xScale(0))
			.attr("height", function(d,i) { return this.yScale(0) - this.yScale(d.length); }.bind(this))
			.attr("fill", "red");
	}

	batFlightDuration(bat) {
		return bat.f2 - bat.f1;
	}

}