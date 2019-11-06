import React, {Component} from 'react';
import { Container, Row, Col } from 'react-grid-system';
import './App.css';
import BarChartHistagram from './BarChartHistagram';
import TimeLineChart from './Stocks/TimeLineChart';
import * as d3 from "d3";
import {group} from 'd3-array';
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

   const stockNames = this.fetchNames();
  this.state = {
   histArray: [], 
   startDate:d3.timeParse("%m/%d/%Y")("03/02/2009"),
   endDate:d3.timeParse("%m/%d/%Y")("11/31/2009"),
   strategy:'strategy1',
      stockNames: stockNames,
      stockSimulate: stockNames[0],
      stockSelection: [],
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
    return data.length > 1 ? Math.sqrt(data.reduce((acc, val) => {
      const diff = val - avg;
      return acc + diff * diff
    }) / (data.length - 1)) : 0;
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

  async postProcess(raw) {
    let tmp = [];
    group(raw, d => d.stock)
      .forEach((prices, stock) => {
        prices.forEach((d, i, a) => {
          d.time = d3.timeParse('%Y-%m-%d')(d.date);
          d.price = +d.adjusted_close;
          d.volume = +d.volume;
          d.MA5  = this.movingAverage(a,  5, i, d => d.price);
          d.MA10 = this.movingAverage(a, 10, i, d => d.price);
          d.MA20 = this.movingAverage(a, 20, i, d => d.price);
          d.MA30 = this.movingAverage(a, 30, i, d => d.price);
          d.SD5 = this.standardDeviation(this.sliceRecent(a, 5, i, d => d.price));
          d.SD10 = this.standardDeviation(this.sliceRecent(a, 10, i, d => d.price));
          d.SD20 = this.standardDeviation(this.sliceRecent(a, 20, i, d => d.price));
          d.SD30 = this.standardDeviation(this.sliceRecent(a, 30, i, d => d.price));
          d.Boll20_1L = d.MA20 - d.SD20;
          d.Boll20_1U = d.MA20 + d.SD20;
          d.Boll30_1L = d.MA30 - d.SD30;
          d.Boll30_1U = d.MA30 + d.SD30;
          tmp.push(d);
        });
      });
    const data = tmp.sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return a.stock < b.stock ? -1 : 1;
    });
    this.setState({
      data: group(data, d => d.date, d => d.stock),
      dataByDate: group(data, d => d.date),
      dataByStock: group(data, d => d.stock)
    });
  }

  async fetchStock(stock) {
    this.postProcess(await this.query(`
      SELECT * from stocks
      WHERE (stock='${stock}' OR stock='SPY')
      AND date BETWEEN '${d3.timeFormat('%Y-%m-%d')(this.state.startDate)}'
      AND '${d3.timeFormat('%Y-%m-%d')(this.state.endDate)}'`
    ));
  }

  async fetchStocks() {
    this.postProcess(await this.query(`
      SELECT * from stocks
      WHERE date BETWEEN '${d3.timeFormat('%Y-%m-%d')(this.state.startDate)}'
      AND '${d3.timeFormat('%Y-%m-%d')(this.state.endDate)}'`
    ));
  }

  async strategy1() {
    // investment strategy1 based on ma5 and ma30
    await this.fetchStock(this.state.stockSimulate);
    const ratio =
      this.state.accountStart / this.state.dataByStock.get('SPY')[0].price;
    let out = {};
    this.toArray(this.state.dataByStock.get(this.state.stockSimulate) || {})
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
        let shares = i > 0 ? Object.assign({}, prev.shares) : { total: 0 };
        if (d.MA5BuyFlag && d.cash > d.price) {
          const buy = Math.floor(d.cash / d.price);
          d.cash -= buy * d.price;
          shares.total += buy;
          shares[this.state.stockSimulate] =
            shares[this.state.stockSimulate]
              ? shares[this.state.stockSimulate] + buy
              : buy;
        }
        if (d.MA5SellFlag && shares[this.state.stockSimulate] > 0) {
          d.cash += shares[this.state.stockSimulate] * d.price;
          shares.total -= shares[this.state.stockSimulate];
          shares[this.state.stockSimulate] = 0;
        }
        d.shares = shares;
        d.positions = d3.sum(Object.entries(d.shares)
          .filter(([k, v]) => k != 'total')
          .map(([k, v]) => v * this.state.data.get(d.date).get(k)[0].price));
        d.account = d.cash + d.positions;
        d.accountSPY =
          this.state.data.get(d.date).get('SPY')[0].price
            ? ratio * this.state.data.get(d.date).get('SPY')[0].price
            : 0;
        return d;
      })
      .forEach(d => out[d.date] = d);
    this.setState({
      stockSelection: [ this.state.stockSimulate ],
      stockSelected: this.state.stockSimulate
    });
    return out;
  }

  async strategy2() {
    // investment strategy1 based on ma5 and ma30
    await this.fetchStock(this.state.stockSimulate);
    const ratio =
      this.state.accountStart / this.state.dataByStock.get('SPY')[0].price;
    let out = {};
    this.toArray(this.state.dataByStock.get(this.state.stockSimulate) || {})
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
        let shares = i > 0 ? Object.assign({}, prev.shares) : { total: 0 };
        if (d.MA5BuyFlag && d.cash > d.price) {
          const buy = Math.floor(d.cash / d.price);
          d.cash -= buy * d.price;
          shares.total += buy;
          shares[this.state.stockSimulate] =
            shares[this.state.stockSimulate]
              ? shares[this.state.stockSimulate] + buy
              : buy;
        }
        if (d.MA5SellFlag && shares[this.state.stockSimulate] > 0) {
          d.cash += shares[this.state.stockSimulate] * d.price;
          shares.total -= shares[this.state.stockSimulate];
          shares[this.state.stockSimulate] = 0;
        }
        d.shares = shares;
        d.positions = d3.sum(Object.entries(d.shares)
          .filter(([k, v]) => k != 'total')
          .map(([k, v]) => v * this.state.data.get(d.date).get(k)[0].price));
        d.account = d.cash + d.positions;
        d.accountSPY =
          this.state.data.get(d.date).get('SPY')[0].price
            ? ratio * this.state.data.get(d.date).get('SPY')[0].price
            : 0;
        return d;
      })
      .forEach(d => out[d.date] = d);
    this.setState({
      stockSelection: [ this.state.stockSimulate ],
      stockSelected: this.state.stockSimulate
    });
    return out;
  }

  async strategy3() {
    await this.fetchStocks();
    const ratio =
      this.state.accountStart / this.state.dataByStock.get('SPY')[0].price;
    let out = {};
    let curr = {
      cash: this.state.accountStart,
      account: this.state.accountStart,
      positions: 0,
      data: new Map(),
      shares: { total: 0 }
    };
    this.state.dataByDate
      .forEach((stocks, date) => {
        const prev = curr;
        curr = Object.assign({}, prev, { date: date, time: d3.timeParse('%Y-%m-%d')(date) });
        curr.data = new Map([...prev.data, ...this.state.data.get(date)]);
        curr.shares = Object.assign({}, prev.shares);
        let data = curr.data;
        let shares = curr.shares;
        Object.entries(shares)
          .forEach(
            ([k, v]) => {
              if (k == 'total') return;
              const stock = data.get(k)[0];
              if (v > 0 && stock.price > stock.MA5) {
                curr.cash += v * stock.price;
                shares.total -= v;
                shares[k] = 0;
              }
            }
          );
        const buySelection =
          stocks.reduce((acc, stock) => {
            if (stock.price <= 0) return acc;
            const diff = (stock.Boll20_1L - stock.price) / stock.price;
            return diff > 0
              ? acc.concat([{ diff: diff, stock: stock }])
              : acc;
          }, [])
            .sort((a, b) => a.diff - b.diff);
        buySelection.forEach(
          d => {
            if (d.stock.price <= 0) return;
            const buy = Math.floor((curr.cash / buySelection.length) / d.stock.price);
            curr.cash -= buy * d.stock.price;
            shares.total += buy;
            shares[d.stock.stock] =
              shares[d.stock.stock]
                ? shares[d.stock.stock] + buy
                : buy;
          }
        );
        curr.positions = d3.sum(Object.entries(shares)
          .filter(([k, v]) => k != 'total')
          .map(([k, v]) => v * data.get(k)[0].price));
        curr.account = curr.cash + curr.positions;
        curr.accountSPY =
          data.get('SPY')[0].price
            ? ratio * data.get('SPY')[0].price
            : 0;
        out[date] = curr;
      })
    const stocks = Object.keys(curr.shares).sort();
    this.setState({
      stockSelection: stocks,
      stockSelected: stocks[0]
    });
    return out;
  }

  async strategy4() {
    await this.fetchStocks();
    const ratio =
      this.state.accountStart / this.state.dataByStock.get('SPY')[0].price;
    let out = {};
    let curr = {
      cash: this.state.accountStart,
      account: this.state.accountStart,
      positions: 0,
      data: new Map(),
      shares: { total: 0 }
    };
    this.state.dataByDate
      .forEach((stocks, date) => {
        const prev = curr;
        curr = Object.assign({}, prev, { date: date, time: d3.timeParse('%Y-%m-%d')(date) });
        curr.data = new Map([...prev.data, ...this.state.data.get(date)]);
        curr.shares = Object.assign({}, prev.shares);
        let data = curr.data;
        let shares = curr.shares;
        Object.entries(shares)
          .forEach(
            ([k, v]) => {
              if (k == 'total') return;
              const stock = data.get(k)[0];
              if (v > 0 && stock.price > stock.MA5) {
                curr.cash += v * stock.price;
                shares.total -= v;
                shares[k] = 0;
              }
            }
          );
        const buySelection =
          stocks.reduce((acc, stock) => {
            if (stock.price <= 0) return acc;
            const diff = (stock.Boll30_1L - stock.price) / stock.price;
            return diff > 0
              ? acc.concat([{ diff: diff, stock: stock }])
              : acc;
          }, [])
            .sort((a, b) => a.diff - b.diff);
        buySelection.forEach(
          d => {
            if (d.stock.price <= 0) return;
            const buy = Math.floor((curr.cash / buySelection.length) / d.stock.price);
            curr.cash -= buy * d.stock.price;
            shares.total += buy;
            shares[d.stock.stock] =
              shares[d.stock.stock]
                ? shares[d.stock.stock] + buy
                : buy;
          }
        );
        curr.positions = d3.sum(Object.entries(shares)
          .filter(([k, v]) => k != 'total')
          .map(([k, v]) => v * data.get(k)[0].price));
        curr.account = curr.cash + curr.positions;
        curr.accountSPY =
          data.get('SPY')[0].price
            ? ratio * data.get('SPY')[0].price
            : 0;
        out[date] = curr;
      })
    const stocks = Object.keys(curr.shares).sort();
    this.setState({
      stockSelection: stocks,
      stockSelected: stocks[0]
    });
    return out;
  }

  async runSimulation()
  {
    const strategies = {
      'strategy1': this.strategy1.bind(this),
      'strategy2': this.strategy2.bind(this),
      'strategy3': this.strategy3.bind(this),
      'strategy4': this.strategy4.bind(this)
    };

    const dataAccount = await strategies[this.state.strategy]();
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

    const first = accountArray[0] || { accountSPY: 1 };
    const last = accountArray[accountArray.length - 1] || {
      account: 0,
      accountSPY: 0
    };
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
    const selectStyle = {
      control: (provided) => ({
        ...provided,
        fontSize: '0.8em',
        minHeight: '1.6em',
        borderRadius: '0.2em'
      }),
      valueContainer: (provided) => ({
        ...provided,
        padding: '0.1em 0.4em'
      }),
      menu: (provided) => ({
        ...provided,
        margin: '0.4em 0',
        borderRadius: '0.2em'
      }),
      option: (provided) => ({
        ...provided,
        fontSize: '0.8em',
        padding: '0.4em 0.6em',
        color: 'black'
      }),
      dropdownIndicator: (provided) => ({
        ...provided,
        height: '1.6em',
        padding: '0.4em'
      }),
      noOptionsMessage: (provided) => ({
        ...provided,
        fontSize: '0.8em',
        padding: '0.4em 0.6em'
      }),
      container: (provided) => ({
        ...provided,
        width: '10vmin'
      })
    };
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
                onStockChanged={(stock) => this.setState({ stockSimulate: stock })}
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
                keys={['account', 'positions', 'accountSPY']}
                names={['Account value', 'Positions', 'S&P500 value']}
                format='$.0f'
              />
            </Row>
            <Row className='header'>
              <div style={{ alignItems: 'center' }}>
                <div style={{ display: 'inline-flex' }}>
                  <Select
                    styles={selectStyle}
                    options={this.state.stockSelection.map(stock => ({ value: stock, label: stock }))}
                    value={{ value: this.state.stockSelected, label: this.state.stockSelected }}
                    onChange={e => this.setState({ stockSelected: e.value })}
                  />
                </div>&nbsp;Shares Held
              </div>
            </Row>
            <Row style={{ height: 'calc(25vh - 3em)' }}>
              <TimeLineChart
                data={this.state.dataAccount && this.toArray(this.state.dataAccount).map(d => Object.assign({ time: d.time }, d.shares))}
                keys={[this.state.stockSelected]}
                names={['Shares']}
                format='.0f'
              />
            </Row>
            <Row className='header'>
              <div style={{ alignItems: 'center' }}>
                <div style={{ display: 'inline-flex' }}>
                  <Select
                    styles={selectStyle}
                    options={this.state.stockSelection.map(stock => ({ value: stock, label: stock }))}
                    value={{ value: this.state.stockSelected, label: this.state.stockSelected }}
                    onChange={e => this.setState({ stockSelected: e.value })}
                  />
                </div>&nbsp;Stock Price
              </div>
            </Row>
            <Row style={{ height: 'calc(50vh - 4em)' }}>
              <TimeLineChart
                data={
                  this.state.dataByStock
                    && this.state.stockSelected
                    && this.state.dataByStock.get(this.state.stockSelected)}
                keys={[
                  'price',
                  'MA5',
                  'MA10',
                  'MA20',
                  'MA30',
                  'Boll20_1L',
                  'Boll30_1L'
                ]}
                names={[
                  'Stock price',
                  '5-day SMA',
                  '10-day SMA',
                  '20-day SMA',
                  '30-day SMA',
                  'BB N=20 K=1 (L)',
                  'BB N=30 K=1 (L)'
                ]}
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
