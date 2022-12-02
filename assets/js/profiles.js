const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const USE_METRIC = true;
const CHART_HEIGHT = 500;
const CHART_WIDTH = 700;

class ProfilesLineChart {
  constructor(globalApplicationState) {
    this.xScale = null;
    this.yScale = null;
    this.yAxisPadding = 80;
    this.xAxisPadding = 50;

    this.svg = d3.select('#profiles-div').append('svg:svg')
      .attr('width', CHART_WIDTH)
      .attr('height', CHART_HEIGHT);
    this.svg.append('g').attr('id', 'x-axis');
    this.svg.append('g').attr('id', 'y-axis');
    this.svg.append('g').attr('id', 'lines')
      .classed('line-chart', true)
      .append('path')
      .attr('class', 'line');

    this.colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    this.xScale = d3.scaleLinear()
      .domain([0, 170])
      // start is somewhere between 0 and yAxis padding
      .range([this.xAxisPadding, CHART_WIDTH - this.yAxisPadding]);
    this.svg.select('#x-axis')
      .append('g')
      .attr('transform', `translate(${this.xAxisPadding}, ${CHART_HEIGHT / 2})`)
      .call(d3.axisBottom(this.xScale));

    this.yScale = d3.scaleLinear()
      .domain([-800, 800])
      // add in some padding
      .range([CHART_HEIGHT - MARGIN.bottom, MARGIN.top]);

    this.svg.select('#y-axis')
      .append('g')
      .attr('transform', `translate(${this.yAxisPadding},0)`)
      .call(d3.axisLeft(this.yScale));

    // Append y axis text
    this.svg.select('#y-axis')
      .append('text')
      .text('Change in Elevation')
      .attr('x', -280)
      .attr('y', 20)
      .attr('transform', 'rotate(-90)');

    this.lineGenerator = d3.line()
      .defined(((d, i) => !isNaN(d.dist) && !isNaN(d.ele)))
      .x((d) => this.xScale(d.dist) + this.xAxisPadding)
      .y((d) => this.yScale(d.ele));


    this.drawAll(globalApplicationState.profileData);

    // interaction handler from hw4 solution
    // Add an interaction for the x position over the lines
    // this.svg.on('mousemove', (event) => {
    //     const svgEdge = this.svg.node().getBoundingClientRect().x;
    //     const distanceFromSVGEdge = event.clientX - svgEdge;

    //     if (distanceFromSVGEdge > this.yAxisPadding) {
    //         // Set the line position
    //         this.svg
    //             .select('#overlay')
    //             .select('line')
    //             .attr('stroke', 'black')
    //             .attr('x1', distanceFromSVGEdge)
    //             .attr('x2', distanceFromSVGEdge)
    //             .attr('y1', this.height - this.xAxisPadding)
    //             .attr('y2', 0);
    //     }
    //     // Find the relevant data (by date and location)
    //     const dateHovered = this.xAxis.invert(distanceFromSVGEdge - this.yAxisPadding).toISOString().substring(0, 10);
    //     const filteredData = globalApplicationState.covidData
    //         .filter((row) => (
    //             row.date === dateHovered
    //             && (
    //                 (globalApplicationState.selectedLocations.length > 0 &&
    //                     globalApplicationState.selectedLocations.includes(row.iso_code))
    //                 ||
    //                 (globalApplicationState.selectedLocations.length === 0 &&
    //                     row.iso_code.includes('OWID'))
    //             )
    //         ))
    //         .sort((rowA, rowB) => rowB.total_cases_per_million - rowA.total_cases_per_million);
    //     // Add text to the SVG
    //     this.svg
    //         .select('#overlay')
    //         .selectAll('text')
    //         .data(filteredData)
    //         .join('text')
    //         .text((d) => `${d.location}, ${d3.format(".2s")(d.total_cases_per_million)}`)
    //         // .attr('x', distanceFromSVGEdge > 500 ? distanceFromSVGEdge - 200 : distanceFromSVGEdge + 5)
    //         .attr('x', distanceFromSVGEdge > 500 ? distanceFromSVGEdge - 5 : distanceFromSVGEdge + 5)
    //         .attr('text-anchor', distanceFromSVGEdge > 500 ? 'end' : 'start')
    //         .attr('y', (d, i) => (i + 1) * 20)
    //         .attr('fill', (d) => this.colorScale(d.iso_code));

    // });
  }



