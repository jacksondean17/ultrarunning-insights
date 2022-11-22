const globalApplicationState = {
    raceData: null,
    rankingData: null,
    selectedRace: null
};

/**
 * Load d3 data from csv
 */

 races = d3.csv("assets/data/race.csv", d3.autoType)
 ranks = d3.csv("assets/data/ultra_rankings.csv", d3.autoType)
 
 races.then(races => {
   ranks.then(ranks => {
     globalApplicationState.raceData = races;
     globalApplicationState.rankingData = ranks;
 
     console.log('loading data')
     const extremes_chart = new ExtremesChart(globalApplicationState);
   })
 });
 
 