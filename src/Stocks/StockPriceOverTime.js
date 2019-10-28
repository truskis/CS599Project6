import React, {Component} from 'react';
import TimeLineChart from './TimeLineChart';

class SingleNumber extends Component {
    render() {
        return <div>
            <TimeLineChart data= {this.state.stockdata3} data2= {this.state.dataSPY} size={[800,500]} yAxis={"account"}/>
            </div>
     }
  }
  export default SingleNumber