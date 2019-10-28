import React, { Component } from 'react'
import './../App.css'
import './../Chart.css';
import * as d3 from "d3";
import { cpus } from 'os';

const lineColors =[
   'steelblue',
   'green',
   'yellow',
   'orange',
   'red',
   'violet'


];
class TimeLineChart extends Component {
   constructor(props){
      super(props)
      this.createChart = this.createChart.bind(this)
   }
   componentDidMount() {
      this.createChart()
   }
   componentDidUpdate() {
      var svg = d3.select(this.node)
         .selectAll("*").remove();
         
       this.createChart()
    }
   createChart() 
   {
      //console.log(this.props.data.length);
       if(this.props.data && this.props.data.length > 0)
       {
         var data = this.props.data;
         const node = this.node;
         const padding = 0;
         const yName = this.props.yAxises ? this.props.yAxises[0] : this.props.yAxis;
      
         // set the dimensions and margins of the graph
         var margin = {top: 40, right: 40, bottom: 60, left: 80},
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
         var x = d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.Date; }))
            .range([padding, width - padding * 2]);
            svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%y")))
            .selectAll("text")
            .style("font-size", 14)
            .style("fill", "#045a5a");

       svg.selectAll(".axis text")  // select all the text elements for the xaxis
       .attr("transform", function(d) {
           return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";});
            
         // Add Y axis
         var y = d3.scaleLinear()
            .domain([0, d3.max(data.map (d => { return d[yName];})) + 1])
            .range([ height, 0]);
            svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", 14)
            .style("fill", "#045a5a");


         var keys;
         var color;
         var legend = false;


         if (this.props.yAxis && data.length >0)
         {
            if (this.props.lineNames)
            {
               keys = this.props.lineNames;
               color = d3.scaleOrdinal()
               .domain(keys)
               .range(d3.schemeSet2);
               legend = true;
            }
            svg.append("text")
            .attr("class", "axis")
            .attr("text-anchor", "end")
            .attr("y", 2 )
            .attr("x", -20)
            .style("font-size", 16)
            .style("fill", "#045a5a")
            .text(yName);
           
             svg.append("path")
             .datum(data)
             .attr("fill", "none")
             .attr("stroke", this.props.lineNames ? color(keys[0]) : 'steelblue')
             .attr("stroke-width", 1.5)
             .attr("d", d3.line()
                .x(function(d) { return x(d.Date) })
                .y(function(d) { return y(d[yName]) })
                )

         if (this.props.data2)
         {             svg.append("path")
                 .datum(this.props.data2)
                .attr("fill", "none")
                .attr("stroke", color(keys[1]))
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                .x(function(d) { return x(d.Date) })
                .y(function(d) { return y(d[yName]) })
                )
         }
         }

         if(this.props.yAxises)
         {

            var keys = this.props.yAxises;
            // Usually you have a color scale in your chart already
            color = d3.scaleOrdinal()
            .domain(keys)
            .range(d3.schemeSet2);

            legend = true;

            var i =0;
            this.props.yAxises.forEach(
               function(element) {
                  svg.append("path")
                  .datum(data)
                  .attr("fill", "none")
                  .attr("stroke", color(element))
                  .attr("stroke-width", 1.5)
                  .attr("data-legend",function(d) { return d[element]})
                  .attr("d", d3.line()
                     .x(function(d) { return x(d.Date) })
                     .y(function(d) { return y(d[element]) })
                     );;
               i++;
               });
         }


         if(legend)
         {

         // Add legend
                           // Add one dot in the legend for each name.
                           svg.selectAll("mydots")
                           .data(keys)
                           .enter()
                           .append("circle")
                           .attr("cx", width - 120 )
                           .attr("cy", function(d,i){ return  width/3 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
                           .attr("r", 7)
                           .style("fill", function(d){ return color(d)})
         
                           // Add one dot in the legend for each name.
                           svg.selectAll("mylabels")
                           .data(keys)
                           .enter()
                           .append("text")
                           .attr("x", width - 100)
                           .attr("y", function(d,i){ return width/3 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
                           .style("fill", function(d){ return color(d)})
                           .text(function(d){ return d})
                           .attr("text-anchor", "left")
                           .style("alignment-baseline", "middle")
         }
               
        }
   }
render() {
      return <svg ref={node => this.node = node}
      width={this.props.size[0]} height={this.props.size[1]}>
      </svg>
   }
}
export default TimeLineChart