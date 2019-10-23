import DatePicker from 'react-datepicker'
import './../App.css';
import React, { Component } from 'react'
import "react-datepicker/dist/react-datepicker.css";
import { Container, Row, Col } from 'react-grid-system';

class DatePickerStock extends Component {

  state = {
    startDate : new Date("2009/01/01"),
    endDate : new Date("2009/12/31")
  };

    render() {
      const { startDate } = this.state;
      const { endDate } = this.state;
        return (
          <div style={{ display: 'inline-block' }}>
          <Container fluid className='datePickerContainer'>
          <Row justify="center" className='App-numberHeader' >
            Time range
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
              onChange={this.handleChange} 
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
                onChange={this.handleChange} 
                selectsEnd
                endDate={endDate}
                minDate={startDate}
                maxDate={new Date("2009/12/31")}
              />
              </Col>
            </Row>
            <Row >
              <Col>
            <button className='button'>Start Simulation</button>
            </Col>
            </Row>
          </Container>
        </div>
        );
     }

     handleChange = startDate => {
      this.setState({
        startDate
      });
    };

      handleChange = endDate => {
        this.setState({
         endDate
        });
    };
  }
  export default DatePickerStock
