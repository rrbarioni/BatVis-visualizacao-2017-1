class PopulationGraph {
	constructor(width,height) {
		this.margin = { top: 20, right: 20, bottom: 30, left: 50 };
		this.width =  width - this.margin.left - this.margin.right;
		this.height = height - this.margin.top - this.margin.bottom;

		this.firstCalibrationDone = false;
		this.receivedCalibrationOnZoom = false;

		this.currentZoomLevel = -1;
		this.brush = d3.brush()
			.on("end", this.zoomIn.bind(this))
			.extent([[this.margin.left,this.margin.top], [this.width + this.margin.left,this.height + this.margin.top]]);

		this.svg = d3.select("#populationGraph")
			.attr("width",  this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.call(this.brush)
			.on("contextmenu", this.zoomOut.bind(this));
			
		this.container = this.svg.append("g")
			.attr("class", "container");

		this.xScale = d3.scaleLinear().range([this.margin.left, this.width + this.margin.left]);
		this.yScale = d3.scaleLinear().range([this.height + this.margin.top, this.margin.top]);
		this.svg.append("g").attr("class", "xAxis");
		this.svg.append("g").attr("class", "yAxis");

		this.calibratorLines, this.calibratorCells, this.calibratorScreenScale;
		
		this.batData;
		this.enteringExitingBatDataSize = 60;

		this.firstFrame = [];					  //xMin
		this.lastFrame = [];					  //xMax
		this.minEntranceOrExitingOnInterval = []; //yMin
		this.maxEntranceOrExitingOnInterval = []; //yMax
		this.framesPerInterval = [];
		this.bats = [];
		this.enteringBatData = [];
		this.exitingBatData = [];
		this.populationBatData = [];

		this.enteringBatGraphNodes, this.exitingBatGraphNodes;
		this.enteringBatGraphLines, this.exitingBatGraphLines, this.populationBatGraphLines;
		// this.loadBatFile("files/simulation.json");
		this.loadBatFile("files/20141003_tracking.json");
		
	}

	loadBatFile(batFilePath) {
		d3.json(batFilePath, function(error, batData) {
			if (error) { throw error; }
			this.batData = batData;

			this.currentZoomLevel = 0;
			this.firstFrame = [0];
			this.lastFrame = [this.batData.total];
			this.framesPerInterval = [(this.lastFrame[this.currentZoomLevel] - this.firstFrame[this.currentZoomLevel])/this.enteringExitingBatDataSize];
			this.bats = [this.filterBatArrayByFrameInterval(this.batData.bats, this.firstFrame[this.currentZoomLevel], this.lastFrame[this.currentZoomLevel])];
			this.enteringBatData = [];
			this.exitingBatData = [];
			this.populationBatData = [];


			this.setEnteringAndExitingBatData();
			this.drawGraph();
		}.bind(this));
	}

	zoomIn() {
		var brushRect = d3.event.selection;
		if (!brushRect) { return; }

		if (this.currentZoomLevel == -1) { return; }
		this.currentZoomLevel++;
		
		this.firstFrame.push(this.xScale.invert(brushRect[0][0]));
		this.lastFrame.push (this.xScale.invert(brushRect[1][0]));
		this.framesPerInterval.push((this.lastFrame[this.currentZoomLevel] - this.firstFrame[this.currentZoomLevel])/this.enteringExitingBatDataSize);
		this.bats.push(this.filterBatArrayByFrameInterval(this.batData.bats, this.firstFrame[this.currentZoomLevel], this.lastFrame[this.currentZoomLevel]));

		this.setEnteringAndExitingBatData();
		this.drawGraph();

		this.sendData();
	}

	zoomOut() {
		d3.event.preventDefault();

		if(this.currentZoomLevel == 0) {
			return;
		}
		this.currentZoomLevel--;

		this.firstFrame.pop();
		this.lastFrame.pop();
		this.framesPerInterval.pop();
		this.bats.pop();

		if (!this.receivedCalibrationOnZoom) {
			this.enteringBatData.pop();
			this.exitingBatData.pop();
			this.populationBatData.pop();

		}
		else {
			this.setEnteringAndExitingBatData();
		}

		this.drawGraph();

		if(this.currentZoomLevel == 0) {
			this.receivedCalibrationOnZoom = false;
		}

		this.sendData();
	}

	setAxisDomain() {
		var minPop = d3.min(this.populationBatData[this.currentZoomLevel], function(d) { return d.population; });
		var maxPop = d3.max(this.populationBatData[this.currentZoomLevel], function(d) { return d.population; });

		this.minEntranceOrExitingOnInterval[this.currentZoomLevel] =             d3.min(this.enteringBatData[this.currentZoomLevel].concat(this.exitingBatData[this.currentZoomLevel]), function(d) { return d.bats.length; });
		this.maxEntranceOrExitingOnInterval[this.currentZoomLevel] = Math.max(1, d3.max(this.enteringBatData[this.currentZoomLevel].concat(this.exitingBatData[this.currentZoomLevel]), function(d) { return d.bats.length; }));

		this.minEntranceOrExitingOnInterval[this.currentZoomLevel] = Math.min(this.minEntranceOrExitingOnInterval[this.currentZoomLevel], minPop);
		this.maxEntranceOrExitingOnInterval[this.currentZoomLevel] = Math.max(this.maxEntranceOrExitingOnInterval[this.currentZoomLevel], maxPop);

  		this.xScale.domain([this.firstFrame[this.currentZoomLevel], this.lastFrame[this.currentZoomLevel]]);
  		this.yScale.domain([this.minEntranceOrExitingOnInterval[this.currentZoomLevel], this.maxEntranceOrExitingOnInterval[this.currentZoomLevel]]);
	}

	drawAxis() {
		this.setAxisDomain();

		this.svg.selectAll(".xAxis")
			.transition()
	        .attr("transform", "translate(0," + (this.height + this.margin.top) + ")")
	        .call(d3.axisBottom(this.xScale)
	        		.tickValues((d3.range(this.firstFrame[this.currentZoomLevel], this.lastFrame[this.currentZoomLevel], this.framesPerInterval[this.currentZoomLevel] * 10)).concat([this.lastFrame[this.currentZoomLevel]]))
	        		.tickFormat(d3.format(".0f"))
	        		);

	    this.svg.selectAll(".yAxis")
	    	.transition()
	        .attr("transform", "translate(" + this.margin.left + ",0)")
	        .call(d3.axisLeft(this.yScale)
	        		// .tickValues((d3.range(this.minEntranceOrExitingOnInterval[this.currentZoomLevel], this.maxEntranceOrExitingOnInterval[this.currentZoomLevel], 1)).concat(this.maxEntranceOrExitingOnInterval[this.currentZoomLevel]))
	        		.tickFormat(d3.format(".0f"))
	        		);
	}

	drawNodes() {
		var nodeRadius = 5;
		var nodeOpacity = 0.8;
	}

	drawLines() {
		var lineWidth = 5;
		var lineOpacity = 0.5;

		this.enteringBatGraphLines = this.container.selectAll(".enteringBatLine")
			.data(this.enteringBatData[this.currentZoomLevel]);
		this.enteringBatGraphLines
			.exit()
			.remove();
		this.enteringBatGraphLines
			.transition()
			.attr("class", "enteringBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[this.currentZoomLevel]); } return this.xScale(this.enteringBatData[this.currentZoomLevel][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[this.currentZoomLevel]); } return this.yScale(this.enteringBatData[this.currentZoomLevel][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[this.currentZoomLevel]); } return this.xScale(this.enteringBatData[this.currentZoomLevel][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[this.currentZoomLevel]); } return this.yScale(this.enteringBatData[this.currentZoomLevel][i].bats.length);   }.bind(this))
			.attr("stroke", "#00FF00")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);
		this.enteringBatGraphLines
			.enter()
			.append("line")
			.transition()
			.attr("class", "enteringBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[this.currentZoomLevel]); } return this.xScale(this.enteringBatData[this.currentZoomLevel][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[this.currentZoomLevel]); } return this.yScale(this.enteringBatData[this.currentZoomLevel][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[this.currentZoomLevel]); } return this.xScale(this.enteringBatData[this.currentZoomLevel][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[this.currentZoomLevel]); } return this.yScale(this.enteringBatData[this.currentZoomLevel][i].bats.length);   }.bind(this))
			.attr("stroke", "#00FF00")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);

		this.exitingBatGraphLines = this.container.selectAll(".exitingBatLine")
			.data(this.exitingBatData[this.currentZoomLevel]);
		this.exitingBatGraphLines
			.exit()
			.remove();
		this.exitingBatGraphLines
			.transition()
			.attr("class", "exitingBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[this.currentZoomLevel]); } return this.xScale(this.exitingBatData[this.currentZoomLevel][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[this.currentZoomLevel]); } return this.yScale(this.exitingBatData[this.currentZoomLevel][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[this.currentZoomLevel]); } return this.xScale(this.exitingBatData[this.currentZoomLevel][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[this.currentZoomLevel]); } return this.yScale(this.exitingBatData[this.currentZoomLevel][i].bats.length);   }.bind(this))
			.attr("stroke", "#FF0000")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);
		this.exitingBatGraphLines
			.enter()
			.append("line")
			.transition()
			.attr("class", "exitingBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[this.currentZoomLevel]); } return this.xScale(this.exitingBatData[this.currentZoomLevel][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[this.currentZoomLevel]); } return this.yScale(this.exitingBatData[this.currentZoomLevel][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[this.currentZoomLevel]); } return this.xScale(this.exitingBatData[this.currentZoomLevel][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[this.currentZoomLevel]); } return this.yScale(this.exitingBatData[this.currentZoomLevel][i].bats.length);   }.bind(this))
			.attr("stroke", "#FF0000")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);

		this.populationBatGraphLines = this.container.selectAll(".populationBatLine")
			.data(this.populationBatData[this.currentZoomLevel]);
		this.populationBatGraphLines
			.exit()
			.remove();
		this.populationBatGraphLines
			.transition()
			.attr("class", "populationBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[this.currentZoomLevel]); } return this.xScale(this.populationBatData[this.currentZoomLevel][i-1].f2); }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[this.currentZoomLevel]); } return this.yScale(this.populationBatData[this.currentZoomLevel][i-1].population); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[this.currentZoomLevel]); } return this.xScale(this.populationBatData[this.currentZoomLevel][i].f2); }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[this.currentZoomLevel]); } return this.yScale(this.populationBatData[this.currentZoomLevel][i].population); }.bind(this))
			.attr("stroke", "#FFFF00")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);
		this.populationBatGraphLines
			.enter()
			.append("line")
			.transition()
			.attr("class", "populationBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[this.currentZoomLevel]); } return this.xScale(this.populationBatData[this.currentZoomLevel][i-1].f2); }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[this.currentZoomLevel]); } return this.yScale(this.populationBatData[this.currentZoomLevel][i-1].population); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[this.currentZoomLevel]); } return this.xScale(this.populationBatData[this.currentZoomLevel][i].f2); }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[this.currentZoomLevel]); } return this.yScale(this.populationBatData[this.currentZoomLevel][i].population); }.bind(this))
			.attr("stroke", "#FFFF00")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);
	}

	drawGraph() {
		this.drawAxis();

		this.drawNodes();
		this.drawLines();
	}

	receiveCalibratorData(lines, cells, screenScale) {
		this.calibratorLines = lines;
		this.calibratorCells = cells;
		this.calibratorScreenScale = screenScale;

		this.firstCalibrationDone = true;
		if (this.currentZoomLevel > 0) { this.receivedCalibrationOnZoom = true; }
		
		this.setEnteringAndExitingBatData();
		this.drawGraph();

		this.sendData();
	}

	setEnteringAndExitingBatData() {
		this.enteringBatData[this.currentZoomLevel] = [];
		this.exitingBatData[this.currentZoomLevel] = [];
		this.populationBatData[this.currentZoomLevel] = [];


		this.enteringBatData[this.currentZoomLevel].push({ "f1": this.firstFrame[this.currentZoomLevel], "f2": this.firstFrame[this.currentZoomLevel], "bats": [] });
		this.exitingBatData[this.currentZoomLevel].push ({ "f1": this.firstFrame[this.currentZoomLevel], "f2": this.firstFrame[this.currentZoomLevel], "bats": [] });
		this.populationBatData[this.currentZoomLevel].push ({ "f1": this.firstFrame[this.currentZoomLevel], "f2": this.firstFrame[this.currentZoomLevel], "population": 0 });
		for(var i = 0; i < this.enteringExitingBatDataSize - 1; i++) {
			this.enteringBatData[this.currentZoomLevel].push({ "f1": this.firstFrame[this.currentZoomLevel] + (i * this.framesPerInterval[this.currentZoomLevel]), "f2": this.firstFrame[this.currentZoomLevel] + ((i+1) * this.framesPerInterval[this.currentZoomLevel]), "bats": [] });
			this.exitingBatData[this.currentZoomLevel].push ({ "f1": this.firstFrame[this.currentZoomLevel] + (i * this.framesPerInterval[this.currentZoomLevel]), "f2": this.firstFrame[this.currentZoomLevel] + ((i+1) * this.framesPerInterval[this.currentZoomLevel]), "bats": [] });
			this.populationBatData[this.currentZoomLevel].push ({ "f1": this.firstFrame[this.currentZoomLevel] + (i * this.framesPerInterval[this.currentZoomLevel]), "f2": this.firstFrame[this.currentZoomLevel] + ((i+1) * this.framesPerInterval[this.currentZoomLevel]), "population": 0 });
		}
		this.enteringBatData[this.currentZoomLevel].push({ "f1": this.firstFrame[this.currentZoomLevel] + (this.enteringExitingBatDataSize - 1) * this.framesPerInterval[this.currentZoomLevel], "f2": this.lastFrame[this.currentZoomLevel], "bats": [] });
		this.exitingBatData[this.currentZoomLevel].push ({ "f1": this.firstFrame[this.currentZoomLevel] + (this.enteringExitingBatDataSize - 1) * this.framesPerInterval[this.currentZoomLevel], "f2": this.lastFrame[this.currentZoomLevel], "bats": [] });
		this.populationBatData[this.currentZoomLevel].push ({ "f1": this.firstFrame[this.currentZoomLevel] + (this.enteringExitingBatDataSize - 1) * this.framesPerInterval[this.currentZoomLevel], "f2": this.lastFrame[this.currentZoomLevel], "population": 0 });
		
		if (!this.firstCalibrationDone) { return; }

		for (var i = 0; i < this.bats[this.currentZoomLevel].length; i++) {
        	var bat = this.bats[this.currentZoomLevel][i];
        	if (this.filterEnteringBat(bat)) {
        		this.enteringBatData[this.currentZoomLevel][Math.floor((bat.f2 - this.firstFrame[this.currentZoomLevel])/this.framesPerInterval[this.currentZoomLevel]) + 1].bats.push(bat);
        		this.populationBatData[this.currentZoomLevel][Math.floor((bat.f2 - this.firstFrame[this.currentZoomLevel])/this.framesPerInterval[this.currentZoomLevel]) + 1].population--;
        	}
        	else if (this.filterExitingBat(bat)) {
        		this.exitingBatData[this.currentZoomLevel][Math.floor((bat.f2 - this.firstFrame[this.currentZoomLevel])/this.framesPerInterval[this.currentZoomLevel]) + 1].bats.push(bat);
        		this.populationBatData[this.currentZoomLevel][Math.floor((bat.f2 - this.firstFrame[this.currentZoomLevel])/this.framesPerInterval[this.currentZoomLevel]) + 1].population++;
        	}
        }

        for(var i = 1; i < this.populationBatData[this.currentZoomLevel].length; i++) {
        	this.populationBatData[this.currentZoomLevel][i].population += this.populationBatData[this.currentZoomLevel][i-1].population;
        }

        //console.log(this.populationBatData[this.currentZoomLevel][Math.floor((bat.f2 - this.firstFrame[this.currentZoomLevel])/this.framesPerInterval[this.currentZoomLevel]) + 1]);
	}

	filterBatArrayByFrameInterval(bats, f1, f2) {
		return bats.filter(function(bat) {
			return bat.f2 >= f1 && bat.f2 < f2;
		});
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

	sendData() {
		this.dispatch.call(
			"batListChanged",
			{
				"id": "populationGraph",
				"enteringBats": this.bats[this.currentZoomLevel].filter(function(bat) { return this.filterEnteringBat(bat); }.bind(this)),
				"exitingBats":  this.bats[this.currentZoomLevel].filter(function(bat) { return this.filterExitingBat(bat);  }.bind(this))
			}
		);
	}

}