var deviceWidth = 320;
var deviceHeight = 240;
var calibratorScale = 1.5;

var caveDMYSelectorWidth = 600;
var caveDMYSelectorHeight = 300;

var populationGraphWidth = 600;
var populationGraphHeight = 600;

var flightsHistogramWidth = 600;
var flightsHistogramHeight = 600;

var averageFlightTimeGraphWidth = 600;
var averageFlightTimeGraphHeight = 600;

var calibrator =             new Calibrator            (deviceWidth,                 deviceHeight,calibratorScale);
var caveDMYSelector =        new CaveDMYSelector       (caveDMYSelectorWidth,        caveDMYSelectorHeight);
var populationGraph =        new PopulationGraph       (populationGraphWidth,        populationGraphHeight);
var flightsHistogram =       new FlightsHistogram      (flightsHistogramWidth,       flightsHistogramHeight);
var averageFlightTimeGraph = new AverageFlightTimeGraph(averageFlightTimeGraphWidth, averageFlightTimeGraphHeight);

var calibratorChangeDispatch = d3.dispatch("calibratorChanged");
calibratorChangeDispatch.on("calibratorChanged", function() {
	populationGraph.receiveCalibratorData(this.lines, this.cells, this.screenScale);
});

var batListDispatch = d3.dispatch("batListChanged");
batListDispatch.on("batListChanged", function() {
	flightsHistogram.receiveBatListData(this.enteringBats, this.exitingBats, this.neutralBats);
});

calibrator.dispatch      = calibratorChangeDispatch;
populationGraph.dispatch = batListDispatch;