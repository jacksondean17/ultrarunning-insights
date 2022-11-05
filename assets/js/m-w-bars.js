const N_FINISHERS = 10;
const ANIMATION_DURATION = 500;

class MvWBarChart {
    constructor(globalApplicationState) {
        this.races = globalApplicationState.raceData;
        this.ranks = globalApplicationState.rankingData;

        this.table_sort_status = {
            col: 'race',
            asc: true
        }

        this.processData();
        this.initalizeSVG();
        this.addEventListeners();
        this.draw();
    }

    onResize() {

    }

    draw() {
        let rows = this.table.select('tbody').selectAll('tr')
        rows.data(this.races)
            .join(
                enter => {
                    let row = enter.append('tr')
                    row.append('td')
                        .classed('race-data', true)
                        .text(d => d.event)
                    row.append('td')
                        .classed('distance-data', true)
                        .text(d => d.distance)
                    let raw_svg = row.append('td')
                        .append('div')
                        .classed('bar-container', true)
                        .append('svg')
                        .classed('raw-data', true)

                    raw_svg.append('rect')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width', d => this.overall_finishers_scale(d.percent_men_winners))
                        .attr('height', 20)
                        .classed('men-bar', true)

                    raw_svg.append('rect')
                        .attr('x', d => this.overall_finishers_scale(d.percent_men_winners))
                        .attr('y', 0)
                        .attr('width', d => this.overall_finishers_scale(d.percent_women_winners))
                        .attr('height', 20)
                        .classed('women-bar', true)

                    raw_svg.append('line')
                        .attr('y1', 0)
                        .attr('x2', d => this.overall_finishers_scale(0.5))
                        .attr('y2', 20)
                        .attr('x1', d => this.overall_finishers_scale(0.5))
                        .classed('center-axis-line', true)


                    let norm_svg = row.append('td')
                        .append('div')
                        .classed('bar-container', true)
                        .append('svg')
                        .classed('norm-data', true)

                    norm_svg.append('rect')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width', d => this.norm_finishers_scale(d.norm_men_liklihood))
                        .attr('height', 20)
                        .classed('men-bar', true)

                    norm_svg.append('rect')
                        .attr('x', d => this.norm_finishers_scale(d.norm_men_liklihood))
                        .attr('y', 0)
                        .attr('width', d => this.norm_finishers_scale(d.norm_women_liklihood))
                        .attr('height', 20)
                        .classed('women-bar', true)

                    norm_svg.append('line')
                        .attr('y1', 0)
                        .attr('x2', d => this.norm_finishers_scale(0.5))
                        .attr('y2', 20)
                        .attr('x1', d => this.norm_finishers_scale(0.5))
                        .classed('center-axis-line', true)

                    return row
                },
                update => {
                    update.select('.race-data')
                        .text(d => d.event)

                    update.select('.distance-data')
                        .text(d => d.distance)

                    update.select('.raw-data').select('.men-bar')
                        .transition()
                        .duration(ANIMATION_DURATION)
                        .attr('width', d => this.overall_finishers_scale(d.percent_men_winners))

                    update.select('.raw-data').select('.women-bar')
                        .transition()
                        .duration(ANIMATION_DURATION)
                        .attr('x', d => this.overall_finishers_scale(d.percent_men_winners))
                        .attr('width', d => this.overall_finishers_scale(d.percent_women_winners))

                    update.select('.norm-data').select('.men-bar')
                        .transition()
                        .duration(ANIMATION_DURATION)
                        .attr('width', d => this.norm_finishers_scale(d.norm_men_liklihood))

                    update.select('.norm-data').select('.women-bar')
                        .transition()
                        .duration(ANIMATION_DURATION)
                        .attr('x', d => this.norm_finishers_scale(d.norm_men_liklihood))
                        .attr('width', d => this.norm_finishers_scale(d.norm_women_liklihood))


                },
                exit => {
                    exit.remove()
                }
            )


    }

