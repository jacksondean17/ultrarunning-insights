class DemographicsChart {
    constructor(globalApplicationState) {
        this.GAS = globalApplicationState;

        this.selected_countries = [];

        this.population = {
            regression: x => -0.01224 * x + 11.78
        }
        this.health = {
            regression: x => -0.1233 * x + 18.6
        }
        this.living = {
            regression: x => -0.02729 * x + 11.77
        }
        this.elevation = {
            regression: x => -0.001065 * x + 10.8
        }

        d3.select('#pills-demographics').classed('show', true)

        d3.csv('./assets/data/demographics/processed_data.csv', d3.autoType).then(data => {
            this.data = data;
            console.log(this.data)
            this.initializeSVG();

            this.update();
        })
    }

    initializeSVG() {
        this.population.container = d3.select('#demographics-chart-1')
        this.health.container = d3.select('#demographics-chart-2')
        this.living.container = d3.select('#demographics-chart-3')
        this.elevation.container = d3.select('#demographics-chart-4')

        this.svgs = d3.selectAll('.demo-chart').append('svg')
            .attr('width', '100%')
            .attr('height', '32vh')

        // scroll to hide tabs
        window.scrollTo(0, 100)

        this.population.svg = d3.select('#demographics-chart-1 svg')
        this.health.svg = d3.select('#demographics-chart-2 svg')
        this.living.svg = d3.select('#demographics-chart-3 svg')
        this.elevation.svg = d3.select('#demographics-chart-4 svg')

        this.DIMENSIONS = {
            margin_top: 5,
            margin_bottom: 40,
            margin_left: 50,
            margin_right: 20,
            width: this.population.svg.node().getBoundingClientRect().width,
            height: this.population.svg.node().getBoundingClientRect().height
        }
        this.DIMENSIONS.drawable_height = this.DIMENSIONS.height - this.DIMENSIONS.margin_top - this.DIMENSIONS.margin_bottom
        this.DIMENSIONS.drawable_width = this.DIMENSIONS.width - this.DIMENSIONS.margin_left - this.DIMENSIONS.margin_right

        this.createScales()
        this.createAxisLabels()
        this.createAxes()
        this.createBrushing()
        this.createTooltips()
    }

    createBrushing() {
        this.brush = d3.brush()
            .on('brush', this.handleBrush.bind(this))
            .on('end', this.handleBrushEnd.bind(this))

        this.svgs.call(this.brush)
    }

    handleBrush(e) {
        this.brush_extent = e.selection
        console.log(this.brush_extent)
        let points = d3.select(e.sourceEvent.target.parentElement).selectAll('.point')
        this.selected_countries = this.findPointsInBrush(points)

        this.svgs.selectAll('.point').classed('un-brushed', d => !this.selected_countries.has(d))

    }

    findPointsInBrush(points) {
        let selected_countries = new Set()
        points.each((d, i, n) => {
            let x = d3.select(n[i]).attr('cx')
            let y = d3.select(n[i]).attr('cy')
            if (this.isInBrush({ xPos: x, yPos: y })) {
                selected_countries.add(d)
            }
        })
        return selected_countries
    }



    isInBrush(d) {
        let retVal = this.brush_extent &&
            this.brush_extent[0][0] <= d.xPos &&
            this.brush_extent[1][0] >= d.xPos &&
            this.brush_extent[0][1] <= d.yPos &&
            this.brush_extent[1][1] >= d.yPos;


//        if (retVal) {
//            this.selected_points.push(d);
//        }
        return retVal;
    }



    handleBrushEnd(e) {
        this.brush_extent = e.selection;
        if (this.brush_extent === null) {
            this.svgs.selectAll('.point')
                .classed('un-brushed', false)

        }
    }

    createTooltips() {
        let tooltip_width = 200
        let tooltip_height = 50

        let tooltips = this.svgs.append('g')

        tooltips.attr('class', 'tooltip')
            .style('opacity', 0)
            .append('rect')
            .attr('width', tooltip_width)
            .attr('height', tooltip_height)
            .attr('rx', 5)
            .attr('x', 0)
            .attr('y', 0)

        tooltips.append('text')
            .classed('tooltip-country', true)
            .attr('x', tooltip_width / 2)
            .attr('y', 15)            
            .text('Country')
            .attr('text-anchor', 'middle')

        tooltips.append('text')
            .classed('tooltip-data-label', true)
            .attr('x', 10)
            .attr('y', 30)
            .text('Data')

        tooltips.append('text')
            .classed('tooltip-data-value', true)
            .attr('x', tooltip_width - 10)
            .attr('y', 30)
            .text('Value')
            .attr('text-anchor', 'end')

        tooltips.append('text')
            .classed('tooltip-score-label', true)
            .attr('x', 10)
            .attr('y', 45)
            .text('Score')

        tooltips.append('text')
            .classed('tooltip-score-value', true)
            .attr('x', tooltip_width - 10) 
            .attr('y', 45)
            .text('Value')
            .attr('text-anchor', 'end')

        this.population.tooltip = this.population.svg.select('.tooltip')
        this.health.tooltip = this.health.svg.select('.tooltip')
        this.living.tooltip = this.living.svg.select('.tooltip')
        this.elevation.tooltip = this.elevation.svg.select('.tooltip')

        this.population.tooltip.select('.tooltip-data-label').text('Population Density')
        this.health.tooltip.select('.tooltip-data-label').text('Healthcare Index')
        this.living.tooltip.select('.tooltip-data-label').text('Cost of Living Index')
        this.elevation.tooltip.select('.tooltip-data-label').text('Elevation')


    }



    createScales() {
        this.yScale = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.score), d3.max(this.data, d => d.score)])
            .range([this.DIMENSIONS.drawable_height, 0])
        this.yAxis = d3.axisLeft(this.yScale)

        this.population.xScale = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.population_density), d3.max(this.data, d => d.population_density)])
            .range([0, this.DIMENSIONS.drawable_width])
        this.population.xAxis = d3.axisBottom(this.population.xScale)

        this.health.xScale = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.health_care), d3.max(this.data, d => d.health_care)])
            .range([0, this.DIMENSIONS.drawable_width])
        this.health.xAxis = d3.axisBottom(this.health.xScale)

        this.living.xScale = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.cost_of_living), d3.max(this.data, d => d.cost_of_living)])
            .range([0, this.DIMENSIONS.drawable_width])
        this.living.xAxis = d3.axisBottom(this.living.xScale)

        this.elevation.xScale = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.elevation), d3.max(this.data, d => d.elevation)])
            .range([0, this.DIMENSIONS.drawable_width])
        this.elevation.xAxis = d3.axisBottom(this.elevation.xScale)

    }



    createAxes() {
        this.population.xAxisWrapper = this.population.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.height - this.DIMENSIONS.margin_bottom})`)
            .call(this.population.xAxis)
        this.population.yAxisWrapper = this.population.svg.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.margin_top})`)
            .call(this.yAxis)

        this.health.xAxisWrapper = this.health.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.height - this.DIMENSIONS.margin_bottom})`)
            .call(this.health.xAxis)
        this.health.yAxisWrapper = this.health.svg.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.margin_top})`)
            .call(this.yAxis)

        this.living.xAxisWrapper = this.living.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.height - this.DIMENSIONS.margin_bottom})`)
            .call(this.living.xAxis)
        this.living.yAxisWrapper = this.living.svg.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.margin_top})`)
            .call(this.yAxis)

        this.elevation.xAxisWrapper = this.elevation.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.height - this.DIMENSIONS.margin_bottom})`)
            .call(this.elevation.xAxis)
        this.elevation.yAxisWrapper = this.elevation.svg.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.margin_top})`)
            .call(this.yAxis)
    }


    createAxisLabels() {
        this.population.y_label = this.population.svg.append('text')
            .attr('class', 'axis-label')
            .attr('text-anchor', 'middle')
            .attr('transform', `translate(20, ${this.DIMENSIONS.height / 2}) rotate(-90)`)
            .text('Score')

        this.population.x_label = this.population.svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', `translate(${this.DIMENSIONS.width / 2}, ${this.DIMENSIONS.height - 10})`)
            .attr('text-anchor', 'middle')
            .text('Population Density (people per square km)')

        this.health.y_label = this.health.svg.append('text')
            .attr('class', 'axis-label')
            .attr('text-anchor', 'middle')
            .attr('transform', `translate(20, ${this.DIMENSIONS.height / 2}) rotate(-90)`)
            .text('Score')

        this.health.x_label = this.health.svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', `translate(${this.DIMENSIONS.width / 2}, ${this.DIMENSIONS.height - 10})`)
            .attr('text-anchor', 'middle')
            .text('Healthcare Index')

        this.living.y_label = this.living.svg.append('text')
            .attr('class', 'axis-label')
            .attr('text-anchor', 'middle')
            .attr('transform', `translate(20, ${this.DIMENSIONS.height / 2}) rotate(-90)`)
            .text('Score')

        this.living.x_label = this.living.svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', `translate(${this.DIMENSIONS.width / 2}, ${this.DIMENSIONS.height - 10})`)
            .attr('text-anchor', 'middle')
            .text('Cost of Living Index')

        this.elevation.y_label = this.elevation.svg.append('text')
            .attr('class', 'axis-label')
            .attr('text-anchor', 'middle')
            .attr('transform', `translate(20, ${this.DIMENSIONS.height / 2}) rotate(-90)`)
            .text('Score')

        this.elevation.x_label = this.elevation.svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', `translate(${this.DIMENSIONS.width / 2}, ${this.DIMENSIONS.height - 10})`)
            .attr('text-anchor', 'middle')
            .text('Elevation (meters above sea level)')
    }


    update() {
        this.population.svg.append('path')
            .datum(this.data)
            .attr('class', 'regression')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.margin_top})`)
            .attr('d', d3.line()
                .x(d => this.population.xScale(d.population_density))
                .y(d => this.yScale(this.population.regression(d.population_density)))
            )

        this.population.svg.selectAll('.point')
            .data(this.data)
            .join(
                enter => enter.append('circle')
                    .attr('class', 'point')
                    .attr('r', 5)
                    .attr('cx', d => this.population.xScale(d.population_density) + this.DIMENSIONS.margin_left)
                    .attr('cy', d => this.yScale(d.score) + this.DIMENSIONS.margin_top)
                    .on('mouseover', this.circleMouseOver.bind(this)),
                update => update,
                exit => exit.remove()

            )

        this.health.svg.append('path')
            .datum(this.data)
            .attr('class', 'regression')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.margin_top})`)
            .attr('d', d3.line()
                .x(d => this.health.xScale(d.health_care))
                .y(d => this.yScale(this.health.regression(d.health_care)))
            )

        this.health.svg.selectAll('.point')
            .data(this.data)
            .join(
                enter => enter.append('circle')
                    .attr('class', 'point')
                    .attr('r', 5)
                    .attr('cx', d => this.health.xScale(d.health_care) + this.DIMENSIONS.margin_left)
                    .attr('cy', d => this.yScale(d.score) + this.DIMENSIONS.margin_top)
                    .on('mouseover', this.circleMouseOver.bind(this)),
                update => update,
                exit => exit.remove()
            )

        this.living.svg.append('path')
            .datum(this.data)
            .attr('class', 'regression')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.margin_top})`)
            .attr('d', d3.line()
                .x(d => this.living.xScale(d.cost_of_living))
                .y(d => this.yScale(this.living.regression(d.cost_of_living)))
            )

        this.living.svg.selectAll('.point')
            .data(this.data)
            .join(
                enter => enter.append('circle')
                    .attr('class', 'point')
                    .attr('r', 5)
                    .attr('cx', d => this.living.xScale(d.cost_of_living) + this.DIMENSIONS.margin_left)
                    .attr('cy', d => this.yScale(d.score) + this.DIMENSIONS.margin_top)
                    .on('mouseover', this.circleMouseOver.bind(this)),
                update => update,
                exit => exit.remove()
            )

        this.elevation.svg.append('path')
            .datum(this.data)
            .attr('class', 'regression')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.margin_top})`)
            .attr('d', d3.line()
                .x(d => this.elevation.xScale(d.elevation))
                .y(d => this.yScale(this.elevation.regression(d.elevation)))
            )

        this.elevation.svg.selectAll('.point')
            .data(this.data)
            .join(
                enter => enter.append('circle')
                    .attr('class', 'point')
                    .attr('r', 5)
                    .attr('cx', d => this.elevation.xScale(d.elevation) + this.DIMENSIONS.margin_left)
                    .attr('cy', d => this.yScale(d.score) + this.DIMENSIONS.margin_top)
                    .on('mouseover', this.circleMouseOver.bind(this)),
                update => update,
                exit => exit.remove()
            )


    }

    circleMouseOver(e, d) {
        d3.selectAll('.hovered').classed('hovered', false)
        d3.selectAll('.point').filter(p => p.country === d.country).classed('hovered', true)

        d3.selectAll('.tooltip')
            .style('opacity', 0)

        let tooltip = d3.select(e.target.parentNode).select('.tooltip')

        let cx = e.target.cx.baseVal.value
        let cy = e.target.cy.baseVal.value
        let x = cx + 10
        let y = cy + 10
        if (cx > this.DIMENSIONS.width / 2) {
            x -= 220
        }
        if (cy > this.DIMENSIONS.height / 2) {
            y -= 70
        }

        tooltip.attr('transform', `translate(${x}, ${y})`)
            .style('opacity', 1)
            .attr('x', 0)
            .attr('y', 0)
        
        tooltip.raise()

        this.updateTooltips(d)

        console.log(e.target)
    }


    updateTooltips(d) {
        d3.selectAll('.tooltip')
            .select('.tooltip-country')
            .text(d.country)
        d3.selectAll('.tooltip')
            .select('.tooltip-score-value')
            .text(d.score)

        this.population.svg.select('.tooltip')
            .select('.tooltip-data-value')
            .text(d.population_density)

        this.health.svg.select('.tooltip')
            .select('.tooltip-data-value')
            .text(d.health_care)

        this.living.svg.select('.tooltip')
            .select('.tooltip-data-value')
            .text(d.cost_of_living)

        this.elevation.svg.select('.tooltip')
            .select('.tooltip-data-value')
            .text(d.elevation)


    }

    getData() {
        switch (this.selected_chart.choice) {
            case 'fastest':
                this.selected_chart.y_label = 'Average Pace (min/mile)'
                this.selected_chart.title = 'Average Pace of top 10 Finishers'
                this.GAS.raceData.sort((a, b) => a.average_pace - b.average_pace)
                this.selected_chart.data = this.GAS.raceData.slice(0, 10).map(d => {
                    return {
                        id: d.race_year_id,
                        event: d.event,
                        data: d.average_pace / 60
                    }
                })
                break;
            case 'slowest':
                this.selected_chart.y_label = 'Average Pace (min/mile)'
                this.selected_chart.title = 'Average Pace of top 10 Finishers'
                this.GAS.raceData.sort((a, b) => b.average_pace - a.average_pace)
                this.selected_chart.data = this.GAS.raceData.slice(0, 10).map(d => {
                    return {
                        id: d.race_year_id,
                        event: d.event,
                        data: d.average_pace / 60
                    }
                })

                break;
            case 'hardest':
                this.selected_chart.y_label = 'Elevation Gain (ft)'
                this.selected_chart.title = 'Total Elevation Gain'
                this.GAS.raceData.sort((a, b) => b.elevation_gain - a.elevation_gain)
                this.selected_chart.data = this.GAS.raceData.slice(0, 10).map(d => {
                    return {
                        id: d.race_year_id,
                        event: d.event,
                        data: d.elevation_gain
                    }
                })
                break;
            case 'easiest':
                this.selected_chart.y_label = 'Elevation Gain (ft)'
                this.selected_chart.title = 'Total Elevation Gain'
                // custom sort that puts races with 0 elevation gain at the end
                // just assuming that races with 0 elevation gain have incomplete data
                this.GAS.raceData.sort((a, b) => {
                    if (a.elevation_gain === 0) {
                        return 1
                    } else if (b.elevation_gain === 0) {
                        return -1
                    } else {
                        return a.elevation_gain - b.elevation_gain
                    }
                })
                this.selected_chart.data = this.GAS.raceData.slice(0, 10).map(d => {
                    return {
                        id: d.race_year_id,
                        event: d.event,
                        data: d.elevation_gain
                    }
                })
                break;
            case 'biggest':
                this.selected_chart.y_label = 'Number of Finishers'
                this.selected_chart.title = 'Number of Finishers'
                this.GAS.raceData.sort((a, b) => b.num_finishers - a.num_finishers)
                this.selected_chart.data = this.GAS.raceData.slice(0, 10).map(d => {
                    return {
                        id: d.race_year_id,
                        event: d.event,
                        data: d.num_finishers
                    }
                })
                break;
            default:

        }
    }


 


    processData() {
        d3.csv('./assets/data/demographics/processed_data.csv', d3.autoType).then(data => {
            this.data = data;
            console.log(this.data)
        })





    }
}