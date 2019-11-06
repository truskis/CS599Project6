import React, { Component } from 'react'
import './../App.css'
import './../Chart.css';
import * as d3 from "d3";

class TimeLineChart extends Component {
  constructor(props){
    super(props)
    this.createChart = this.createChart.bind(this);
    this.enabled = {};
  }

  componentDidMount() {
    this.createChart();
    window.addEventListener('resize', this.createChart);
  }

  componentDidUpdate() {
    this.createChart();
  }

  createChart() 
  {
    const node = this.node;
    const keys = this.props.keys;
   
    // set the dimensions and margins of the graph
    var margin = {top: 15, right: 150, bottom: 25, left: 60},
    width = this.node.clientWidth - margin.left - margin.right,
    height = this.node.clientHeight - margin.top - margin.bottom;

    d3.select(this.node)
      .selectAll("*").remove();

    var svg =
      d3.select(node)
        .append("svg")
        .append("g")
          .attr("transform",
                `translate(${margin.left},${margin.top})`);

      //console.log(this.props.data.length);
    if (this.props.data)
    {
      const data = this.props.data;
      const updateAxis = this.props.updateAxis;

      // Add X axis
      const xDomain = d3.extent(data, d => d.time);
      if (!this.valid) {
        this.x = d3.scaleTime()
          .domain(xDomain)
          .range([0, width]);
        this.valid = true;
      }
      const x = this.x;
      const xTicks = scale =>
        scale.ticks()
          .filter(tick =>
            !tick.getHours()
              && !tick.getMinutes()
              && !tick.getSeconds()
              && !tick.getMilliseconds());
      const xGen = (scale, ticks) =>
        d3.axisBottom(scale)
          .tickValues(ticks)
          .tickFormat(d3.timeFormat("%m/%d/%y"));
      this.xAxis = svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xGen(x, xTicks(x)));
      this.xAxis
        .selectAll("text")
        .style("font-size", 14)
        .style("fill", "#045a5a");

         var yMax = d3.max(data.map(d => keys.map(k => d[k]).reduce((acc, v) => Math.max(acc, v || 0))));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, yMax *1.05])
        .range([ height, 0])
      var yTicks = this.props.focus ? y.ticks() : [];
      if (this.props.integer)
      {
        yTicks = yTicks.filter(tick => Number.isInteger(tick));
      }
      svg.append("g")
        .attr("class", "axis")
        .call(
          d3.axisLeft(y)
            .tickValues(yTicks)
            .tickFormat(d3.format(this.props.format))
        )
        .selectAll("text")
        .style("fill", "#045a5a");

            // Add a clipPath: everything out of this area won't be drawn.
            var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("class", "selectedChart")
            .attr("width", width )
            .attr("height", height )
            .attr("x", 0)
            .attr("y", 0);


         var color;

            // Usually you have a color scale in your chart already
            color = d3.scaleOrdinal()
            .domain(keys)
            .range(d3.schemeSet2);


            // Add brushing
            var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
            .extent( [ [0,0], [width,height] ] )  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
            .on("end", updateChart)               // Each time the brush selection changes, trigger the 'updateChart' function

            var line = svg.append('g')
                    .attr("clip-path", "url(#clip)");

      function genLine(k) {
        return d3.line()
          .x(d => x(d.time))
          .y(d => y(d[k] || 0));
      }
      this.genLine = genLine;

      function genLines() {
        return keys.map(
          (k, i) =>
            line.append("path")
              .datum(data)
              .attr('id', `plot-${i}`)
              .attr('fill', 'none')
              .attr('stroke', color(k))
              .attr('stroke-width', 1.5)
              .attr('data-legend', d => d[k] || 0)
              .attr('d', genLine(k))
        );
      }

      this.lines = genLines();

               line
               .append("g")
                 .attr("class", "brush")
                 .call(brush);

      // A function that set idleTimeOut to null
      var idleTimeout
      function idled() { idleTimeout = null; }

                     // A function that update the chart for given boundaries
    function updateChart() {

      // What are the selected boundaries?
      var extent = d3.event.selection
      const domain = x.domain();

      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if(!extent){
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
        x.domain(xDomain);
      }else{
        x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
        line.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
      }

      const ticks = xTicks(x);
      if (ticks.length >= 2) {
        updateAxis(x.domain(), xGen(x, ticks));
      }
      else
      {
        x.domain(domain);
      }
    }

    // If user double click, reinitialize the chart
    svg.on("dblclick", () => {
      x.domain(xDomain);
      updateAxis(x.domain(), xGen(x, xTicks(x)));
    });

      // Add legend
      svg.append('g')
        .attr('transform', `translate(${width + 20}, ${margin.top})`)
        .selectAll('g')
        .data(keys)
        .enter()
        .append('g')
          .attr('transform', (d, i) => `translate(0, ${i * 25})`)
          .call(g => {
            g.append('circle')
              .attr('class', 'legend-toggle')
              .attr('cx', 0)
              .attr('cy', 0)
              .attr('r', 7)
              .style('fill', d => color(d))
              .style('stroke', d => color(d))
            g.append('text')
              .attr('class', 'legend')
              .attr('x', 15)
              .attr('y', 0)
              .style('fill', d => color(d))
              .text((d, i) => this.props.names ? this.props.names[i] : d)
              .attr('text-anchor', 'left')
              .attr('dominant-baseline', 'middle');
          });
      if (this.props.toggle) {
        var enabled = this.enabled;
        svg.selectAll('.legend-toggle')
          .each(function(d, i) {
            d3.select(this)
              .on('mouseover', function() {
                d3.select(this).transition()
                  .duration('50')
                  .attr('opacity', '0.5');
              })
              .on('mouseout', function() {
                d3.select(this).transition()
                  .duration('50')
                  .attr('opacity', '1');
              })
              .on('mousedown', function() {
                const value = !enabled[i];
                d3.select(this).transition()
                  .duration('50')
                  .attr('fill-opacity', value ? '1' : '0');
                svg.select(`#plot-${i}`)
                  .attr('opacity', value ? '1' : '0');
                enabled[i] = value;
              });
            const value = enabled[i] !== undefined ? enabled[i] : i == 0;
            enabled[i] = value;
            d3.select(this)
              .attr('fill-opacity', value ? '1' : '0');
            svg.select(`#plot-${i}`)
              .attr('opacity', value ? '1' : '0');
          });
      }
    }
  }

  resetAxis() {
    this.valid = false;
  }

  updateAxis(domain, axis) {
    this.x.domain(domain);
    this.xAxis.transition().duration(1000).call(axis);
    console.log(this.props.keys);
    this.props.keys.forEach(
      (k, i) => {
        console.log(this.lines[i]);
        this.lines[i]
          .transition()
          .duration(1000)
          .attr('d', this.genLine(k));
      }
    );
  }

render() {
      return <svg ref={node => this.node = node} />
   }
}

export default TimeLineChart
