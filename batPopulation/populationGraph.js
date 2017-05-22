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

		this.horizontalBrush = d3.brushX()
			.on("end", this.brushMiniArea.bind(this))
			.extent([[this.miniMargin.left,this.miniMargin.top], [this.miniWidth + this.miniMargin.left,this.miniHeight + this.miniMargin.top]]);
		this.verticalZoom = d3.zoom()
			.on("zoom", this.zoomArea.bind(this));

		this.svg = d3.select("#populationGraph")
			.attr("width",  this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.call(this.horizontalBrush);
			// .call(this.verticalZoom);
			
		this.container = this.svg.append("g")
			.attr("class", "container");
		this.miniContainer = this.svg.append("g")
			.attr("class", "miniContainer");

		this.xScale = d3.scaleLinear().range([this.margin.left, this.width + this.margin.left]);
		this.yScale = d3.scaleLinear().range([this.height + this.margin.top, this.margin.top]);
		this.xAxis = d3.axisBottom(this.xScale);
		this.yAxis = d3.axisLeft(this.yScale);
		this.xAxisLine = this.svg.append("g").attr("class", "xAxis");
		this.yAxisLine = this.svg.append("g").attr("class", "yAxis");

		this.miniXScale = d3.scaleLinear().range([this.miniMargin.left, this.miniWidth + this.miniMargin.left]);
		this.miniYScale = d3.scaleLinear().range([this.miniHeight + this.miniMargin.top, this.miniMargin.top]);
		this.miniXAxis = d3.axisBottom(this.miniXScale);
		this.miniXAxisLine = this.svg.append("g").attr("class", "miniXAxis");

		this.calibratorLines, this.calibratorCells, this.calibratorScreenScale;
		
		this.batData, this.fps, this.startTime;

		this.enteringExitingBatDataSize = 60;

		this.firstFrame = [];
		this.lastFrame = [];
		this.minEntranceOrExitingOnInterval = [];
		this.maxEntranceOrExitingOnInterval = [];
		this.framesPerInterval = [];
		this.bats = [];
		this.enteringBatData = [];
		this.exitingBatData = [];
		this.neutralBatData = [];
		this.populationBatData = [];

		this.enteringBatGraphLines, this.exitingBatGraphLines, this.neutralBatGraphLines, this.populationBatGraphLines;
		this.enteringBatGraphMiniLines, this.exitingBatGraphMiniLines, this.neutralBatGraphMiniLines, this.populationBatGraphMiniLines;
		
		//this.loadBatFile("files/20141003_tracking.json");
	}

	loadBatFile(batFilePath) {
		d3.json(batFilePath, function(error, batData) {
			if (error) { throw error; }
			this.batData = batData;
			this.fps = this.batData.fps;
			this.startTime = {
				"h": parseInt(this.batData.start.substring(0, 2)),
				"m": parseInt(this.batData.start.substring(3, 5)),
				"s": parseInt(this.batData.start.substring(6, 8))
			}

			this.firstFrame[0] = [0];                                                                                    this.firstFrame[1] = this.firstFrame[0];
			this.lastFrame[0] = this.batData.total;                                                                      this.lastFrame[1] = this.lastFrame[0];
			this.framesPerInterval[0] = (this.lastFrame[0] - this.firstFrame[0])/this.enteringExitingBatDataSize;        this.framesPerInterval[1] = this.framesPerInterval[0];
			this.bats[0] = this.filterBatArrayByFrameInterval(this.batData.bats, this.firstFrame[0], this.lastFrame[0]); this.bats[1] = this.bats[0];
			this.enteringBatData[0] = [];                                                                                this.enteringBatData[1] = this.enteringBatData[0];
			this.exitingBatData[0] = [];                                                                                 this.exitingBatData[1] = this.exitingBatData[0];
			this.neutralBatData[0] = [];                                                                                 this.neutralBatData[1] = this.neutralBatData[0];
			this.populationBatData[0] = [];                                                                              this.populationBatData[1] = this.populationBatData[0];

			this.setEnteringAndExitingBatData(1);
			this.drawGraph();
			this.setEnteringAndExitingBatData(0);
			this.drawMiniGraph();
		}.bind(this));
	}

	zoomArea() {
		// re-scale y axis during zoom; ref [2]
        // y_axis.transition()
        //       .duration(50)
        //       .call(yAxis.scale(d3.event.transform.rescaleY(yScale)));

        // // re-draw circles using new y-axis scale; ref [3]
        // var new_yScale = d3.event.transform.rescaleY(yScale);
        // circles.attr("cy", function(d) { return new_yScale(d[1]); });

        return;

        var newYScale = d3.event.transform.rescaleY(this.yScale);
        this.yAxis
	        .tickValues(newYScale.ticks(10).filter(function(d) { return Number.isInteger(d); }))
	        .tickFormat(d3.format(".0f"));
    	this.yAxisLine
    		.transition()
    		.call(this.yAxis.scale(newYScale));

    	this.enteringBatGraphLines
    		.attr("y1", function(d,i) { if (i == 0) { return newYScale(this.firstFrame[1]); } return newYScale(this.enteringBatData[1][i-1].bats.length); }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return newYScale(this.firstFrame[1]); } return newYScale(this.enteringBatData[1][i].bats.length);   }.bind(this));
		this.exitingBatGraphLines
    		.attr("y1", function(d,i) { if (i == 0) { return newYScale(this.firstFrame[1]); } return newYScale(this.exitingBatData[1][i-1].bats.length); }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return newYScale(this.firstFrame[1]); } return newYScale(this.exitingBatData[1][i].bats.length);   }.bind(this));
		this.neutralBatGraphLines
    		.attr("y1", function(d,i) { if (i == 0) { return newYScale(this.firstFrame[1]); } return newYScale(this.neutralBatData[1][i-1].bats.length); }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return newYScale(this.firstFrame[1]); } return newYScale(this.neutralBatData[1][i].bats.length);   }.bind(this));
		this.populationBatGraphLines
    		.attr("y1", function(d,i) { if (i == 0) { return newYScale(this.firstFrame[1]); } return newYScale(this.populationBatData[1][i-1].population); }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return newYScale(this.firstFrame[1]); } return newYScale(this.populationBatData[1][i].population);   }.bind(this));
	}

	brushMiniArea() {
		var brushRect = d3.event.selection;
		if (!brushRect) { 
			this.firstFrame[1] = this.firstFrame[0];
			this.lastFrame[1] = this.lastFrame[0];
		}
		else {
			this.firstFrame[1] = this.miniXScale.invert(brushRect[0]);
			this.lastFrame[1] = this.miniXScale.invert(brushRect[1]);
		}

		this.framesPerInterval[1] = (this.lastFrame[1] - this.firstFrame[1])/this.enteringExitingBatDataSize;
		this.bats[1] = this.filterBatArrayByFrameInterval(this.batData.bats, this.firstFrame[1], this.lastFrame[1]);

		this.setEnteringAndExitingBatData(1);
		this.drawGraph();

		if (!this.firstCalibrationDone) { return; }

		this.sendData();
	}

	setAxisDomain() {
		var minPop = d3.min(this.populationBatData[1], function(d) { return d.population; });
		var maxPop = d3.max(this.populationBatData[1], function(d) { return d.population; });
		this.minEntranceOrExitingOnInterval[1] =             d3.min(this.enteringBatData[1].concat(this.exitingBatData[1]).concat(this.neutralBatData[1]), function(d) { return d.bats.length; });
		this.maxEntranceOrExitingOnInterval[1] = Math.max(1, d3.max(this.enteringBatData[1].concat(this.exitingBatData[1]).concat(this.neutralBatData[1]), function(d) { return d.bats.length; }));
		this.minEntranceOrExitingOnInterval[1] = Math.min(this.minEntranceOrExitingOnInterval[1], minPop);
		this.maxEntranceOrExitingOnInterval[1] = Math.max(this.maxEntranceOrExitingOnInterval[1], maxPop);

  		this.xScale.domain([this.firstFrame[1], this.lastFrame[1]]);
  		this.yScale.domain([this.minEntranceOrExitingOnInterval[1], this.maxEntranceOrExitingOnInterval[1]]);
	}

	drawAxis() {
		this.setAxisDomain();

		this.xAxis
	        .tickValues(this.xScale.ticks(6).filter(function(d) { return Number.isInteger(d); }))
	        .tickFormat(function(d) { return this.convertFrameToHHMMSS(d); }.bind(this));
		this.xAxisLine
			.transition()
	        .attr("transform", "translate(0," + (this.height + this.margin.top) + ")")
	        .call(this.xAxis);

	    this.yAxis
	        .tickValues(this.yScale.ticks(10).filter(function(d) { return Number.isInteger(d); }))
	        .tickFormat(d3.format(".0f"));
	    this.yAxisLine
	    	.transition()
	        .attr("transform", "translate(" + this.margin.left + ",0)")
	        .call(this.yAxis);
	}

	drawLines() {
		var lineWidth = 5;
		var lineOpacity = 0.5;
		var lineLinecap ="round";

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
			.attr("stroke-opacity", lineOpacity)
			.attr("stroke-linecap", lineLinecap);
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
			.attr("stroke-opacity", lineOpacity)
			.attr("stroke-linecap", lineLinecap);

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
			.attr("stroke-opacity", lineOpacity)
			.attr("stroke-linecap", lineLinecap);
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
			.attr("stroke-opacity", lineOpacity)
			.attr("stroke-linecap", lineLinecap);

		this.neutralBatGraphLines = this.container.selectAll(".neutralBatLine")
			.data(this.neutralBatData[1]);
		this.neutralBatGraphLines
			.exit()
			.remove();
		this.neutralBatGraphLines
			.transition()
			.attr("class", "neutralBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.neutralBatData[1][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.neutralBatData[1][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.neutralBatData[1][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.neutralBatData[1][i].bats.length);   }.bind(this))
			.attr("stroke", "#0000FF")
			.attr("stroke-width", lineWidth)
			.attr("stroke-opacity", lineOpacity)
			.attr("stroke-linecap", lineLinecap);
		this.neutralBatGraphLines
			.enter()
			.append("line")
			.transition()
			.attr("class", "neutralBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.neutralBatData[1][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.neutralBatData[1][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.neutralBatData[1][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.neutralBatData[1][i].bats.length);   }.bind(this))
			.attr("stroke", "#0000FF")
			.attr("stroke-width", lineWidth)
			.attr("stroke-opacity", lineOpacity)
			.attr("stroke-linecap", lineLinecap);

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
			.attr("stroke", "#FF9900")
			.attr("stroke-width", lineWidth)
			.attr("stroke-opacity", lineOpacity)
			.attr("stroke-linecap", lineLinecap);
		this.populationBatGraphLines
			.enter()
			.append("line")
			.transition()
			.attr("class", "populationBatLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.populationBatData[1][i-1].f2);         }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.populationBatData[1][i-1].population); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.xScale(this.firstFrame[1]); } return this.xScale(this.populationBatData[1][i].f2);           }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.yScale(this.firstFrame[1]); } return this.yScale(this.populationBatData[1][i].population);   }.bind(this))
			.attr("stroke", "#FF9900")
			.attr("stroke-width", lineWidth)
			.attr("stroke-opacity", lineOpacity)
			.attr("stroke-linecap", lineLinecap);
	}

	drawGraph() {
		this.drawAxis();
		this.drawLines();
	}

	setMiniAxisDomain() {
		var minPop = d3.min(this.populationBatData[0], function(d) { return d.population; });
		var maxPop = d3.max(this.populationBatData[0], function(d) { return d.population; });
		this.minEntranceOrExitingOnInterval[0] =             d3.min(this.enteringBatData[0].concat(this.exitingBatData[0]).concat(this.neutralBatData[0]), function(d) { return d.bats.length; });
		this.maxEntranceOrExitingOnInterval[0] = Math.max(1, d3.max(this.enteringBatData[0].concat(this.exitingBatData[0]).concat(this.neutralBatData[0]), function(d) { return d.bats.length; }));
		this.minEntranceOrExitingOnInterval[0] = Math.min(this.minEntranceOrExitingOnInterval[0], minPop);
		this.maxEntranceOrExitingOnInterval[0] = Math.max(this.maxEntranceOrExitingOnInterval[0], maxPop);

  		this.miniXScale.domain([this.firstFrame[0], this.lastFrame[0]]);
  		this.miniYScale.domain([this.minEntranceOrExitingOnInterval[0], this.maxEntranceOrExitingOnInterval[0]]);
	}

	drawMiniAxis() {
		this.setMiniAxisDomain();

		this.miniXAxis
	        .tickValues(this.miniXScale.ticks(10).filter(function(d) { return Number.isInteger(d); }))
	        .tickFormat(function(d) { return this.convertFrameToHHMMSS(d); }.bind(this));
		this.miniXAxisLine
			.transition()
	        .attr("transform", "translate(0," + (this.miniHeight + this.miniMargin.top) + ")")
	        .call(this.miniXAxis);
	}

	drawMiniLines() {
		var miniLineWidth = 5;
		var miniLineOpacity = 0.5;
		var miniLineLinecap = "round";

		this.enteringBatGraphMiniLines = this.miniContainer.selectAll(".enteringBatMiniLine")
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
			.attr("stroke-opacity", miniLineOpacity)
			.attr("stroke-linecap", miniLineLinecap);
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
			.attr("stroke-opacity", miniLineOpacity)
			.attr("stroke-linecap", miniLineLinecap);

		this.exitingBatGraphMiniLines = this.miniContainer.selectAll(".exitingBatMiniLine")
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
			.attr("stroke-opacity", miniLineOpacity)
			.attr("stroke-linecap", miniLineLinecap);
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
			.attr("stroke-opacity", miniLineOpacity)
			.attr("stroke-linecap", miniLineLinecap);

		this.neutralBatGraphMiniLines = this.miniContainer.selectAll(".neutralBatMiniLine")
			.data(this.neutralBatData[0]);
		this.neutralBatGraphMiniLines
			.exit()
			.remove();
		this.neutralBatGraphMiniLines
			.transition()
			.attr("class", "neutralBatMiniLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.neutralBatData[0][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.neutralBatData[0][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.neutralBatData[0][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.neutralBatData[0][i].bats.length);   }.bind(this))
			.attr("stroke", "#0000FF")
			.attr("stroke-width", miniLineWidth)
			.attr("stroke-opacity", miniLineOpacity)
			.attr("stroke-linecap", miniLineLinecap);
		this.neutralBatGraphMiniLines
			.enter()
			.append("line")
			.transition()
			.attr("class", "neutralBatMiniLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.neutralBatData[0][i-1].f2);          }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.neutralBatData[0][i-1].bats.length); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.neutralBatData[0][i].f2);            }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.neutralBatData[0][i].bats.length);   }.bind(this))
			.attr("stroke", "#0000FF")
			.attr("stroke-width", miniLineWidth)
			.attr("stroke-opacity", miniLineOpacity)
			.attr("stroke-linecap", miniLineLinecap);

		this.populationBatGraphMiniLines = this.miniContainer.selectAll(".populationBatMiniLine")
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
			.attr("stroke", "#FF9900")
			.attr("stroke-width", miniLineWidth)
			.attr("stroke-opacity", miniLineOpacity)
			.attr("stroke-linecap", miniLineLinecap);
		this.populationBatGraphMiniLines
			.enter()
			.append("line")
			.transition()
			.attr("class", "populationBatMiniLine")
			.attr("x1", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.populationBatData[0][i-1].f2);         }.bind(this))
			.attr("y1", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.populationBatData[0][i-1].population); }.bind(this))
			.attr("x2", function(d,i) { if (i == 0) { return this.miniXScale(this.firstFrame[0]); } return this.miniXScale(this.populationBatData[0][i].f2);           }.bind(this))
			.attr("y2", function(d,i) { if (i == 0) { return this.miniYScale(this.firstFrame[0]); } return this.miniYScale(this.populationBatData[0][i].population);   }.bind(this))
			.attr("stroke", "#FF9900")
			.attr("stroke-width", miniLineWidth)
			.attr("stroke-opacity", miniLineOpacity)
			.attr("stroke-linecap", miniLineLinecap);
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
		this.neutralBatData[zoomLevel] = [];
		this.populationBatData[zoomLevel] = [];

		this.enteringBatData[zoomLevel].push({ "f1": this.firstFrame[zoomLevel], "f2": this.firstFrame[zoomLevel], "bats": [] });
		this.exitingBatData[zoomLevel].push ({ "f1": this.firstFrame[zoomLevel], "f2": this.firstFrame[zoomLevel], "bats": [] });
		this.neutralBatData[zoomLevel].push ({ "f1": this.firstFrame[zoomLevel], "f2": this.firstFrame[zoomLevel], "bats": [] });
		this.populationBatData[zoomLevel].push ({ "f1": this.firstFrame[zoomLevel], "f2": this.firstFrame[zoomLevel], "population": 0 });
		for(var i = 0; i < this.enteringExitingBatDataSize - 1; i++) {
			this.enteringBatData[zoomLevel].push({ "f1": this.firstFrame[zoomLevel] + (i * this.framesPerInterval[zoomLevel]), "f2": this.firstFrame[zoomLevel] + ((i+1) * this.framesPerInterval[zoomLevel]), "bats": [] });
			this.exitingBatData[zoomLevel].push ({ "f1": this.firstFrame[zoomLevel] + (i * this.framesPerInterval[zoomLevel]), "f2": this.firstFrame[zoomLevel] + ((i+1) * this.framesPerInterval[zoomLevel]), "bats": [] });
			this.neutralBatData[zoomLevel].push ({ "f1": this.firstFrame[zoomLevel] + (i * this.framesPerInterval[zoomLevel]), "f2": this.firstFrame[zoomLevel] + ((i+1) * this.framesPerInterval[zoomLevel]), "bats": [] });
			this.populationBatData[zoomLevel].push ({ "f1": this.firstFrame[zoomLevel] + (i * this.framesPerInterval[zoomLevel]), "f2": this.firstFrame[zoomLevel] + ((i+1) * this.framesPerInterval[zoomLevel]), "population": 0 });
		}
		this.enteringBatData[zoomLevel].push({ "f1": this.firstFrame[zoomLevel] + (this.enteringExitingBatDataSize - 1) * this.framesPerInterval[zoomLevel], "f2": this.lastFrame[zoomLevel], "bats": [] });
		this.exitingBatData[zoomLevel].push ({ "f1": this.firstFrame[zoomLevel] + (this.enteringExitingBatDataSize - 1) * this.framesPerInterval[zoomLevel], "f2": this.lastFrame[zoomLevel], "bats": [] });
		this.neutralBatData[zoomLevel].push ({ "f1": this.firstFrame[zoomLevel] + (this.enteringExitingBatDataSize - 1) * this.framesPerInterval[zoomLevel], "f2": this.lastFrame[zoomLevel], "bats": [] });
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
        	else {
        		this.neutralBatData[zoomLevel][Math.floor((bat.f2 - this.firstFrame[zoomLevel])/this.framesPerInterval[zoomLevel]) + 1].bats.push(bat);
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

	convertFrameToHHMMSS(d) {
		var flightDurationInSeconds = Math.ceil(d/this.fps);
		var flightEndTimeSeconds =  this.startTime.s + flightDurationInSeconds;
		var flightEndTimeMinutes =  this.startTime.m;
		var flightEndTimeHours =  this.startTime.h;

		if (flightEndTimeSeconds >= 60) {
			flightEndTimeMinutes += Math.floor(flightEndTimeSeconds/60);
			flightEndTimeSeconds -= Math.floor(flightEndTimeSeconds/60) * 60;
		}
		if (flightEndTimeMinutes >= 60) {
			flightEndTimeHours += Math.floor(flightEndTimeMinutes/60);
			flightEndTimeMinutes -= Math.floor(flightEndTimeMinutes/60) * 60;
		}

		if (flightEndTimeSeconds < 10) { flightEndTimeSeconds = "0" + flightEndTimeSeconds; }
		if (flightEndTimeMinutes < 10) { flightEndTimeMinutes = "0" + flightEndTimeMinutes; }
		if (flightEndTimeHours < 10)   { flightEndTimeHours = "0" + flightEndTimeHours; }

		return flightEndTimeHours + ":" + flightEndTimeMinutes + ":" + flightEndTimeSeconds;
	}

	sendData() {
		this.dispatch.call(
			"batListChanged",
			{
				"id": "populationGraph",
				"sendToFlightsHistogram": {
					"enteringBats": this.bats[1].filter(function(bat) { return this.filterEnteringBat(bat);                                  }.bind(this)),
					"exitingBats":  this.bats[1].filter(function(bat) { return this.filterExitingBat(bat);                                   }.bind(this)),
					"neutralBats":  this.bats[1].filter(function(bat) { return !this.filterEnteringBat(bat) && !this.filterExitingBat(bat);  }.bind(this))
				},
				"sendToAverageFlightTimeGraph": {
					"firstFrame":   this.firstFrame[1],
					"lastFrame":    this.lastFrame[1],
					"fps":          this.fps,
					"startTime":    this.startTime,
					"enteringBats": this.enteringBatData[1],
					"exitingBats":  this.exitingBatData[1],
					"neutralBats":  this.neutralBatData[1]
				},
				"sendToBatViewer": {
					"firstFrame":   this.firstFrame[1],
					"lastFrame":    this.lastFrame[1]
				}
			}
		);
	}

}