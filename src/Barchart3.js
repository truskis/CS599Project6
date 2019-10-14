import React, { Component } from 'react'
import './App.css'
import { scaleLinear, max, select } from 'd3'
//import yargsParser from 'yargs-parser'
//import { declareExportAllDeclaration } from '@babel/types'
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
       const counts = this.props.data.map(d =>
        {
            return d[1];
        });
        const years = this.props.data.map(d =>
        {
            return d[0];
        });

        const node = this.node
        const dataMax = max(counts)
        const yScale = scaleLinear()
            .domain([0, dataMax])
            .range([0, this.props.size[1]])

       const xSize = this.props.size[0] / counts.length;
      // const xSize = 10;
    select(node)
        .selectAll('rect')
        .data(counts)
        .enter()
        .append('rect')
    
    select(node)
        .selectAll('rect')
        .data(counts)
        .exit()
        .remove()
    
    select(node)
        .selectAll('rect')
        .data(counts)
        .style('fill', '#0000FF')
        .style('stroke', '#000000')
        .attr('x', (d,i) => i * xSize)
        .attr('y', d => this.props.size[1] - yScale(d))
        .attr('height', d => yScale(d))
        .attr('width', xSize)
    
    years.forEach( (year, i) =>
        {
            year = select(node).append('text');
            year.text(years[i]);
            year.attr('text',years[0]);
            year.attr('x',i * xSize );
            year.attr('y',this.props.size[1] );
            year.attr('font-size',"14px");
            year.attr('font-weight',"bold");
            year.attr('fill',"black");
        });
    counts.forEach( (count, i) =>
        {
            count = select(node).append('text');
            count.text(counts[i]);
            count.attr('text', " " +count[i]+" ");
            count.attr('x',i * xSize );
            count.attr('y',10 );
            count.attr('font-size',"14px");
            count.attr('font-weight',"bold");
            count.attr('fill',"black");
        });
   }
render() {
      return <svg ref={node => this.node = node}
      width={500} height={500}>
      </svg>
   }
}
export default BarChart