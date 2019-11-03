import React, {Component} from 'react';
import { Container, Row, Col } from 'react-grid-system';
import './App.css';
import BarChartHistagram from './BarChartHistagram';
import TimeLineChart from './Stocks/TimeLineChart';
import {csv} from 'd3';
import * as d3 from "d3";
import SingleNumber from './Helpers/SingleNumber';
import DatePickerStock from './Helpers/DatePickerStock';
import Select from 'react-select';

class App extends Component {

 constructor()
 {
   super();

   this.onDateChanged = this.onDateChanged.bind(this);
   this.onStrategyChanged = this.onStrategyChanged.bind(this);
   this.runSimulation = this.runSimulation.bind(this);


   this.state = {
   histArray: [], 
   startDate:d3.timeParse("%m/%d/%Y")("03/02/2009"),
   endDate:d3.timeParse("%m/%d/%Y")("11/31/2009"),
   strategy:'strategy1',
      stockNames: [],
      dataStock: {},
      dataSPY: {}, 
      accountStart: 100000,
      percentageGain: 0,
      percentageGainYearly: 0,
      percentageGainSPY: 0,
      standardDeviation: 0,
      maxDrawdown: 0,
      sharpeRatio: 0
    };
    this.state.accountEnd = this.state.accountStart;
  }


//  onStartSimulation()
//  {
//    console.log("simulation satrted");
//   this.runSimulation();
//  }
onStrategyChanged(newStrategy)
{
  console.log('strat choseen' + newStrategy);
 this.setState({
  strategy: newStrategy,
 });
}
 onDateChanged(newStartDate, newEndDate)
 {
  this.setState({
    startDate: newStartDate,
    endDate: newEndDate
  });
 }

  toArray(object) {
    return Object.entries(object).map(([k, v]) => v);
  }

  average(data) {
    return data.reduce((acc, val) => acc + val, 0) / data.length;
  }

  movingAverage(data, n, i, map) {
    return this.average(data.slice(i - Math.min(i, n - 1), i + 1).map(d => map(d)));
  }

