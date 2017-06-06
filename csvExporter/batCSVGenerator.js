class BatCSVGenerator {
	constructor() {
		this.generatedLines = [];
	}

	receiveBatListData(firstFrame, lastFrame, fps, startTime, batListSegmentationSize, enteringBats, exitingBats, populationBats) {
		this.generatedLines = [];

		var frameJump = Math.round((lastFrame - firstFrame)/batListSegmentationSize);

		for(var i = 0; i < batListSegmentationSize; i++) {
			this.generatedLines.push({
				"time": this.convertFrameToHHMMSS(firstFrame + i*frameJump, fps, startTime),
				"enteredBats": enteringBats[i],
				"exitedBats": exitingBats[i],
				"batPopulation": populationBats[i]
			});
		}

		// console.log(this.generatedLines);
	}

	generateCSV() {

	}

	convertFrameToHHMMSS(d, fps, startTime) {
		var flightDurationInSeconds = Math.ceil(d/fps);
		var flightEndTimeSeconds =  startTime.s + flightDurationInSeconds;
		var flightEndTimeMinutes =  startTime.m;
		var flightEndTimeHours =  startTime.h;

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
}