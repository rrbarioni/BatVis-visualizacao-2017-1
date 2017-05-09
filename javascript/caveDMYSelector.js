class CaveDMYSelector {
	constructor(width,height) {
		this.width = width;
		this.height = height;

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
			.attr("id", "caveSelector");
		this.containerCaveSelector.list = this.containerCaveSelector.append("ul")
			.attr("class", "list");
		this.containerCaveSelector.list.append("li")
			.attr("class", "prev")
			.html("&#10094;")
			.on("click", function(d) { console.log("eae meeeen HA O SAM É BRABO"); });

	}

	setMYSelector() {
		this.containerMYSelector = this.div.append("div")
			.attr("id", "mySelector");
	}

	setDSelector() {
		this.containerDSelector = this.div.append("div")
			.attr("id", "dSelector");
	}

}