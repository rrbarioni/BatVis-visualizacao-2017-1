class CaveDMYSelector {
	constructor(width,height) {
		this.width = width;
		this.height = height;

		this.caves = [
			"Caverna 1",
			"Caverna 2",
			"Caverna 3",
			"Caverna 4",
			"Caverna 5",
		]
		
		this.div = d3.select("#caveDMYSelector")
			.style("width", this.width + "px")
			.style("height", this.height + "px");
		this.containerCaveSelector, this.containerMYSelector, this.containerDSelector;

		this.currentCave = 0;
		this.currentMonth = 1;
		this.currentYear = 2014;
		this.activeDMY = [];

		this.setCaveSelector();
		this.setMYSelector();
		this.setDSelector();
	}

	setCaveSelector() {
		this.containerCaveSelector = this.div.append("div")
			.attr("class", "caveSelector");
		this.containerCaveSelector.list = this.containerCaveSelector.append("ul")
			.attr("class", "list");
		this.containerCaveSelector.list.append("li")
			.attr("class", "prev")
			.style("font-size", (this.height * 0.15) + "px")
			.html("&#10094;")
			.on("click", function(d) { console.log("CAVE PREV"); });
		this.containerCaveSelector.list.append("li")
			.attr("class", "next")
			.style("font-size", (this.height * 0.15) + "px")
			.html("&#10095;")
			.on("click", function(d) { console.log("CAVE NEXT"); });
		this.containerCaveSelector.list.append("li")
			.attr("class", "caveName")
			.style("font-size", (this.height * 0.15) + "px")
			.html(this.caves[this.currentCave]);
	}

	setMYSelector() {
		this.containerMYSelector = this.div.append("div")
			.attr("class", "mySelector");
	}

	setDSelector() {
		this.containerDSelector = this.div.append("div")
			.attr("class", "dSelector");
	}

}