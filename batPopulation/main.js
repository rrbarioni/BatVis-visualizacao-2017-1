var deviceWidth = 320;
var deviceHeight = 240;
var calibratorScale = 1.5;

var caveDMYSelectorWidth = 600;
var caveDMYSelectorHeight = 300;

var populationGraphWidth = 550;
var populationGraphHeight = 550;

var flightsHistogramWidth = 550;
var flightsHistogramHeight = 550;

var averageFlightTimeGraphWidth = 550;
var averageFlightTimeGraphHeight = 550;

var batViewerWidth = 500;
var batViewerHeight = 500;

var calibrator =             new Calibrator            (deviceWidth,                 deviceHeight,calibratorScale);
var caveDMYSelector =        new CaveDMYSelector       (caveDMYSelectorWidth,        caveDMYSelectorHeight);
var populationGraph =        new PopulationGraph       (populationGraphWidth,        populationGraphHeight);
var flightsHistogram =       new FlightsHistogram      (flightsHistogramWidth,       flightsHistogramHeight);
var averageFlightTimeGraph = new AverageFlightTimeGraph(averageFlightTimeGraphWidth, averageFlightTimeGraphHeight);
var batViewer = new BatViewer(batViewerWidth, batViewerHeight);

var calibratorChangeDispatch = d3.dispatch("calibratorChanged");
calibratorChangeDispatch.on("calibratorChanged", function() {
	populationGraph.receiveCalibratorData(
		this.lines,
		this.cells,
		this.screenScale
	);
});

var batListDispatch = d3.dispatch("batListChanged");
batListDispatch.on("batListChanged", function() {
	flightsHistogram.receiveBatListData(
		this.sendToFlightsHistogram.enteringBats,
		this.sendToFlightsHistogram.exitingBats,
		this.sendToFlightsHistogram.neutralBats
	);
	averageFlightTimeGraph.receiveBatListData(
		this.sendToAverageFlightTimeGraph.firstFrame,
		this.sendToAverageFlightTimeGraph.lastFrame,
		this.sendToAverageFlightTimeGraph.fps,
		this.sendToAverageFlightTimeGraph.startTime,
		this.sendToAverageFlightTimeGraph.enteringBats,
		this.sendToAverageFlightTimeGraph.exitingBats,
		this.sendToAverageFlightTimeGraph.neutralBats
	);
	batViewer.setInterval(
		this.sendToBatViewer.firstFrame,
		this.sendToBatViewer.lastFrame
	);
});

var histogramBarsListDispatch = d3.dispatch("histogramBarListChanged");
histogramBarsListDispatch.on("histogramBarListChanged", function() {
	batViewer.receiveBatLabels(this.batLabels);
});

calibrator.dispatch      = calibratorChangeDispatch;
populationGraph.dispatch = batListDispatch;
flightsHistogram.dispatch = histogramBarsListDispatch;

var currentFileDate = "20141003";
populationGraph.loadBatFile("files/" + currentFileDate + "_tracking.json");
batViewer.loadFile("files/" + currentFileDate + "_s3dr.json");