const n_finishers = 50;

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
                let raw_svg = row.append('td')
                    .append('div')
                    .classed('bar-container', true)
                    .append('svg')
                    .classed('bar', true)

                raw_svg.append('rect')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', d => this.overall_finishers_scale(d.percent_men))
                    .attr('height', 20)
                    .classed('men-bar', true)

                raw_svg.append('rect')
                    .attr('x', d => this.overall_finishers_scale(d.percent_men))
                    .attr('y', 0)
                    .attr('width', d => this.overall_finishers_scale(d.percent_women))
                    .attr('height', 20)
                    .classed('women-bar', true)
                    

                let norm_svg = row.append('td')
                    .append('div')
                    .classed('bar-container', true)
                    .append('svg')
                    .classed('bar', true)

                


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
            let denom = d3.min([race.num_finishers, 50])


            race.men_winners = race_participants.filter(p => {
                return p.gender === "M" && p.rank <= denom
            })
            race.women_winners = race_participants.filter(p => {
                return  p.gender === "W" && p.rank <= denom
            })
            // recalcualte the denominator since some of the race datasets have
            // weird ties and can end up with more than 50 people finishing in the top 50
            denom = race.men_winners.length + race.women_winners.length
            race.percent_men = race.men_winners.length / denom;
            race.percent_women = race.women_winners.length / denom;




        })

        console.log(this.races)
    }
}