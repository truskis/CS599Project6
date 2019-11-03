import './../App.css';
import React, { Component } from 'react'
import { Container, Row, Col } from 'react-grid-system';

class SingleNumber extends Component {
  render() {
    return <div className='singleNumber'>
      <div className='header'>{this.props.header}</div>
      <div
        className={
          this.props.value < 0
            ? 'numberValue negative'
            : 'numberValue positive'
        }
      >
        {this.props.value}
      </div>
    </div>
  }
}

export default SingleNumber
