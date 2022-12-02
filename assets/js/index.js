/**
 * Load d3 data from csv
 */
const globalApplicationState = {
  raceData: null,
  rankingData: null,
  profileData: null,
  selectedRace: null,
  MvWBarChart: null,
  ExtremesChart: null,
  ProfilesChart: null
};

const drawn = {
  MvWBarChart: false,
  ExtremesChart: false,
  ProfilesChart: false
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

    console.log('loading data');
    const bar_chart = new MvWBarChart(globalApplicationState);

    globalApplicationState.MvWBarChart = bar_chart;
    drawn.MvWBarChart = true;
  })
});

const course_mappings = d3.csv("assets/data/course_mappings.csv", d3.autoType);
course_mappings.then(course_mappings => {
  const profiles = loadProfiles(course_mappings);
  
  globalApplicationState.profileData = profiles;
});

async function loadProfiles(course_mappings) {
  const promises = course_mappings.map(cm => d3.xml(`../assets/data/gpx/${cm.file}`, d3.autoType)
    .then(d => {
      return { id: cm.id, gpx: ProfilesLineChart.process(d) };
    }));
  let profiles = await Promise.all(promises);
  return profiles;
}

// let profiles = [];
// const profiles_chart = new ProfilesLineChart();
// const course_mappings = d3.csv("assets/data/course_mappings.csv", d3.autoType);
// course_mappings.then(course_mappings => {
//   course_mappings.forEach(cm => {
//     d3.xml("../assets/data/gpx/" + cm.file).then(d => {
//       let data = ProfilesLineChart.process(d);
//       profiles.push({ id: cm.id, gpx: data });
//     });
//   });
// });
// console.log("profile data", profiles);
// globalApplicationState.profileData = profiles;
// profiles_chart.drawAll(profiles);

// event for tab switcher
document.querySelector('button#pills-event-tab')
  .addEventListener('shown.bs.tab', function (e) {
    console.log('tab switch');
    console.log(e.target.id);
    if (!drawn.ExtremesChart) {
      const extremes_chart = new ExtremesChart(globalApplicationState);
      globalApplicationState.ExtremesChart = extremes_chart;
      drawn.ExtremesChart = true;
      console.log('drawn ExtremesChart');
    }
    if (!drawn.ProfilesChart) {
      const profiles_chart = new ProfilesLineChart(globalApplicationState);
      globalApplicationState.ProfilesChart = profiles_chart;
      drawn.ProfilesChart = true;
      console.log('drawn ProfilesChart');
    }
  });

document.querySelector('button#pills-demo-tab')
  .addEventListener('shown.bs.tab', function (e) {

  });