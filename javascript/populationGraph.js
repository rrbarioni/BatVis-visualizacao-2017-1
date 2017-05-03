class PopulationGraph {
	constructor(width,height) {
		this.width = width;
		this.height = height;

		this.svg = d3.select("#populationGraph")
			.attr("width", this.width)
			.attr("height", this.height);
		this.container = this.svg.append("g")
			.attr("class", "container");
	}
}