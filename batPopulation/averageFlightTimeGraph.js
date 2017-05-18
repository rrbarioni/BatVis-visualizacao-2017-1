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

		this.averageEnteringBatsFlightDuration = [];
		this.averageExitingBatsFlightDuration = [];
		this.averageNeutralBatsFlightDuration = [];

		// for(var i = 0; i < this.enteringBats.length; i++) {
		// 	if (this.enteringBats[i].bats.length < 1) {
		// 		this.averageEnteringBatsFlightDuration.push({
		// 			"f1": this.enteringBats[i].f1;
		//			"f2": this.enteringBats[i].f2;
		// 			"average": 0
		// 		});
		// 	}
		// 	else {
		// 		this.averageEnteringBatsFlightDuration.push(this.enteringBats[i].bats.reduce(this.reduceSumBatFlightsDuration.bind(this))/this.enteringBats[i].bats.length);
		// 	}
		// }
		// for(var i = 0; i < this.exitingBats.length; i++) {
		// 	if (this.exitingBats[i].bats.length < 1) {
		// 		this.averageExitingBatsFlightDuration.push(0);
		// 	}
		// 	else {
		// 		this.averageExitingBatsFlightDuration.push (this.exitingBats[i].bats.reduce(this.reduceSumBatFlightsDuration.bind(this))/this.exitingBats[i].bats.length);
		// 	}
		// }
		// for(var i = 0; i < this.neutralBats.length; i++) {
		// 	if (this.neutralBats[i].bats.length < 1) {
		// 		this.averageNeutralBatsFlightDuration.push(0);
		// 	}
		// 	else {
		// 		this.averageNeutralBatsFlightDuration.push (this.neutralBats[i].bats.reduce(this.reduceSumBatFlightsDuration.bind(this))/this.neutralBats[i].bats.length);
		// 	}
		// }

		// this.drawGraph();
	}

	drawGraph() {
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
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.enteringBatData[1][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.enteringBatData[1][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.enteringBatData[1][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.enteringBatData[1][i].bats.length);   }.bind(this))
			.attr("stroke", "#00FF00")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);
		this.averageEnteringBatsFlightDurationLines
			.enter()
			.append("line")
			.transition()
			.attr("class", "averageEnteringBatsFlightDurationLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.enteringBatData[1][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.enteringBatData[1][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.enteringBatData[1][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.enteringBatData[1][i].bats.length);   }.bind(this))
			.attr("stroke", "#00FF00")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);
	}

	batFlightDuration(bat) {
		return bat.f2 - bat.f1;
	}

	reduceSumBatFlightsDuration(total, bat) {
		return total + this.batFlightDuration(bat);
	}
}