  drawAll(profiles) {
    console.log("drawAll profiles", profiles);
    this.svg
      .select('#lines')
      .selectAll('.line')
      .data(profiles)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', ([id, gpx]) => this.colorScale(id))
      .attr('stroke-width', 1)
      .attr('d', ([id, gpx]) => {
        d3.line()
          .defined(((d, i) => !isNaN(d.dist) && !isNaN(d.ele)))
          .x((d) => this.xScale(d.dist) + this.xAxisPadding)
          .y((d) => this.yScale(d.ele))
          (gpx);
      });
  }

  addLine(profile, race_year_id) {
    console.log(profile);
    this.svg
      .select('#lines')
      .selectAll('.line')
      .data([profile])
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', this.colorScale(race_year_id))
      .attr('stroke-width', 1)
      .attr('d', this.lineGenerator);
    // .join(
    //     enter => {
    //         let line = enter.append('path')
    //         .attr('fill', 'none')

    // add in data for a flat line
    // .data([{dist: 0, ele: 0}, {dist: 160, ele: 0}])
    // add a transition 
    // .transition()
    // now add in data for profile
    // .data([profile])
    // watch it grow!!!
    //         .attr('stroke', this.colorScale(race_year_id))
    //         .attr('stroke-width', 1)
    //         .attr('d', this.lineGenerator);

    //         return line;
    //     },
    //     update => update,
    //     exit => exit);



    // Add an interaction for the x position over the lines
    this.svg.on('mousemove', (event) => {
      const svgEdge = this.svg.node().getBoundingClientRect().x;
      const distanceFromSVGEdge = event.clientX - svgEdge;

      if (distanceFromSVGEdge > this.yAxisPadding) {
        // Set the line position
        this.svg
          .select('#overlay')
          .select('line')
          .attr('stroke', 'black')
          .attr('x1', distanceFromSVGEdge)
          .attr('x2', distanceFromSVGEdge)
          .attr('y1', this.height - this.xAxisPadding)
          .attr('y2', 0);
      }
    });
  }

  // process gpx data for a single profile
  static process(gpx) {
    console.log('processing gpx');
    let tracks = gpx.querySelector("trkpt");
    let lon1 = +tracks.getAttribute("lon");
    let lat1 = +tracks.getAttribute("lat");

    let startingEle = +tracks.querySelector("ele").textContent;
    let totalDist = 0;
    // let points = [].reduce(function (result, element) {
    //   if (typeof element !== "undefined") {
    //     gpx.querySelectorAll("trkpt"), function (d) {
    //       //   // get distance from last point
    //       let lat2 = +d.getAttribute("lat");
    //       let lon2 = +d.getAttribute("lon");
    //       totalDist = totalDist + ProfilesLineChart.distance2(lat1, lon1, lat2, lon2)
    //       lon1 = lon2; lat1 = lat2;
    //       result.push({
    //         dist: totalDist,
    //         ele: +d.querySelector("ele").textContent - startingEle
    //       });
    //     }
    //   }
    //   return result;
    // }, []);
    let points = [].map.call(gpx.querySelectorAll("trkpt"), function (d) {
      // get distance from last point
      let lat2 = +d.getAttribute("lat");
      let lon2 = +d.getAttribute("lon");
      totalDist = totalDist + ProfilesLineChart.distance2(lat1, lon1, lat2, lon2)
      lon1 = lon2; lat1 = lat2;
      if (typeof d.querySelector("ele") == null ||
        d.querySelector("ele") == null) {
        return null;
      }
      return {
        dist: totalDist,
        ele: +d.querySelector("ele").textContent - startingEle
      }
    });
    return points;
  }

  static distance2(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = ProfilesLineChart.deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = ProfilesLineChart.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(ProfilesLineChart.deg2rad(lat1)) * Math.cos(ProfilesLineChart.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  static deg2rad(deg) {
    return deg * (Math.PI / 180)
  }
}
