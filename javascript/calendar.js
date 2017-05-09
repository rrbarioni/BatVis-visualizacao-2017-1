class CaveDMYSelector {
	constructor(width,height) {
		this.width = width;
		this.height = height;

		this.div = d3.select("#caveDMYSelector")
			.style("width", this.width + "px")
			.style("height", this.height + "px");
		this.containerCave = this.div.append("div")
			.attr("id", "caveSelector")
			.style("width", this.width + "px")
			.style("height", (this.height/5) + "px");
		this.containerMonthYear = this.div.append("div")
			.attr("id", "mySelector")
			.style("width", this.width + "px")
			.style("height", (this.height * 2/5) + "px");
		this.containerDays = this.div.append("div")
			.attr("id", "dSelector")
			.style("width", this.width + "px")
			.style("height", (this.height * 2/5) + "px");

		this.currentCave = 0;
		this.currentMonth = 1;
		this.currentYear = 2014;
		this.activeDMY = [];

		this.setCaveSelector();
		this.setMYSelector();
		this.setDSelector();
	}

	setCaveSelector() {

	}

	setMYSelector() {

	}

	setDSelector() {

	}
}