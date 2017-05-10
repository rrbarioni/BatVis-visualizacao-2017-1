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

		this.months = [
			{ "en": "NO_MONTH",  "pt": "NO_MONTH"  },
			{ "en": "January",   "pt": "Janeiro"   },
			{ "en": "February",  "pt": "Fevereiro" },
			{ "en": "March",     "pt": "Março"     },
			{ "en": "April",     "pt": "Abril"     },
			{ "en": "May",       "pt": "Maio"      },
			{ "en": "June",      "pt": "Junho"     },
			{ "en": "July",      "pt": "Julho"     },
			{ "en": "August",    "pt": "Agosto"    },
			{ "en": "September", "pt": "Setembro"  },
			{ "en": "October",   "pt": "Outubro"   },
			{ "en": "November",  "pt": "Novembro"  },
			{ "en": "December",  "pt": "Dezembro"  }
		];
		
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
			.attr("class", "prevCave")
			.style("font-size", (this.height * 0.15) + "px")
			.html("&#10094;")
			.on("click", this.prevCave.bind(this));
		this.containerCaveSelector.list.append("li")
			.attr("class", "nextCave")
			.style("font-size", (this.height * 0.15) + "px")
			.html("&#10095;")
			.on("click", this.nextCave.bind(this));
		this.containerCaveSelector.list.append("li")
			.attr("class", "currentCave")
			.style("font-size", (this.height * 0.15) + "px")
			.html(this.caves[this.currentCave]);
	}

	updateCaveNameText() {
		this.containerCaveSelector.list.select(".currentCave")
			.html(this.caves[this.currentCave]);
	}

	setMYSelector() {
		this.containerMYSelector = this.div.append("div")
			.attr("class", "mySelector");
		this.containerMYSelector.list = this.containerMYSelector.append("ul")
			.attr("class", "list");
		this.containerMYSelector.list.append("li")
			.attr("class", "prevM")
			.style("font-size", (this.height * 0.15) + "px")
			.html("&#10094;")
			.on("click", this.prevMonth.bind(this));
		this.containerMYSelector.list.append("li")
			.attr("class", "nextM")
			.style("font-size", (this.height * 0.15) + "px")
			.html("&#10095;")
			.on("click", this.nextMonth.bind(this));
		this.containerMYSelector.list.append("li")
			.attr("class", "prevY")
			.style("font-size", (this.height * 0.15) + "px")
			.html("&#10094;")
			.on("click", this.prevYear.bind(this));
		this.containerMYSelector.list.append("li")
			.attr("class", "nextY")
			.style("font-size", (this.height * 0.15) + "px")
			.html("&#10095;")
			.on("click", this.nextYear.bind(this));
		this.containerMYSelector.list.append("li")
			.attr("class", "currentMY")
			.style("font-size", (this.height * 0.15) + "px")
			.html(this.months[this.currentMonth].pt + "<br>" +
				  this.currentYear);
	}

	updateMonthYearText() {
		this.containerMYSelector.list.select(".currentMY")
			.html(this.months[this.currentMonth].pt + "<br>" +
				  this.currentYear);
	}

	setDSelector() {
		this.containerDSelector = this.div.append("div")
			.attr("class", "dSelector");
		this.containerDSelector.list = this.containerDSelector.append("ul")
			.attr("class", "list");

	}

	prevCave() {
		this.currentCave--;
		if (this.currentCave < 0) {
			this.currentCave = this.caves.length - 1;
		}
		this.updateCaveNameText();
	}

	nextCave() {
		this.currentCave++;
		if (this.currentCave > this.caves.length - 1) {
			this.currentCave = 0;
		}
		this.updateCaveNameText();
	}

	prevMonth() {
		this.currentMonth--;
		if (this.currentMonth < 1) {
			this.currentMonth = this.months.length - 1;
		}
		this.updateMonthYearText();
	}

	nextMonth() {
		this.currentMonth++;
		if (this.currentMonth > this.months.length - 1) {
			this.currentMonth = 1;
		}
		this.updateMonthYearText();
	}

	prevYear() {
		this.currentYear--;
		this.updateMonthYearText();
	}

	nextYear() {
		this.currentYear++;
		this.updateMonthYearText();
	}

	fileExists(path) {
		// return d3.json(path, function(error,data) {
		// 	if (error) { return false; }
		// 	else { return true; }
		// });
	}

}