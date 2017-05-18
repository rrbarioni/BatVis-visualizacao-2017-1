class AverageFlightTimeGraph {
	constructor(width,height) {
		this.margin = { top: 20, right: 20, bottom: 30, left: 50 };
		this.width =  width - this.margin.left - this.margin.right;
		this.height = height - this.margin.top - this.margin.bottom;

		this.svg = d3.select("#averageFlightTimeGraph")
			.attr("width",  this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom);
		this.container = this.svg.append("g")
			.attr("class", "container");

		this.xScale = d3.scaleLinear().range([this.margin.left, this.width + this.margin.left]);
		this.yScale = d3.scaleLinear().range([this.height + this.margin.top, this.margin.top]);
		this.svg.append("g").attr("class", "xAxis");
		this.svg.append("g").attr("class", "yAxis");

		this.enteringBats, this.exitingBats, this.neutralBats;
		this.averageEnteringBatsFlightDuration, this.averageExitingBatsFlightDuration, this.averageNeutralBatsFlightDuration;
		this.averageEnteringBatsFlightDurationLines, this.averageExitingBatsFlightDurationLines, this.averageNeutralBatsFlightDurationLines;

		this.receiveBatListData( { "bats": [] }, { "bats": [] }, { "bats": [] }	);
	}

	receiveBatListData(enteringBats, exitingBats, neutralBats) {
		this.enteringBats = enteringBats;
		this.exitingBats = exitingBats;
		this.neutralBats = neutralBats;

		console.log(this.enteringBats);

		for(var i = 0; i < this.enteringBats.bats.length; i++) {
			this.averageEnteringBatsFlightDuration.push(this.enteringBats[i].bats.reduce(function(bat1, bat2) { return this.batFlightDuration(bat1) + this.batFlightDuration(bat2); }.bind(this))/this.enteringBats[i].bats.length);
		}
		for(var i = 0; i < this.exitingBats.bats.length; i++) {
			this.averageExitingBatsFlightDuration.push (this.exitingBats[i].bats.reduce (function(bat1, bat2) { return this.batFlightDuration(bat1) + this.batFlightDuration(bat2); }.bind(this))/this.exitingBats[i].bats.length);
		}
		for(var i = 0; i < this.neutralBats.bats.length; i++) {
			this.averageNeutralBatsFlightDuration.push (this.neutralBats[i].bats.reduce (function(bat1, bat2) { return this.batFlightDuration(bat1) + this.batFlightDuration(bat2); }.bind(this))/this.neutralBats[i].bats.length);
		}

		this.drawGraph();
	}

	drawGraph() {

	}

	batFlightDuration(bat) {
		return bat.f2 - bat.f1;
	}
}