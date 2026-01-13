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
      loading: false
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

  // DELETE: Elimina un evento
  deleteEvento = (id) => {
    let request = "api/Eventos/" + id;
    axios.delete(this.url + request).then(response => {
      this.loadEventosCursoEscolar();
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
          <Link to="/crear-evento" className="btn-crear-evento">
            + Crear Evento
          </Link>
        </div>

        <div className="eventos-grid">
          {eventosCursoEscolar && eventosCursoEscolar.length > 0 ? (
            eventosCursoEscolar.map((evento) => (
              <div key={evento.idEvento} className="evento-card">
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
                  <button className="btn-editar">Ver Detalles</button>
                </div>
              </div>
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