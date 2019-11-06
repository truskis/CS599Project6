import React, { Component } from 'react'
import './App.css'
import './Chart.css';
import * as d3 from "d3";

class BarChartHistagram extends Component {
  constructor(props) {
    super(props)
    this.createBarChart = this.createBarChart.bind(this);
  }

  componentDidMount() {
    this.createBarChart();
    window.addEventListener('resize', this.createBarChart);
  }

  componentDidUpdate() {
    this.createBarChart()
  }

  createBarChart() 
  {
    // set the dimensions and margins of the graph
    var margin = {top: 15, right: 0, bottom: 25, left: 25},
    width = this.node.clientWidth - margin.left - margin.right,
    height = this.node.clientHeight - margin.top - margin.bottom;

    d3.select(this.node)
      .selectAll("*").remove();

    this.svg = d3.select(this.node)
      .append("svg")
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        if (this.props.data.length <= 0 )
           return;

        var histArray = this.props.data;


        //histArray = histArray.map

        // X axis: scale and draw:
        var x = d3.scaleLinear()
        .domain([d3.min(histArray), d3.max(histArray)])  
        .range([0, width - 20]);
        this.svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "axis")
        .call(d3.axisBottom(x).tickFormat(d3.format(".00%")))
        .selectAll("text")
        .style("font-size", 11)
        .style("fill", "#045a5a");

        // set the parameters for the histogram
        var histogram = d3.histogram()
        .value(function(d) { return d; })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(x.ticks(100)); // then the numbers of bins

        // // And apply this function to data to get the bins
        var bins = histogram(histArray);

        // // Y axis: scale and draw:
        var y = d3.scaleLinear()
        .range([height, 0]);
        y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
        this.svg.append("g")
        .call(d3.axisLeft(y).tickFormat(function(e){
            if(Math.floor(e) !== e)
            {
                return;
            }
    
            return e;
        }))
        .selectAll("text")
        .style("font-size", 10)
        .style("fill", "#045a5a");;

        // // append the bar rectangles to the svg element
        this.svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
            .attr("x", 1)
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
            .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
            .attr("height", function(d) { return height - y(d.length); })
            .style("fill", function(d) { return d.x0 >= 0 ? "#54b545" : "#f74848"})

    }

  render() {
    return <div className='histogram'>
      <div className='padding' />
      <svg ref={node => this.node = node} />
    </div>
  }
 }
 export default BarChartHistagram