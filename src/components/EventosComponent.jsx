import React, { Component } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Global from '../Global'
import '../css/EventosComponent.css'

export class EventosComponent extends Component {
  constructor(props) {
    super(props);
    this.url = Global.apiDeportes;
    this.state = {
      eventos: [],
      eventosCursoEscolar: [],
      eventoById: null,
      loading: false,
      eventoAEliminar: null
    };
  }

  componentDidMount() {
    this.loadEventosCursoEscolar();
  }

  // GET: Obtiene eventos del curso escolar
  loadEventosCursoEscolar = () => {
    let request = "api/Eventos/EventosCursoEscolar";
    axios.get(this.url + request).then(response => {
      this.setState({
        eventosCursoEscolar: response.data
      });
    });
  }

  // DELETE: Elimina un evento con confirmación
  deleteEvento = (id) => {
    this.setState({ eventoAEliminar: id });
  }

  confirmarEliminar = (id) => {
    let request = "api/Eventos/" + id;
    axios.delete(this.url + request).then(response => {
      this.setState({ eventoAEliminar: null });
      this.loadEventosCursoEscolar();
    });
  }

  cancelarEliminar = () => {
    this.setState({ eventoAEliminar: null });
  }

  formatearFecha = (fecha) => {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
  }

  render() {
    const { eventosCursoEscolar, eventoAEliminar } = this.state;

    return (
      <div className="eventos-container">
        <div className="eventos-header">
          <h1>Eventos</h1>
          <Link to="/crear-evento" className="btn-crear-evento">
            + Crear Evento
          </Link>
        </div>

        <div className="eventos-grid">
          {eventosCursoEscolar && eventosCursoEscolar.length > 0 ? (
            eventosCursoEscolar.map((evento) => (
              <Link 
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
                  <Link to={`/editar-evento/${evento.idEvento}`} className="btn-editar" onClick={(e) => e.stopPropagation()}>Editar</Link>
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
              </Link>
            ))
          ) : (
            <div className="no-eventos">
              <p>No hay eventos disponibles</p>
            </div>
          )}
        </div>

        {eventoAEliminar && (
          <div className="modal-overlay">
            <div className="modal-contenido">
              <h2>¿Eliminar evento?</h2>
              <p>¿Estás seguro de que deseas eliminar este evento?</p>
              <div className="modal-acciones">
                <button 
                  className="btn-confirmar-eliminar"
                  onClick={() => this.confirmarEliminar(eventoAEliminar)}
                >
                  Eliminar
                </button>
                <button 
                  className="btn-cancelar-modal"
                  onClick={this.cancelarEliminar}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default EventosComponent