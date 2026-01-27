import React, { Component } from 'react'
import axios from 'axios'
import { Link, NavLink } from 'react-router-dom'
import Global from '../Global'
import { AuthContext } from '../context/AuthContext'
import Swal from 'sweetalert2'
import '../css/EventosComponent.css'
import EventosService from '../services/EventosService'

const serviceEventos = new EventosService();
export class EventosComponent extends Component {
  static contextType = AuthContext;

  url = Global.apiDeportes;
  state = {
    eventos: [],
    eventosCursoEscolar: [],
    eventoById: null,
    loading: false
  };

  componentDidMount() {
    this.loadEventosCursoEscolar();
  }

  // GET: Obtiene eventos del curso escolar
  loadEventosCursoEscolar = () => {
    let token = this.context.token;
    serviceEventos.getEventosCursoEscolar(token)
      .then(data => {
        this.setState({
          eventosCursoEscolar: data
        });
      })
      .catch(error => {
        console.error('Error al cargar eventos:', error);
      });
  }

  // DELETE: Elimina un evento con confirmación
  deleteEvento = (id) => {
    Swal.fire({
      title: '¿Eliminar evento?',
      text: '¿Estás seguro de que deseas eliminar este evento?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.confirmarEliminar(id);
      }
    });
  }

  confirmarEliminar = (id) => {
    if (!this.context.logeado) {
      Swal.fire({
        title: 'No has iniciado sesión',
        text: 'Debes iniciar sesión para eliminar un evento',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    let token = this.context.token;
    serviceEventos.eliminarEvento(id, token)
      .then(data => {
        Swal.fire({
          title: 'Eliminado',
          text: 'Evento eliminado exitosamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        this.loadEventosCursoEscolar();
      })
      .catch(error => {
        Swal.fire({
          title: 'Error',
          text: error.response?.status === 403 
            ? 'No tienes permisos para eliminar este evento. Verifica que tu usuario tenga rol de administrador.' 
            : 'Error al eliminar el evento: ' + (error.response?.data || error.message),
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
      });
  }

  formatearFecha = (fecha) => {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
  }

  render() {
    const { eventosCursoEscolar } = this.state;

    return (
      <div className="eventos-container">
        <div className="eventos-header">
          <h1>Eventos</h1>
          <NavLink to="/crear-evento" className="btn-crear-evento">
            + Crear Evento
          </NavLink>
        </div>

        <div className="eventos-grid">
          {eventosCursoEscolar && eventosCursoEscolar.length > 0 ? (
            eventosCursoEscolar.map((evento) => (
              <NavLink 
                to={`/actividades/${evento.idEvento}`} 
                key={evento.idEvento} 
                className="evento-card"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="evento-card-header">
                  <h3>Evento #{evento.idEvento}</h3>                 
                </div>
                <div className="evento-card-body">
                  <div className="evento-info">
                    <p className="evento-label">Fecha:</p>
                    <p className="evento-valor">{this.formatearFecha(evento.fechaEvento)}</p>
                  </div>              
                </div>
                <div className="evento-card-footer">
                  <NavLink to={`/editar-evento/${evento.idEvento}`} className="btn-editar" onClick={(e) => e.stopPropagation()}>Editar</NavLink>
                  <button 
                    className="btn-eliminar"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      this.deleteEvento(evento.idEvento);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </NavLink>
            ))
          ) : (
            <div className="no-eventos">
              <p>No hay eventos disponibles</p>
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default EventosComponent