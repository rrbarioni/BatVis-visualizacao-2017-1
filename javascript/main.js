var deviceWidth = 320;
var deviceHeight = 240;
var calibratorScale = 2;

var calibrator = new Calibrator(deviceWidth,deviceHeight,calibratorScale);
var populationGraph = new PopulationGraph(900,600);

var calibratorChangeDispatch = d3.dispatch("calibratorChanged");
calibratorChangeDispatch.on("calibratorChanged", function() {
	populationGraph.receivedCalibratorData(this.lines, this.cells, this.screenScale);
});

calibrator.dispatch = calibratorChangeDispatch;
populationGraph.dispatch = calibratorChangeDispatch;