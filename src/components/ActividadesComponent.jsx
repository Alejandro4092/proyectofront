import React, { Component } from 'react'
import Global from '../Global';
import { NavLink } from 'react-router-dom'
import axios from 'axios'
import '../css/Actividades.css'


export class ActividadesComponent extends Component {
    url = Global.apiDeportes;
    state = {
        actividades: [],
        mostrarModal: false,
        actividadSeleccionada: null,
        esCapitan: false,
        usuarioActividades: []
    };
    loadActividades = () => {
    let request = "api/Actividades/ActividadesEvento/" + this.props.idEvento;
    axios.get(this.url + request).then((response) => {
        console.log("Leyendo actividades");
        this.setState({
            actividades: response.data,
        });
        });
    };

    loadUsuarioActividades = () => {
        this.loadUsuarioActividades();
        let request = "api/UsuariosDeportes/ActividadesUsuario";
        axios.get(this.url + request).then((response) => {
            console.log("Actividades del usuario:", response.data);
            this.setState({
                usuarioActividades: response.data
            });
        });
    };
    componentDidMount = () => {
        this.loadActividades();
    };

    abrirModal = (actividad) => {
        this.setState({
            mostrarModal: true,
            actividadSeleccionada: actividad,
        });
    };

    cerrarModal = () => {
        this.setState({
            mostrarModal: false,
            actividadSeleccionada: null,
            esCapitan: false,
        });
    };

    postInscripcion= (e) => {
        e.preventDefault();
        console.log('Inscripción enviada para:', this.state.actividadSeleccionada);
        console.log('Es capitán:', this.state.esCapitan);
        this.cerrarModal();
    };
    render() {
    return (
        <div className="actividades-wrapper">
            <div className="actividades-head">
                <h1 className="actividades-title">Actividades</h1>
            </div>

            <div className="actividades-grid">
                {this.state.actividades.map((actividad) => (
                    <NavLink 
                        to={`/equipos/${actividad.idEvento}/${actividad.idActividad}`}
                        key={actividad.idEventoActividad}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <article className="actividad-card">
                            <div className="actividad-title">{actividad.nombreActividad}</div>
                            <div className="actividad-fecha">{actividad.fechaEvento}</div>
                            <p className="actividad-desc">
                                Mínimo de jugadores: {actividad.minimoJugadores}
                            </p>
                            <div className="actividad-tags">
                                <span className="chip chip-primary">Posición: {actividad.posicion}</span>
                                <button 
                                    className="btn-inscribirse" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        this.abrirModal(actividad);
                                    }}
                                    disabled={this.state.usuarioActividades.some(ua => ua.idActividad === actividad.idActividad)}
                                >
                                    {this.state.usuarioActividades.some(ua => ua.idActividad === actividad.idActividad) ? 'Inscrito' : 'Inscribirse'}
                                </button>
                            </div>
                        </article>
                    </NavLink>
                ))}
            </div>
            {this.state.mostrarModal && (
                <div className="modal-overlay" onClick={this.cerrarModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={this.cerrarModal}>&times;</button>
                        <h2>Inscribirse en {this.state.actividadSeleccionada?.nombreActividad}</h2>
                        
                        <form onSubmit={this.postInscripcion}>
                            <div className="form-group">
                                <label className="custom-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={this.state.esCapitan}
                                        onChange={(e) => this.setState({ esCapitan: e.target.checked })}
                                    />
                                    <span className="slider"></span>
                                    <span className="label-text">¿Quieres ser capitán?</span>
                                </label>
                            </div>
                            
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={this.cerrarModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-submit">
                                    Confirmar inscripción
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}        </div>
        )
    }
}

export default ActividadesComponent