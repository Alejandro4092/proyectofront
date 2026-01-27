import React, { Component } from 'react'
import Global from '../Global';
import { NavLink, Link } from 'react-router-dom'
import '../css/Actividades.css'
import AuthContext from '../context/AuthContext';
import Swal from 'sweetalert2';
import CapitanService from '../services/CapitanService';
import ActividadesService from '../services/ActividadesService';
import InscripcionesService from '../services/InscripcionesService';
import PrecioActividadService from '../services/PrecioActividadService';
const serviceCapitan = new CapitanService();
const serviceActividades = new ActividadesService();
const serviceInscripciones = new InscripcionesService();
const servicePrecioActividad = new PrecioActividadService();

export class ActividadesComponent extends Component {
    static contextType = AuthContext;

    url = Global.apiDeportes;
    state = {
        actividades: [],
        actividadesCapitan: [],
        actividadesInscritas: [],
        datosInscritos: [],
        mostrarModal: false,
        actividadSeleccionada: null,
        esCapitan: false,
        precios: [],
    };

    componentDidMount = async () => {
        await this.loadActividades();
        await this.checkCapitan();
        await this.loadActividadesInscritas();
        await this.loadPrecios();
    };

    loadActividades = () => {
        serviceActividades.getActividadesEvento(this.props.idEvento)
            .then(data => {
                console.log(data)
                this.setState({
                    actividades: data,
                });
            })
            .catch(error => {
                console.error('Error al cargar actividades:', error);
            });
    };

    checkCapitan = async () => {
        if (!this.context.token) return;

        let token = this.context.token;
        try {
            const capitanes = await serviceCapitan.getCapitanes(token);
            const actividadesCapitan = [];
            this.state.actividades.forEach(actividad => {
                capitanes.forEach(capitan => {
                    if (actividad.idEventoActividad == capitan.idEventoActividad) {
                        if (capitan.idUsuario == this.context.usuario.idUsuario) {
                            actividadesCapitan.push(actividad.idEventoActividad)
                        }
                    }
                });
            });
            this.setState({
                actividadesCapitan: actividadesCapitan
            });
        } catch (error) {
            console.error('Error al verificar capitán:', error);
        }
    };

    loadActividadesInscritas = async () => {
        if (!this.context.token) return;

        let token = this.context.token;
        try {
            const actividades = await serviceActividades.getActividadesUsuario(token);
            // Filtrar solo las actividades del evento actual
            const actividadesDelEvento = actividades.filter(
                act => act.idEvento === parseInt(this.props.idEvento)
            );
            const idsInscritas = actividadesDelEvento.map(act => act.idEventoActividad);
            this.setState({
                actividadesInscritas: idsInscritas,
                datosInscritos: actividadesDelEvento
            });
        } catch (error) {
            console.error('Error al cargar actividades inscritas:', error);
        }
    };

    esCapitanActividad = (idEventoActividad) => {
        return this.state.actividadesCapitan.includes(idEventoActividad);
    };

    estaInscrito = (idEventoActividad) => {
        return this.state.actividadesInscritas.includes(idEventoActividad);
    };

    estaInscritoEnEvento = () => {
        return this.state.actividadesInscritas.length > 0;
    };

    loadPrecios = async () => {
        try {
            const precios = await servicePrecioActividad.getPreciosActividades();
            this.setState({ precios });
        } catch (error) {
            console.error('Error al cargar precios:', error);
        }
    };

    getPrecioActividad = (idEventoActividad) => {
        const precio = this.state.precios.find(
            p => p.idEventoActividad === idEventoActividad
        );
        return precio?.precioTotal;
    };

    desinscribirse = async (idEventoActividad) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Deseas desinscribirte de esta actividad?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, desinscribirse',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                // Obtener todas las inscripciones y buscar la del usuario en esta actividad
                const todasInscripciones = await serviceInscripciones.obtenerInscripciones();
                const inscripcion = todasInscripciones.find(
                    ins => ins.idEventoActividad === idEventoActividad && 
                           ins.idUsuario === this.context.usuario.idUsuario
                );

                if (!inscripcion) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se encontró la inscripción'
                    });
                    return;
                }

                let token = this.context.token;
                await serviceInscripciones.desinscribirse(inscripcion.idInscripcion, token);

                Swal.fire({
                    icon: 'success',
                    title: '¡Desinscripción exitosa!',
                    text: 'Te has desinscrito correctamente de la actividad',
                    timer: 2000,
                    showConfirmButton: false
                });
                await this.loadActividadesInscritas();
                await this.checkCapitan();
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data || 'Error al desinscribirse. Por favor, intenta de nuevo.'
                });
            }
        }
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

        try {
            let token = this.context.token;
            await serviceInscripciones.inscribirse(
                this.state.actividadSeleccionada.idEventoActividad, 
                this.state.esCapitan, 
                token
            );
            Swal.fire({
                icon: 'success',
                title: '¡Inscripción exitosa!',
                text: 'Te has inscrito correctamente en la actividad',
                timer: 2000,
                showConfirmButton: false
            });
            await this.loadActividadesInscritas();
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
        console.log(this.context)
        return (
            <div className="actividades-wrapper">
                <div className="actividades-head">
                    <h1 className="actividades-title">Actividades</h1>
                    {this.context.esOrganizador && (
                        <div className="actividades-actions">
                            <Link to="/crear-actividad" className="btn-crear-evento">
                                + Crear Actividad
                            </Link>
                            <Link to={`/gestionar-actividades/${this.props.idEvento}`} className="btn-gestionar-actividades">
                                Gestionar Actividades
                            </Link>
                        </div>
                    )}
                </div>

                <div className="actividades-grid">
                    {this.state.actividades.map((actividad) => (
                        <NavLink
                            to={`/equipos/${actividad.idEvento}/${actividad.idActividad}`}
                            key={actividad.idEventoActividad}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <article className="actividad-card">
                                {this.getPrecioActividad(actividad.idEventoActividad) && (
                                    <div className="actividad-precio-badge">
                                        <span className="chip chip-precio">Precio: {this.getPrecioActividad(actividad.idEventoActividad)}€</span>
                                    </div>
                                )}
                                <div className="actividad-title">{actividad.nombreActividad}</div>
                                <div className="actividad-fecha">{actividad.fechaEvento}</div>
                                <p className="actividad-desc">
                                    Mínimo de jugadores: {actividad.minimoJugadores}
                                </p>
                                <div className="actividad-tags">
                                    <span className="chip chip-primary">Posición: {actividad.posicion}</span>
                                    {this.esCapitanActividad(actividad.idEventoActividad) && (
                                        <span className="chip chip-capitan">👑 Capitán</span>
                                    )}
                                    {this.estaInscrito(actividad.idEventoActividad) && (
                                        <span className="chip chip-inscrito">✓ Inscrito</span>
                                    )}
                                    {this.estaInscrito(actividad.idEventoActividad) ? (
                                        <button
                                            className="btn-desinscribirse"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                this.desinscribirse(actividad.idEventoActividad);
                                            }}
                                        >
                                            Desinscribirse
                                        </button>
                                    ) : !this.estaInscritoEnEvento() && (
                                        <button
                                            className="btn-inscribirse"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                this.abrirModal(actividad);
                                            }}
                                        >
                                            Inscribirse
                                        </button>
                                    )}
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