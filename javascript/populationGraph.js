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

		this.xScale = d3.scaleLinear().range([this.margin.left, this.width + this.margin.left]);
		this.yScale = d3.scaleLinear().range([this.height + this.margin.top, this.margin.top]);
		this.container.append("g").attr("class", "xAxis");
		this.container.append("g").attr("class", "yAxis");

		this.calibratorLines, this.calibratorCells, this.calibratorScreenScale;
		
		this.batData, this.enteringBatData, this.exitingBatData;

		this.enteringBatGraphNodes, this.exitingBatGraphNodes;
		//this.loadBatFile("files/simulation.json");
	}

	loadBatFile(batFilePath) {
		d3.json(batFilePath, function(error, batData) {
			if (error) { throw error; }
			this.batData = batData;

			this.setEnteringAndExitingBatData();
			this.drawGraph();
		}.bind(this));
	}

	setAxisDomain() {
		this.xScale.domain([0, this.batData.total]);
  		this.yScale.domain([0, d3.max(this.enteringBatData, function(d) { return d.bats.length; })]);
	}

	drawAxis() {
		this.setAxisDomain();

		this.container.selectAll(".xAxis")
	        .attr("transform", "translate(0," + (this.height + this.margin.top) + ")")
	        .call(d3.axisBottom(this.xScale));

	    this.container.selectAll(".yAxis")
	        .attr("transform", "translate(" + this.margin.left + ",0)")
	        .call(d3.axisLeft(this.yScale));
	}

	drawGraph() {
		this.drawAxis();
		console.log("eae meeen");
		this.enteringBatGraphNodes = this.container.selectAll(".enteringBatNode")
			.data(this.enteringBatData)
			.enter()
			.append("circle")
			.attr("class", "enteringBatNode")
			.attr("r", 5)
			.attr("cx", function(d) { return this.xScale(d.f2); }.bind(this))
			.attr("cy", function(d) { return this.yScale(d.bats.length); }.bind(this))
			.attr("fill", "#FF0000");
		this.enteringBatGraphNodes.exit().remove();
	}

	receivedCalibratorData(lines, cells, screenScale) {
		this.calibratorLines = lines;
		this.calibratorCells = cells;
		this.calibratorScreenScale = screenScale;
	}

	setEnteringAndExitingBatData() {
		this.enteringBatData = [];
		this.exitingBatData = [];

		var secondsPerInterval = 1;
		var framesPerInterval = this.batData.fps * secondsPerInterval;
		var enteringExitingBatDataSize = Math.ceil(this.batData.total/framesPerInterval);
		
		this.enteringBatData.push({ "f1": 0, "f2": 0, "bats": [] });
		this.exitingBatData.push ({ "f1": 0, "f2": 0, "bats": [] });
		for(var i = 0; i < enteringExitingBatDataSize; i++) {
			this.enteringBatData.push({ "f1": i * this.batData.fps * secondsPerInterval, "f2": (i+1) * this.batData.fps * secondsPerInterval, "bats": [] });
			this.exitingBatData.push ({ "f1": i * this.batData.fps * secondsPerInterval, "f2": (i+1) * this.batData.fps * secondsPerInterval, "bats": [] });
		}
		
		for (var i = 0; i < this.batData.bats.length; i++) {
        	var bat = this.batData.bats[i];
        	if (this.filterEnteringBat(bat)) {
        		// A ideia aqui seria incrementar a posição no array correspondente ao frame que o morcego saiu do tracking
        		// (no caso, seriam <numeroDeFramesDoArquivo> posições no array, mas isso poderia ser diminuido, já que temos o FPS)
        		this.enteringBatData[Math.floor(bat.f2/framesPerInterval) + 1].bats.push(bat);
        	}
        	else if (this.filterExitingBat(bat)) {
        		// mesma coisa aqui
        		this.exitingBatData[Math.floor(bat.f2/framesPerInterval) + 1].bats.push(bat);
        	}
        }

	    // var sEnteringBatData = "";
	    // for(var i = 0; i < this.enteringBatData.length; i++) {
	    // 	sEnteringBatData += this.enteringBatData[i].f2 + ", ";
	    // }
	    // console.log(sEnteringBatData);
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