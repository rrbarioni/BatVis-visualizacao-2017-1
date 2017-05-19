class AverageFlightTimeGraph {
	constructor(width,height) {
		this.margin = { top: 20, right: 30, bottom: 30, left: 50 };
		this.width =  width - this.margin.left - this.margin.right;
		this.height = height - this.margin.top - this.margin.bottom;

		this.svg = d3.select("#averageFlightTimeGraph")
			.attr("width",  this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom);
		this.container = this.svg.append("g")
			.attr("class", "container");

		this.xScale = d3.scaleLinear().range([this.margin.left, this.width + this.margin.left]);
		this.yScale = d3.scaleLinear().range([this.height + this.margin.top, this.margin.top]);
		this.xAxis = d3.axisBottom(this.xScale);
		this.yAxis = d3.axisLeft(this.yScale);
		this.xAxisLine = this.svg.append("g").attr("class", "xAxis");
		this.yAxisLine = this.svg.append("g").attr("class", "yAxis");
		
		this.enteringExitingNeutralBatDataSize;
		this.firstFrame, this.lastFrame, this.fps, this.startTime;
		this.enteringBats, this.exitingBats, this.neutralBats;
		this.averageEnteringBatsFlightDuration, this.averageExitingBatsFlightDuration, this.averageNeutralBatsFlightDuration;
		this.averageEnteringBatsFlightDurationLines, this.averageExitingBatsFlightDurationLines, this.averageNeutralBatsFlightDurationLines;

		this.receiveBatListData(0, 1, 1, { "h": 0, "m": 0, "s": 0 }, { "bats": [] }, { "bats": [] }, { "bats": [] } );
	}

	receiveBatListData(firstFrame, lastFrame, fps, startTime, enteringBats, exitingBats, neutralBats) {
		this.firstFrame = firstFrame;
		this.lastFrame = lastFrame;
		this.fps = fps;
		this.startTime = startTime;

		this.enteringBats = enteringBats;
		this.exitingBats = exitingBats;
		this.neutralBats = neutralBats;

		this.enteringExitingNeutralBatDataSize = this.enteringBats.length; //enteringBats.length == exitingBats.length == neutralBats.length

		this.averageEnteringBatsFlightDuration = [];
		this.averageExitingBatsFlightDuration = [];
		this.averageNeutralBatsFlightDuration = [];

		for(var i = 0; i < this.enteringBats.length; i++) {
			if (this.enteringBats[i].bats.length < 1) {
				this.averageEnteringBatsFlightDuration.push({
					"f1": this.enteringBats[i].f1,
					"f2": this.enteringBats[i].f2,
					"average": 0
				});
			}
			else {
				this.averageEnteringBatsFlightDuration.push({
					"f1": this.enteringBats[i].f1,
					"f2": this.enteringBats[i].f2,
					"average": this.enteringBats[i].bats.map(this.batFlightDuration).reduce(this.reduceSumBatFlightsDuration)/this.enteringBats[i].bats.length
				});
			}
		}

		for(var i = 0; i < this.exitingBats.length; i++) {
			if (this.exitingBats[i].bats.length < 1) {
				this.averageExitingBatsFlightDuration.push({
					"f1": this.exitingBats[i].f1,
					"f2": this.exitingBats[i].f2,
					"average": 0
				});
			}
			else {
				this.averageExitingBatsFlightDuration.push({
					"f1": this.exitingBats[i].f1,
					"f2": this.exitingBats[i].f2,
					"average": this.exitingBats[i].bats.map(this.batFlightDuration).reduce(this.reduceSumBatFlightsDuration)/this.exitingBats[i].bats.length
				});
			}
		}

		for(var i = 0; i < this.neutralBats.length; i++) {
			if (this.neutralBats[i].bats.length < 1) {
				this.averageNeutralBatsFlightDuration.push({
					"f1": this.neutralBats[i].f1,
					"f2": this.neutralBats[i].f2,
					"average": 0
				});
			}
			else {
				this.averageNeutralBatsFlightDuration.push({
					"f1": this.neutralBats[i].f1,
					"f2": this.neutralBats[i].f2,
					"average": this.neutralBats[i].bats.map(this.batFlightDuration).reduce(this.reduceSumBatFlightsDuration)/this.neutralBats[i].bats.length
				});
			}
		}

		this.drawGraph();
	}

	setAxisDomain() {
		var maxAverageFlightDuration = 0;
		for(var i = 0; i < this.enteringExitingNeutralBatDataSize; i++) {
			maxAverageFlightDuration = Math.max(
				maxAverageFlightDuration,
				d3.max(this.averageEnteringBatsFlightDuration.concat(this.averageExitingBatsFlightDuration).concat(this.averageNeutralBatsFlightDuration), function(d) { return d.average; })
			);
		}

		this.xScale.domain([Math.max(0, this.firstFrame), Math.max(1, this.lastFrame)]);
		this.yScale.domain([0, Math.max(1, maxAverageFlightDuration)]);
	}

	drawAxis() {
		this.setAxisDomain();

		this.xAxis
	        .tickValues(this.xScale.ticks(6).filter(function(d) { return Number.isInteger(d); }))
	        .tickFormat(function(d) { return this.convertFrameToHHMMSS(d); }.bind(this));
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

	drawGraph() {
		this.drawAxis();

		var lineWidth = 5;
		var lineOpacity = 0.5;

		this.averageEnteringBatsFlightDurationLines = this.container.selectAll(".averageEnteringBatsFlightDurationLine")
			.data(this.averageEnteringBatsFlightDuration);
		this.averageEnteringBatsFlightDurationLines
			.exit()
			.remove();
		this.averageEnteringBatsFlightDurationLines
			.transition()
			.attr("class", "averageEnteringBatsFlightDurationLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.averageEnteringBatsFlightDuration[i-1].f2);      }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.averageEnteringBatsFlightDuration[i-1].average); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.averageEnteringBatsFlightDuration[i].f2);        }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.averageEnteringBatsFlightDuration[i].average);   }.bind(this))
			.attr("stroke", "#00FF00")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);
		this.averageEnteringBatsFlightDurationLines
			.enter()
			.append("line")
			.transition()
			.attr("class", "averageEnteringBatsFlightDurationLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.averageEnteringBatsFlightDuration[i-1].f2);      }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.averageEnteringBatsFlightDuration[i-1].average); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.averageEnteringBatsFlightDuration[i].f2);        }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.averageEnteringBatsFlightDuration[i].average);   }.bind(this))
			.attr("stroke", "#00FF00")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);

		this.averageExitingBatsFlightDurationLines = this.container.selectAll(".averageExitingBatsFlightDurationLine")
			.data(this.averageExitingBatsFlightDuration);
		this.averageExitingBatsFlightDurationLines
			.exit()
			.remove();
		this.averageExitingBatsFlightDurationLines
			.transition()
			.attr("class", "averageExitingBatsFlightDurationLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.averageExitingBatsFlightDuration[i-1].f2);      }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.averageExitingBatsFlightDuration[i-1].average); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.averageExitingBatsFlightDuration[i].f2);        }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.averageExitingBatsFlightDuration[i].average);   }.bind(this))
			.attr("stroke", "#FF0000")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);
		this.averageExitingBatsFlightDurationLines
			.enter()
			.append("line")
			.transition()
			.attr("class", "averageExitingBatsFlightDurationLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.averageExitingBatsFlightDuration[i-1].f2);      }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.averageExitingBatsFlightDuration[i-1].average); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.averageExitingBatsFlightDuration[i].f2);        }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.averageExitingBatsFlightDuration[i].average);   }.bind(this))
			.attr("stroke", "#FF0000")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);

		this.averageNeutralBatsFlightDurationLines = this.container.selectAll(".averageNeutralBatsFlightDurationLine")
			.data(this.averageNeutralBatsFlightDuration);
		this.averageNeutralBatsFlightDurationLines
			.exit()
			.remove();
		this.averageNeutralBatsFlightDurationLines
			.transition()
			.attr("class", "averageNeutralBatsFlightDurationLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.averageNeutralBatsFlightDuration[i-1].f2);      }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.averageNeutralBatsFlightDuration[i-1].average); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.averageNeutralBatsFlightDuration[i].f2);        }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.averageNeutralBatsFlightDuration[i].average);   }.bind(this))
			.attr("stroke", "#0000FF")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);
		this.averageNeutralBatsFlightDurationLines
			.enter()
			.append("line")
			.transition()
			.attr("class", "averageNeutralBatsFlightDurationLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.averageNeutralBatsFlightDuration[i-1].f2);      }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.averageNeutralBatsFlightDuration[i-1].average); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.averageNeutralBatsFlightDuration[i].f2);        }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.averageNeutralBatsFlightDuration[i].average);   }.bind(this))
			.attr("stroke", "#0000FF")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);
	}

	batFlightDuration(bat) {
		return bat.f2 - bat.f1;
	}

	reduceSumBatFlightsDuration(total, flightDuration) {
		return total + flightDuration;
	}

	convertFrameToHHMMSS(d) {
		var flightDurationInSeconds = Math.ceil(d/this.fps);
		var flightEndTimeSeconds =  this.startTime.s + flightDurationInSeconds;
		var flightEndTimeMinutes =  this.startTime.m;
		var flightEndTimeHours =  this.startTime.h;

		if (flightEndTimeSeconds >= 60) {
			flightEndTimeMinutes += Math.floor(flightEndTimeSeconds/60);
			flightEndTimeSeconds -= Math.floor(flightEndTimeSeconds/60) * 60;
		}
		if (flightEndTimeMinutes >= 60) {
			flightEndTimeHours += Math.floor(flightEndTimeMinutes/60);
			flightEndTimeMinutes -= Math.floor(flightEndTimeMinutes/60) * 60;
		}

		if (flightEndTimeSeconds < 10) { flightEndTimeSeconds = "0" + flightEndTimeSeconds; }
		if (flightEndTimeMinutes < 10) { flightEndTimeMinutes = "0" + flightEndTimeMinutes; }
		if (flightEndTimeHours < 10)   { flightEndTimeHours = "0" + flightEndTimeHours; }

		return flightEndTimeHours + ":" + flightEndTimeMinutes + ":" + flightEndTimeSeconds;
	}
}