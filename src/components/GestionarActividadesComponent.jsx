import React, { Component } from 'react'
import Global from '../Global';
import { Link, Navigate } from 'react-router-dom'
import axios from 'axios'
import '../css/GestionarActividadesComponent.css'
import AuthContext from '../context/AuthContext';
import Swal from 'sweetalert2';
import ActividadesService from '../services/ActividadesService';

const serviceActividades = new ActividadesService();

export class GestionarActividadesComponent extends Component {
    static contextType = AuthContext;

    url = Global.apiDeportes;
    state = {
        actividadesDisponibles: [],
        actividadesAsociadas: [],
        actividadSeleccionada: '',
        loading: false,
        redirectToHome: false
    };

    componentDidMount = () => {
        // Verificar que el usuario sea organizador
        if (!this.context.esOrganizador) {
            this.setState({ redirectToHome: true });
            return;
        }
        this.loadActividadesDisponibles();
        this.loadActividadesAsociadas();
    };

    loadActividadesDisponibles = () => {
        let token = this.context.token;
        serviceActividades.getActividades(token)
            .then(data => {
                this.setState({
                    actividadesDisponibles: data,
                });
            })
            .catch(error => {
                console.error('Error al cargar actividades disponibles:', error);
            });
    };

    loadActividadesAsociadas = () => {
        serviceActividades.getActividadesEvento(this.props.idEvento)
            .then(data => {
                this.setState({
                    actividadesAsociadas: data,
                });
            })
            .catch(error => {
                console.error('Error al cargar actividades asociadas:', error);
            });
    };

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    asociarActividad = async (e) => {
        e.preventDefault();

        if (!this.state.actividadSeleccionada) {
            Swal.fire({
                icon: 'warning',
                title: 'Selección requerida',
                text: 'Por favor, selecciona una actividad'
            });
            return;
        }

        let token = this.context.token;
        const idEvento = parseInt(this.props.idEvento);
        const idActividad = parseInt(this.state.actividadSeleccionada);

        this.setState({ loading: true });

        try {
            await serviceActividades.asociarEventoActividad(idEvento, idActividad, token);

            Swal.fire({
                icon: 'success',
                title: '¡Actividad asociada!',
                text: 'La actividad se ha asociado correctamente al evento',
                timer: 2000,
                showConfirmButton: false
            });

            this.setState({
                actividadSeleccionada: '',
                loading: false
            });

            this.loadActividadesAsociadas();
        } catch (error) {
            this.setState({ loading: false });
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data || 'Error al asociar la actividad'
            });
        }
    };

    eliminarActividad = async (idEventoActividad, nombreActividad) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la actividad "${nombreActividad}" de este evento?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            let token = this.context.token;

            try {
                await serviceActividades.eliminarEventoActividad(idEventoActividad, token);

                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminada!',
                    text: 'La actividad se ha eliminado del evento',
                    timer: 2000,
                    showConfirmButton: false
                });

                this.loadActividadesAsociadas();
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data || 'Error al eliminar la actividad'
                });
            }
        }
    };

    render() {
        if (this.state.redirectToHome) {
            return <Navigate to="/" replace />;
        }

        return (
            <div className="gestionar-actividades-container">
                <div className="gestionar-actividades-wrapper">
                    <div className="gestionar-actividades-header">
                        <h1>Gestionar Actividades del Evento</h1>
                        <Link to={`/actividades/${this.props.idEvento}`} className="ga-btn-volver">
                            Volver
                        </Link>
                    </div>

                    <div className="gestionar-actividades-content">
                        {/* Formulario para asociar actividades */}
                        <div className="asociar-actividad-section">
                            <h2>Asociar Nueva Actividad</h2>
                            <form onSubmit={this.asociarActividad} className="form-asociar">
                                <div className="form-group">
                                    <label htmlFor="actividadSeleccionada">Actividad</label>
                                    <select
                                        id="actividadSeleccionada"
                                        name="actividadSeleccionada"
                                        value={this.state.actividadSeleccionada}
                                        onChange={this.handleChange}
                                        className="form-control"
                                        required
                                    >
                                        <option value="">Selecciona una actividad</option>
                                        {this.state.actividadesDisponibles.map((actividad) => (
                                            <option key={actividad.idActividad} value={actividad.idActividad}>
                                                {actividad.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button 
                                    type="submit" 
                                    className="ga-btn-asociar"
                                    disabled={this.state.loading}
                                >
                                    {this.state.loading ? 'Asociando...' : 'Asociar Actividad'}
                                </button>
                            </form>
                        </div>

                        {/* Lista de actividades asociadas */}
                        <div className="actividades-asociadas-section">
                            <h2>Actividades Asociadas</h2>
                            {this.state.actividadesAsociadas.length === 0 ? (
                                <p className="no-actividades">No hay actividades asociadas a este evento</p>
                            ) : (
                                <div className="actividades-lista">
                                    {this.state.actividadesAsociadas.map((actividad) => (
                                        <div key={actividad.idEventoActividad} className="actividad-item">
                                            <div className="actividad-info">
                                                <h3>{actividad.nombreActividad}</h3>
                                            </div>
                                            <button
                                                className="ga-btn-eliminar"
                                                onClick={() => this.eliminarActividad(
                                                    actividad.idEventoActividad,
                                                    actividad.nombreActividad
                                                )}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default GestionarActividadesComponent;
