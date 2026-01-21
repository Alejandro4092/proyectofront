import React, { Component } from 'react'
import Global from '../Global';
import { NavLink } from 'react-router-dom'
import axios from 'axios'
import '../css/Actividades.css'
import AuthContext from '../context/AuthContext';
import Swal from 'sweetalert2';


export class ActividadesComponent extends Component {
    static contextType = AuthContext;

    url = Global.apiDeportes;
    state = {
        actividades: [],
        mostrarModal: false,
        actividadSeleccionada: null,
        esCapitan: false,
    };
    loadActividades = () => {
        let request = "api/Actividades/ActividadesEvento/" + this.props.idEvento;
        axios.get(this.url + request).then((response) => {
            this.setState({
                actividades: response.data,
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

    inscribirse = async () => {
        let request = "api/UsuariosDeportes/InscribirmeEvento/"+this.state.actividadSeleccionada.idEventoActividad+"/"+this.state.esCapitan;
        //let request = "api/Inscripciones/create";
        
        
        if (!this.context.usuario || !this.context.usuario.idUsuario) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Debes iniciar sesión para inscribirte'
            });
            return;
        }
        
        if (!this.state.actividadSeleccionada || !this.state.actividadSeleccionada.idEventoActividad) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No hay actividad seleccionada'
            });
            return;
        }
        
        const datos = {
            idInscripcion: 0,
            idUsuario: this.context.usuario.idUsuario,
            idEventoActividad: this.state.actividadSeleccionada.idEventoActividad,
            quiereSerCapitan: this.state.esCapitan,
            fechaInscripcion: new Date().toISOString()
        };
        
        try {
            let token = this.context.token;
            console.log(token)
            const response = await axios.post(this.url + request, datos, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            Swal.fire({
                icon: 'success',
                title: '¡Inscripción exitosa!',
                text: 'Te has inscrito correctamente en la actividad',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            if (error.response?.status === 400) {
                const mensajeError = error.response?.data?.message || error.response?.data || "";
                
                if (mensajeError.includes("mismo Evento")) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'No puedes inscribirte',
                        text: 'Ya estás inscrito en otra actividad de este evento. Solo puedes participar en una actividad por evento.'
                    });
                } else if (mensajeError.includes("ya esta")) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Ya estás inscrito',
                        text: 'Ya estás inscrito en esta actividad.'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al inscribirse',
                        text: mensajeError
                    });
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al procesar la inscripción. Por favor, intenta de nuevo.'
                });
            }
        }
    }

    postInscripcion = async (e) => {
        e.preventDefault();
        await this.inscribirse();
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
                                    >
                                        Inscribirse
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