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

  standardDeviation(data) {
    const avg = this.average(data);
    return Math.sqrt(data.reduce((acc, val) => {
      const diff = val - avg;
      return acc + diff * diff
    }) / (data.length - 1));
  };

  sliceRecent(data, n, i, map) {
    return data.slice(i - Math.min(i, n - 1), i + 1).map(d => map(d));
  }

  movingAverage(data, n, i, map) {
    return this.average(this.sliceRecent(data, n, i, map));
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
    const arr = this.toArray(this.state.dataStock);
    const ratio = this.state.accountStart / this.state.dataSPY[arr[0].date].price;
    let out = {};
    arr
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
        d.accountSPY =
          this.state.dataSPY[d.date]
            ? ratio * this.state.dataSPY[d.date].price
            : 0;
        return d;
      })
      .forEach(d => out[d.date] = d);
    return out;
  }

  strategy2() {
    // investment strategy1 based on ma5 and ma30
    const arr = this.toArray(this.state.dataStock);
    const ratio = this.state.accountStart / this.state.dataSPY[arr[0].date].price;
    let out = {};
    arr
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
        d.accountSPY =
          this.state.dataSPY[d.date]
            ? ratio * this.state.dataSPY[d.date].price
            : 0;
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
    const accountArray = this.toArray(dataAccount);
    const accountValue = accountArray.map(d => d.account);

    const maxDrawDown = (() => {
      const result = accountValue.reduce(
        (acc, d, i) => {
          if (d < acc.minValue) {
            acc.minValue = d;
            acc.drawdown = (acc.peakValue - d) / acc.peakValue * 100.0;
            acc.drawdownFrom = acc.peakIndex;
            acc.drawdownTo = i;
          }
          else if (d > acc.maxValue) {
            acc.maxValue = d;
            acc.peakValue = d;
            acc.peakIndex = i;
          }
          return acc;
        },
        {
          minValue: accountValue[0],
          maxValue: accountValue[0],
          peakValue: accountValue[0],
          peakIndex: 0,
          drawdown: 0,
          drawdownFrom: 0,
          drawdownTo: 0
        }
      );
      return result.drawdown;
    })();

    const dailyGains =
      accountValue
        .map((d, i, a) => {
          const prev = a[i - 1];
          return prev ? (d - prev) / prev : 0;
        });

    const dailyAvg = this.average(dailyGains);
    const dailyStdDev = this.standardDeviation(dailyGains);
    const yearlyGain = Math.pow(dailyAvg + 1, 252) - 1;
    const yearlyStdDev = dailyStdDev * Math.sqrt(252);
    const sharpeRatio = (yearlyGain - 0.035) / yearlyStdDev;

    const first = accountArray[0];
    const last = accountArray[accountArray.length - 1];
    const accountEnd = last.account;
    console.log(dataAccount);
    this.setState({
      dataAccount: dataAccount,
      accountEnd: accountEnd,
      histArray: dailyGains,
      percentageGain: (accountEnd - this.state.accountStart) / this.state.accountStart * 100,
      percentageGainYearly: yearlyGain * 100,
      percentageGainSPY: (last.accountSPY - first.accountSPY) / first.accountSPY * 100,
      standardDeviation: dailyStdDev * 100,
      maxDrawdown: maxDrawDown,
      sharpeRatio: sharpeRatio
    });
  }

  render()
  {
    return (
      <div className='App'>
        <div style={{
          display: 'inline-block',
          width: 'calc(35vmin - 3.25vmin)',
          height: 'calc(100vh - 5vmin)',
          margin: '2.5vmin 0',
          verticalAlign: 'top'
        }}>
          <Container fluid>
            <Row justify='center'>
              <DatePickerStock
                stockNames={this.state.stockNames}
                dataStock={this.state.dataStock}
                onDatePickedChanged={this.onDateChanged}
                onStartSimulation={this.runSimulation}
                onStrategyChanged={this.onStrategyChanged}
                onStockChanged={(stock) => this.setState({ stockSelection: stock })}
              />
            </Row>
            <Row justify='center' className='header'>
              Daily Gain/Loss Histogram
            </Row>
            <Row justify='center'>
              <BarChartHistagram data={this.state.histArray} />
            </Row>
            <Row justify='center'>
              <SingleNumber header='Start Value' value={`${this.state.accountStart.toFixed(2)}`}/>
              <div style={{ margin: 'auto' }} />
              <SingleNumber header='End Value' value={`${this.state.accountEnd.toFixed(2)}`}/>
            </Row>
            <Row justify='center'>
              <SingleNumber header='% Gain' value={`${this.state.percentageGain.toFixed(1)}%`}/>
              <div style={{ margin: 'auto' }} />
              <SingleNumber header='% Gain Yearly Avg' value={`${this.state.percentageGainYearly.toFixed(1)}%`}/>
            </Row>
            <Row justify='center'>
              <SingleNumber header='Std Dev' value={`${this.state.standardDeviation.toFixed(1)}%`}/>
              <div style={{ margin: 'auto' }} />
              <SingleNumber header='S&amp;P500 % Gain' value={`${this.state.percentageGainSPY.toFixed(1)}%`}/>
            </Row>
            <Row justify='center'>
              <SingleNumber header='Max Drawdown %' value={`${this.state.maxDrawdown.toFixed(1)}%`}/>
              <div style={{ margin: 'auto' }} />
              <SingleNumber header='Sharpe Ratio' value={`${this.state.sharpeRatio.toFixed(1)}`}/>
            </Row>
          </Container>
        </div>
        <div style={{
          display: 'inline-block',
          width: '2.5vmin',
          height: '0'
        }} />
        <div style={{
          display: 'inline-block',
          width: 'calc(100vw - 35vmin - 3.25vmin)',
          height: 'calc(100vh - 5vmin)',
          margin: '2.5vmin 0',
          overflowX: 'visible',
          overflowY: 'visible',
          verticalAlign: 'top'
        }}>
          <Container fluid>
            <Row className='header'>Account Value</Row>
            <Row style={{ height: 'calc(25vh - 3em)' }}>
              <TimeLineChart
                data={this.state.dataAccount && this.toArray(this.state.dataAccount)}
                keys={['account', 'accountSPY']}
                names={['Account value', 'S&P500 value']}
                format='$.0f'
              />
            </Row>
            <Row className='header'>Shares Held</Row>
            <Row style={{ height: 'calc(25vh - 3em)' }}>
              <TimeLineChart
                data={this.state.dataAccount && this.toArray(this.state.dataAccount)}
                keys={['shares']}
                names={['Shares held']}
                format='.0f'
              />
            </Row>
            <Row className='header'>Stock Price</Row>
            <Row style={{ height: 'calc(50vh - 3em)' }}>
              <TimeLineChart
                data={this.state.dataAccount && this.toArray(this.state.dataAccount)}
                keys={['price', 'MA5', 'MA10', 'MA20', 'MA30']}
                format='$.0f'
                toggle='true'
              />
            </Row>
          </Container>
        </div>
      </div>
    );
  }
}

export default App;
