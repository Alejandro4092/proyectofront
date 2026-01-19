import React, { Component } from 'react'
import { AuthContext } from '../context/AuthContext'
import '../css/PerfilComponent.css'

export class PerfilComponent extends Component {
  static contextType = AuthContext;

  render() {
    const { usuario } = this.context;

    if (!usuario) {
      return (
        <div className="perfil-container">
          <div className="perfil-error">
            <h2>No hay información de usuario disponible</h2>
            <p>Por favor, inicia sesión para ver tu perfil.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="perfil-container">
        <div className="perfil-card">
          <div className="perfil-header">
            <h1>Mi Perfil</h1>
          </div>
          
          <div className="perfil-content">
            <div className="perfil-imagen-section">
              {usuario.imagen ? (
                <img 
                  src={usuario.imagen} 
                  alt={`${usuario.nombre} ${usuario.apellidos}`}
                  className="perfil-imagen"
                />
              ) : (
                <div className="perfil-imagen-placeholder">
                  <span className="perfil-initials">
                    {usuario.nombre && usuario.nombre.charAt(0)}
                    {usuario.apellidos && usuario.apellidos.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="perfil-info">
              <div className="perfil-info-item">
                <label>Nombre</label>
                <p>{usuario.nombre || 'No especificado'}</p>
              </div>

              <div className="perfil-info-item">
                <label>Apellidos</label>
                <p>{usuario.apellidos || 'No especificado'}</p>
              </div>

              <div className="perfil-info-item">
                <label>Email</label>
                <p>{usuario.email || 'No especificado'}</p>
              </div>

              <div className="perfil-info-item">
                <label>Rol</label>
                <p className="perfil-rol">{usuario.role || 'No especificado'}</p>
              </div>

              <div className="perfil-info-item">
                <label>Curso</label>
                <p>{usuario.curso || 'No especificado'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="actividades-card">
          <div className="actividades-header">
            <h2>Mis Actividades</h2>
          </div>
          <div className="actividades-content">
            <div className="actividad-item">
              <div className="actividad-icon">🏃</div>
              <div className="actividad-info">
                <h3>Running Club</h3>
                <p className="actividad-fecha">Inscrito desde: 15/01/2026</p>
                <span className="actividad-badge activo">Activo</span>
              </div>
            </div>

            <div className="actividad-item">
              <div className="actividad-icon">⚽</div>
              <div className="actividad-info">
                <h3>Fútbol Sala</h3>
                <p className="actividad-fecha">Inscrito desde: 10/12/2025</p>
                <span className="actividad-badge activo">Activo</span>
              </div>
            </div>

            <div className="actividad-item">
              <div className="actividad-icon">🏀</div>
              <div className="actividad-info">
                <h3>Baloncesto</h3>
                <p className="actividad-fecha">Inscrito desde: 20/11/2025</p>
                <span className="actividad-badge activo">Activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default PerfilComponent