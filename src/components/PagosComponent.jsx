import React, { Component } from 'react'
import AuthContext from '../context/AuthContext';

export class PagosComponent extends Component {
    static contextType = AuthContext;
  
  render() {
    return (
      <div>PagosComponent</div>
    )
  }
}

export default PagosComponent