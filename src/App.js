import React, {Component} from 'react';
import './App.css';
import BarChartHistagram from './BarChartHistagram';
import TimeLineChart from './Stocks/TimeLineChart';
import {csv} from 'd3';
import * as d3 from "d3";
import SingleNumber from './Helpers/SingleNumber';
import DatePickerStock from './Helpers/DatePickerStock';
import moment from 'react-moment';
import DateTime from 'react-datetime';

class App extends Component {

 constructor()
 {
   super();
   this.state = { data : [["",10], ["",20], ["",30]], 
   dataSPY : [], 
   stockdata1: [], 
   stockdata3: [],
   stocksData: [[]], 
   histArray: [], 
   test:0, 
   startDate:d3.timeParse("%m/%d/%Y")("01/01/2009"),
   endDate:d3.timeParse("%m/%d/%Y")("12/31/2009")}

   let data3;
   let data2;
   let data4;
   let data1;
   this.onDateChanged = this.onDateChanged.bind(this);
   this.runSimulation = this.runSimulation.bind(this);
 }


//  onStartSimulation()
//  {
//    console.log("simulation satrted");
//   this.runSimulation();
//  }
 onDateChanged(newStartDate, newEndDate)
 {
  this.setState({
    startDate: newStartDate,
    endDate: newEndDate
  });
 }
  isdateValid(date)
  {
    if ((date< this.state.startDate ) ||(date> this.state.endDate ) )
    return false;

    return true;
  }

  async componentDidMount() {

  //load data
  this.data4  = await csv('./AAP.csv');
  this.data3  = await csv('./AAP.csv'); // single selection algorithm
  this.data2  = await csv('./SPY.csv'); // get SPY stock
  this.data1  = await csv('./AAP.csv'); // get one stock date, price,volumn


  this.runSimulation();

 
  }

  runSimulation( )
  {
  let  stockdata1 = [];
  let  dataSPY = [];
  let  stockdata3 = [];
  var  date=[];
  var  price=[];
  var  volume=[];
  var  ma=[];
  let  _accountStart=100000;
  let  _cash=100000;
  let  _share=0;
  let  _accountEnd=_accountStart;
  var  accountArray=[];
  var  dateArray=[];
  var  histArray=[];
  let  prevPrice=0;
  let  accountSum=0;
  var  SPYprice=[];
  var  vol=[];
  var  dateStart=new Date("3/2/2009");
  var  dateEnd=new Date('11/31/2009');

    let originalSPYPrice = +this.data2[0]["Adjusted_close"];
    let numberOfSPYs = _accountStart / originalSPYPrice;
    
    //single stock price,date and volume
    this.data1.forEach(d => 
      {
        var singleData = 
        {
           Date: '0',
           Price:'0',
           Volume:'0'          
        };
         
        singleData.Date = d3.timeParse("%m/%d/%Y")(d["Date"]);
        singleData.Price = +d["Adjusted_close"];
        singleData.Volume = +d["Volume"];  
       
        if (this.isdateValid(singleData.Date) && singleData.Price>0 )
        {
          stockdata1.push(singleData);
          //console.log("data1 Price: ",singleData.Price);
        }       
  
      });
      this.setState({ data1: stockdata1 })
    
    // SPY date,price,volume
    this.data2.forEach(d => 
      {
        var singleData = 
        {
           Price:'0'
           
        };
        singleData.Date = d3.timeParse("%m/%d/%Y")(d["Date"]);
  
        singleData.Price = +d["Adjusted_close"];
        singleData.account =  numberOfSPYs * singleData.Price;
  
        if (this.isdateValid(singleData.Date) && singleData.Price>0 )
        {
          dataSPY.push(singleData);
          SPYprice.push(singleData.Price);
        }
  
      });

      this.setState({ dataSPY: dataSPY })
  
    // investment1
    this.data3.forEach(d => 
      {
        var singleData = 
        {
           Date: '0',
           DateStr: '0',
           Price:'0',
           Volume:'0',
           MA5:'0',
           MA10:'0',
           MA20:'0',
           MA30:'0',        
           MA5BuyFlag:false,
           MA5SellFlag:false,
           accountStart:_accountStart,
           account:_accountStart,
           cash:_cash,
           share:_share,
           hist:'0',
           accountEnd:_accountStart,
        };
        
        singleData.Date = d3.timeParse("%m/%d/%Y")(d["Date"]);
        singleData.DateStr=d["Date"];
        singleData.Price = +d["Adjusted_close"];
        singleData.Volume = +d["Volume"];         
        
        if(singleData.Date.getTime()>=dateStart.getTime() 
          && singleData.Date.getTime()<=dateEnd.getTime())
        {
          console.log("found");
        

        ma.push(singleData.Price);
        vol.push(singleData.Volume);
  
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
            && vol[i]<vol[i-1]
            )
            flag=true;
          else
            flag=false;
          return flag;
        },false);
  
        singleData.MA5SellFlag=ma.reduce(function(flag,d,i) {
          if(i>=30 && ma[i]>ma[i-1] && ma[i-1]>ma[i-2]
            && singleData.MA10<singleData.MA5 
            && vol[i]>vol[i-1]
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
          //console.log("buy stocks Date: ",singleData.Date," Cash=",_cash," Share=",_share);           
        }
  
        if(singleData.MA5SellFlag && singleData.share>0)
        {        
          singleData.cash=singleData.cash+singleData.share*singleData.Price;
          _cash=singleData.cash;
          singleData.share=0;
          _share=singleData.share;
         // console.log("sell stocks Date: ",singleData.Date," Cash=",_cash," Share=",_share);
        }
        singleData.cash=_cash;
        singleData.share=_share;
        singleData.account=singleData.cash+singleData.share*singleData.Price;
        accountArray.push(singleData.account);
        dateArray.push(singleData.Date);
        _accountEnd=singleData.account;
        accountSum+=singleData.account;
  
        singleData.hist= accountArray.reduce(function(diff, d, i) {        
          if(accountArray.length<2) return 0.0;  
          var j=accountArray.length-1;
          if(i===j-1)     
          { 
            prevPrice=d;   
          }     
          else if(i===j)
          {
            diff=(d-prevPrice)/prevPrice;
          }
          return diff;
        }, 0);
  
  
  
        if (this.isdateValid(singleData.Date) && singleData.Price>0)
        {
          histArray.push(singleData.hist);
          stockdata3.push(singleData);
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
          //console.log('accountEnd=',singleData.accountEnd); 
        }
      }       
  
      });

