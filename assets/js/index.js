/**
 * Load d3 data from csv
 */
 const globalApplicationState = {
    raceData: null,
    rankingData: null,
    selectedRace: null
};

 races = d3.csv("assets/data/race.csv", d3.autoType)
 ranks = d3.csv("assets/data/ultra_rankings.csv", d3.autoType)
 
 races.then(races => {
   ranks.then(ranks => {
     globalApplicationState.raceData = races;
     globalApplicationState.rankingData = ranks;
 
     console.log('loading data')
     const bar_chart = new MvWBarChart(globalApplicationState);
   })
 });
 