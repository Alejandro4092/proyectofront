import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import '../css/NavbarComponent.css'
import tajamarLogo from '../assets/images/logo-tajamar-blanco-01.png'
import { AuthContext } from '../context/AuthContext'


export class NavbarComponent extends Component {
    static contextType = AuthContext;
    
    state = {
        dropdownOpen: false
    }

    componentDidMount = () => {
        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', this.handleClickOutside);
    }

    componentWillUnmount = () => {
        document.removeEventListener('click', this.handleClickOutside);
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
        // Usar la función del contexto para cerrar sesión
        this.context.cerrarSesion();
        this.setState({ dropdownOpen: false });
    }

    render() {
        // Obtener datos del contexto
        const { usuario, rol, logeado } = this.context;

        return (
            <nav className="navbar navbar-expand-lg custom-navbar">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">
                        <img src={tajamarLogo} alt="Tajamar" className="navbar-logo" />
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll" aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
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
                            {(rol === "Profesor" || rol === "Admin") && 
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/alumnos">Alumnos</NavLink>
                                </li>
                            }
                        </ul>
                        {
                            !logeado ?
                            <div className="login-button">
                                <NavLink to="/login">Login</NavLink>
                            </div>
                            :
                            <div className="d-flex align-items-center user-profile-container">
                                <div className="user-profile" onClick={this.toggleDropdown}>
                                    <div className="user-icon">
                                        <img src={usuario?.imagen || "https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_640.png"} alt="User" />
                                    </div>
                                    <span className="user-name">{usuario?.nombre}</span>
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