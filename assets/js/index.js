/**
 * Load d3 data from csv
 */
const globalApplicationState = {
  raceData: null,
  rankingData: null,
  profileData: null,
  selectedRace: null,
  MvWBarChart: null,
  MvWScatterChart: null,
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
    const scatter_chart = new MvWScatterChart(globalApplicationState);
    globalApplicationState.MvWBarChart = bar_chart;
    globalApplicationState.MvWScatterChart = scatter_chart;
    drawn.MvWBarChart = true;
  })
});

const course_mappings = d3.csv("assets/data/course_mappings.csv", d3.autoType);
course_mappings.then(course_mappings => {
  loadProfiles(course_mappings);
});

async function loadProfiles(course_mappings) {
  const promises = course_mappings.map(cm => d3.xml(`../assets/data/gpx/${cm.file}`, d3.autoType)
    .then(d => {
      // push to map key of id and value of gpx
      return { id: cm.race_year_id, gpx: ProfilesLineChart.process(d, cm) };
    }));
  let profiles = await Promise.all(promises);
  console.log('end of loadProfiles', profiles);
  globalApplicationState.profileData = profiles;
  document.getElementById('pills-event-tab').classList.remove('disabled');
  return profiles;
}


// event for tab switcher
document.querySelector('button#pills-event-tab')
  .addEventListener('shown.bs.tab', function (e) {
    console.log('tab switch');
    console.log(e.target.id);
    if (!drawn.ExtremesChart) {
      drawn.ExtremesChart = true;
      const extremes_chart = new ExtremesChart(globalApplicationState);
      globalApplicationState.ExtremesChart = extremes_chart;
      console.log('drawn ExtremesChart');
    }
    if (!drawn.ProfilesChart) {
      drawn.ProfilesChart = true;
      const profiles_chart = new ProfilesLineChart(globalApplicationState);
      globalApplicationState.ProfilesChart = profiles_chart;
      console.log('drawn ProfilesChart');
    }
  });

document.querySelector('button#pills-demo-tab')
  .addEventListener('shown.bs.tab', function (e) {

  });