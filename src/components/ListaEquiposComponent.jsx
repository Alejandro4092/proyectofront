import React, { Component } from 'react'
import Global from '../Global.js';
import axios from 'axios';
import Equipo from './EquipoComponent.jsx';
import { NavLink } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../css/ListaEquiposComponent.css';
import EquiposService from '../services/EquiposService.js';
import AuthContext from '../context/AuthContext.js';
import CapitanService from '../services/CapitanService.js';
import ActividadesService from '../services/ActividadesService.js';
import PartidosService from '../services/PartidosService.js';

const serviceEquipos = new EquiposService();
const serviceCapitan = new CapitanService();
const serviceActividades = new ActividadesService();
const servicePartidos = new PartidosService();
export class ListaEquiposComponent extends Component {
    url = Global.apiDeportes
    static contextType = AuthContext;
    

    state = {
        equipos: [],
        capitan: {},
        eresCapitan: false,
        // Formulario de resultados
        mostrarFormularioResultado: false,
        formularioResultado: {
            idEquipoLocal: '',
            idEquipoVisitante: '',
            puntosLocal: 0,
            puntosVisitante: 0
        },
        guardandoResultado: false,
        mensajeExitoResultado: '',
        mensajeErrorResultado: '',
        equiposPrueba: [
            {
                "idEquipo": 4444,
                "idEventoActividad": 1,
                "nombreEquipo": "pruebaPablo",
                "minimoJugadores": 4,
                "idColor": 1,
                "idCurso": 3430
            },
            {
                "idEquipo": 1,
                "idEventoActividad": 1,
                "nombreEquipo": "Equipo2",
                "minimoJugadores": 5,
                "idColor": 3,
                "idCurso": 3430
            },
            {
                "idEquipo": 5000,
                "idEventoActividad": 2,
                "nombreEquipo": "Equipo3",
                "minimoJugadores": 4,
                "idColor": 1,
                "idCurso": 3430
            },
            {
                "idEquipo": 6000,
                "idEventoActividad": 3,
                "nombreEquipo": "pruebaEQUIPO4",
                "minimoJugadores": 10,
                "idColor": 2,
                "idCurso": 3440
            },

        ]
    }

    componentDidMount = async () => {
        await this.loadEquipos();
        await this.findCapitan();
    }

    getEventoActividad = async () => {
        try {
            return await serviceActividades.getEventoActividad(this.props.idEvento, this.props.idActividad);
        } catch (error) {
            console.error("Error al obtener el id:", error);
            throw error;
        }
    }

    findCapitan = async () => {
        
        if (!this.context.token) return;
        let idEventoActividad = await this.getEventoActividad();
        
        let token = this.context.token;
        try {
            const capitan = await serviceCapitan.getCapitanEventoActividad(idEventoActividad, token);
            
            let esCapi = false;
            if(capitan.idUsuario == this.context.usuario.idUsuario){
                esCapi = true;
            }
            this.setState({
                capitan: capitan,
                eresCapitan: esCapi
            });
        } catch (error) {
            console.error('Error al verificar capitán:', error);
        }
    

    }

    loadEquipos = async () => {
        let idActividad = this.props.idActividad;
        let idEvento = this.props.idEvento;
        serviceEquipos.getEquiposActividad(idActividad, idEvento).then(data =>{
            this.setState({
                equipos: data
            })
        })
    }

    eliminarEquipo = (e, idEquipo, nombreEquipo) => {
        e.preventDefault(); // Evitar que el NavLink navegue
        e.stopPropagation(); // Evitar que se propague al NavLink

        if (!this.context.logeado) {
            Swal.fire({
                title: 'No has iniciado sesión',
                text: 'Debes iniciar sesión para eliminar un equipo',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el equipo "${nombreEquipo}"? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                let token = this.context.token;
                serviceEquipos.eliminarEquipo(idEquipo, token)
                    .then(data => {
                        Swal.fire(
                            '¡Eliminado!',
                            'El equipo ha sido eliminado correctamente.',
                            'success'
                        );
                        // Recargar la lista de equipos
                        this.loadEquipos();
                    })
                    .catch(error => {
                        console.error("Error al eliminar equipo:", error);
                        Swal.fire(
                            'Error',
                            error.response?.status === 404
                                ? 'El equipo no fue encontrado.'
                                : 'No se pudo eliminar el equipo. Inténtalo de nuevo.',
                            'error'
                        );
                    });
            }
        });
    }

