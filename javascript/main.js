var deviceWidth = 320;
var deviceHeight = 240;
var calibratorScale = 2;

var caveDMYSelectorWidth = 600;
var caveDMYSelectorHeight = 300;

var populationGraphWidth = 900;
var populationGraphHeight = 600;

var calibrator = new Calibrator(deviceWidth,deviceHeight,calibratorScale);
var caveDMYSelector = new CaveDMYSelector(caveDMYSelectorWidth,caveDMYSelectorHeight);
var populationGraph = new PopulationGraph(populationGraphWidth,populationGraphHeight);

var calibratorChangeDispatch = d3.dispatch("calibratorChanged");
calibratorChangeDispatch.on("calibratorChanged", function() {
	populationGraph.receivedCalibratorData(this.lines, this.cells, this.screenScale);
	populationGraph.loadBatFile("files/simulation.json");
});

calibrator.dispatch = calibratorChangeDispatch;
populationGraph.dispatch = calibratorChangeDispatch;