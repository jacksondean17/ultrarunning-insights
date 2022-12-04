class DemographicsChart {
    constructor(globalApplicationState) {
        this.GAS = globalApplicationState;

        this.selected_points = [];

        this.population = {}
        this.health = {}
        this.living = {}
        this.elevation = {}

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
        this.health.svg = this.svgs.filter('#demographics-chart-2')
        this.living.svg = this.svgs.filter('#demographics-chart-3')
        this.elevation.svg = this.svgs.filter('#demographics-chart-4')

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
    }

    createScales() {
        this.yScale = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.score), d3.max(this.data, d => d.score)])
            .range([this.DIMENSIONS.drawable_height, 0])
        this.population.xScale = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.population_density), d3.max(this.data, d => d.population_density)])
            .range([0, this.DIMENSIONS.drawable_width])
        this.yAxis = d3.axisLeft(this.yScale)
        this.population.xAxis = d3.axisBottom(this.population.xScale)

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
        this.health.yAxisWrapper = this.health.svg.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.margin_top})`)
        this.living.xAxisWrapper = this.living.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.height - this.DIMENSIONS.margin_bottom})`)
        this.living.yAxisWrapper = this.living.svg.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.margin_top})`)
        this.elevation.xAxisWrapper = this.elevation.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.height - this.DIMENSIONS.margin_bottom})`)
        this.elevation.yAxisWrapper = this.elevation.svg.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.margin_top})`)
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
            .text('Quality of Life Index')

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

        let regression = x => -0.01224*x + 11.78
            
        this.population.svg.append('path')
            .datum(this.data)
            .attr('class', 'regression')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.margin_top})`)
            .attr('d', d3.line()
                .x(d => this.population.xScale(d.population_density))
                .y(d => this.yScale(regression(d.population_density)))
            )

        let points = this.population.svg.selectAll('.point')
            .data(this.data)
            .join(
                enter => enter.append('circle')
                    .attr('class', 'point')
                    .attr('r', 5)
                    .attr('cx', d => this.population.xScale(d.population_density))
                    .attr('cy', d => this.yScale(d.score))
                    .attr('fill', 'black')
                    .attr('opacity', 0.5)
                    .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.margin_top})`),
                update => update,
                exit => exit.remove()

            )

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


    attachEventListeners() {
        this.select = d3.select('#extremes-select')
        d3.select('#extremes-select')
            .on('change', this.handleSelectChange.bind(this))
    }

    handleSelectChange(e) {
        let value = e.target.value;
        this.select.classed('fastest slowest hardest easiest biggest', false)
        this.select.classed(value, true)

        this.selected_chart.choice = value;
        this.update();

    }


    processData() {
        d3.csv('./assets/data/demographics/processed_data.csv', d3.autoType).then(data => {
            this.data = data;
            console.log(this.data)
        })





    }
}