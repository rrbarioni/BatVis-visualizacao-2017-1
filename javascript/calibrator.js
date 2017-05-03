class Calibrator {
	constructor(width) {
		this.width = width;
		this.height = this.width * 0.75;

		this.svg = d3.select("#calibrator")
			.attr("width", this.width)
			.attr("height", this.height);
		this.container = this.svg.append("g")
			.attr("class", "container");

		this.calibratorLinesContainer = this.container.append("g")
			.attr("class", "calibratorLines")
		this.calibratorLines;
		this.setLines();
	}

	setLines() {
		var lineThickness = 5;
		this.calibratorLines = [
			{ "id": "leftLine",	  "x": this.width * 1/3, "y": 0,                 "width": lineThickness, "height": this.height   },
			{ "id": "rightLine",  "x": this.width * 2/3, "y": 0,                 "width": lineThickness, "height": this.height   },
			{ "id": "topLine",	  "x": 0,                "y": this.height * 1/3, "width": this.width,    "height": lineThickness },
			{ "id": "bottomLine", "x": 0,                "y": this.height * 2/3, "width": this.width,    "height": lineThickness }
		];

		this.calibratorLinesContainer.selectAll(".calibratorLine")
			.data(this.calibratorLines)
			.enter()
			.append("rect")
			.attr("class", "calibratorLine")
			.attr("id",     function(d) { return d.id;     })
			.attr("x",      function(d) { return d.x;      })
			.attr("y",      function(d) { return d.y;      })
			.attr("width",  function(d) { return d.width;  })
			.attr("height", function(d) { return d.height; })
			.call(d3.drag()
	            .on("start", this.dragStarted)
	            .on("drag", this.dragged)
	            .on("end", this.dragEnded));
		
	}

	dragStarted(d) {}
	dragged(d) {
		switch(d.id) {
			case "leftLine":   d3.select(this).attr("x", d.x = d3.event.x); break;
			case "rightLine":  d3.select(this).attr("x", d.x = d3.event.x); break;
			case "topLine":    d3.select(this).attr("y", d.x = d3.event.y); break;
			case "bottomLine": d3.select(this).attr("y", d.x = d3.event.y); break;
		}
	}
	dragEnded(d) {}
}