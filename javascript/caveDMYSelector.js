class CaveDMYSelector {
	constructor(width,height) {
		this.width = width;
		this.height = height;

		this.caves = [
			"Caverna 0",
			"Caverna 1",
			"Caverna 2",
			"Caverna 3",
			"Caverna 4",
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
			.on("click", this.prevCave.bind(this));
		this.containerCaveSelector.list.append("li")
			.attr("class", "next")
			.style("font-size", (this.height * 0.15) + "px")
			.html("&#10095;")
			.on("click", this.nextCave.bind(this));
		this.containerCaveSelector.list.append("li")
			.attr("class", "currentCave")
			.style("font-size", (this.height * 0.15) + "px")
			.html(this.caves[this.currentCave]);
	}

	prevCave() {
		this.currentCave--;
		if (this.currentCave < 0) {
			this.currentCave = this.caves.length - 1;
		}
		this.updateCaveName();
	}

	nextCave() {
		this.currentCave++;
		if (this.currentCave > this.caves.length - 1) {
			this.currentCave = 0;
		}
		this.updateCaveName();
	}

	updateCaveName() {
		this.containerCaveSelector.list.select(".currentCave")
			.html(this.caves[this.currentCave]);
	}

	setMYSelector() {
		this.containerMYSelector = this.div.append("div")
			.attr("class", "mySelector");
		this.containerMYSelector.list = this.containerMYSelector.append("ul")
			.attr("class", "list");
	}

	setDSelector() {
		this.containerDSelector = this.div.append("div")
			.attr("class", "dSelector");
		this.containerDSelector.list = this.containerDSelector.append("ul")
			.attr("class", "list");
			
	}

}