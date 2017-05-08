var deviceWidth = 320;
var deviceHeight = 240;
var calibratorScale = 2;

var populationGraphWidth = 900;
var populationGraphHeight = 600;

var calibrator = new Calibrator(deviceWidth,deviceHeight,calibratorScale);
var calendar = new Calendar();
var populationGraph = new PopulationGraph(populationGraphWidth,populationGraphHeight);

var calibratorChangeDispatch = d3.dispatch("calibratorChanged");
calibratorChangeDispatch.on("calibratorChanged", function() {
	populationGraph.receivedCalibratorData(this.lines, this.cells, this.screenScale);
});

calibrator.dispatch = calibratorChangeDispatch;
populationGraph.dispatch = calibratorChangeDispatch;