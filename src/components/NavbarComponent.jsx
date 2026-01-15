import axios from 'axios'
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import '../css/NavbarComponent.css'
import tajamarLogo from '../assets/images/logo-tajamar-blanco-01.png'


export class NavbarComponent extends Component {
    state = {
        rol: ""
    }


    componentDidMount = () => {

    }

    render() {
        return (
            <nav className="navbar navbar-expand-lg custom-navbar">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">
                        <img src={tajamarLogo} alt="Tajamar" className="navbar-logo" />
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll" aria-controls="navbarScroll" aria-expanded="false" aria-label="   Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarScroll">
                        <ul className="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll">
                            <li className="nav-item">
                                <NavLink className="nav-link" aria-current="page" to="/">Home</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/eventos">Eventos</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/pagos">Pagos</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/partidos">Partidos</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/materialesSolicitados">Materiales solicitados</NavLink>
                            </li>
                            {this.state.rol == "Profesor" || this.state.rol == "Admin" && 
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/alumnos">Alumnos</NavLink>
                                </li>
                            }
                        </ul>
                        <div className="d-flex align-items-center">
                            <NavLink to="/perfil" style={{ textDecoration: 'none' }}>
                                <div className="user-profile">
                                    <div className="user-icon">
                                        <img src="https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_640.png" alt="User" />
                                    </div>
                                    <span className="user-name">Pablo</span>
                                </div>
                            </NavLink>
                        </div>
                    </div>
                </div>
            </nav>
        )
    }
}

export default NavbarComponent