import React, {Component} from 'react';
import './App.css';
import BarChartHistagram from './BarChartHistagram';
import TimeLineChart from './Stocks/TimeLineChart';
import {csv} from 'd3';
import * as d3 from "d3";
import SingleNumber from './SingleNumber'


class App extends Component {

 constructor()
 {
   super();
   this.state = { data : [["",10], ["",20], ["",30]], dataSold : [], stockdata: [], histArray: [], test:0}
 }


  async componentDidMount() {

  

  const data2  = await csv('./redfin_2019-09-30-Bellevue-sold.csv');
  let  dataSold = [];

  data2.forEach(d => 
    {
      var singleData = 
      {
         yearBuilt:'0',
         baths:'0',
         daysOnMarket:'0'
      };
      singleData.yearBuilt = +d["YEAR BUILT"];
      singleData.baths = +d["BATHS"];
      singleData.daysOnMarket = +d["DAYS ON MARKET"];

      if (singleData.baths > 0 && singleData.daysOnMarket > 0)
        dataSold.push(singleData);

    });
    this.setState({ dataSold: dataSold })

    //data3
  const data3  = await csv('./AAP.csv');
  let  stockdata = [];
  var  ma=[];
  let  _account=100000;
  let  _cash=100000;
  let  _share=0;
  var  accountArray=[];
  var  histArray=[];

  data3.forEach(d => 
    {
      var singleData = 
      {
         Price:'0',
         Volume:'0',
         MA5:'0',
         MA10:'0',
         MA20:'0',
         MA30:'0',        
         MA5BuyFlag:false,
         MA5SellFlag:false,
         account:_account,
         cash:_cash,
         share:_share,
         hist:'0',
      };
       
      singleData.Date = d3.timeParse("%m/%d/%Y")(d["Date"]);
      singleData.Price = +d["Adjusted_close"];
      singleData.Volume = +d["Volume"];      
      ma.push(singleData.Price);

      singleData.MA5=ma.reduce(function(sum, d, i) {        
        if(ma.length<5) return 0.0;  
        var j=ma.length-5;
        if(i>=j)     
        { 
          return sum+d;   
        }     
        return 0;
      }, 0);
      singleData.MA5=singleData.MA5/5.0;

      singleData.MA10=ma.reduce(function(sum, d, i) {        
        if(ma.length<10) return 0.0;  
        var j=ma.length-10;
        if(i>=j)     
        { 
          return sum+d;   
        }     
        return 0;
      }, 0);
      singleData.MA10=singleData.MA10/10.0;

      singleData.MA20=ma.reduce(function(sum, d, i) {        
        if(ma.length<20) return 0.0;  
        var j=ma.length-20;
        if(i>=j)     
        { 
          return sum+d;   
        }     
        return 0;
      }, 0);
      singleData.MA20=singleData.MA20/20.0;

      singleData.MA30=ma.reduce(function(sum, d, i) {        
        if(ma.length<30) return 0.0;  
        var j=ma.length-30;
        if(i>=j)     
        { 
          return sum+d;   
        }     
        return 0;
      }, 0);
      singleData.MA30=singleData.MA30/30.0;

      
      singleData.MA5BuyFlag=ma.reduce(function(flag,d,i) {
        if(i>=30 && ma[i]<ma[i-1] && ma[i-1]<ma[i-2]
          && singleData.MA10>singleData.MA5 
          )
          flag=true;
        else
          flag=false;
        return flag;
      },false);

      singleData.MA5SellFlag=ma.reduce(function(flag,d,i) {
        if(i>=30 && ma[i]>ma[i-1] && ma[i-1]>ma[i-2]
          && singleData.MA10<singleData.MA5 
          )
          flag=true;
        else
          flag=false;
        return flag;
      },false);

      if(singleData.MA5BuyFlag && singleData.cash>singleData.Price)
      {
        var share=Math.floor(singleData.cash/singleData.Price);
        singleData.cash=singleData.cash-share*singleData.Price;
        singleData.share=singleData.share+share;
        _share=singleData.share;         
        _cash=singleData.cash;
        console.log("buy stocks Date: ",singleData.Date," Cash=",_cash," Share=",_share);           
      }

      if(singleData.MA5SellFlag && singleData.share>0)
      {        
        singleData.cash=singleData.cash+singleData.share*singleData.Price;
        _cash=singleData.cash;
        singleData.share=0;
        _share=singleData.share;
        console.log("sell stocks Date: ",singleData.Date," Cash=",_cash," Share=",_share);
      }
      singleData.cash=_cash;
      singleData.share=_share;
      singleData.account=singleData.cash+singleData.share*singleData.Price;
      accountArray.push(singleData.account);

      singleData.hist= accountArray.reduce(function(diff, d, i) {        
        if(accountArray.length<2) return 0.0;  
        var j=accountArray.length-1;
        if(i===j-1)     
        { 
          diff=-d;   
        }     
        else if(i===j)
        {
          diff=d/diff-1;
        }
        return Math.round(diff*100);
      }, 0);

      histArray.push(singleData.hist);

      if (singleData.Price>0)
      {
        stockdata.push(singleData);
        singleData.account=singleData.cash+singleData.share*singleData.Price;
        // console.log("Date=",singleData.Date,
        //             " Account=",singleData.account,
        //             " Cash=",singleData.cash,
        //             " Share=",singleData.share,
        //             " Price=",singleData.Price,
        //             //" ma=",JSON.stringify(ma),
        //             //" MA5=",singleData.MA5," MA10=",singleData.MA10,
        //             //" MA20=",singleData.MA20," MA30=",singleData.MA30,
        //             " Buy=",singleData.MA5BuyFlag,
        //             " Sell=",singleData.MA5SellFlag);     
      }
      

    });

    // Update all the information to be displayed
    this.setState({
      stockdata: stockdata,
      histArray: histArray,
       startingMoney : 100000,
       endingMoney : 160000,
       percentangeGain :   100000 /  160000,
       averagePercentagegain : 0.15,
       standardDeviation : 9.00,
       percetangeGainOfSPY : -0.14,
       MaxDrawdownPercentage : 0.1,
       sharpeRadio : -0.3
     })
  }
  render()
  {

  return (
    <div className='App'>
      <div id="divLineChart"  className='Chart'>
        <div className='App-header'>
          <h4>Histagram of daily gains/losses</h4>
        </div>
            {<BarChartHistagram data= {this.state.histArray} size={[800,500]}/>}
      </div>

      <div className='Chart'>
        <div className='App-header'>
          <h4>Stock Account of AAP</h4>
        </div>
            {<TimeLineChart data= {this.state.stockdata} size={[800,500]} yAxis={"account"}/>}
      </div>
      <div>
      <SingleNumber header='Starting Money' value={this.state.startingMoney}/>
      <SingleNumber header='Ending Money' value={this.state.endingMoney}/>
      <SingleNumber header='Percentage gain' value={this.state.percentangeGain}/>
      <SingleNumber header='Avg yearly percetange gain' value={this.state.averagePercentagegain}/>
      <SingleNumber header='Standard deviation' value={this.state.standardDeviation}/>
      <SingleNumber header='Percentage gain of SPY ' value={this.state.percetangeGainOfSPY}/>
      <SingleNumber header='Max drawdown percentage' value={this.state.MaxDrawdownPercentage}/>
      <SingleNumber header='Sharpe Ratio' value={this.state.sharpeRadio}/>
    </div>
    </div>
  );
  }
}

export default App;
