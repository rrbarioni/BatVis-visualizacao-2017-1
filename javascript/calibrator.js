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

		this.linesContainer = this.container.append("g")
			.attr("class", "calibratorLines");
		this.linesValues, this.lines;
		this.setLines();

		this.cellsContainer = this.container.append("g")
			.attr("class", "calibratorCells");
		this.cellsValues, this.cells;
		this.setCells();
	}

	updateLinesValues() {
		this.linesValues = [
			{ "id": "leftLine",	  "x": this.width * 1/3, "y": 0,                 "width": this.lineThickness, "height": this.height        },
			{ "id": "rightLine",  "x": this.width * 2/3, "y": 0,                 "width": this.lineThickness, "height": this.height        },
			{ "id": "topLine",	  "x": 0,                "y": this.height * 1/3, "width": this.width,         "height": this.lineThickness },
			{ "id": "bottomLine", "x": 0,                "y": this.height * 2/3, "width": this.width,         "height": this.lineThickness }
		];
	}

	setLines() {
		this.updateLinesValues();

		this.lines = this.linesContainer
			.selectAll(".calibratorLine")
			.data(this.linesValues)
			.enter()
			.append("rect")
			.attr("class", "calibratorLine")
			.attr("id",     function(d) { return d.id;     })
			.attr("x",      function(d) { return d.x;      })
			.attr("y",      function(d) { return d.y;      })
			.attr("width",  function(d) { return d.width;  })
			.attr("height", function(d) { return d.height; })
			.call(d3.drag().on("drag",  this.dragLine.bind(this)));	
	}

	dragLine(d) {
		switch(d.id) {
			case "leftLine":   { this.linesContainer.select("#leftLine").attr  ("x", d.x = Math.max(0, Math.min(this.linesValues[this.getLineIndexById("rightLine")].x,d3.event.x)));                                this.updateCells(); break; }
			case "rightLine":  { this.linesContainer.select("#rightLine").attr ("x", d.x = Math.max(this.linesValues[this.getLineIndexById("leftLine")].x, Math.min((this.width - this.lineThickness),d3.event.x))); this.updateCells(); break; }
			case "topLine":    { this.linesContainer.select("#topLine").attr   ("y", d.y = Math.max(0, Math.min(this.linesValues[this.getLineIndexById("bottomLine")].y,d3.event.y)));                               this.updateCells(); break; }
			case "bottomLine": { this.linesContainer.select("#bottomLine").attr("y", d.y = Math.max(this.linesValues[this.getLineIndexById("topLine")].y, Math.min((this.height - this.lineThickness),d3.event.y))); this.updateCells(); break; }
		}
	}

	updateCellsValues() {
		var leftLineX =   this.linesValues[this.getLineIndexById("leftLine")].x;
		var rightLineX =  this.linesValues[this.getLineIndexById("rightLine")].x;
		var topLineY =    this.linesValues[this.getLineIndexById("topLine")].y;
		var bottomLineY = this.linesValues[this.getLineIndexById("bottomLine")].y;

		this.cellsValues = [
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

	updateCells() {
		this.updateCellsValues();

		this.cells
			.data(this.cellsValues)
			.attr("x",      function(d) { return d.x;      })
			.attr("y",      function(d) { return d.y;      })
			.attr("width",  function(d) { return d.width;  })
			.attr("height", function(d) { return d.height; });
	}

	setCells() {
		this.updateCellsValues();

		this.cells = this.cellsContainer
			.selectAll(".calibratorCell")
			.data(this.cellsValues)
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
			case "neutral":  this.cellsContainer.select("#" + d.id).attr("status", d.status = "entrance"); break;
			case "entrance": this.cellsContainer.select("#" + d.id).attr("status", d.status = "exit");     break;
			case "exit":     this.cellsContainer.select("#" + d.id).attr("status", d.status = "neutral");  break;
		}	
	}

	getLineIndexById(id) {
		for(var i = 0; i < this.linesValues.length; i++) {
			if (id == this.linesValues[i].id) {
				return i;
			}
		}
		return -1;
	}
/*
	getCellIdByPos(x,y) {
		var cellX = 1;
		if (x >= this.cells)
	}*/
}