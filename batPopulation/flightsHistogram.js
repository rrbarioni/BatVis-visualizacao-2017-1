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
	}

	receiveBatListData(bats) {
		console.log(bats.length);
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

		this.drawHistogram();
	}

	drawHistogram() {

	}

	batFlightDuration(bat) {
		return bat.f2 - bat.f1;
	}

}