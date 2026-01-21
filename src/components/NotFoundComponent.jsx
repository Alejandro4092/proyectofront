import React, { Component } from 'react'
import notfound from '../assets/images/notfound.jpg' 
import '../css/NotFound.css'

export class NotFoundComponent extends Component {
  render() {
    return (
      <div className='notfound'>
        <img src={notfound} alt="404 Not Found" />
      </div>
    )
  }
}

export default NotFoundComponent