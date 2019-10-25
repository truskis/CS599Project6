import React, { Component } from 'react'
import './App.css'
import './Chart.css';
import * as d3 from "d3";

class BarChartHistagram extends Component {
    constructor(props){
       super(props)
       this.createBarChart = this.createBarChart.bind(this)
       var svg = d3.select(this.node);
    }
    componentDidMount() {
       this.createBarChart()
    }
    componentDidUpdate() {
      var svg = d3.select(this.node)
         .selectAll("*").remove();
         
       this.createBarChart()
    }

    createBarChart() 
    {
        if (this.props.data.length <= 0 )
           return;

        var histArray = this.props.data;


        //histArray = histArray.map
        const node = this.node

         // set the dimensions and margins of the graph
         var margin = {top: 40, right: 40, bottom: 60, left: 80},
         width =this.props.size[0] - margin.left - margin.right,
         height = this.props.size[1] - margin.top - margin.bottom;

         this.svg = d3.select(node)
         .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



        // X axis: scale and draw:
        var x = d3.scaleLinear()
        .domain([d3.min(histArray), d3.max(histArray)])  
        .range([0, width - 10]);
        this.svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "axis")
        .call(d3.axisBottom(x).tickFormat(d3.format(".00%")))
        .selectAll("text")
        .style("font-size", 12)
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
        .style("font-size", 12)
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
            return <svg ref={node => this.node = node}
            width={this.props.size[0]} height={this.props.size[1]}>
            </svg>
    }
 }
 export default BarChartHistagram