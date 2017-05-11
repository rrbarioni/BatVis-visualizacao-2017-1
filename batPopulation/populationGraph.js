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
		this.transition = d3.transition().duration(200);

		this.calibratorLines, this.calibratorCells, this.calibratorScreenScale;
		
		this.batData, this.enteringBatData, this.exitingBatData;

		this.enteringBatGraphNodes, this.exitingBatGraphNodes;
		this.enteringBatGraphLines, this.exitingBatGraphLines;
		this.loadBatFile("files/simulation.json");
	}

	loadBatFile(batFilePath) {
		d3.json(batFilePath, function(error, batData) {
			if (error) { throw error; }
			this.batData = batData;
		}.bind(this));
	}

	setAxisDomain() {
		this.xScale.domain([0, this.batData.total]);
  		this.yScale.domain([0, Math.max(1, d3.max(this.enteringBatData.concat(this.exitingBatData), function(d) { return d.bats.length; }))]);
	}

	drawAxis() {
		this.setAxisDomain();

		this.container.selectAll(".xAxis")
			// .transition(this.transition)
	        .attr("transform", "translate(0," + (this.height + this.margin.top) + ")")
	        .call(d3.axisBottom(this.xScale));

	    this.container.selectAll(".yAxis")
	    	// .transition(this.transition)
	        .attr("transform", "translate(" + this.margin.left + ",0)")
	        .call(d3.axisLeft(this.yScale));
	}

	drawGraph() {
		this.drawAxis();

		// this.enteringBatGraphNodes = this.container.selectAll(".enteringBatNode")
		// 	.data(this.enteringBatData)
		// this.enteringBatGraphNodes
		// 	.exit()
		// 	.remove();
		// this.enteringBatGraphNodes
		// 	.attr("class", "enteringBatNode")
		// 	.attr("r", 5)
		// 	.attr("cx", function(d) { return this.xScale(d.f2); }.bind(this))
		// 	.attr("cy", function(d) { return this.yScale(d.bats.length); }.bind(this))
		// 	.attr("fill", "#00FF00")
		// 	.attr('fill-opacity', 0.7);
		// this.enteringBatGraphNodes
		// 	.enter()
		// 	.append("circle")
		// 	.attr("class", "enteringBatNode")
		// 	.attr("r", 5)
		// 	.attr("cx", function(d) { return this.xScale(d.f2); }.bind(this))
		// 	.attr("cy", function(d) { return this.yScale(d.bats.length); }.bind(this))
		// 	.attr("fill", "#00FF00")
		// 	.attr('fill-opacity', 0.7);

		// this.exitingBatGraphNodes = this.container.selectAll(".exitingBatNode")
		// 	.data(this.exitingBatData)
		// this.exitingBatGraphNodes
		// 	.exit()
		// 	.remove();
		// this.exitingBatGraphNodes
		// 	.attr("class", "exitingBatNode")
		// 	.attr("r", 5)
		// 	.attr("cx", function(d) { return this.xScale(d.f2); }.bind(this))
		// 	.attr("cy", function(d) { return this.yScale(d.bats.length); }.bind(this))
		// 	.attr("fill", "#FF0000")
		// 	.attr('fill-opacity', 0.7);
		// this.exitingBatGraphNodes
		// 	.enter()
		// 	.append("circle")
		// 	.attr("class", "exitingBatNode")
		// 	.attr("r", 5)
		// 	.attr("cx", function(d) { return this.xScale(d.f2); }.bind(this))
		// 	.attr("cy", function(d) { return this.yScale(d.bats.length); }.bind(this))
		// 	.attr("fill", "#FF0000")
		// 	.attr('fill-opacity', 0.7);

		this.enteringBatGraphLines = this.container.selectAll(".enteringBatLine")
			.data(this.enteringBatData)
		this.enteringBatGraphLines
			.exit()
			.remove();
		this.enteringBatGraphLines
			.attr("class", "enteringBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.enteringBatData[i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.enteringBatData[i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.enteringBatData[i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.enteringBatData[i].bats.length);   }.bind(this))
			.attr("stroke", "#00FF00")
			.attr("stroke-width", 3)
			.attr('stroke-opacity', 0.7);
		this.enteringBatGraphLines
			.enter()
			.append("line")
			.attr("class", "enteringBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.enteringBatData[i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.enteringBatData[i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.enteringBatData[i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.enteringBatData[i].bats.length);   }.bind(this))
			.attr("stroke", "#00FF00")
			.attr("stroke-width", 3)
			.attr('stroke-opacity', 0.7);

		this.exitingBatGraphLines = this.container.selectAll(".exitingBatLine")
			.data(this.exitingBatData)
		this.exitingBatGraphLines
			.exit()
			.remove();
		this.exitingBatGraphLines
			.attr("class", "exitingBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.exitingBatData[i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.exitingBatData[i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.exitingBatData[i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.exitingBatData[i].bats.length);   }.bind(this))
			.attr("stroke", "#FF0000")
			.attr("stroke-width", 3)
			.attr('stroke-opacity', 0.7);
		this.exitingBatGraphLines
			.enter()
			.append("line")
			.attr("class", "exitingBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.exitingBatData[i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.exitingBatData[i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.exitingBatData[i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.exitingBatData[i].bats.length);   }.bind(this))
			.attr("stroke", "#FF0000")
			.attr("stroke-width", 3)
			.attr('stroke-opacity', 0.7);
	}

	receivedCalibratorData(lines, cells, screenScale) {
		this.calibratorLines = lines;
		this.calibratorCells = cells;
		this.calibratorScreenScale = screenScale;
		
		this.setEnteringAndExitingBatData();
		this.drawGraph();
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

	    var sEnteringBatData = "";
	    for(var i = 0; i < this.enteringBatData.length; i++) {
	    	sEnteringBatData += this.enteringBatData[i].bats.length + ", ";
	    }
	    console.log(sEnteringBatData);
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