import React, { Component } from 'react';
import axios from 'axios';
import Global from '../Global';
import '../css/PartidosComponent.css';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import EquiposService from '../services/EquiposService';
import PartidosService from '../services/PartidosService';
import EventosService from '../services/EventosService';
import ActividadesService from '../services/ActividadesService';

const serviceEquipos = new EquiposService();
const servicePartidos = new PartidosService();
const serviceEventos = new EventosService();
const serviceActividades = new ActividadesService();
export class PartidosComponent extends Component {
    static contextType = AuthContext;
    
    constructor(props) {
        super(props);
        this.state = {
            partidos: [],
            equipos: {},
            cargando: true,
            error: null,
            // Filtros
            filtroEvento: '',
            filtroActividad: '',
            eventosFiltroLista: [],
            actividadesFiltroLista: []
        };
        this.url = Global.apiDeportes;
    }

    componentDidMount() {
        this.obtenerPartidos();
        this.obtenerEventosFiltro();
    }

    obtenerEventosFiltro = () => {
        serviceEventos.getEventosCursoEscolar(this.context.token)
            .then(data => {
                this.setState({
                    eventosFiltroLista: data
                });
            })
            .catch(error => {
                console.error('Error al obtener eventos para filtro:', error);
            });
    }   

    obtenerActividadesPorEventoFiltro = (idEvento) => {
        if (!idEvento) {
            this.setState({ 
                actividadesFiltroLista: [], 
                filtroActividad: ''
            });
            // Recargar todos los partidos cuando se limpia el filtro
            this.obtenerPartidos();
            return;
        }

        serviceActividades.getActividadesEvento(idEvento)
            .then(data => {
                this.setState({
                    actividadesFiltroLista: data,
                    filtroActividad: ''
                });
            })
            .catch(error => {
                console.error('Error al obtener actividades para filtro:', error);
                this.setState({ actividadesFiltroLista: [] });
            });
    }

    aplicarFiltroActividad = async (idEvento, idActividad) => {
        if (!idEvento || !idActividad) {
            // Si no hay actividad seleccionada, recargar todos los partidos
            this.obtenerPartidos();
            return;
        }

        try {
            const idEventoActividad = await serviceActividades.getEventoActividad(
                parseInt(idEvento),
                parseInt(idActividad)
            );

            this.setState({ cargando: true });
            servicePartidos.getPartidosPorActividad(idEventoActividad)
                .then(data => {
                    this.setState({ partidos: data });
                    this.obtenerEquipos(data);
                    this.setState({ cargando: false });
                })
                .catch(error => {
                    console.error('Error:', error);
                    this.setState({
                        error: 'Error al cargar los partidos',
                        cargando: false
                    });
                });
        } catch (error) {
            console.error('Error al obtener idEventoActividad:', error);
            this.setState({ cargando: false });
        }
    }

    obtenerPartidos = () => {
        servicePartidos.getPartidos()
            .then(data => {
                this.setState({ partidos: data });
                this.obtenerEquipos(data);
                this.setState({ cargando: false });
            })
            .catch(error => {
                console.error('Error:', error);
                this.setState({
                    error: 'Error al cargar los partidos',
                    cargando: false
                });
            });
    }

    obtenerEquipos = (partidos) => {
        const equiposUnicos = new Set();
        partidos.forEach(partido => {
            equiposUnicos.add(partido.idEquipoLocal);
            equiposUnicos.add(partido.idEquipoVisitante);
        });

        const equiposData = {};
        let equiposCargados = 0;

        if (equiposUnicos.size === 0) {
            this.setState({ equipos: {} });
            return;
        }

        equiposUnicos.forEach(idEquipo => {
            serviceEquipos.getEquipo(idEquipo)
                .then(data => {
                    equiposData[idEquipo] = data;
                    equiposCargados++;
                    if (equiposCargados === equiposUnicos.size) {
                        this.setState({ equipos: equiposData });
                    }
                })
                .catch(error => {
                    console.error(`Error al obtener equipo ${idEquipo}:`, error);
                    equiposCargados++;
                    if (equiposCargados === equiposUnicos.size) {
                        this.setState({ equipos: equiposData });
                    }
                });
        });
    }

    determinarGanador = (partido) => {
        if (partido.puntosLocal > partido.puntosVisitante) {
            return 'local';
        } else if (partido.puntosVisitante > partido.puntosLocal) {
            return 'visitante';
        }
        return 'empate';
    }

