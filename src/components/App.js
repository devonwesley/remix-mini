import React, { Component } from 'react'
// import './App.css'
import { Appbar, Button, Container, Option, Select} from 'muicss/react';

// TODO:
    // - write function that creates options, should be a list of available versions of solidity for compiler: https://www.muicss.com/docs/v1/react/select
    // -

export default class App extends Component {
  render() {
    return (
      <Appbar>
        <Container>
          <Select>
            <Option id="versions" value="option1" label="Option 1" />
          </Select>
        </Container>
      </Appbar>
    )
  }
}
