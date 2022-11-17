class ExtremesChart {
    constructor(globalApplicationState) {
        this.GAS = globalApplicationState;

        this.selected_chart = {
            choice: 'fastest',
            title: 'Average Pace of top 10 Finishers',
            y_label: 'Average Pace (min/mile)',
            data: null
        }

        this.initializeSVG();
        this.attchEventListeners();

        this.update();
    }

    initializeSVG() {
        this.svg = d3.select('#extremes-chart')
        
        this.DIMENSIONS = {
            width: this.svg.node().getBoundingClientRect().width,
            height: this.svg.node().getBoundingClientRect().height,
            margin_top: 20,
            margin_bottom: 80,
            margin_left: 50,
            margin_right: 20
        }
        this.DIMENSIONS.drawable_width = this.DIMENSIONS.width - this.DIMENSIONS.margin_left - this.DIMENSIONS.margin_right;
        this.DIMENSIONS.drawable_height = this.DIMENSIONS.height - this.DIMENSIONS.margin_top - this.DIMENSIONS.margin_bottom;

        // scale for the 10 bars
        this.x_axis_scale = d3.scaleBand()
            .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
            .range([0, this.DIMENSIONS.drawable_width])
        this.y_axis_scale = d3.scaleLinear()
            .domain([0, 100])
            .range([this.DIMENSIONS.drawable_height, 0])

        this.x_axis = d3.axisBottom(this.x_axis_scale)
        this.y_axis = d3.axisLeft(this.y_axis_scale)
        this.x_axis_wrapper = this.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.height - this.DIMENSIONS.margin_bottom})`)
            .call(this.x_axis)
        this.y_axis_wrapper = this.svg.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.margin_top})`)
            .call(this.y_axis)

        

        this.chart_title = this.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', this.DIMENSIONS.width / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .text(this.selected_chart.title)

        this.y_axis_label = this.svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', `translate(20, ${this.DIMENSIONS.height / 2}) rotate(-90)`)
            .attr('text-anchor', 'middle')
            .text(this.selected_chart.y_label)

    }

    update() {
        this.getData();

        this.chart_title.text(this.selected_chart.title)
        this.y_axis_label.text(this.selected_chart.y_label)
        this.x_axis_scale.domain(this.selected_chart.data.map(d => d.id))
        this.x_axis_scale.paddingInner(0.1)
        this.y_axis_scale.domain([0, d3.max(this.selected_chart.data, d => d.data)])

        //this.x_axis.tickValues(this.selected_chart.data.map(d => d.event))
        this.x_axis_wrapper.transition().duration(500).call(this.x_axis)
        this.y_axis_wrapper.transition().duration(500).call(this.y_axis)

        this.x_axis_wrapper.selectAll('text')
            .attr('transform', 'rotate(-45)')
            .attr('text-anchor', 'end')


        let bars = this.svg.selectAll('.bar')
            .data(this.selected_chart.data)
            .join(
                enter => enter.append('rect')
                    .attr('class', 'bar')
                    .attr('x', d => this.x_axis_scale(d.id))
                    .attr('y', d => this.y_axis_scale(d.data))
                    .attr('width', this.x_axis_scale.bandwidth())
                    .attr('height', d =>  this.y_axis_scale(0) - this.y_axis_scale(d.data))
                    .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.margin_top})`)
                    .attr('fill', 'steelblue'),
                update => update.transition().duration(500)
                    .attr('x', d => this.x_axis_scale(d.id))
                    .attr('y', d => this.y_axis_scale(d.data))
                    .attr('width', this.x_axis_scale.bandwidth())
                    .attr('height', d => this.DIMENSIONS.drawable_height - this.y_axis_scale(d.data))
                    .attr('transform', `translate(${this.DIMENSIONS.margin_left}, ${this.DIMENSIONS.margin_top})`)
                    .attr('fill', 'steelblue'),
                exit => exit.remove()
            )

    }

    getData() {
        switch(this.selected_chart.choice) {
            case 'fastest':
                this.selected_chart.y_label = 'Average Pace (min/mile)'
                this.selected_chart.title = 'Average Pace of top 10 Finishers'
                this.GAS.raceData.sort((a, b) => a.average_pace - b.average_pace)
                this.selected_chart.data = this.GAS.raceData.slice(0, 10).map(d => {
                                                return {
                                                    id: d.race_year_id,
                                                    event: d.event,
                                                    data: d.average_pace/60
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
                                                    data: d.average_pace/60
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


    attchEventListeners() {
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
}