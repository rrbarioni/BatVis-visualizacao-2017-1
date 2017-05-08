class PopulationGraph {
	constructor(width,height) {
		this.margin = { top: 20, right: 20, bottom: 30, left: 50 };
		this.width =  width - this.margin.left - this.margin.right;
		this.height = height - this.margin.top - this.margin.bottom;

		this.svg = d3.select("#populationGraph")
			.attr("width",  this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom);
		this.container = this.svg.append("g")
			.attr("class", "container");

		this.xScale = d3.scaleLinear().range([0, this.width]);
		this.yScale = d3.scaleLinear().range([this.height, 0]);

		this.calibratorLines, this.calibratorCells, this.calibratorScreenScale;
		
		this.batData, this.batEntranceData, this.batExitData;
		this.loadBatFile("files/simulation.json");
	}

	loadBatFile(batFilePath) {
		d3.json(batFilePath, function(error, batData) {
			if (error) { throw error; }

			this.batData = batData;
			this.setAxisDomain();
			this.drawAxis();

		}.bind(this));	
	}

	setAxisDomain() {
		this.xScale.domain(d3.extent (this.batData.bats, function(d) { return d.x1; }));
  		this.yScale.domain([0, d3.max(this.batData.bats, function(d) { return d.y1; })]);
	}

	drawAxis() {
		this.container.append("g")
	        .attr("transform", "translate(" + this.margin.left + "," + (this.height + this.margin.top) + ")")
	        .call(d3.axisBottom(this.xScale));

	    this.container.append("g")
	        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
	        .call(d3.axisLeft(this.yScale));
	}

	receivedCalibratorData(lines, cells, screenScale) {
		this.calibratorLines = lines;
		this.calibratorCells = cells;
		this.calibratorScreenScale = screenScale;
	}

	filterBat(bat) {
		return (this.calibratorCells[getCalibratorCellIdByPos(bat.x1, bat.y1)].status == "entrance" &&
				this.calibratorCells[getCalibratorCellIdByPos(bat.x2, bat.y2)].status == "exit");
	}

	getCalibratorCellIdByPos(x,y) {
		var cellId = 1;
		if (x >= this.calibratorCells[1].x / screenScale) { cellId++;    }
		if (x >= this.calibratorCells[2].x / screenScale) { cellId++;    }
		if (y >= this.calibratorCells[3].y / screenScale) { cellId += 3; }
		if (y >= this.calibratorCells[6].y / screenScale) { cellId += 3; }
		return cellId;
	}

}