    abrirFormularioResultado = () => {
        this.setState({
            mostrarFormularioResultado: true,
            formularioResultado: {
                idEquipoLocal: '',
                idEquipoVisitante: '',
                puntosLocal: 0,
                puntosVisitante: 0
            },
            mensajeExitoResultado: '',
            mensajeErrorResultado: ''
        });
    }

    cerrarFormularioResultado = () => {
        this.setState({
            mostrarFormularioResultado: false,
            formularioResultado: {
                idEquipoLocal: '',
                idEquipoVisitante: '',
                puntosLocal: 0,
                puntosVisitante: 0
            },
            mensajeExitoResultado: '',
            mensajeErrorResultado: ''
        });
    }

    handleInputResultadoChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            formularioResultado: {
                ...this.state.formularioResultado,
                [name]: value
            }
        });
    }

    guardarResultado = async (e) => {
        e.preventDefault();

        const { idEquipoLocal, idEquipoVisitante, puntosLocal, puntosVisitante } = this.state.formularioResultado;

        // Validaciones
        if (!idEquipoLocal || !idEquipoVisitante) {
            this.setState({ mensajeErrorResultado: 'Debes seleccionar ambos equipos' });
            setTimeout(() => this.setState({ mensajeErrorResultado: '' }), 1500);
            return;
        }

        if (idEquipoLocal === idEquipoVisitante) {
            this.setState({ mensajeErrorResultado: 'Los equipos deben ser diferentes' });
            setTimeout(() => this.setState({ mensajeErrorResultado: '' }), 1500);
            return;
        }

        try {
            this.setState({ guardandoResultado: true });

            const idEventoActividad = await this.getEventoActividad();

            const partidoResultado = {
                idEventoActividad: idEventoActividad,
                idEquipoLocal: parseInt(idEquipoLocal),
                idEquipoVisitante: parseInt(idEquipoVisitante),
                puntosLocal: parseInt(puntosLocal),
                puntosVisitante: parseInt(puntosVisitante)
            };

            await servicePartidos.createPartidoResultado(partidoResultado, this.context.token);

            this.setState({ 
                mensajeExitoResultado: 'Resultado guardado correctamente',
                guardandoResultado: false
            });

            setTimeout(() => {
                this.cerrarFormularioResultado();
            }, 1500);

        } catch (error) {
            console.error('Error al guardar resultado:', error);
            this.setState({ 
                mensajeErrorResultado: 'Error al guardar el resultado',
                guardandoResultado: false
            });
            setTimeout(() => this.setState({ mensajeErrorResultado: '' }), 1500);
        }
    }


