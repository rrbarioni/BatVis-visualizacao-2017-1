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

		this.xScale = d3.scaleLinear().range([this.margin.left, this.width + this.margin.left]);
		this.yScale = d3.scaleLinear().range([this.height + this.margin.top, this.margin.top]);
		this.svg.append("g").attr("class", "xAxis");
		this.svg.append("g").attr("class", "yAxis");

		this.bats, this.batsByFlightDuration;
		this.enteringBatsByFlightDuration, this.exitingBatsByFlightDuration;

		this.enteringBatsByFlightDurationNodes, this.exitingBatsByFlightDurationNodes;
	}

	receiveBatListData(bats) {
		// console.log(bats.length);
		this.bats = bats;
		this.batsByFlightDuration = [];

		for(var i = 0; i < this.bats.length; i++) {
			if (this.batFlightDuration(this.bats[i]) < 1) { continue; }

			if (this.batsByFlightDuration[this.batFlightDuration(this.bats[i])] === undefined) {
				this.batsByFlightDuration[this.batFlightDuration(this.bats[i])] = [this.bats[i]];
			}
			else {
				this.batsByFlightDuration[this.batFlightDuration(this.bats[i])].push(this.bats[i]);
			}
		}

		for(var i = 0; i < this.batsByFlightDuration.length; i++) {
			if (this.batsByFlightDuration[i] === undefined) {
				this.batsByFlightDuration[i] = [];
			}
		}

		this.enteringBatsByFlightDuration = this.batsByFlightDuration;
		this.enteringBatsByFlightDuration.forEach(function(d1) { d1 = d1.filter(function(d2) { return d2.entering; }); });
		this.exitingBatsByFlightDuration = this.batsByFlightDuration;
		this.exitingBatsByFlightDuration.forEach(function(d1) { d1 = d1.filter(function(d2) { return d2.exiting; }); });

		console.log(this.batsByFlightDuration);
		this.drawHistogram();
	}

	setAxisDomain() {
		this.xScale.domain([0, this.batsByFlightDuration.length]);
		this.yScale.domain([0, d3.max(this.batsByFlightDuration, function(d) { return d.length; })]);
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
			.attr("r", 5)
			.attr("cx", function(d,i) { return this.xScale(i);        }.bind(this))
			.attr("cy", function(d,i) { return this.yScale(d.length); }.bind(this))
			.attr("fill", "green");
		this.enteringBatsByFlightDurationNodes
			.enter()
			.append("circle")
			.transition()
			.attr("class", "enteringBatByFlightDurationNode")
			.attr("r", 5)
			.attr("cx", function(d,i) { return this.xScale(i);        }.bind(this))
			.attr("cy", function(d,i) { return this.yScale(d.length); }.bind(this))
			.attr("fill", "green");

		this.exitingBatsByFlightDurationNodes = this.container.selectAll(".exitingBatByFlightDurationNode")
			.data(this.exitingBatsByFlightDuration);
		this.exitingBatsByFlightDurationNodes
			.exit()
			.remove();
		this.exitingBatsByFlightDurationNodes
			.transition()
			.attr("class", "exitingBatByFlightDurationNode")
			.attr("r", 5)
			.attr("cx", function(d,i) { return this.xScale(i);        }.bind(this))
			.attr("cy", function(d,i) { return this.yScale(d.length); }.bind(this))
			.attr("fill", "red");
		this.exitingBatsByFlightDurationNodes
			.enter()
			.append("circle")
			.transition()
			.attr("class", "exitingBatByFlightDurationNode")
			.attr("r", 5)
			.attr("cx", function(d,i) { return this.xScale(i);        }.bind(this))
			.attr("cy", function(d,i) { return this.yScale(d.length); }.bind(this))
			.attr("fill", "red");
	}

	batFlightDuration(bat) {
		return bat.f2 - bat.f1;
	}

}