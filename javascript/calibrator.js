class Calibrator {
	constructor(width,height) {
		this.width = width;
		this.height = height;

		this.svg = d3.select("#calibrator")
			.attr("width", this.width)
			.attr("height", this.height);
		this.container = this.svg.append("g")
			.attr("class", "container");

		this.lineThickness = 5;

		this.calibratorLinesContainer = this.container.append("g")
			.attr("class", "calibratorLines");
		this.calibratorLinesValues, this.calibratorLines;
		this.setCalibratorLines();

		this.calibratorCellsContainer = this.container.append("g")
			.attr("class", "calibratorCells");
		this.calibratorCellsValues, this.calibratorCells;
		this.setCalibratorCells();
	}

	updateCalibratorLinesValues() {
		this.calibratorLinesValues = [
			{ "id": "leftLine",	  "x": this.width * 1/3, "y": 0,                 "width": this.lineThickness, "height": this.height        },
			{ "id": "rightLine",  "x": this.width * 2/3, "y": 0,                 "width": this.lineThickness, "height": this.height        },
			{ "id": "topLine",	  "x": 0,                "y": this.height * 1/3, "width": this.width,         "height": this.lineThickness },
			{ "id": "bottomLine", "x": 0,                "y": this.height * 2/3, "width": this.width,         "height": this.lineThickness }
		];
	}

	setCalibratorLines() {
		this.updateCalibratorLinesValues();

		this.calibratorLines = this.calibratorLinesContainer
			.selectAll(".calibratorLine")
			.data(this.calibratorLinesValues)
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
			case "leftLine":   { this.calibratorLinesContainer.select("#leftLine").attr  ("x", d.x = Math.max(0, Math.min(this.calibratorLinesValues[this.getLineIndexById("rightLine")].x,d3.event.x)));                                this.updateCalibratorCells(); break; }
			case "rightLine":  { this.calibratorLinesContainer.select("#rightLine").attr ("x", d.x = Math.max(this.calibratorLinesValues[this.getLineIndexById("leftLine")].x, Math.min((this.width - this.lineThickness),d3.event.x))); this.updateCalibratorCells(); break; }
			case "topLine":    { this.calibratorLinesContainer.select("#topLine").attr   ("y", d.y = Math.max(0, Math.min(this.calibratorLinesValues[this.getLineIndexById("bottomLine")].y,d3.event.y)));                               this.updateCalibratorCells(); break; }
			case "bottomLine": { this.calibratorLinesContainer.select("#bottomLine").attr("y", d.y = Math.max(this.calibratorLinesValues[this.getLineIndexById("topLine")].y, Math.min((this.height - this.lineThickness),d3.event.y))); this.updateCalibratorCells(); break; }
		}
	}

	updateCalibratorCellsValues() {
		var leftLineX =   this.calibratorLinesValues[this.getLineIndexById("leftLine")].x;
		var rightLineX =  this.calibratorLinesValues[this.getLineIndexById("rightLine")].x;
		var topLineY =    this.calibratorLinesValues[this.getLineIndexById("topLine")].y;
		var bottomLineY = this.calibratorLinesValues[this.getLineIndexById("bottomLine")].y;

		this.calibratorCellsValues = [
			{ "id": "cell1", "x": 0,                               "y": 0,                                "width": Math.max(0, leftLineX),                                      "height": Math.max(0, topLineY),                                         "status": "neutral" },
			{ "id": "cell2", "x": leftLineX + this.lineThickness,  "y": 0,                                "width": Math.max(0, rightLineX - (leftLineX + this.lineThickness)),  "height": Math.max(0, topLineY),                                         "status": "neutral" },
			{ "id": "cell3", "x": rightLineX + this.lineThickness, "y": 0,                                "width": Math.max(0, this.width - (rightLineX + this.lineThickness)), "height": Math.max(0, topLineY),                                         "status": "neutral" },
			{ "id": "cell4", "x": 0,                               "y": topLineY + this.lineThickness,    "width": Math.max(0, leftLineX),                                      "height": Math.max(0, bottomLineY - (topLineY + this.lineThickness)),    "status": "neutral" },
			{ "id": "cell5", "x": leftLineX + this.lineThickness,  "y": topLineY + this.lineThickness,    "width": Math.max(0, rightLineX - (leftLineX + this.lineThickness)),  "height": Math.max(0, bottomLineY - (topLineY + this.lineThickness)),    "status": "neutral" },
			{ "id": "cell6", "x": rightLineX + this.lineThickness, "y": topLineY + this.lineThickness,    "width": Math.max(0, this.width - (rightLineX + this.lineThickness)), "height": Math.max(0, bottomLineY - (topLineY + this.lineThickness)),    "status": "neutral" },
			{ "id": "cell7", "x": 0,                               "y": bottomLineY + this.lineThickness, "width": Math.max(0, leftLineX),                                      "height": Math.max(0, this.height - (bottomLineY + this.lineThickness)), "status": "neutral" },
			{ "id": "cell8", "x": leftLineX + this.lineThickness,  "y": bottomLineY + this.lineThickness, "width": Math.max(0, rightLineX - (leftLineX + this.lineThickness)),  "height": Math.max(0, this.height - (bottomLineY + this.lineThickness)), "status": "neutral" },
			{ "id": "cell9", "x": rightLineX + this.lineThickness, "y": bottomLineY + this.lineThickness, "width": Math.max(0, this.width - (rightLineX + this.lineThickness)), "height": Math.max(0, this.height - (bottomLineY + this.lineThickness)), "status": "neutral" }
		];
	}

	updateCalibratorCells() {
		this.updateCalibratorCellsValues();

		this.calibratorCells
			.data(this.calibratorCellsValues)
			.attr("x",      function(d) { return d.x;      })
			.attr("y",      function(d) { return d.y;      })
			.attr("width",  function(d) { return d.width;  })
			.attr("height", function(d) { return d.height; });
	}

	setCalibratorCells() {
		this.updateCalibratorCellsValues();

		this.calibratorCells = this.calibratorCellsContainer
			.selectAll(".calibratorCell")
			.data(this.calibratorCellsValues)
			.enter()
			.append("rect")
			.attr("class", "calibratorCell")
			.attr("id",     function(d) { return d.id;     })
			.attr("x",      function(d) { return d.x;      })
			.attr("y",      function(d) { return d.y;      })
			.attr("width",  function(d) { return d.width;  })
			.attr("height", function(d) { return d.height; })
			.attr("status", function(d) { return d.status; })
			.on("click", this.changeCellStatus.bind(this));
	}

	changeCellStatus(d) {
		switch(d.status) {
			case "neutral":  this.calibratorCellsContainer.select("#" + d.id).attr("status", d.status = "entrance"); break;
			case "entrance": this.calibratorCellsContainer.select("#" + d.id).attr("status", d.status = "exit");     break;
			case "exit":     this.calibratorCellsContainer.select("#" + d.id).attr("status", d.status = "neutral");  break;
		}	
	}

	getLineIndexById(id) {
		for(var i = 0; i < this.calibratorLinesValues.length; i++) {
			if (id == this.calibratorLinesValues[i].id) {
				return i;
			}
		}
		return -1;
	}
}