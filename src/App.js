import React, {Component} from 'react';
import './App.css';
import BarChart from './BarChart';
import ScatterChart from './Pages/ScatterChart';
import {csv} from 'd3';


class App extends Component {

 constructor()
 {
   super();
   this.state = { data : [["",10], ["",20], ["",30]], dataSold : []}
 }

 ChartVisibility ()
 {
  let bBarChart = true;
  let bScatterChart = true;

  if (!bBarChart)
  {
     document.getElementById("divBarChart").style.display = "none";
  }
  
  if (!bScatterChart)
  {
     document.getElementById("divScatterChart").style.display = "none";
  }

 }
 GetDecade (year)
 {
     if( year < 1930)
    return 0; //"1920";
    if( year < 1940)
    return 1//"1930s";
    if( year < 1950)
    return 2//"1940s";
    if( year < 1960)
    return 3//"1950s";
    if( year < 1970)
    return 4//"1960s";
    if( year < 1980)
    return 5//"1970s";
    if( year < 1990)
    return 6//"1980s";
    if( year < 2000)
    return 7//"1990s";
    if( year < 2010)
    return 8//"2000s";

    return 9//"2010s";
 }
  async componentDidMount() {

  this.ChartVisibility();

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

  }
  render()
  {

  return (
    <div className='App'>

      <div id="divBarChart">
        <div className='App-header'>
          <h4>Average house price in Bellevue</h4>
        </div>
        <div>
          {<BarChart data= {this.state.data} size={[850,600]}/>}
        </div>
     </div>

     <div id="divScatterChart">
      <div className='App-header'>
        <h4>Houses with 2-3 bathrooms sell fastest!</h4>
      </div>
        <div className='Chart'>
          {<ScatterChart data= {this.state.dataSold} size={[500,500]}/>}
        </div>
      </div>

    </div>
  );
  }
}

export default App;
