
class MvWBarChart {
    constructor(globalApplicationState) {
        this.races = globalApplicationState.raceData;
        this.ranks = globalApplicationState.rankingData;

        this.svg = d3.select("#m-w-bars").select("svg");
        
        this.initalizeSVG();
    }

    initalizeSVG() {
        this.svg.attr("viewBox", `0 0 300 600`)


        this.svg.append("rect")
            .attr("width", 100)
            .attr("height", 100)
            .attr("fill", "red");



    }
}