      function standardDeviation(values){
        var avg = average(values);
        
        var squareDiffs = values.map(function(value){
          var diff = value - avg;
          var sqrDiff = diff * diff;
          return sqrDiff;
        });
        
        var avgSquareDiff = average(squareDiffs);
      
        var stdDev = Math.sqrt(avgSquareDiff)/_accountStart*100;
        return stdDev;
      }
      
      function average(data){
        var sum = data.reduce(function(sum, value){
          return sum + value;
        }, 0);
      
        var avg = sum / data.length;
        return avg;
      }    
  
    
      function drawDown(values)
      {
        var accountMaxIndex=0;
        var accountMax=values.reduce(function(accountMax,d,i)
        {
          if(accountMax<d)
            {
              accountMaxIndex=i;
              return d;
            }
          else
          {
            return accountMax;
          }
        },0);
      
        var accountMin=values.reduce(function(accountMin,d,i)
        {
          if(i>accountMaxIndex )
            {
              if(accountMin>d)
                return d;
              else
                return accountMin;
            }
          else
            return accountMax;
        },accountMax);
  
        var maxdrawDown= (accountMax-accountMin)/accountMax*100;

        console.log('accountMax= ',accountMax, ", accountMin= ", accountMin);
        
        return maxdrawDown.toFixed(1);
  
      }
  
      function yearlyGain(values)
      {
        //var range=(dateEnd.getTime()-dateStart.getTime())/(1000 * 3600 * 24);
        //var range=values.length();
        //if((dateEnd.getTime()-dateStart.getTime())/(1000 * 3600 * 24) <= 252)
        //return ((_accountEnd-_accountStart)/_accountStart*100).toFixed(1);
        // var countDay=values.reduce(function(countDay,d,i)
        // {
        //   countDay=countDay+1;
        // },0);
        var firstDayAccount=values[0];
        var lastDayAccount=values[0];
        var firstYear= dateArray[0].getFullYear();
        var lastYear=dateArray[dateArray.length-1].getFullYear();
        var gain=[];
        if(firstYear==lastYear)
        {
          return (accountArray[accountArray.length-1]-accountArray[0])/accountArray[0]*100;
        } 
        else
        {
          for(var i=0;i<values.length;i++)
          {
            
            if(i+1<values.length && dateArray[i].getFullYear()==firstYear+1)
            {
              lastDayAccount=accountArray[i];
              var yealygain=(lastDayAccount-firstDayAccount)/firstDayAccount*100;
              gain.push(yealygain);
              firstYear=firstYear+1;
              if(firstYear==lastYear)
              {
                var lastgain=(accountArray[accountArray.length-1]-accountArray[i+1])/accountArray[i+1]*100;
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
  
      function sharpeRatio()
      {
          var yearlygain=yearlyGain(accountArray);
          var yearlySd=standardDeviation(accountArray).toFixed(1);
          return ((yearlygain-0.035)/yearlySd).toFixed(1);
      }  
      
      // Update all the information to be displayed
      this.setState({
        stockdata3: stockdata3,
        histArray: histArray,
        startingMoney : _accountStart.toFixed(2),
        endingMoney : _accountEnd.toFixed(2),
        percentangeGain :   ((_accountEnd-_accountStart)/_accountStart*100).toFixed(1),
        averagePercentagegain : yearlyGain(accountArray).toFixed(1),
        standardDeviation : standardDeviation(accountArray).toFixed(1),
        percetangeGainOfSPY :((SPYprice[SPYprice.length-1]-SPYprice[0])/SPYprice[0]*100).toFixed(1),
        MaxDrawdownPercentage :drawDown(accountArray),
        sharpeRadio :sharpeRatio() 
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
            {<TimeLineChart data= {this.state.stockdata3} data2= {this.state.dataSPY} size={[800,500]} yAxis={"account"}/>}
      </div>
      <div>
      <DatePickerStock onDatePickedChanged={this.onDateChanged} onStartSimulation={this.runSimulation} />
      <SingleNumber header='Starting Money' value={'$'+ this.state.startingMoney}/>
      <SingleNumber header='Ending Money' value={'$'+this.state.endingMoney}/>
      <SingleNumber header='Percentage gain' value={this.state.percentangeGain +'%'}/>
      <SingleNumber header='Avg yearly percetange gain' value={this.state.averagePercentagegain +'%'}/>
      <SingleNumber header='Standard deviation' value={this.state.standardDeviation+'%'}/>
      <SingleNumber header='Percentage gain of SPY ' value={this.state.percetangeGainOfSPY +'%'}/>
      <SingleNumber header='Max drawdown percentage' value={this.state.MaxDrawdownPercentage +'%'}/>
      <SingleNumber header='Sharpe Ratio' value={this.state.sharpeRadio}/>
    </div>
    </div>
  );
  }
}

export default App;
