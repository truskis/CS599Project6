import DatePicker from 'react-datepicker'
import './../App.css';
import React, { Component } from 'react'
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import AsyncSelect from 'react-select/async';

const strategyOptions = [
  { value: 'strategy1', label: 'Single stock 5d vs 10d SMA' },
  { value: 'strategy2', label: 'Single stock 5d vs 10d SMA & volume' },
  { value: 'strategy3', label: 'Buy < BB (N=20, K=1), sell > MA5' },
  { value: 'strategy4', label: 'Buy < BB (N=30, K=1), sell > MA5' }
];

class DatePickerStock extends Component {

  constructor (props) {
    super(props)
    this.state = {
      startDate : new Date("2009/01/01"),
      endDate : new Date("2009/12/31"),
      showStocks: true,
    };
    this.handleStartChange = this.handleStartChange.bind(this);
    this.handleEndChange = this.handleEndChange.bind(this);
  }
  handleStartChange(date)
  {
    this.setState({
           startDate:date,
         })
  

    this.props.onDatePickedChanged(date, this.state.endDate);
  }

  handleEndChange(date)
  {
    this.setState({
      endDate:date,
    })
  

this.props.onDatePickedChanged(this.state.startDate,date);
  }

    render() {
      const { startDate } = this.state;
      const { endDate } = this.state;
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
        padding: '0.4em 0.6em'
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
      })
    };
    return (
      <div className='datePickerContainer' width='100%'>
        <div className='header'>Configuration</div>
        <div style={{ marginTop: '0.3em' }}>
          <div style={{ width: '50%', display: 'inline-block' }}>
            <div>Starting Date</div>
            <DatePicker
              className='datePicker'
              selected={startDate}
              onChange={this.handleStartChange} 
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date("2009/01/01")}
            />
          </div>
          <div style={{ width: '50%', display: 'inline-block' }}>
            <div>Ending Date</div>
            <DatePicker
              className='datePicker'
              selected={endDate}
              onChange={this.handleEndChange} 
              selectsEnd
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date("2019/10/11")}
            />
          </div>
        </div>
        <div style={{ margin: '0.6em auto', width: '90%' }}>
          <Select
            styles={selectStyle}
            options={strategyOptions} 
            defaultValue={strategyOptions[0]}
            onChange={e => {
              this.props.onStrategyChanged(e.value);
              this.setState
              ({
               showStocks : e.value == 'strategy1' || e.value == 'strategy2'
              });
            }}
          />
          { this.state.showStocks ? 
          <AsyncSelect
            styles={selectStyle}
            defaultOptions
            loadOptions={() => new Promise(
              async resolve =>{ resolve((await this.props.stockNames)
                .map(stock => ({ value: stock, label: stock }
               )))
               document.getElementById("startButton").disabled = false;
                }
            )}
            onChange={e => 
              {this.props.onStockChanged(e.value)}}
          />
          : null}
          <button id="startButton"  className='button' onClick={this.props.onStartSimulation}>Start Simulation</button>
        </div>
      </div>
    );
  }

    //  handleChange = startDate => {
    //   this.setState({
    //     startDate
    //   });
    // };

    //   handleChange = endDate => {
    //     this.setState({
    //      endDate
    //     });
    // };
}

export default DatePickerStock
