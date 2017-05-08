class Calendar {
	constructor(width,height) {
		this.width = width;
		this.height = height;

		this.svg = d3.select("#calendar")
			.attr("width", this.width)
			.attr("height", this.height);
		this.containerMonthYear = this.svg.append("div")
			.attr("class", "calendarMonthYear");
		this.containerDays = this.svg.append("div")
			.attr("class", "calendarDays");

		this.currentMonth = 1;
		this.currentYear = 2009;
		this.activeDays = [];
	}
}