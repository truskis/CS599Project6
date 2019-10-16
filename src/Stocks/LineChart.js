import React, { Component } from 'react'
import './../App.css'
import './../Chart.css';
import * as d3 from "d3";


class LineChart extends Component {
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
       if(this.props.data.length > 0)
       {
         var data = this.props.data;
         const node = this.node
      
         // set the dimensions and margins of the graph
         var margin = {top: 10, right: 40, bottom: 60, left: 80},
         width =this.props.size[0] - margin.left - margin.right,
         height = this.props.size[1] - margin.top - margin.bottom;

         var svg = d3.select(node)
                  .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
         .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

           // Add X axis
         var x = d3.scaleLinear()
            .domain([0, d3.max(data.map (d => { return d.Id;})) +10])
            .range([ 0, width ]);
            svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", 14)
            .style("fill", "#045a5a");
            //.call(d3.axisBottom(x).tickSize(-height).ticks(10));
            
         // Add Y axis
         var y = d3.scaleLinear()
            .domain([0, d3.max(data.map (d => { return d.Price;})) + 1])
            .range([ height, 0]);
            svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", 14)
            .style("fill", "#045a5a");

            
         // Add X axis label:
         svg.append("text")
         .attr("text-anchor", "end")
         .attr("class", "axis")
         .attr("x", width/2 + margin.left)
         .attr("y", height + margin.top + 40)
         .style("font-size", 16)
         .style("fill", "#045a5a")
         .text("Date");

         // Y axis label:
         svg.append("text")
         .attr("class", "axis")
         .attr("text-anchor", "end")
         .attr("y", height/2 + 10 )
         .attr("x", -30)
         .style("font-size", 16)
         .style("fill", "#045a5a")
         .text("Price")

         // Add dots
         svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("dot")
               .attr("cx", function (d) { return x(d.Id); } )
               .attr("cy", function (d) { return y(d.Price); } )
               .attr("r", 5.0)
               .style("fill", "69b3a2")
               .style("fill-opacity", "0.3" )
               .style("stroke", "#69b3a2")

        }
   }
render() {
      return <svg ref={node => this.node = node}
      width={500} height={500}>
      </svg>
   }
}
export default LineChart