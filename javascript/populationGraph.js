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
		this.container.append("g").attr("class", "xAxis");
		this.container.append("g").attr("class", "yAxis");

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
			
			//debugger;

			this.batEntranceData = [];
			this.batExitData = [];
			var entranceDataIndex = 0;
			var exitDataIndex = 0;

			for (var i = 0; i < this.batData.bats.length; i++) {
            	var bat = this.batData.bats[i];
            	if(this.filterEnteringBat(bat)) {
            		this.batEntranceData.push(bat);
            		entranceDataIndex++;
            	}
            	else if(this.filterExitingBat(bat)) {
            		this.batExitData.push(bat);
            		exitDataIndex++;
            	}

            }
			console.log("Entrando: " + (this.batEntranceData.length) + ", " + "Saindo: " + (this.batExitData.length));

		}.bind(this));
	}

	setAxisDomain() {
		this.xScale.domain(d3.extent (this.batData.bats, function(d) { return d.x1; }));
  		this.yScale.domain([0, d3.max(this.batData.bats, function(d) { return d.y1; })]);
	}

	drawAxis() {
		this.container.selectAll(".xAxis")
	        .attr("transform", "translate(" + this.margin.left + "," + (this.height + this.margin.top) + ")")
	        .call(d3.axisBottom(this.xScale));

	    this.container.selectAll(".yAxis")
	        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
	        .call(d3.axisLeft(this.yScale));
	}

	receivedCalibratorData(lines, cells, screenScale) {
		this.calibratorLines = lines;
		this.calibratorCells = cells;
		this.calibratorScreenScale = screenScale;
	}

	filterEnteringBat(bat) {
		return (this.calibratorCells[this.getCalibratorCellIdByPos(bat.x1, bat.y1)].status == "entrance" &&
				this.calibratorCells[this.getCalibratorCellIdByPos(bat.x2, bat.y2)].status == "exit");
	}

	filterExitingBat(bat) {
		return (this.calibratorCells[this.getCalibratorCellIdByPos(bat.x1, bat.y1)].status == "exit" &&
				this.calibratorCells[this.getCalibratorCellIdByPos(bat.x2, bat.y2)].status == "entrance");
	}

	getCalibratorCellIdByPos(x,y) {
		var cellId = 0;
		if (x >= this.calibratorCells[1].x / this.calibratorScreenScale) { cellId++;    }
		if (x >= this.calibratorCells[2].x / this.calibratorScreenScale) { cellId++;    }
		if (y >= this.calibratorCells[3].y / this.calibratorScreenScale) { cellId += 3; }
		if (y >= this.calibratorCells[6].y / this.calibratorScreenScale) { cellId += 3; }
		return cellId;
	}

}