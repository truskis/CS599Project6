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
           // Add X axis
         var x = d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.time; }))
            .range([0, width]);
            svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%y")))
            .selectAll("text")
            .style("font-size", 14)
            .style("fill", "#045a5a");

         var yMax = d3.max(data.map(d => keys.map(k => d[k]).reduce((acc, v) => Math.max(acc, v || 0))));

         // Add Y axis
         var y = d3.scaleLinear()
            .domain([0, yMax *1.05])
            .range([ height, 0]);
            svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).tickFormat(d3.format(this.props.format)))
            .selectAll("text")
            .style("fill", "#045a5a");

         var color;

            // Usually you have a color scale in your chart already
            color = d3.scaleOrdinal()
            .domain(keys)
            .range(d3.schemeSet2);

            keys.forEach(
               function(element, i) {
                  svg.append("path")
                  .datum(data)
                  .attr('id', `plot-${i}`)
                  .attr("fill", "none")
                  .attr("stroke", color(element))
                  .attr("stroke-width", 1.5)
                  .attr("data-legend",function(d) { return d[element] || 0})
                  .attr("d", d3.line()
                     .x(function(d) { return x(d.time) })
                     .y(function(d) { return y(d[element] || 0) })
                     );;
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
render() {
      return <svg ref={node => this.node = node} />
   }
}

export default TimeLineChart
