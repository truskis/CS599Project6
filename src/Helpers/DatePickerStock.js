import DatePicker from 'react-datepicker'
import './../App.css';
import React, { Component } from 'react'
import "react-datepicker/dist/react-datepicker.css";
import { Container, Row, Col } from 'react-grid-system';
import Select from 'react-select';

const strategyOptions = [
  { value: 'strategy1', label: 'strategy1' },
  { value: 'strategy2', label: 'strategy2' },
  // { value: 'strategy3', label: 'strategy3' },
  // { value: 'strategy4', label: 'strategy4' }
];

class DatePickerStock extends Component {

  constructor (props) {
    super(props)
    this.state = {
      startDate : new Date("2009/01/01"),
      endDate : new Date("2009/12/31")
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
        return (
          <div style={{ margin: '15px 15px 15px 35px'}}>
          <Container fluid className='datePickerContainer'>
          <Row justify="center" className='App-numberHeader' >
            Configuration
            </Row>
            <Row style={{ margin: '12px 0px 12px 0px' }}>
              <Col  justify="center" >
              Starting Date
              </Col>
              <Col  justify="center" >
              Ending Date
              </Col>
            </Row>
            <Row>
              <Col justify="center" >
              <DatePicker
              className='datePicker'
              selected={startDate}
              onChange={this.handleStartChange} 
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date("2009/01/01")}
            />
              </Col>
               {/* ToDo:Change the date */}
              <Col  justify="center" >
              <DatePicker
                className='datePicker'
                selected={endDate}
                onChange={this.handleEndChange} 
                selectsEnd
                endDate={endDate}
                minDate={startDate}
                maxDate={new Date("2019/10/11")}
              />
              </Col>
            </Row>
            <Row style={{ margin: '12px 0px 12px 0px' }}> 
              <Col >
            <Select 
              options={strategyOptions} 
              defaultValue={strategyOptions[0]}
              onChange={e => {
                this.props.onStrategyChanged(e.value);
                ;}} />
            {this.props.stockNames &&
              this.props.stockNames[0] &&
              <Select
                options={
                  this.props.stockNames
                    .map(stock => ({ value: stock, label: stock }))
                }
                defaultValue={
                  {
                    value: this.props.stockNames[0],
                    label: this.props.stockNames[0]
                  }
                }
                onChange={async e => this.props.onStockChanged(e.value)}
              />}
            </Col>
            </Row>
            <Row >
              <Col>
            <button className='button' onClick={this.props.onStartSimulation}>Start Simulation</button>
            </Col>
            </Row>
          </Container>
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
