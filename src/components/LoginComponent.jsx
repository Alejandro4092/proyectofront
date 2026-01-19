import axios from 'axios';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import Global from '../Global';
import '../css/LoginComponent.css';
import { AuthContext } from '../context/AuthContext';

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
      loading: false
    };
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

    // Usar la función login del contexto
    const resultado = await this.context.login(userName, password);

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
    const { userName, password, loginSuccess, errorMessage, loading } = this.state;

    // Redirigir al home después del login exitoso
    if (loginSuccess) {
      return <Navigate to="/" />;
    }

    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1>Iniciar Sesión</h1>
            <p>Accede a tu cuenta de eventos deportivos</p>
          </div>

          <form onSubmit={this.handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="userName">Usuario / Email</label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={userName}
                onChange={this.handleInputChange}
                placeholder="Ingresa tu email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={this.handleInputChange}
                placeholder="Ingresa tu contraseña"
                disabled={loading}
              />
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
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="login-info">
            <p className="info-title">Usuarios de prueba:</p>
            <p><strong>Admin:</strong> admin@tajamar365.com / 12345</p>
            <p><strong>Profesor:</strong> profesortest@tajamar365.com / 12345</p>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginComponent;
