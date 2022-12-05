const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const USE_METRIC = true;
const CHART_HEIGHT = 500;
const CHART_WIDTH = 700;

class ProfilesLineChart {
  constructor(globalApplicationState) {

    this.GAS = globalApplicationState;

    this.svg = d3.select('#profiles-chart');
    this.DIMENSIONS = {
      width: this.svg.node().getBoundingClientRect().width,
      height: this.svg.node().getBoundingClientRect().height,
      margin_top: 20,
      margin_bottom: 50,
      margin_left: 50,
      margin_right: 20
    }
    this.xScale = null;
    this.yScale = null;
    this.yAxisPadding = 80;
    this.xAxisPadding = 50;
    this.DIMENSIONS.drawable_width = this.DIMENSIONS.width - this.DIMENSIONS.margin_left - this.DIMENSIONS.margin_right;
    this.DIMENSIONS.drawable_height = this.DIMENSIONS.height - this.DIMENSIONS.margin_top - this.DIMENSIONS.margin_bottom;


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
      .range([this.DIMENSIONS.margin_left, this.DIMENSIONS.width - this.yAxisPadding]);



    this.yScale = d3.scaleLinear()
      .domain([-800, 2500])
      // add in some padding
      .range([this.DIMENSIONS.height - this.DIMENSIONS.margin_bottom, this.DIMENSIONS.margin_top]);
    // .range([this.drawable_height, 0]);
    //draw x axis
    this.svg.select('#x-axis')
      .append('g')
      .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.yScale(0)})`)
      .call(d3.axisBottom(this.xScale));

    this.svg.select('#y-axis')
      .append('g')
      .attr('transform', `translate(${this.yAxisPadding},0)`)
      .call(d3.axisLeft(this.yScale));

    // Append y axis text
    this.svg.select('#y-axis')
      .append('text')
      .text('Change in Elevation (m)')
      .attr('x', -280)
      .attr('y', 20)
      .attr('transform', 'rotate(-90)');

    this.lineGenerator = d3.line()
      .defined(((d, i) => !isNaN(d.dist) && !isNaN(d.ele)))
      .x((d) => this.xScale(d.dist) + this.xAxisPadding)
      .y((d) => this.yScale(d.ele));


    this.createTooltip();
    this.drawAll(globalApplicationState.profileData);


  }

  createTooltip() {
    this.tooltip = this.svg.append('g')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    this.DIMENSIONS.tooltip_width = 200;
    this.DIMENSIONS.tooltip_height = 100;

    this.tooltip.append('rect')
      .attr('width', this.DIMENSIONS.tooltip_width)
      .attr('height', this.DIMENSIONS.tooltip_height)
      .attr('fill', 'white')
      .attr('rx', 5)
      .style('opacity', 0.8);

    this.tooltip.append('text')
      .attr('id', 'tooltip-race-name')
      .attr('x', 5)
      .attr('y', 15)

    this.tooltip.append('text')
      .classed('tooltip-data-label', true)
      .attr('x', 5)
      .attr('y', 30)
      .text('Country:');

    this.tooltip.append('text')
      .classed('tooltip-data', true)
      .attr('id', 'tooltip-country')
      .attr('x', this.DIMENSIONS.tooltip_width - 5)
      .attr('y', 30)
      .attr('text-anchor', 'end');

    this.tooltip.append('text')
      .classed('tooltip-data-label', true)
      .attr('x', 5)
      .attr('y', 45)
      .text('Date:');

    this.tooltip.append('text')
      .classed('tooltip-data', true)
      .attr('id', 'tooltip-date')
      .attr('x', this.DIMENSIONS.tooltip_width - 5)
      .attr('y', 45)
      .attr('text-anchor', 'end');

    this.tooltip.append('text')
      .classed('tooltip-data-label', true)
      .attr('x', 5)
      .attr('y', 60)
      .text('Gain:');

    this.tooltip.append('text')
      .classed('tooltip-data', true)
      .attr('id', 'tooltip-gain')
      .attr('x', this.DIMENSIONS.tooltip_width - 5)
      .attr('y', 60)
      .attr('text-anchor', 'end');

    this.tooltip.append('text')
      .classed('tooltip-data-label', true)
      .attr('x', 5)
      .attr('y', 75)
      .text('Loss:');

    this.tooltip.append('text')
      .classed('tooltip-data', true)
      .attr('id', 'tooltip-loss')
      .attr('x', this.DIMENSIONS.tooltip_width - 5)
      .attr('y', 75)
      .attr('text-anchor', 'end');

    this.tooltip.append('text')
      .classed('tooltip-data-label', true)
      .attr('x', 5)
      .attr('y', 90)
      .text('Participants:');

    this.tooltip.append('text')
      .classed('tooltip-data', true)
      .attr('id', 'tooltip-participants')
      .attr('x', this.DIMENSIONS.tooltip_width - 5)
      .attr('y', 90)
      .attr('text-anchor', 'end');
  }

  updateTooltip(d) {
    this.tooltip
      .select('#tooltip-race-name')
      .text(d.event);

    this.tooltip
      .select('#tooltip-country')
      .text(d.country);

    this.tooltip
      .select('#tooltip-date')
      .text(d.date);

    this.tooltip
      .select('#tooltip-gain')
      .text(d.elevation_gain);

    this.tooltip
      .select('#tooltip-loss')
      .text(d.elevation_loss);

    this.tooltip
      .select('#tooltip-participants')
      .text(d.participants);

  }



  drawAll(profiles) {
    profiles.forEach((entry, i) => {
      console.log(profiles[i].gpx);
      let color = this.colorScale(entry.id);
      this.svg.select('#lines')
        .append('path')
        .datum(profiles[i].gpx.filter((d) => d.ele !== null && d.dist !== null))
        .attr('class', 'line')
        .attr('id', profiles[i].id)
        .attr('opacity', 0.5)
        .attr('d', this.lineGenerator)
        .attr('stroke', color)
        .attr('fill', 'none')
        .on('mouseover', this.hoverProfile.bind(this))
        .on('mouseout', this.unhoverProfile.bind(this))
        .on('mousemove', this.moveProfile.bind(this))
        .on('click', this.clickProfile.bind(this));

    });
  }

  hoverProfile(event, d) {
    console.log('hovering');
    console.log(d);
    d3.select(event.currentTarget)
      .attr('opacity', 1);

    this.tooltip
      .style('opacity', 1)
      .attr('transform', `translate(${event.pageX + 10},${event.pageY - 10})`);

    this.updateTooltip(this.GAS.raceData.find(r => r.race_year_id === parseInt(event.target.id)));
  }

  moveProfile(event, d) {
    this.tooltip
      .attr('transform', `translate(${event.pageX - this.svg.node().getBoundingClientRect().x + 10},${event.pageY - this.svg.node().getBoundingClientRect().y - 10})`);
  }

  unhoverProfile(event, d) {
    console.log('unhovering');
    console.log(d);
    d3.select(event.currentTarget)
      .attr('opacity', 0.5);

    this.tooltip
      .style('opacity', 0);
  }

  clickProfile(event, d) {
    alert('clicked');
    console.log(d);
    d3.select(event.currentTarget)
      .attr('opacity', 1);
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
  static process(gpx, cm) {
    console.log('processing gpx');

    try {

      let tracks = gpx.querySelector("trkpt");
      let lon1 = +tracks.getAttribute("lon");
      let lat1 = +tracks.getAttribute("lat");

      let startingEle = +tracks.querySelector("ele").textContent;
      let totalDist = 0;
      let points = [].map.call(gpx.querySelectorAll("trkpt"), function (d) {
        // get distance from last point
        let lat2 = +d.getAttribute("lat");
        let lon2 = +d.getAttribute("lon");
        totalDist = totalDist + ProfilesLineChart.distance2(lat1, lon1, lat2, lon2)
        lon1 = lon2; lat1 = lat2;
        if (typeof d.querySelector("ele") == null ||
          d.querySelector("ele") == null) {
          return { dist: null, ele: null };
        }
        return {
          dist: totalDist,
          ele: +d.querySelector("ele").textContent - startingEle
        }
      });
      return points;
    }
    catch (e) {
      console.log(e);
      console.log(cm);
      return [];
    }
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
