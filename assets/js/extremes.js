class ExtremesChart {
    constructor(globalApplicationState) {
        this.GAS = globalApplicationState;

        this.initializeSVG();
        this.attchEventListeners();
    }

    initializeSVG() {
        this.svg = d3.select('#extremes-chart')
            .append('rect')
            .attr('width', 100)
            .attr('height', 100)
            .attr('fill', 'red')


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
    }
}