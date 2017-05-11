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
		this.transition = d3.transition().duration(1);

		this.calibratorLines, this.calibratorCells, this.calibratorScreenScale;
		
		this.maxEntranceOrExitingOnInterval, this.secondsPerInterval, this.framesPerInterval, this.enteringExitingBatDataSize;
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
		this.maxEntranceOrExitingOnInterval = Math.max(1, d3.max(this.enteringBatData.concat(this.exitingBatData), function(d) { return d.bats.length; }))

		this.xScale.domain([0, this.batData.total]);
  		this.yScale.domain([0, this.maxEntranceOrExitingOnInterval]);
	}

	drawAxis() {
		this.setAxisDomain();

		this.container.selectAll(".xAxis")
			// .transition(this.transition)
	        .attr("transform", "translate(0," + (this.height + this.margin.top) + ")")
	        .call(d3.axisBottom(this.xScale)
	        		.tickValues((d3.range(0, this.framesPerInterval * this.enteringExitingBatDataSize, this.framesPerInterval)).concat([this.batData.total]))
	        		.tickFormat(d3.format(".0f")));

	    this.container.selectAll(".yAxis")
	    	// .transition(this.transition)
	        .attr("transform", "translate(" + this.margin.left + ",0)")
	        .call(d3.axisLeft(this.yScale)
	        		.tickValues(d3.range(0, this.maxEntranceOrExitingOnInterval + 1, 1))
	        		.tickFormat(d3.format(".0f")));
	}

	drawGraph() {
		this.drawAxis();

		var nodeRadius = 5;
		var nodeOpacity = 0.8;

		this.enteringBatGraphNodes = this.container.selectAll(".enteringBatNode")
			.data(this.enteringBatData.slice(1, this.enteringBatData.length));
		this.enteringBatGraphNodes
			.exit()
			.remove();
		this.enteringBatGraphNodes
			// .transition(this.transition)
			.attr("class", "enteringBatNode")
			.attr("r", nodeRadius)
			.attr("cx", function(d) { return this.xScale(d.f2); }.bind(this))
			.attr("cy", function(d) { return this.yScale(d.bats.length); }.bind(this))
			.attr("fill", "#00FF00")
			.attr('fill-opacity', nodeOpacity);
		this.enteringBatGraphNodes
			.enter()
			.append("circle")
			// .transition(this.transition)
			.attr("class", "enteringBatNode")
			.attr("r", nodeRadius)
			.attr("cx", function(d) { return this.xScale(d.f2); }.bind(this))
			.attr("cy", function(d) { return this.yScale(d.bats.length); }.bind(this))
			.attr("fill", "#00FF00")
			.attr('fill-opacity', nodeOpacity);

		this.exitingBatGraphNodes = this.container.selectAll(".exitingBatNode")
			.data(this.exitingBatData.slice(1, this.exitingBatData.length))
		this.exitingBatGraphNodes
			.exit()
			.remove();
		this.exitingBatGraphNodes
			.attr("class", "exitingBatNode")
			.attr("r", nodeRadius)
			.attr("cx", function(d) { return this.xScale(d.f2); }.bind(this))
			.attr("cy", function(d) { return this.yScale(d.bats.length); }.bind(this))
			.attr("fill", "#FF0000")
			.attr('fill-opacity', nodeOpacity);
		this.exitingBatGraphNodes
			.enter()
			.append("circle")
			.attr("class", "exitingBatNode")
			.attr("r", nodeRadius)
			.attr("cx", function(d) { return this.xScale(d.f2); }.bind(this))
			.attr("cy", function(d) { return this.yScale(d.bats.length); }.bind(this))
			.attr("fill", "#FF0000")
			.attr('fill-opacity', nodeOpacity);

		var lineWidth = 5;
		var lineOpacity = 0.5;

		this.enteringBatGraphLines = this.container.selectAll(".enteringBatLine")
			.data(this.enteringBatData);
		this.enteringBatGraphLines
			.exit()
			.remove();
		this.enteringBatGraphLines
			// .transition(this.transition)
			.attr("class", "enteringBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.enteringBatData[i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.enteringBatData[i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.enteringBatData[i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.enteringBatData[i].bats.length);   }.bind(this))
			.attr("stroke", "#00FF00")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);
		this.enteringBatGraphLines
			.enter()
			.append("line")
			// .transition(this.transition)
			.attr("class", "enteringBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.enteringBatData[i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.enteringBatData[i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.enteringBatData[i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.enteringBatData[i].bats.length);   }.bind(this))
			.attr("stroke", "#00FF00")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);

		this.exitingBatGraphLines = this.container.selectAll(".exitingBatLine")
			.data(this.exitingBatData);
		this.exitingBatGraphLines
			.exit()
			.remove();
		this.exitingBatGraphLines
			// .transition(this.transition)
			.attr("class", "exitingBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.exitingBatData[i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.exitingBatData[i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.exitingBatData[i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.exitingBatData[i].bats.length);   }.bind(this))
			.attr("stroke", "#FF0000")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);
		this.exitingBatGraphLines
			.enter()
			.append("line")
			// .transition(this.transition)
			.attr("class", "exitingBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.exitingBatData[i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.exitingBatData[i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(0); } return this.xScale(this.exitingBatData[i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(0); } return this.yScale(this.exitingBatData[i].bats.length);   }.bind(this))
			.attr("stroke", "#FF0000")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);
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

		this.secondsPerInterval = 1;
		this.framesPerInterval = this.batData.fps * this.secondsPerInterval;
		this.enteringExitingBatDataSize = Math.ceil(this.batData.total/this.framesPerInterval);
		
		this.enteringBatData.push({ "f1": 0, "f2": 0, "bats": [] });
		this.exitingBatData.push ({ "f1": 0, "f2": 0, "bats": [] });
		for(var i = 0; i < this.enteringExitingBatDataSize - 1; i++) {
			this.enteringBatData.push({ "f1": i * this.framesPerInterval, "f2": (i+1) * this.framesPerInterval, "bats": [] });
			this.exitingBatData.push ({ "f1": i * this.framesPerInterval, "f2": (i+1) * this.framesPerInterval, "bats": [] });
		}
		this.enteringBatData.push({ "f1": (this.enteringExitingBatDataSize - 1) * this.framesPerInterval, "f2": this.batData.total, "bats": [] });
		this.exitingBatData.push ({ "f1": (this.enteringExitingBatDataSize - 1) * this.framesPerInterval, "f2": this.batData.total, "bats": [] });
		
		for (var i = 0; i < this.batData.bats.length; i++) {
        	var bat = this.batData.bats[i];
        	if (this.filterEnteringBat(bat)) {
        		this.enteringBatData[Math.floor(bat.f2/this.framesPerInterval) + 1].bats.push(bat);
        	}
        	else if (this.filterExitingBat(bat)) {
        		this.exitingBatData[Math.floor(bat.f2/this.framesPerInterval) + 1].bats.push(bat);
        	}
        }

	    // var sEnteringBatData = "";
	    // for(var i = 0; i < this.enteringBatData.length; i++) {
	    // 	sEnteringBatData += this.enteringBatData[i].bats.length + ", ";
	    // }
	    // console.log(sEnteringBatData);
	}

	filterEnteringBat(bat) {
		return (this.calibratorCells[this.getCalibratorCellIdByPos(bat.x1, bat.y1)].status == "exit" &&
				this.calibratorCells[this.getCalibratorCellIdByPos(bat.x2, bat.y2)].status == "entrance");
	}

	filterExitingBat(bat) {
		return (this.calibratorCells[this.getCalibratorCellIdByPos(bat.x1, bat.y1)].status == "entrance" &&
				this.calibratorCells[this.getCalibratorCellIdByPos(bat.x2, bat.y2)].status == "exit");
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