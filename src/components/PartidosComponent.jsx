import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Global from '../Global';
import '../css/PartidosComponent.css';

export const PartidosComponent = () => {
    const [partidos, setPartidos] = useState([]);
    const [equipos, setEquipos] = useState({});
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const url = Global.apiDeportes;

    useEffect(() => {
        obtenerPartidos();
    }, []);

    const obtenerPartidos = () => {
        let request = "api/PartidoResultado";
        axios.get(url + request)
            .then(response => {
                setPartidos(response.data);
                obtenerEquipos(response.data);
                setCargando(false);
            })
            .catch(error => {
                console.error('Error:', error);
                setError('Error al cargar los partidos');
                setCargando(false);
            });
    };

    const obtenerEquipos = (partidos) => {
        const equiposUnicos = new Set();
        partidos.forEach(partido => {
            equiposUnicos.add(partido.idEquipoLocal);
            equiposUnicos.add(partido.idEquipoVisitante);
        });

        const equiposData = {};
        let equiposCargados = 0;

        if (equiposUnicos.size === 0) {
            setEquipos({});
            return;
        }

        equiposUnicos.forEach(idEquipo => {
            let request = `api/Equipos/${idEquipo}`;
            axios.get(url + request)
                .then(response => {
                    equiposData[idEquipo] = response.data;
                    equiposCargados++;
                    if (equiposCargados === equiposUnicos.size) {
                        setEquipos(equiposData);
                    }
                })
                .catch(error => {
                    console.error(`Error al obtener equipo ${idEquipo}:`, error);
                    equiposCargados++;
                    if (equiposCargados === equiposUnicos.size) {
                        setEquipos(equiposData);
                    }
                });
        });
    };

    const determinarGanador = (partido) => {
        if (partido.puntosLocal > partido.puntosVisitante) {
            return 'local';
        } else if (partido.puntosVisitante > partido.puntosLocal) {
            return 'visitante';
        }
        return 'empate';
    };

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
                    const ganador = determinarGanador(partido);

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
                                <div className={`equipo local ${ganador === 'local' ? 'ganador' : ''}`}>
                                    <div className="nombre-equipo">
                                        {equipoLocal.nombreEquipo || `Equipo ${partido.idEquipoLocal}`}
                                    </div>
                                    <div className="puntos-equipo">
                                        {partido.puntosLocal}
                                    </div>
                                </div>

                                <div className="vs">VS</div>

                                <div className={`equipo visitante ${ganador === 'visitante' ? 'ganador' : ''}`}>
                                    <div className="nombre-equipo">
                                        {equipoVisitante.nombreEquipo || `Equipo ${partido.idEquipoVisitante}`}
                                    </div>
                                    <div className="puntos-equipo">
                                        {partido.puntosVisitante}
                                    </div>
                                </div>
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
};

export default PartidosComponent;