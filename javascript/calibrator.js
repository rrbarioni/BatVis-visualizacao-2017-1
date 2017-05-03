class Calibrator {
	constructor(width,height) {
		this.width = width;
		this.height = height;

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
			.call(d3.drag().on("drag",  this.dragCalibratorLine.bind(this)));
		
	}

	dragCalibratorLine(d) {
		switch(d.id) {
			case "leftLine":   this.calibratorLinesContainer.select("#leftLine").attr  ("x", d.x = Math.max(0, Math.min(this.calibratorLines[1].x,d3.event.x))); break;
			case "rightLine":  this.calibratorLinesContainer.select("#rightLine").attr ("x", d.x = Math.max(this.calibratorLines[0].x, Math.min(this.width,d3.event.x))); break;
			case "topLine":    this.calibratorLinesContainer.select("#topLine").attr   ("y", d.y = Math.max(0, Math.min(this.calibratorLines[3].y,d3.event.y))); break;
			case "bottomLine": this.calibratorLinesContainer.select("#bottomLine").attr("y", d.y = Math.max(this.calibratorLines[2].y, Math.min(this.height,d3.event.y))); break;
		}
	}
}