import React, { Component } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import Global from '../Global'
import '../css/CrearEventoComponent.css'

export class CrearEventoComponent extends Component {
  constructor(props) {
    super(props);
    this.url = Global.apiDeportes;
    this.state = {
      fecha: '',
      mensaje: null
    };
  }

  // POST: Crea un nuevo evento
  createEvento = (fecha) => {
    // Convertir fecha a formato ISO
    const fechaFormato = new Date(fecha).toISOString();
    let request = "api/Eventos/create/" + encodeURIComponent(fechaFormato) + "?datofecha=" + encodeURIComponent(fechaFormato);
    axios.post(this.url + request).then(response => {
      this.setState({
        mensaje: 'Evento creado exitosamente'
      });
      setTimeout(() => {
        this.props.navigate('/eventos');
      }, 1500);
    });
  }

  // PUT: Modifica un evento
  updateEvento = (evento) => {
    let request = "api/Eventos/update";
    axios.put(this.url + request, evento).then(response => {
      this.setState({
        mensaje: 'Evento actualizado exitosamente'
      });
      setTimeout(() => {
        this.props.navigate('/eventos');
      }, 1500);
    });
  }

  handleChange = (e) => {
    this.setState({
      fecha: e.target.value
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.fecha) {
      this.createEvento(this.state.fecha);
    }
  }

  render() {
    const { fecha, mensaje } = this.state;

    return (
      <div className="crear-evento-container">
        <div className="crear-evento-wrapper">
          <div className="crear-evento-header">
            <h1>Crear Nuevo Evento</h1>
            <Link to="/eventos" className="btn-volver">← Volver</Link>
          </div>

          {mensaje && (
            <div className="mensaje-exito">
              {mensaje}
            </div>
          )}

          <form onSubmit={this.handleSubmit} className="evento-form">
            <div className="form-group">
              <label htmlFor="fecha">Fecha del Evento *</label>
              <input
                type="datetime-local"
                id="fecha"
                value={fecha}
                onChange={this.handleChange}
                required
                className="form-input"
              />
              <small className="form-help">Selecciona la fecha y hora del evento</small>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-crear"
              >
                Crear Evento
              </button>
              <Link to="/eventos" className="btn-cancelar">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

// Wrapper funcional para usar useNavigate
export function CrearEventoWrapper() {
  const navigate = useNavigate();
  return <CrearEventoComponent navigate={navigate} />;
}

export default CrearEventoWrapper
