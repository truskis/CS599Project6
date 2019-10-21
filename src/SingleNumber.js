import './App.css';
import React, { Component } from 'react'
import { Container, Row, Col } from 'react-grid-system';

class SingleNumber extends Component {
    render() {
        return <div className="App-singleNumber">
                <Container>
                <Row className='App-numberHeader'>
                    <Col> {this.props.header}</Col>
                </Row>
                <Row className= {this.props.value < 0 ? 'App-numberValueNeg' :'App-numberValuePos' }>
                    <Col> {this.props.value}</Col>
                </Row>
                </Container>
            </div>
     }
  }
  export default SingleNumber