class BatCSVGenerator {
	constructor() {
		this.generatedLines = [];
		this.currentInterval = "000000_to_000000";
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

		this.currentInterval = this.convertFrameToHHMMSS(firstFrame, fps, startTime) + "_to_" + this.convertFrameToHHMMSS(lastFrame, fps, startTime);
	}

	generateCSV(currentFileDate) {
		var csvContent = "data:text/csv;charset=utf-8,";
		csvContent += "Time,Entered Bats,Exited Bats,Bat Population\n";
		for(var i = 0; i < this.generatedLines.length; i++) {
			var dataString = this.generatedLines[i].time + "," +
						 this.generatedLines[i].enteredBats + "," +
						 this.generatedLines[i].exitedBats + "," +
						 this.generatedLines[i].batPopulation;
			csvContent += i < this.generatedLines.length ? dataString + "\n" : dataString;
		}

		var encodedUri = encodeURI(csvContent);
		var link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", currentFileDate + "_" + this.currentInterval + ".csv");
		link.click();
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