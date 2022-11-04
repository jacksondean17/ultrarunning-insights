
class MvWBarChart {
    constructor(globalApplicationState) {
        this.races = globalApplicationState.raceData;
        this.ranks = globalApplicationState.rankingData;
        this.mwData = {
        };

        this.svg = d3.select("#m-w-bars").select("svg");
        
        this.processData();
        this.initalizeSVG();
    }

    initalizeSVG() {
        console.log(this.races);
        console.log(this.ranks);

        this.svg.attr("viewBox", `0 0 300 600`)


        this.svg.append("rect")
            .attr("width", 100)
            .attr("height", 100)
            .attr("fill", "red");
    }

    processData() {
        
        this.races.map(race => {
            let race_participants = this.ranks.filter(rank => rank.race_year_id === race.race_year_id);
            race.num_finishers = race_participants.filter(p => p.rank !== null).length;
            
            race.men_winners = race_participants.filter(p => {
                return p.gender === "M" && p.rank <= 50
            })
            race.women_winners = race_participants.filter(p => {
                return  p.gender === "W" && p.rank <= 50
            })
            race.percent_men = race.men_winners.length / 50;
            race.percent_women = race.women_winners.length / 50;

        })

        console.log(this.races)
    }
}