    render() {
        const { partidos, equipos, cargando, error } = this.state;

        if (cargando) {
            return (
                <div className="partidos-container">
                    <div className="cargando">Cargando partidos...</div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="partidos-container">
                    <div className="error">{error}</div>
                </div>
            );
        }

        if (partidos.length === 0) {
            return (
                <div className="partidos-container">
                    <h1>Resultados de Partidos</h1>
                    
                    {/* Filtros */}
                    <div className="partidos-filtros">
                        <div className="form-group">
                            <label>Filtrar por Evento:</label>
                            <select 
                                value={this.state.filtroEvento}
                                onChange={(e) => {
                                    const idEvento = e.target.value;
                                    this.setState({ filtroEvento: idEvento });
                                    this.obtenerActividadesPorEventoFiltro(idEvento);
                                }}
                            >
                                <option value="">Todos los eventos</option>
                                {this.state.eventosFiltroLista.map((evento) => (
                                    <option key={evento.idEvento} value={evento.idEvento}>
                                        Evento {evento.idEvento} - {new Date(evento.fechaEvento).toLocaleDateString('es-ES')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {this.state.filtroEvento && (
                            <div className="form-group">
                                <label>Filtrar por Actividad:</label>
                                <select 
                                    value={this.state.filtroActividad}
                                    onChange={(e) => {
                                        const idActividad = e.target.value;
                                        this.setState({ filtroActividad: idActividad });
                                        this.aplicarFiltroActividad(this.state.filtroEvento, idActividad);
                                    }}
                                >
                                    <option value="">Todas las actividades</option>
                                    {this.state.actividadesFiltroLista.map((actividad) => (
                                        <option key={actividad.idActividad} value={actividad.idActividad}>
                                            {actividad.nombreActividad}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="sin-partidos">
                        No hay partidos registrados
                    </div>
                </div>
            );
        }

        return (
            <div className="partidos-container">
                <h1>Resultados de Partidos</h1>
                
                {/* Filtros */}
                <div className="partidos-filtros">
                    <div className="form-group">
                        <label>Filtrar por Evento:</label>
                        <select 
                            value={this.state.filtroEvento}
                            onChange={(e) => {
                                const idEvento = e.target.value;
                                this.setState({ filtroEvento: idEvento });
                                this.obtenerActividadesPorEventoFiltro(idEvento);
                            }}
                        >
                            <option value="">Todos los eventos</option>
                            {this.state.eventosFiltroLista.map((evento) => (
                                <option key={evento.idEvento} value={evento.idEvento}>
                                    Evento {evento.idEvento} - {new Date(evento.fechaEvento).toLocaleDateString('es-ES')}
                                </option>
                            ))}
                        </select>
                    </div>

                    {this.state.filtroEvento && (
                        <div className="form-group">
                            <label>Filtrar por Actividad:</label>
                            <select 
                                value={this.state.filtroActividad}
                                onChange={(e) => {
                                    const idActividad = e.target.value;
                                    this.setState({ filtroActividad: idActividad });
                                    this.aplicarFiltroActividad(this.state.filtroEvento, idActividad);
                                }}
                            >
                                <option value="">Todas las actividades</option>
                                {this.state.actividadesFiltroLista.map((actividad) => (
                                    <option key={actividad.idActividad} value={actividad.idActividad}>
                                        {actividad.nombreActividad}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="partidos-grid">
                    {partidos.map((partido) => {
                        const equipoLocal = equipos[partido.idEquipoLocal] || {};
                        const equipoVisitante = equipos[partido.idEquipoVisitante] || {};
                        const ganador = this.determinarGanador(partido);

                        return (
                            <div
                                key={partido.idPartidoResultado}
                                className={`partido-card ${ganador}`}
                            >
                                <div className="partido-header">
                                    <span className="evento-actividad">
                                        Actividad ID: {partido.idEventoActividad}
                                    </span>
                                </div>

                                <div className="partido-content">
                                    <NavLink
                                        to={`/equipo/${equipoLocal.idEquipo}`}
                                        className="equipo-link"
                                    >
                                        <div className={`equipo local ${ganador === 'local' ? 'ganador' : ''}`}>
                                            <div className="nombre-equipo">
                                                {equipoLocal.nombreEquipo || `Equipo ${partido.idEquipoLocal}`}
                                            </div>
                                            <div className="puntos-equipo">
                                                {partido.puntosLocal}
                                            </div>
                                        </div>
                                    </NavLink>

                                    <div className="vs">VS</div>
                                    <NavLink
                                        to={`/equipo/${equipoVisitante.idEquipo}`}
                                        className="equipo-link"
                                    >
                                        <div className={`equipo visitante ${ganador === 'visitante' ? 'ganador' : ''}`}>
                                            <div className="nombre-equipo">
                                                {equipoVisitante.nombreEquipo || `Equipo ${partido.idEquipoVisitante}`}
                                            </div>
                                            <div className="puntos-equipo">
                                                {partido.puntosVisitante}
                                            </div>
                                        </div>
                                    </NavLink>
                                </div>

                                <div className="partido-footer">
                                    {ganador === 'empate' ? (
                                        <span className="resultado-empate">Empate</span>
                                    ) : (
                                        <span className="resultado-ganador">
                                            {ganador === 'local'
                                                ? equipoLocal.nombreEquipo || `Equipo ${partido.idEquipoLocal}`
                                                : equipoVisitante.nombreEquipo || `Equipo ${partido.idEquipoVisitante}`
                                            } gana
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

export default PartidosComponent;