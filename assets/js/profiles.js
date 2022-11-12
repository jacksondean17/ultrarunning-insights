const ANIMATION_DURATION = 500;
const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const USE_METRIC = true;
const CHART_HEIGHT = 500;
const CHART_WIDTH = 700;

class ProfilesLineChart {
    constructor() {
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
}

/**
 * load gpx data as xml
 */
const line_chart = new ProfilesLineChart();
course_mappings = d3.csv("assets/data/course_mappings.csv", d3.autoType);
var profiles = [];
let promises = [];
// THIS IS CODE TO LOAD ALL GPX FILES SO THAT IT WORKS CONCURRENTLY
// CAN'T GET IT TO PLAY NICE THOUGH
// course_mappings.then(course_mappings => {
//     course_mappings.forEach(cm => {
//         profiles.push({id : cm.race_year_id, gpx: null});
//         promises.push(d3.xml("../assets/data/gpx/" + cm.file))
//     });
// });
// Promise.all(promises).then((values) => {
//     console.log(values);
//     console.log("promises", promises);
//     promises.forEach(p => {
//         if (p.PromiseState == 'fullfilled') {

//         }
//     })
//     console.log("profiles", profiles);
// });

//     console.log(course_mappings);
//     var q = d3.queue();
//     course_mappings.forEach(cm => {
//         q = q.defer(d3.xml, "../assets/data/gpx/" + cm.file);
//     });
//     q.await(process);
course_mappings.then(course_mappings => {
    course_mappings.forEach(cm => {
        let url = cm.file;
        d3.xml("../assets/data/gpx/" + url).then(function (gpx) {
            let tracks = gpx.querySelector("trkpt");
            let lon1 = +tracks.getAttribute("lon");
            let lat1 = +tracks.getAttribute("lat");
            // console.log(tracks);
            let startingEle = +tracks.querySelector("ele").textContent;
            // console.log(startingEle);
            let totalDist = 0;
            let points = [].map.call(gpx.querySelectorAll("trkpt"), function (d) {
                // get distance from last point
                let lat2 = +d.getAttribute("lat");
                let lon2 = +d.getAttribute("lon");
                // totalDist = totalDist + distance(lat1, lat2, lon1, lon2)
                totalDist = totalDist + distance2(lat1, lon1, lat2, lon2)
                lon1 = lon2; lat1 = lat2;
                return {
                    dist: totalDist,
                    ele: +d.querySelector("ele").textContent - startingEle
                }
            });
            console.log(points);
            line_chart.addLine(points, cm.race_year_id);
            profiles.push({ id: cm.race_year_id, profile: points });
        });
    });
});

function process(data) {
    for (i = 1; i < arguments.length; i++) {
        console.log(arguments[i]);
    }
}

/**
 *  Helper function for calculating the distance between two geographical points.
 * @param {*} lat1 
 * @param {*} lat2 
 * @param {*} lon1 
 * @param {*} lon2 
 * @returns 
 */
function distance(lat1, lat2, lon1, lon2) {

    // The math module contains a function
    // named toRadians which converts from
    // degrees to radians.
    lon1 = lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2)
        + Math.cos(lat1) * Math.cos(lat2)
        * Math.pow(Math.sin(dlon / 2), 2);

    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956
    // for miles
    let r = 6371;
    if (!USE_METRIC)
        r = 3956;

    // calculate the result
    return (c * r);
}

function distance2(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}