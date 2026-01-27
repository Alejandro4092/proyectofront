import axios from 'axios';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import Global from '../Global';
import '../css/LoginComponent.css';
import { AuthContext } from '../context/AuthContext';
import tajamarLogo from '../assets/images/logo-tajamar-blanco-01.png';

export class LoginComponent extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.url = Global.apiDeportes;
    this.state = {
      userName: '',
      password: '',
      loginSuccess: false,
      errorMessage: '',
      loading: false,
      showPassword: false
    };
  }

  componentDidUpdate(prevProps, prevState) {
    // Si el login fue exitoso, forzar recarga para actualizar toda la app
    if (this.state.loginSuccess && !prevState.loginSuccess) {
      window.location.href = '/eventos';
    }
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
      errorMessage: '' // Limpiar mensajes de error al escribir
    });
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    
    const { userName, password } = this.state;

    // Validación básica
    if (!userName || !password) {
      this.setState({ errorMessage: 'Por favor, completa todos los campos' });
      return;
    }

    this.setState({ loading: true, errorMessage: '' });

    // Concatenar el dominio al username
    const fullEmail = userName.includes('@') ? userName : `${userName}@tajamar365.com`;

    // Usar la función login del contexto
    const resultado = await this.context.login(fullEmail, password);

    if (resultado.success) {
      this.setState({
        loginSuccess: true,
        loading: false
      });
    } else {
      this.setState({
        errorMessage: resultado.error,
        loading: false,
        password: '' // Limpiar contraseña
      });
    }
  }

  render() {
    const { userName, password, loginSuccess, errorMessage, loading, showPassword } = this.state;
    const { logeado } = this.context;

    // Si ya está logueado desde antes (recarga de página), redirigir
    if (logeado && !loading) {
      return <Navigate to="/eventos" replace />;
    }

    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-illustration">
            <img src={tajamarLogo} alt="Tajamar Logo" />
          </div>
          
          <div className="login-content">
            <h1 className="login-title">Iniciar sesión</h1>

            <form onSubmit={this.handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="userName">
                  Correo educativo <span className="required">*</span>
                </label>
                <div className="email-input-group">
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    value={userName}
                    onChange={this.handleInputChange}
                    placeholder="username"
                    disabled={loading}
                    className="email-username"
                  />
                  <span className="email-domain">@tajamar365.com</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Contraseña <span className="required">*</span>
                </label>
                <div className="password-input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={this.handleInputChange}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={`toggle-password ${showPassword ? 'visible' : ''}`}
                    onClick={() => this.setState({ showPassword: !showPassword })}
                  >
                    👁
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="error-message">
                  {errorMessage}
                </div>
              )}

              <button 
                type="submit" 
                className="btn-login"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="register-link">
              ¿No tienes cuenta? <span className="link-text">Regístrate</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginComponent;
