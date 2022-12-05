class MvWScatterChart {
    constructor(globalApplicationState) {
        this.GAS = globalApplicationState;

        this.selected_chart = {
            choice: 'age',
            title: '',
            y_label: 'Average Pace (min/mile)',
            data: null
        }

        this.processData()
        this.initializeSVG();
        this.attachEventListeners();

        this.update();
    }

    initializeSVG() {
        this.svg = d3.select('#m-w-scatter-chart')

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

        this.x_axis_scale = d3.scaleLinear()
            .domain([0, 100])
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



        // this.chart_title = this.svg.append('text')
        //     .attr('class', 'chart-title')
        //     .attr('x', this.DIMENSIONS.width / 2)
        //     .attr('y', 20)
        //     .attr('text-anchor', 'middle')
        //     .text(this.selected_chart.title)

        this.y_axis_label = this.svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', `translate(20, ${this.DIMENSIONS.height / 2}) rotate(-90)`)
            .attr('text-anchor', 'middle')
            .text(this.selected_chart.y_label)

    }

    update() {
        console.log('update', this.GAS);
        // this.selected_x_data = this.GAS.rankingData.map(d => d.age)
        // this.selected_y_data = this.GAS.rankingData.map(d => d.average_pace)
        // //this.selected_data = Array.from(this.GAS.rankingData.map(function (d) { return { x: d.age, y: d.average_pace } }));
        // this.selected_data = Array.from(this.individualData.map(function (d) { return { x: d.age, y: d.average_pace } }));
        // console.log(this.selected_data);
        this.getData();
        console.log(this.selected_chart.data);
        // this.chart_title.text(this.selected_chart.title)
        this.y_axis_label.text(this.selected_chart.y_label)
        this.x_axis_scale.domain([0, d3.max(this.selected_chart.data, d => d.x)])
        // getting not a function here
        // this.x_axis_scale.padding(0.1)
        this.y_axis_scale.domain([d3.min(this.selected_chart.data, d => d.y), d3.max(this.selected_chart.data, d => d.y)])

        //this.x_axis.tickValues(this.selected_chart.data.map(d => d.event))
        this.x_axis_wrapper.transition().duration(500).call(this.x_axis)
        this.y_axis_wrapper.transition().duration(500).call(this.y_axis)

        this.x_axis_wrapper.selectAll('text')
            .attr('transform', 'rotate(-45)')
            .attr('text-anchor', 'end')

        // this.svg.select('#dots').selectAll('circle').remove();
        // Add dots
        this.svg.select('#dots')
            .selectAll(".dot")
            .data(this.selected_chart.data)
            .join(
                enter => enter.append("circle")
                    .attr("cx", (d) => this.x_axis_scale(d.x) + this.DIMENSIONS.margin_left)
                    .attr("cy", (d) => this.y_axis_scale(d.y) + this.DIMENSIONS.margin_top)
                    .attr("r", 3)
                    .attr('class', d => d.g === 'M' ? 'dot men' : 'dot women')
                ,
                // update => update.remove()
                update => update.transition().duration(1000)
                    .attr("cx", (d) => this.x_axis_scale(d.x) + this.DIMENSIONS.margin_left)
                    .attr("cy", (d) => this.y_axis_scale(d.y) + this.DIMENSIONS.margin_top)
                    .attr("r", 3)
                    .attr('class', d => d.g === 'M' ? 'dot men' : 'dot women')
                ,
                exit => exit.remove()
            )
    }

    getData() {
        switch (this.selected_chart.choice) {
            case 'age':
                this.selected_chart.data = Array.from(
                    this.individualData.map(function (d) {
                        return {
                            x: d.age,
                            y: d.average_pace,
                            g: d.gender
                        }
                    })
                ).filter(d => !isNaN(d.y));
                break;
            case 'num_races':
                let set = new Set();
                let a = Array.from(
                    this.individualData.map(d => {
                        if (!set.has(d.runner)) {
                            set.add(d.runner);
                            return {
                                x: this.people.get(d.runner).length,
                                y: d.average_pace,
                                g: d.gender
                            }
                        }
                    })
                ).filter(d => typeof d !== 'undefined');
                this.selected_chart.data = a;
                break;
        }
    }


    attachEventListeners() {
        this.select = d3.select('#mw-scatter-select')
        d3.select('#mw-scatter-select')
            .on('change', this.handleSelectChange.bind(this))
    }

    handleSelectChange(e) {
        let value = e.target.value;
        this.selected_chart.choice = value;
        this.update();
    }


    processData() {
        this.individualData = [];
        let races_map = d3.group(this.GAS.raceData, d => d.race_year_id);
        this.GAS.rankingData.map(entry => {
            // find race distance
            //let race = this.GAS.raceData.filter((d) => d.race_year_id === entry.race_year_id)[0];
            let race = races_map.get(entry.race_year_id);
            if (typeof race !== 'undefined' && entry.time !== 'NA') {
                // convert to min/mile
                entry.average_pace = ((+entry.time_in_seconds / +race[0].distance) / 60) * 1.609344;
                // entry.average_pace = (+entry.time_in_seconds / +race.distance) * 60

                // exclude those who don't have a listed age
                if (entry.age > 0)
                    this.individualData.push(entry);
            }
        });


        // compare number of races in list vs average pace - do faster people run more or less events?
        // group by name
        // find count
        this.people = d3.group(this.GAS.rankingData, d => d.runner);

    }
}