const N_FINISHERS = 10;

class MvWBarChart {
    constructor(globalApplicationState) {
        this.races = globalApplicationState.raceData;
        this.ranks = globalApplicationState.rankingData;

        
        this.processData();
        this.initalizeSVG();
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
                row.append('td').text(d => d.event)
                row.append('td').text(d => d.distance)
                let raw_svg = row.append('td')
                    .append('div')
                    .classed('bar-container', true)
                    .append('svg')
                    .classed('bar', true)

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
                    

                let norm_svg = row.append('td')
                    .append('div')
                    .classed('bar-container', true)
                    .append('svg')
                    .classed('bar', true)

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

                


                return row
            }
        )
  
    
    }

    initalizeSVG() {
        this.table = d3.select('#m-w-bars-table')
        this.headers = this.table.select('thead').select('tr')
        this.rows = this.table.select('tbody').selectAll('tr')
        
        // initialize header svgs
        let raw_finishers_axis_svg = this.headers.select('#raw-top-finishers-header').append('div').append('svg')
        let norm_finishers_axis_svg = this.headers.select('#norm-top-finishers-header').append('div').append('svg')

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
                return  p.gender === "W" && p.rank <= denom
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

            console.log(`Men liklihood: ${race.norm_men_liklihood}`)
            console.log(`Women liklihood: ${race.norm_women_liklihood}`)
            console.log(`Sum: ${race.norm_women_liklihood + race.norm_men_liklihood}`)





        })

        
        console.log(this.races)
    }
}