render() {
    return (
        <div className='equipos-container'>
            <div className='equipos-header'>
                <h1>Equipos</h1>
                <h1 className='capitan-info'>
                    Capitán: <span className='capitan-nombre'>{this.state.capitan.usuario}</span>
                </h1>
                <div className='equipos-actions'>
                    {
                        this.state.eresCapitan && 
                        <>
                            <button
                                className='btn-crear-resultado'
                                onClick={this.abrirFormularioResultado}
                            >
                                ⚽ Crear Resultado
                            </button>
                            <NavLink
                                to={`/crear-equipo/${this.props.idEvento}/${this.props.idActividad}`}
                                className='btn-crear-equipo'
                            >
                                + Crear Equipo
                            </NavLink>
                        </>
                    }
                </div>
            </div>
            <div className='equipos-grid'>
                {
                    this.state.equipos.map((equipo, index) => {
                        return (
                            <NavLink
                                key={index}
                                to={"/equipo/" + equipo.idEquipo}
                                className='equipo-link'
                            >
                                <div className='cardEquipo'>
                                    <h1>{equipo.nombreEquipo}</h1>
                                    <h2>Mínimo de Jugadores: {equipo.minimoJugadores}</h2>
                                    {
                                        this.state.eresCapitan != false &&
                                        <button 
                                            className='btn-eliminar-equipo'
                                            onClick={(e) => this.eliminarEquipo(e, equipo.idEquipo, equipo.nombreEquipo)}
                                        >
                                            🗑️ Eliminar
                                        </button>

                                    }
                                </div>
                            </NavLink>
                        )
                    })
                }
            </div>

            {/* Modal formulario de resultados */}
            {this.state.mostrarFormularioResultado && (
                <div className="equipos-modal-overlay" onClick={this.cerrarFormularioResultado}>
                    <div className="equipos-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="equipos-modal-close" onClick={this.cerrarFormularioResultado}>
                            &times;
                        </button>
                        <h2>Crear Resultado de Partido</h2>

                        {this.state.mensajeExitoResultado && (
                            <div className="mensaje-exito">{this.state.mensajeExitoResultado}</div>
                        )}

                        {this.state.mensajeErrorResultado && (
                            <div className="mensaje-error">{this.state.mensajeErrorResultado}</div>
                        )}

                        <form onSubmit={this.guardarResultado}>
                            <div className="equipos-form-row">
                                <div className="equipos-form-group">
                                    <label htmlFor="equipoLocal">Equipo Local *</label>
                                    <select
                                        id="equipoLocal"
                                        name="idEquipoLocal"
                                        value={this.state.formularioResultado.idEquipoLocal}
                                        onChange={this.handleInputResultadoChange}
                                        required
                                    >
                                        <option value="">Selecciona equipo local</option>
                                        {this.state.equipos
                                            .filter(equipo => equipo.idEquipo !== parseInt(this.state.formularioResultado.idEquipoVisitante))
                                            .map((equipo) => (
                                                <option key={equipo.idEquipo} value={equipo.idEquipo}>
                                                    {equipo.nombreEquipo}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="equipos-form-group">
                                    <label htmlFor="puntosLocal">Puntos Local *</label>
                                    <input
                                        type="number"
                                        id="puntosLocal"
                                        name="puntosLocal"
                                        value={this.state.formularioResultado.puntosLocal}
                                        onChange={this.handleInputResultadoChange}
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="equipos-form-row">
                                <div className="equipos-form-group">
                                    <label htmlFor="equipoVisitante">Equipo Visitante *</label>
                                    <select
                                        id="equipoVisitante"
                                        name="idEquipoVisitante"
                                        value={this.state.formularioResultado.idEquipoVisitante}
                                        onChange={this.handleInputResultadoChange}
                                        required
                                    >
                                        <option value="">Selecciona equipo visitante</option>
                                        {this.state.equipos
                                            .filter(equipo => equipo.idEquipo !== parseInt(this.state.formularioResultado.idEquipoLocal))
                                            .map((equipo) => (
                                                <option key={equipo.idEquipo} value={equipo.idEquipo}>
                                                    {equipo.nombreEquipo}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="equipos-form-group">
                                    <label htmlFor="puntosVisitante">Puntos Visitante *</label>
                                    <input
                                        type="number"
                                        id="puntosVisitante"
                                        name="puntosVisitante"
                                        value={this.state.formularioResultado.puntosVisitante}
                                        onChange={this.handleInputResultadoChange}
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="equipos-modal-actions">
                                <button
                                    type="button"
                                    className="equipos-btn-cancel"
                                    onClick={this.cerrarFormularioResultado}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="equipos-btn-submit"
                                    disabled={this.state.guardandoResultado}
                                >
                                    {this.state.guardandoResultado ? 'Guardando...' : 'Guardar Resultado'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
}

export default ListaEquiposComponent