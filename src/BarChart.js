import React, { Component } from 'react'
import './App.css'
import './Chart.css';
import * as d3 from "d3";


class BarChart extends Component {
    constructor(props){
       super(props)
       this.createBarChart = this.createBarChart.bind(this)
    }
    componentDidMount() {
       this.createBarChart()
    }
    componentDidUpdate() {
       this.createBarChart()
    }
    createBarChart() 
    {
            // javascript
        var dataset = [741.2, 551.6, 997.9, 974.2, 818.2, 1043.0, 1127.0, 558.1, 616.9,1195.0,880.7,1224.0];
        var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

        
        const node = this.node

        var margin = {top: 40, right: 30, bottom: 40, left: 60},
        width =this.props.size[0] - margin.left - margin.right,
        height = this.props.size[1] - margin.top - margin.bottom;
        var legendHeight = height/8;

        var svgWidth = width, svgHeight = height - legendHeight, barPadding = 5;
        var barWidth = svgWidth / dataset.length;
        var svg = d3.select(node)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");
            
        var yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset)])
            .range([-200, svgHeight]);
            
        svg.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("y", function(d) {
                return svgHeight - yScale(d)+20; 
            })
            .attr("height", function(d) { 
                return yScale(d); 
            })
            .attr("width", barWidth - barPadding)
            .attr("class", "bar")
            .attr("transform", function (d, i) {
                var translate = [barWidth * i, 0]; 
                return "translate("+ translate +")";
            });
        
        svg.selectAll("text")
            .data(dataset)
            .enter()
            .append("text")
            .text(function(d) {
                return "$"+d+"k";
            })
            .attr("y", function(d, i) {
                return svgHeight - yScale(d) +15;
            })
            .attr("x", function(d, i) {
                return 5+barWidth * i;
            })
            .attr("class", "bar");
            
            
        
        
        // Create the scale
        var x = d3.scaleBand()
            .domain(months)         // This is what is written on the Axis: from 0 to 100
            .range([0, svgWidth]);         // Note it is reversed
        
        // Draw the axis
        svg
        .append("g")
        .attr("transform", "translate(0," + (svgHeight +20) + ")")     // This controls the rotate position of the Axis
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "translate(-10,10)rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", 18)
            .style("fill", "#045a5a")
    }

 render() {
       return <svg ref={node => this.node = node}
       width={500} height={500}>
       </svg>
    }
 }
 export default BarChart
 