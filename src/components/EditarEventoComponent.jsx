import React, { Component } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import Global from '../Global'
import { AuthContext } from '../context/AuthContext'
import Swal from 'sweetalert2'
import '../css/CrearEventoComponent.css'

export class EditarEventoComponent extends Component {
  static contextType = AuthContext;

  url = Global.apiDeportes;
  state = {
    idEvento: null,
    fecha: '',
    mensaje: null,
    cargando: true,
    error: null
  };

  loadEvento = () => {
    let token = this.context.token;
    var idEvento = this.props.idEvento;
    var request = "api/Eventos/" + idEvento;
    axios.get(this.url + request, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(response => {
      const fechaEvento = new Date(response.data.fechaEvento);
      const fechaFormateada = fechaEvento.toISOString().slice(0, 16);
      this.setState({
        idEvento: idEvento,
        fecha: fechaFormateada,
        cargando: false
      });
    });
  }

  componentDidMount = () => {
    this.loadEvento();
  }

  // PUT: Modifica un evento
  updateEvento = () => {
    if (!this.context.logeado) {
      Swal.fire({
        title: 'No has iniciado sesión',
        text: 'Debes iniciar sesión para editar un evento',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    let token = this.context.token;
    const { idEvento, fecha } = this.state;
    const fechaFormato = new Date(fecha).toISOString();
    
    const eventoActualizado = {
      idEvento: parseInt(idEvento),
      fechaEvento: fechaFormato,
      idProfesor: 0
    };

    let request = "api/Eventos/update";
    axios.put(this.url + request, eventoActualizado, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(response => {
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
      this.updateEvento();
    }
  }

  render() {
    const { fecha, mensaje, cargando, error } = this.state;

    if (cargando) {
      return (
        <div className="crear-evento-container">
          <p>Cargando evento...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="crear-evento-container">
          <div className="mensaje-error">{error}</div>
          <Link to="/eventos" className="btn-volver">← Volver</Link>
        </div>
      );
    }

    return (
      <div className="crear-evento-container">
        <div className="crear-evento-wrapper">
          <div className="crear-evento-header">
            <h1>Editar Evento</h1>
            <Link to="/eventos" className="btn-volver">← Volver</Link>
          </div>

          {mensaje && (
            <div className="mensaje-exito">
              {mensaje}
            </div>
          )}

          {!mensaje && (
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
                <small className="form-help">Modifica la fecha y hora del evento</small>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-crear"
                >
                  Actualizar Evento
                </button>
                <Link to="/eventos" className="btn-cancelar">
                  Cancelar
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    )
  }
}

export function EditarEventoWrapper(props) {
  const navigate = useNavigate();
  return <EditarEventoComponent {...props} navigate={navigate} />;
}