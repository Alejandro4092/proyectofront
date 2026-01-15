import axios from 'axios'
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import '../css/NavbarComponent.css'
import tajamarLogo from '../assets/images/logo-tajamar-blanco-01.png'


export class NavbarComponent extends Component {
    state = {
        rol: "",
        logeado: false,
        usuario: null,
        dropdownOpen: false
    }

    componentDidMount = () => {
        // Cargar el usuario desde localStorage
        this.cargarUsuario();

        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', this.handleClickOutside);
        
        // Escuchar evento de login
        window.addEventListener('usuarioLogueado', this.cargarUsuario);
    }

    componentWillUnmount = () => {
        document.removeEventListener('click', this.handleClickOutside);
        window.removeEventListener('usuarioLogueado', this.cargarUsuario);
    }

    cargarUsuario = () => {
        const usuarioString = localStorage.getItem('usuario');
        const token = localStorage.getItem('token');
        
        if (usuarioString && token) {
            const usuario = JSON.parse(usuarioString);
            this.setState({
                usuario: usuario,
                rol: usuario.role,
                logeado: true
            });
        } else {
            this.setState({
                usuario: null,
                rol: "",
                logeado: false
            });
        }
    }

    toggleDropdown = (e) => {
        e.stopPropagation();
        this.setState({ dropdownOpen: !this.state.dropdownOpen });
    }

    handleClickOutside = (e) => {
        if (this.state.dropdownOpen && !e.target.closest('.user-profile-container')) {
            this.setState({ dropdownOpen: false });
        }
    }

    cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        this.setState({
            usuario: null,
            rol: "",
            logeado: false,
            dropdownOpen: false
        });
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
                        {
                            this.state.logeado == false ?
                            <div className="login-button">
                                <NavLink to="/login">Login</NavLink>
                            </div>
                            :
                            <div className="d-flex align-items-center user-profile-container">
                                <div className="user-profile" onClick={this.toggleDropdown}>
                                    <div className="user-icon">
                                        <img src={this.state.usuario?.imagen || "https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_640.png"} alt="User" />
                                    </div>
                                    <span className="user-name">{this.state.usuario?.nombre}</span>
                                    <span className={`dropdown-arrow ${this.state.dropdownOpen ? 'open' : ''}`}>▼</span>
                                </div>
                                
                                {this.state.dropdownOpen && (
                                    <div className="user-dropdown">
                                        <NavLink to="/perfil" className="dropdown-item" onClick={() => this.setState({ dropdownOpen: false })}>
                                            <span>👤 Perfil</span>
                                        </NavLink>
                                        <div className="dropdown-divider"></div>
                                        <div className="dropdown-item" onClick={this.cerrarSesion}>
                                            <span>🚪 Cerrar sesión</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                        }
                    </div>
                </div>
            </nav>
        )
    }
}

export default NavbarComponent