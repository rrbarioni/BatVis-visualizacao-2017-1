class PopulationGraph {
	constructor(width,height) {
		var miniHeight = height/5;

		this.margin = { top: 20, right: 20, bottom: 60 + miniHeight, left: 50 };
		this.width =  width - this.margin.left - this.margin.right;
		this.height = height - this.margin.top - this.margin.bottom;

		this.miniMargin = { top: 60 + this.height, right: this.margin.right, bottom: 30, left: this.margin.left };
		this.miniWidth =  width - this.miniMargin.left - this.miniMargin.right;
		this.miniHeight = height - this.miniMargin.top - this.miniMargin.bottom;

		this.firstCalibrationDone = false;

		this.brush = d3.brushX()
			.on("end", this.brushArea.bind(this))
			.extent([[this.miniMargin.left,this.miniMargin.top], [this.miniWidth + this.miniMargin.left,this.miniHeight + this.miniMargin.top]]);

		this.svg = d3.select("#populationGraph")
			.attr("width",  this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.call(this.brush);
			
		this.container = this.svg.append("g")
			.attr("class", "container");

		this.xScale = d3.scaleLinear().range([this.margin.left, this.width + this.margin.left]);
		this.yScale = d3.scaleLinear().range([this.height + this.margin.top, this.margin.top]);
		this.svg.append("g").attr("class", "xAxis");
		this.svg.append("g").attr("class", "yAxis");

		this.miniXScale = d3.scaleLinear().range([this.miniMargin.left, this.miniWidth + this.miniMargin.left]);
		this.miniYScale = d3.scaleLinear().range([this.miniHeight + this.miniMargin.top, this.miniMargin.top]);
		this.svg.append("g").attr("class", "miniXAxis");

		this.calibratorLines, this.calibratorCells, this.calibratorScreenScale;
		
		this.batData;
		this.enteringExitingBatDataSize = 60;

		this.firstFrame = [];
		this.lastFrame = [];
		this.minEntranceOrExitingOnInterval = [];
		this.maxEntranceOrExitingOnInterval = [];
		this.framesPerInterval = [];
		this.bats = [];
		this.enteringBatData = [];
		this.exitingBatData = [];
		this.populationBatData = [];

		this.enteringBatGraphLines, this.exitingBatGraphLines, this.populationBatGraphLines;
		this.enteringBatGraphMiniLines, this.exitingBatGraphMiniLines, this.populationBatGraphMiniLines;
		
		this.loadBatFile("files/20141003_tracking.json");
		
	}

	loadBatFile(batFilePath) {
		d3.json(batFilePath, function(error, batData) {
			if (error) { throw error; }
			this.batData = batData;

			this.firstFrame[0] = [0];                                                                                    this.firstFrame[1] = this.firstFrame[0];
			this.lastFrame[0] = this.batData.total;                                                                      this.lastFrame[1] = this.lastFrame[0];
			this.framesPerInterval[0] = (this.lastFrame[0] - this.firstFrame[0])/this.enteringExitingBatDataSize;        this.framesPerInterval[1] = this.framesPerInterval[0];
			this.bats[0] = this.filterBatArrayByFrameInterval(this.batData.bats, this.firstFrame[0], this.lastFrame[0]); this.bats[1] = this.bats[0];
			this.enteringBatData[0] = [];                                                                                this.enteringBatData[1] = this.enteringBatData[0];
			this.exitingBatData[0] = [];                                                                                 this.exitingBatData[1] = this.exitingBatData[0];
			this.populationBatData[0] = [];                                                                              this.populationBatData[1] = this.populationBatData[0];

			this.setEnteringAndExitingBatData(1);
			this.drawGraph();
			this.setEnteringAndExitingBatData(0);
			this.drawMiniGraph();
		}.bind(this));
	}

	brushArea() {
		var brushRect = d3.event.selection;
		if (!brushRect) { return; }

		this.firstFrame[1] = this.miniXScale.invert(brushRect[0]);
		this.lastFrame[1] = this.miniXScale.invert(brushRect[1]);
		this.framesPerInterval[1] = (this.lastFrame[1] - this.firstFrame[1])/this.enteringExitingBatDataSize;
		this.bats[1] = this.filterBatArrayByFrameInterval(this.batData.bats, this.firstFrame[1], this.lastFrame[1]);

		this.setEnteringAndExitingBatData(1);
		this.drawGraph();

		this.sendData();
	}

	setAxisDomain() {
		var minPop = d3.min(this.populationBatData[1], function(d) { return d.population; });
		var maxPop = d3.max(this.populationBatData[1], function(d) { return d.population; });
		this.minEntranceOrExitingOnInterval[1] =             d3.min(this.enteringBatData[1].concat(this.exitingBatData[1]), function(d) { return d.bats.length; });
		this.maxEntranceOrExitingOnInterval[1] = Math.max(1, d3.max(this.enteringBatData[1].concat(this.exitingBatData[1]), function(d) { return d.bats.length; }));
		this.minEntranceOrExitingOnInterval[1] = Math.min(this.minEntranceOrExitingOnInterval[1], minPop);
		this.maxEntranceOrExitingOnInterval[1] = Math.max(this.maxEntranceOrExitingOnInterval[1], maxPop);

  		this.xScale.domain([this.firstFrame[1], this.lastFrame[1]]);
  		this.yScale.domain([this.minEntranceOrExitingOnInterval[1], this.maxEntranceOrExitingOnInterval[1]]);
	}

	drawAxis() {
		this.setAxisDomain();

		this.svg.selectAll(".xAxis")
			.transition()
	        .attr("transform", "translate(0," + (this.height + this.margin.top) + ")")
	        .call(d3.axisBottom(this.xScale)
	        		.tickValues((d3.range(this.firstFrame[1], this.lastFrame[1], this.framesPerInterval[1] * 10)).concat([this.lastFrame[1]]))
	        		.tickFormat(d3.format("d"))
	        		);

	    this.svg.selectAll(".yAxis")
	    	.transition()
	        .attr("transform", "translate(" + this.margin.left + ",0)")
	        .call(d3.axisLeft(this.yScale)
	        		// .tickValues((d3.range(this.minEntranceOrExitingOnInterval[1], this.maxEntranceOrExitingOnInterval[1], 1)).concat(this.maxEntranceOrExitingOnInterval[1]))
	        		.tickFormat(d3.format("d"))
	        		);
	}

	drawLines() {
		var lineWidth = 5;
		var lineOpacity = 0.5;

		this.enteringBatGraphLines = this.container.selectAll(".enteringBatLine")
			.data(this.enteringBatData[1]);
		this.enteringBatGraphLines
			.exit()
			.remove();
		this.enteringBatGraphLines
			.transition()
			.attr("class", "enteringBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.enteringBatData[1][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.enteringBatData[1][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.enteringBatData[1][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.enteringBatData[1][i].bats.length);   }.bind(this))
			.attr("stroke", "#00FF00")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);
		this.enteringBatGraphLines
			.enter()
			.append("line")
			.transition()
			.attr("class", "enteringBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.enteringBatData[1][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.enteringBatData[1][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.enteringBatData[1][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.enteringBatData[1][i].bats.length);   }.bind(this))
			.attr("stroke", "#00FF00")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);

		this.exitingBatGraphLines = this.container.selectAll(".exitingBatLine")
			.data(this.exitingBatData[1]);
		this.exitingBatGraphLines
			.exit()
			.remove();
		this.exitingBatGraphLines
			.transition()
			.attr("class", "exitingBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.exitingBatData[1][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.exitingBatData[1][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.exitingBatData[1][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.exitingBatData[1][i].bats.length);   }.bind(this))
			.attr("stroke", "#FF0000")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);
		this.exitingBatGraphLines
			.enter()
			.append("line")
			.transition()
			.attr("class", "exitingBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.exitingBatData[1][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.exitingBatData[1][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.exitingBatData[1][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.exitingBatData[1][i].bats.length);   }.bind(this))
			.attr("stroke", "#FF0000")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);

		this.populationBatGraphLines = this.container.selectAll(".populationBatLine")
			.data(this.populationBatData[1]);
		this.populationBatGraphLines
			.exit()
			.remove();
		this.populationBatGraphLines
			.transition()
			.attr("class", "populationBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.populationBatData[1][i-1].f2);         }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.populationBatData[1][i-1].population); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.populationBatData[1][i].f2);           }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.populationBatData[1][i].population);   }.bind(this))
			.attr("stroke", "#FFFF00")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);
		this.populationBatGraphLines
			.enter()
			.append("line")
			.transition()
			.attr("class", "populationBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.populationBatData[1][i-1].f2);         }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.populationBatData[1][i-1].population); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.populationBatData[1][i].f2);           }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.populationBatData[1][i].population);   }.bind(this))
			.attr("stroke", "#FFFF00")
			.attr("stroke-width", lineWidth)
			.attr('stroke-opacity', lineOpacity);
	}

	drawGraph() {
		this.drawAxis();
		this.drawLines();
	}

	setMiniAxisDomain() {
		var minPop = d3.min(this.populationBatData[0], function(d) { return d.population; });
		var maxPop = d3.max(this.populationBatData[0], function(d) { return d.population; });
		this.minEntranceOrExitingOnInterval[0] =             d3.min(this.enteringBatData[0].concat(this.exitingBatData[0]), function(d) { return d.bats.length; });
		this.maxEntranceOrExitingOnInterval[0] = Math.max(1, d3.max(this.enteringBatData[0].concat(this.exitingBatData[0]), function(d) { return d.bats.length; }));
		this.minEntranceOrExitingOnInterval[0] = Math.min(this.minEntranceOrExitingOnInterval[0], minPop);
		this.maxEntranceOrExitingOnInterval[0] = Math.max(this.maxEntranceOrExitingOnInterval[0], maxPop);

  		this.miniXScale.domain([this.firstFrame[0], this.lastFrame[0]]);
  		this.miniYScale.domain([this.minEntranceOrExitingOnInterval[0], this.maxEntranceOrExitingOnInterval[0]]);
	}

	drawMiniAxis() {
		this.setMiniAxisDomain();

		this.svg.selectAll(".miniXAxis")
			.transition()
	        .attr("transform", "translate(0," + (this.miniHeight + this.miniMargin.top) + ")")
	        .call(d3.axisBottom(this.miniXScale)
	        		.tickValues((d3.range(this.firstFrame[0], this.lastFrame[0], this.framesPerInterval[0] * 10)).concat([this.lastFrame[0]]))
	        		.tickFormat(d3.format("d"))
	        		);
	}

	drawMiniLines() {
		// this.svg.append("rect")
		// 	.attr("x", this.miniMargin.left)
		// 	.attr("y", this.miniMargin.top)
		// 	.attr("width", this.miniWidth)
		// 	.attr("height", this.miniHeight)
		// 	.attr("fill", "#00FF00");

		var miniLineWidth = 5;
		var miniLineOpacity = 0.5;

		this.enteringBatGraphMiniLines = this.container.selectAll(".enteringBatMiniLine")
			.data(this.enteringBatData[0]);
		this.enteringBatGraphMiniLines
			.exit()
			.remove();
		this.enteringBatGraphMiniLines
			.transition()
			.attr("class", "enteringBatMiniLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.enteringBatData[0][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.enteringBatData[0][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.enteringBatData[0][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.enteringBatData[0][i].bats.length);   }.bind(this))
			.attr("stroke", "#00FF00")
			.attr("stroke-width", miniLineWidth)
			.attr('stroke-opacity', miniLineOpacity);
		this.enteringBatGraphMiniLines
			.enter()
			.append("line")
			.transition()
			.attr("class", "enteringBatMiniLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.enteringBatData[0][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.enteringBatData[0][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.enteringBatData[0][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.enteringBatData[0][i].bats.length);   }.bind(this))
			.attr("stroke", "#00FF00")
			.attr("stroke-width", miniLineWidth)
			.attr('stroke-opacity', miniLineOpacity);

		this.exitingBatGraphMiniLines = this.container.selectAll(".exitingBatMiniLine")
			.data(this.exitingBatData[0]);
		this.exitingBatGraphMiniLines
			.exit()
			.remove();
		this.exitingBatGraphMiniLines
			.transition()
			.attr("class", "exitingBatMiniLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.exitingBatData[0][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.exitingBatData[0][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.exitingBatData[0][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.exitingBatData[0][i].bats.length);   }.bind(this))
			.attr("stroke", "#FF0000")
			.attr("stroke-width", miniLineWidth)
			.attr('stroke-opacity', miniLineOpacity);
		this.exitingBatGraphMiniLines
			.enter()
			.append("line")
			.transition()
			.attr("class", "exitingBatMiniLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.exitingBatData[0][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.exitingBatData[0][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.exitingBatData[0][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.exitingBatData[0][i].bats.length);   }.bind(this))
			.attr("stroke", "#FF0000")
			.attr("stroke-width", miniLineWidth)
			.attr('stroke-opacity', miniLineOpacity);

		this.populationBatGraphMiniLines = this.container.selectAll(".populationBatMiniLine")
			.data(this.populationBatData[0]);
		this.populationBatGraphMiniLines
			.exit()
			.remove();
		this.populationBatGraphMiniLines
			.transition()
			.attr("class", "populationBatMiniLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.populationBatData[0][i-1].f2);         }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.populationBatData[0][i-1].population); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.populationBatData[0][i].f2);           }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.populationBatData[0][i].population);   }.bind(this))
			.attr("stroke", "#FFFF00")
			.attr("stroke-width", miniLineWidth)
			.attr('stroke-opacity', miniLineOpacity);
		this.populationBatGraphMiniLines
			.enter()
			.append("line")
			.transition()
			.attr("class", "populationBatMiniLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.populationBatData[0][i-1].f2);         }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.populationBatData[0][i-1].population); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.populationBatData[0][i].f2);           }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.populationBatData[0][i].population);   }.bind(this))
			.attr("stroke", "#FFFF00")
			.attr("stroke-width", miniLineWidth)
			.attr('stroke-opacity', miniLineOpacity);
	}

	drawMiniGraph() {
		this.drawMiniAxis();
		this.drawMiniLines();
	}

	receiveCalibratorData(lines, cells, screenScale) {
		this.calibratorLines = lines;
		this.calibratorCells = cells;
		this.calibratorScreenScale = screenScale;

		this.firstCalibrationDone = true;
		
		this.setEnteringAndExitingBatData(1);
		this.drawGraph();
		this.setEnteringAndExitingBatData(0);
		this.drawMiniGraph();

		this.sendData();
	}

	setEnteringAndExitingBatData(zoomLevel) {
		this.enteringBatData[zoomLevel] = [];
		this.exitingBatData[zoomLevel] = [];
		this.populationBatData[zoomLevel] = [];

		this.enteringBatData[zoomLevel].push({ "f1": this.firstFrame[zoomLevel], "f2": this.firstFrame[zoomLevel], "bats": [] });
		this.exitingBatData[zoomLevel].push ({ "f1": this.firstFrame[zoomLevel], "f2": this.firstFrame[zoomLevel], "bats": [] });
		this.populationBatData[zoomLevel].push ({ "f1": this.firstFrame[zoomLevel], "f2": this.firstFrame[zoomLevel], "population": 0 });
		for(var i = 0; i < this.enteringExitingBatDataSize - 1; i++) {
			this.enteringBatData[zoomLevel].push({ "f1": this.firstFrame[zoomLevel] + (i * this.framesPerInterval[zoomLevel]), "f2": this.firstFrame[zoomLevel] + ((i+1) * this.framesPerInterval[zoomLevel]), "bats": [] });
			this.exitingBatData[zoomLevel].push ({ "f1": this.firstFrame[zoomLevel] + (i * this.framesPerInterval[zoomLevel]), "f2": this.firstFrame[zoomLevel] + ((i+1) * this.framesPerInterval[zoomLevel]), "bats": [] });
			this.populationBatData[zoomLevel].push ({ "f1": this.firstFrame[zoomLevel] + (i * this.framesPerInterval[zoomLevel]), "f2": this.firstFrame[zoomLevel] + ((i+1) * this.framesPerInterval[zoomLevel]), "population": 0 });
		}
		this.enteringBatData[zoomLevel].push({ "f1": this.firstFrame[zoomLevel] + (this.enteringExitingBatDataSize - 1) * this.framesPerInterval[zoomLevel], "f2": this.lastFrame[zoomLevel], "bats": [] });
		this.exitingBatData[zoomLevel].push ({ "f1": this.firstFrame[zoomLevel] + (this.enteringExitingBatDataSize - 1) * this.framesPerInterval[zoomLevel], "f2": this.lastFrame[zoomLevel], "bats": [] });
		this.populationBatData[zoomLevel].push ({ "f1": this.firstFrame[zoomLevel] + (this.enteringExitingBatDataSize - 1) * this.framesPerInterval[zoomLevel], "f2": this.lastFrame[zoomLevel], "population": 0 });
		
		if (!this.firstCalibrationDone) { return; }

		for (var i = 0; i < this.bats[zoomLevel].length; i++) {
        	var bat = this.bats[zoomLevel][i];
        	if (this.filterEnteringBat(bat)) {
        		this.enteringBatData[zoomLevel][Math.floor((bat.f2 - this.firstFrame[zoomLevel])/this.framesPerInterval[zoomLevel]) + 1].bats.push(bat);
        		this.populationBatData[zoomLevel][Math.floor((bat.f2 - this.firstFrame[zoomLevel])/this.framesPerInterval[zoomLevel]) + 1].population--;
        	}
        	else if (this.filterExitingBat(bat)) {
        		this.exitingBatData[zoomLevel][Math.floor((bat.f2 - this.firstFrame[zoomLevel])/this.framesPerInterval[zoomLevel]) + 1].bats.push(bat);
        		this.populationBatData[zoomLevel][Math.floor((bat.f2 - this.firstFrame[zoomLevel])/this.framesPerInterval[zoomLevel]) + 1].population++;
        	}
        }

        for(var i = 1; i < this.populationBatData[zoomLevel].length; i++) {
        	this.populationBatData[zoomLevel][i].population += this.populationBatData[zoomLevel][i-1].population;
        }
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
				"enteringBats": this.bats[1].filter(function(bat) { return this.filterEnteringBat(bat); }.bind(this)),
				"exitingBats":  this.bats[1].filter(function(bat) { return this.filterExitingBat(bat);  }.bind(this))
			}
		);
	}

}