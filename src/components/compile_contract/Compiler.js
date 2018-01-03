import React, {Component} from 'react'
import sampleContracts from './sample_contracts'

const compileTitle = {fontSize: '25px', fontWeight: 'bold'}
const textAreaOptions = {height: '360px', width: '600px', display: 'block', marginLeft: '20px'} 

export default class Compiler extends Component {
  constructor(props) {
    super(props)
    this.state = {sampleContracts}

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event) {
    this.setState({sampleContracts: event.target.value})
  }

  render() {
    return (
      <div className="mui-col-md-7">
        <div className="mui-panel">
          <p style={compileTitle}>
            Compile Contract
          </p>
          <textarea 
            id="source" 
            style={textAreaOptions}
            value={this.state.sampleContracts}
            onChange={this.handleChange}
            >
          </textarea>
          <button className="mui-btn mui-btn--primary">
            Compile
          </button>
        </div>
      </div>
    )
  }
}