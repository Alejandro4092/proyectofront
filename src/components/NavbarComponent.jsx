import React, { Component } from 'react'
import { NavLink, Navigate } from 'react-router-dom'
import '../css/NavbarComponent.css'
import tajamarLogo from '../assets/images/logo-tajamar-blanco-01.png'
import { AuthContext } from '../context/AuthContext'


export class NavbarComponent extends Component {
    static contextType = AuthContext;
    
    state = {
        dropdownOpen: false,
        redirectToLogin: false
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
        this.setState({ dropdownOpen: false, redirectToLogin: true });
    }

    render() {
        // Obtener datos del contexto
        const { usuario, rol, logeado } = this.context;

        // Redirigir al login después de cerrar sesión
        if (this.state.redirectToLogin) {
            return <Navigate to="/login" replace />;
        }

        return (
            <nav className="navbar navbar-expand-lg custom-navbar">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">
                        <NavLink to="/">
                            <img src={tajamarLogo} alt="Tajamar" className="navbar-logo" />
                        </NavLink>
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll" aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarScroll">
                        <ul className="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll">
                            <li className="nav-item">
                                <NavLink className="nav-link" aria-current="page" to="/">
                                    <span className="nav-icon">🏠</span>
                                    <span>Home</span>
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/eventos">
                                    <span className="nav-icon">📅</span>
                                    <span>Eventos</span>
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/pagos">
                                    <span className="nav-icon">💰</span>
                                    <span>Pagos</span>
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/partidos">
                                    <span className="nav-icon">⚽</span>
                                    <span>Partidos</span>
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/materialesSolicitados">
                                    <span className="nav-icon">📦</span>
                                    <span>Materiales</span>
                                </NavLink>
                            </li>
                            {(rol === "Profesor" || rol === "Admin") && 
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/alumnos">
                                        <span className="nav-icon">👥</span>
                                        <span>Alumnos</span>
                                    </NavLink>
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
                                        <div className="dropdown-header">
                                            <div className="user-icon-dropdown">
                                                <img src={usuario?.imagen || "https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_640.png"} alt="User" />
                                            </div>
                                            <span className="user-name-dropdown">{usuario?.nombre}</span>
                                            <span className="dropdown-arrow-small">▼</span>
                                        </div>
                                        <NavLink to="/perfil" className="dropdown-item-button" onClick={() => this.setState({ dropdownOpen: false })}>
                                            <span>👤 Mi Perfil</span>
                                        </NavLink>
                                        <div className="dropdown-item-button" onClick={this.cerrarSesion}>
                                            <span>🚪 Cerrar Sesión</span>
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