    initalizeSVG() {
        this.table = d3.select('#m-w-bars-table')
        this.headers = this.table.select('thead').selectAll('tr')
        this.rows = this.table.select('tbody').selectAll('tr')

        // initialize header svgs
        //        let raw_finishers_axis_svg = this.headers.select('#raw-top-finishers-header').append('div').append('svg')
        //        let norm_finishers_axis_svg = this.headers.select('#norm-top-finishers-header').append('div').append('svg')

        let raw_finishers_axis_svg = this.headers.select('#overall-axis').append('div').append('svg')
        let norm_finishers_axis_svg = this.headers.select('#normalized-axis').append('div').append('svg')


        raw_finishers_axis_svg.classed('bar-axis', true)
        norm_finishers_axis_svg.classed('bar-axis', true)

        let raw_svg_width = raw_finishers_axis_svg.node().getBoundingClientRect().width;
        let norm_svg_width = norm_finishers_axis_svg.node().getBoundingClientRect().width;

        this.overall_finishers_scale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, raw_svg_width])

        this.norm_finishers_scale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, norm_svg_width])

        let raw_finishers_axis = d3.axisBottom(this.overall_finishers_scale)
            .tickValues([0.5])
            .tickFormat(d3.format('.0%'))

        let norm_finishers_axis = d3.axisBottom(this.norm_finishers_scale)
            .tickValues([0.5])
            .tickFormat(d3.format('.0%'))

        raw_finishers_axis_svg.call(raw_finishers_axis)
        norm_finishers_axis_svg.call(norm_finishers_axis)




    }

    processData() {
        console.log('races')
        console.log(this.races)
        console.log('ranks')
        console.log(this.ranks)


        this.races.map(race => {
            let race_participants = this.ranks.filter(rank => rank.race_year_id === race.race_year_id);
            race.num_finishers = race_participants.filter(p => p.rank !== 'NA').length;
            race.num_men = race_participants.filter(p => p.gender === 'M').length;
            race.num_women = race_participants.filter(p => p.gender === 'W').length;


            /**
             * Find raw percentage of top 50 winners who are male and female
             */
            let denom = d3.min([race.num_finishers, N_FINISHERS])

            race.men_winners = race_participants.filter(p => {
                return p.gender === "M" && p.rank <= denom
            })
            race.women_winners = race_participants.filter(p => {
                return p.gender === "W" && p.rank <= denom
            })
            // recalcualte the denominator since some of the race datasets have
            // weird ties and can end up with more than N people finishing in the top N spots
            denom = race.men_winners.length + race.women_winners.length
            race.percent_men_winners = race.men_winners.length / denom;
            race.percent_women_winners = race.women_winners.length / denom;

            /**
             * Find normalized percentage of top N finishers
             */
            race.men_liklihood_of_winning = race.men_winners.length / race.num_men;
            race.women_liklihood_of_winning = race.women_winners.length / race.num_women;
            let sum = race.men_liklihood_of_winning + race.women_liklihood_of_winning

            race.norm_men_liklihood = race.men_liklihood_of_winning / sum;
            race.norm_women_liklihood = race.women_liklihood_of_winning / sum;






        })


        console.log(this.races)
    }

    addEventListeners() {
        this.headers.select('#race-header')
            .on('click', this.sortByRace.bind(this))
        this.headers.select('#distance-header')
            .on('click', this.sortByDistance.bind(this))
        this.headers.select('#raw-top-finishers-header')
            .on('click', this.sortByRawTopFinishers.bind(this))
        this.headers.select('#norm-top-finishers-header')
            .on('click', this.sortByNormTopFinishers.bind(this))
    }

    setTableSortStatus(col) {
        if (this.table_sort_status.col === col) {
            this.table_sort_status.asc = !this.table_sort_status.asc;
        }
        else {
            this.table_sort_status.col = col;
            this.table_sort_status.asc = true;
        }
    }

    sortByRace() {
        console.log("sort by race")
        this.setTableSortStatus('race');


        this.races.sort((a, b) => {
            if (this.table_sort_status.asc) {
                return d3.ascending(a.event, b.event)
            }
            else {
                return d3.descending(a.event, b.event)
            }
        })

        this.updateHeaderSortIcons();
        this.draw();
    }

    sortByDistance() {
        this.setTableSortStatus('distance');

        this.races.sort((a, b) => {
            if (this.table_sort_status.asc) {
                return d3.ascending(a.distance, b.distance)
            }
            else {
                return d3.descending(a.distance, b.distance)
            }
        })

        this.updateHeaderSortIcons();
        this.draw();
    }

    sortByRawTopFinishers() {
        this.setTableSortStatus('raw_top_finishers');

        this.races.sort((a, b) => {
            if (this.table_sort_status.asc) {
                return d3.ascending(a.percent_men_winners, b.percent_men_winners)
            }
            else {
                return d3.ascending(a.percent_women_winners, b.percent_women_winners)
            }
        })

        this.updateHeaderSortIcons();
        this.draw();
    }

    sortByNormTopFinishers() {
        this.setTableSortStatus('norm_top_finishers');

        this.races.sort((a, b) => {
            if (this.table_sort_status.asc) {
                return d3.ascending(a.norm_men_liklihood, b.norm_men_liklihood)
            }
            else {
                return d3.ascending(a.norm_women_liklihood, b.norm_women_liklihood)
            }
        })


        this.updateHeaderSortIcons();
        this.draw();
    }

    updateHeaderSortIcons() {
        this.headers.selectAll('th')
            .select('i')
            .attr('class', 'bi bi-arrow-down-up unsorted')

        if (this.table_sort_status.col === 'race') {
            this.headers.select('#race-header')
                .select('i')
                .attr('class', this.table_sort_status.asc ? 'bi bi-arrow-up' : 'bi bi-arrow-down')
                .classed('sorted', true)
        }
        else if (this.table_sort_status.col === 'distance') {
            this.headers.select('#distance-header')
                .select('i')
                .attr('class', this.table_sort_status.asc ? 'bi bi-arrow-up' : 'bi bi-arrow-down')
                .classed('sorted', true)
        }
        else if (this.table_sort_status.col === 'raw_top_finishers') {
            this.headers.select('#raw-top-finishers-header')
                .select('i')
                .attr('class', this.table_sort_status.asc ? 'bi bi-arrow-up' : 'bi bi-arrow-down')
                .classed('sorted', true)
        }
        else if (this.table_sort_status.col === 'norm_top_finishers') {
            this.headers.select('#norm-top-finishers-header')
                .select('i')
                .attr('class', this.table_sort_status.asc ? 'bi bi-arrow-up' : 'bi bi-arrow-down')
                .classed('sorted', true)
        }
    }


}