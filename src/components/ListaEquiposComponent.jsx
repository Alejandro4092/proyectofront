import React, { Component } from 'react'
import Global from '../Global.js';
import axios from 'axios';
import Equipo from './EquipoComponent.jsx';
import { NavLink } from 'react-router-dom';
import '../css/ListaEquiposComponent.css';
export class ListaEquiposComponent extends Component {
    url = Global.apiDeportes

    state = {
        equipos: [],
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

    componentDidMount = () => {
        this.loadEquipos();
    }

    loadEquipos = () => {
        let idActividad = this.props.idActividad;
        let idEvento = this.props.idEvento;
        let request = "api/Equipos/EquiposActividadEvento/"+idActividad+"/"+idEvento
        axios.get(this.url + request).then(res => {
            this.setState({
                equipos: res.data
            })
        })
    }


    render() {
        return (
            <div className='equipos-container'>
                <h1>Equipos</h1>
                <div className='equipos-grid'>
                    {console.log(this.state.equipos)}
                    {
                        this.state.equipos.map((equipo, index) => {
                            return(
                                <NavLink 
                                    key={index}
                                    to={"/equipo/" + equipo.idEquipo}
                                    className='equipo-link'
                                >
                                    <div className='cardEquipo'>
                                        <h1>{equipo.nombreEquipo}</h1>
                                        <h2>Mínimo de Jugadores: {equipo.minimoJugadores}</h2>
                                    </div>
                                </NavLink>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

export default ListaEquiposComponent