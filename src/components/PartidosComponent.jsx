import React, { Component } from 'react';
import axios from 'axios';
import Global from '../Global';
import '../css/PartidosComponent.css';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

export class PartidosComponent extends Component {
    static contextType = AuthContext;
    
    constructor(props) {
        super(props);
        this.state = {
            partidos: [],
            equipos: {},
            cargando: true,
            error: null
        };
        this.url = Global.apiDeportes;
    }

    componentDidMount() {
        this.obtenerPartidos();
    }

    obtenerPartidos = () => {
        let request = "api/PartidoResultado";
        axios.get(this.url + request)
            .then(response => {
                this.setState({ partidos: response.data });
                this.obtenerEquipos(response.data);
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
            let request = `api/Equipos/${idEquipo}`;
            axios.get(this.url + request)
                .then(response => {
                    equiposData[idEquipo] = response.data;
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
                    <div className="sin-partidos">No hay partidos registrados</div>
                </div>
            );
        }

        return (
            <div className="partidos-container">
                <h1>Resultados de Partidos</h1>
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