  async query(str) {
    const response = await d3.json('query.php', {
      method: 'post',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ query: str })
    })
    if (response.status != 'success')
    {
      throw response.result;
    }
    return response.result;
  }

  async fetchNames() {
    return (await this.query('SELECT stock FROM stocks GROUP BY stock'))
      .map(d => d.stock);
  }

  async fetchStock(stock) {
    let data = {};
    (await this.query(`
      SELECT * from stocks
      WHERE stock='${stock}'
      AND date BETWEEN '${d3.timeFormat('%Y-%m-%d')(this.state.startDate)}'
      AND '${d3.timeFormat('%Y-%m-%d')(this.state.endDate)}'`
    ))
      .forEach((d, i, a) => {
        d.time = d3.timeParse('%Y-%m-%d')(d.date);
        d.price = +d.adjusted_close;
        d.volume = +d.volume;
        d.MA5 = this.movingAverage(a, 5, i, d => d.price);
        d.MA10 = this.movingAverage(a, 10, i, d => d.price);
        d.MA20 = this.movingAverage(a, 20, i, d => d.price);
        d.MA30 = this.movingAverage(a, 30, i, d => d.price);
        data[d.date] = d
      });
    return data;
  }

  async fetchSPY() {
    let data = await this.fetchStock('SPY');
    const arr = this.toArray(data);
    const ratio = this.state.accountStart / arr[0].price;
    arr.forEach(d => data[d.date].account = d.price * ratio );
    return data;
  }

  async componentDidMount() {
    const stockNames = await this.fetchNames();
    this.setState({
      stockNames: stockNames,
      stockSelection: stockNames[0]
    });
  }

  async selectStock() {
    this.setState({
      dataStock: await this.fetchStock(this.state.stockSelection),
      dataSPY: await this.fetchSPY()
    });
  }

  strategy1() {
    // investment strategy1 based on ma5 and ma30
    let out = {};
    this.toArray(this.state.dataStock)
      .map((d, i, a) => {
        const prev = a[i - 1];
        const prev2 = a[i - 2];
        d.MA5BuyFlag =
          i >= 30
            && d.price < prev.price
            && prev.price < prev2.price
            && d.MA10 > d.MA5;
        d.MA5SellFlag =
          i >= 30
            && d.price > prev.price
            && prev.price > prev2.price
            && d.MA10 < d.MA5;
        d.cash = i > 0 ? prev.cash : this.state.accountStart;
        d.shares = i > 0 ? prev.shares : 0;
        if (d.MA5BuyFlag && d.cash > d.price) {
          const shares = Math.floor(d.cash / d.price);
          d.cash -= shares * d.price;
          d.shares += shares;
        }
        if (d.MA5SellFlag && d.shares > 0) {
          d.cash += d.shares * d.price;
          d.shares = 0;
        }
        d.account = d.cash + d.shares * d.price;
        d.priceSPY =
          this.state.dataSPY[d.date] ? this.state.dataSPY[d.date].price : 0;
        return d;
      })
      .forEach(d => out[d.date] = d);
    return out;
  }

  strategy2() {
    // investment strategy1 based on ma5 and ma30
    let out = {};
    this.toArray(this.state.dataStock)
      .map((d, i, a) => {
        const prev = a[i - 1];
        const prev2 = a[i - 2];
        d.MA5BuyFlag =
          i >= 30
            && d.price < prev.price
            && prev.price < prev2.price
            && d.MA10 > d.MA5
            && d.volume < prev.volume;
        d.MA5SellFlag =
          i >= 30
            && d.price > prev.price
            && prev.price > prev2.price
            && d.MA10 < d.MA5
            && d.volume > prev.volume;
        d.cash = i > 0 ? prev.cash : this.state.accountStart;
        d.shares = i > 0 ? prev.shares : 0;
        if (d.MA5BuyFlag && d.cash > d.price) {
          const shares = Math.floor(d.cash / d.price);
          d.cash -= shares * d.price;
          d.shares += shares;
        }
        if (d.MA5SellFlag && d.shares > 0) {
          d.cash += d.shares * d.price;
          d.shares = 0;
        }
        d.account = d.cash + d.shares * d.price;
        d.priceSPY =
          this.state.dataSPY[d.date] ? this.state.dataSPY[d.date].price : 0;
        return d;
      })
      .forEach(d => out[d.date] = d);
    return out;
  }

  async runSimulation()
  {
    await this.selectStock();

    const strategies = {
      'strategy1': this.strategy1.bind(this),
      'strategy2': this.strategy2.bind(this)
    };

    const dataAccount = strategies[this.state.strategy]();

    const histArray =
      this.toArray(dataAccount)
        .map((d, i, a) => {
          const prev = a[i - 1];
          return prev ? (d.price - prev.price) / prev.price : 0;
        });

    const standardDeviation = values => {
      var avg = this.average(values.map(d => d.account));
      return Math.sqrt(this.average(
        values.map(value => {
          var diff = value.account - avg;
          return diff * diff;
        })
      )) / this.state.accountStart * 100;
    };

    const drawDown = values => {
      var max = values.reduce(
        (acc, d, i) =>
          i > acc.index && d.account > acc.account
            ? { account: d.account, index: i }
            : acc,
        { account: 0, index: 0 }
      );
      var min = values.reduce(
        (acc, d, i) =>
          i > max.index
            ? d.account < acc.account
              ? { account: d.account, index: i }
              : acc
            : max,
        { account: 0, index: 0 }
      );
      return (max.account - min.account) / max.account * 100;
    }

        function yearlyGain(values)
        {
          
          var firstDayAccount=values[0];
          var lastDayAccount=values[0];
          var firstYear = values[0].time.getFullYear();
          var lastYear = values[values.length - 1].time.getFullYear();
          var gain=[];
          if(firstYear==lastYear)
          {
            return (values[values.length - 1].account - values[0].account) / values[0].account * 100;
          } 
          else
          {
            for(var i=0;i<values.length;i++)
            {
              
              if(i+1<values.length && values[i].time.getFullYear()==firstYear+1)
              {
                lastDayAccount = values[i].account;
                var yealygain=(lastDayAccount-firstDayAccount)/firstDayAccount*100;
                gain.push(yealygain);
                firstYear=firstYear+1;
                if(firstYear==lastYear)
                {
                  var lastgain = (values[values.length - 1].account - values[i + 1].account) / values[i + 1].account * 100;
                  gain.push(lastgain);
                  break;
                }
              }
            }
          }
          var gainSum=0;
          for(var i=0;i<gain.length;i++)
            gainSum+=gain[i];
          
          return gainSum/gain.length;
        }

    const accountArray = this.toArray(dataAccount);

        function sharpeRatio()
        {
            var yearlygain=yearlyGain(accountArray);
            var yearlySd=standardDeviation(accountArray);
            return ((yearlygain-0.035)/yearlySd);
        }  
        
        // Update all the information to be displayed data3
    const first = accountArray[0];
    const last = accountArray[accountArray.length - 1];
    const accountEnd = last.account;
    console.log(dataAccount);
    this.setState({
      dataAccount: dataAccount,
      accountEnd: accountEnd,
      histArray: histArray,
      percentageGain: (accountEnd - this.state.accountStart) / this.state.accountStart * 100,
      percentageGainYearly: yearlyGain(accountArray),
      percentageGainSPY: (last.priceSPY - first.priceSPY) / first.priceSPY * 100,
      standardDeviation: standardDeviation(accountArray),
      maxDrawdown: drawDown(accountArray),
      sharpeRatio: sharpeRatio()
    });
  }

  render()
  {
    return (
      <div className='App'>
        <Container fluid>
          <Row justify='center'>
            <Col xs="content">
              <DatePickerStock
                stockNames={this.state.stockNames}
                dataStock={this.state.dataStock}
                onDatePickedChanged={this.onDateChanged}
                onStartSimulation={this.runSimulation}
                onStrategyChanged={this.onStrategyChanged}
                onStockChanged={(stock) => this.setState({ stockSelection: stock })}
              />
            </Col>
            <Col xs="content">
              <Container fluid>
                <Row justify='center'>
                  <SingleNumber header='Start Value' value={`${this.state.accountStart.toFixed(2)}`}/>
                  <SingleNumber header='End Value' value={`${this.state.accountEnd.toFixed(2)}`}/>
                  <SingleNumber header='% Gain' value={`${this.state.percentageGain.toFixed(1)}%`}/>
                  <SingleNumber header='% Gain Yearly Avg' value={`${this.state.percentageGainYearly.toFixed(1)}%`}/>
                </Row>
                <Row justify='center'>
                  <SingleNumber header='Std Dev' value={`${this.state.standardDeviation.toFixed(1)}%`}/>
                  <SingleNumber header='S&amp;P500 % Gain' value={`${this.state.percentageGainSPY.toFixed(1)}%`}/>
                  <SingleNumber header='Max Drawdown %' value={`${this.state.maxDrawdown.toFixed(1)}%`}/>
                  <SingleNumber header='Sharpe Ratio' value={`${this.state.sharpeRatio.toFixed(1)}`}/>
                </Row>
              </Container>
            </Col>
          </Row>
        </Container>
        <div id="divLineChart"  className='Chart'>
          <div className='App-header'>
            <h4>Daily Gain/Loss Histogram</h4>
          </div>
          <BarChartHistagram data={this.state.histArray} size={[800,500]}/>
        </div>
        <div className='Chart'>
          <div className='App-header'>
            <h4>Account Value</h4>
          </div>
          <TimeLineChart
            data={this.state.dataAccount && this.toArray(this.state.dataAccount)}
            data2={this.state.dataSPY && this.toArray(this.state.dataSPY)}
            size={[800,500]}
            yAxis='account'
            lineNames={['Account value', 'S&P500 value']}
          />
        </div>
        <div className='Chart'>
          <div className='App-header'>
            <h4>Historical Stock Price</h4>
          </div>
          <TimeLineChart
            data={this.state.dataStock && this.toArray(this.state.dataStock)}
            size={[800,500]}
            yAxis='price'
          />
        </div>
        <div className='Chart'>
          <div className='App-header'>
            <h4>Moving Averages</h4>
          </div>
          <TimeLineChart
            data={this.state.dataAccount && this.toArray(this.state.dataAccount)}
            size={[800,500]}
            yAxes={['MA5', 'MA10', 'MA20', 'MA30']}
          />
        </div>
      </div>
    );
  }
}

export default App;
