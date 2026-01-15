import axios from 'axios';
import React, { Component } from 'react'
import Global from '../Global';
import '../css/EquipoComponent.css';

export class EquipoComponent extends Component {
    url = Global.apiDeportes
    state = {
        equipoCompleto: false,
        eresMiembro: false,
        equipo: {},
        equipoPrueba: {
            "idEquipo": 1,
            "idEventoActividad": 2,
            "nombreEquipo": "prueba",
            "minimoJugadores": 3,
            "idColor": 1,
            "idCurso": 3430
        },
        colorName: "",
        colorNamePrueba: "rojo",
        jugadores: [],
        jugadoresPrueba: [
            {
                "idMiembroEquipo": 1,
                "idEquipo": 1,
                "idUsuario": 1
            },
            {
                "idMiembroEquipo": 2,
                "idEquipo": 1,
                "idUsuario": 2
            },
            {
                "idMiembroEquipo": 3,
                "idEquipo": 1,
                "idUsuario": 3
            },
        ]
    }

    componentDidMount = () => {
        //console.log(this.getColorName(1))
        this.loadEquipo();
    }

    loadEquipo = () => {
        let idEquipo = this.props.idEquipo;
        let idEventoActividad = this.props.idEventoActividad;
        let request = "api/Equipos/" + idEquipo
        axios.get(this.url + request).then(res => {
            let color = this.getColorName(res.data.idColor)
            // let curso = this.getNombreCurso
            let jugadoresEquipo = this.findJugadoresEquipo(res.data.idEquipo);

            this.setState({
                equipo: res.data,
                colorName: color,
                jugadores: jugadoresEquipo
            })
        })
    }

    getColorName = (idColor) => {
        let request = "api/Colores/" + idColor
        axios.get(this.url + request).then(res => {
            let colorName = res.data.nombreColor
            console.log("color", colorName)
            return colorName;
        })
    }

    findJugadoresEquipo = (idEquipo) => {
        let request = "api/MiembrosEquipos/" + idEquipo
        axios.get(this.url + request).then(res => {
            let players = res.data
            return players;
        })
    }

    salirDelEquipo = () => {

    }

    entrarAlEquipo = () => {

    }

    render() {
        return (
            <div className='equipo-detail-container'>
                <div className='equipo-header'>
                    <h1>{this.state.equipoPrueba.nombreEquipo}</h1>
                </div>
                
                <div className='equipo-actions'>
                    {
                        this.state.eresMiembro ? 
                        <button className='btn-salir' onClick={this.salirDelEquipo}>Salir del equipo</button> :
                        this.state.equipoCompleto == false ? 
                        <button className='btn-entrar' onClick={this.entrarAlEquipo}>Entrar al equipo</button> :
                        <h2 className='equipo-completo'>Equipo completo</h2>
                    }
                </div>

                <div className='equipo-info'>
                    <div className='equipo-stats'>
                        <div className='stat-item'>
                            <h2>Color: <span className='color-badge'>{this.state.colorNamePrueba}</span></h2>
                        </div>
                        <div className='stat-item'>
                            <h2>Mínimo de Jugadores: {this.state.equipoPrueba.minimoJugadores}</h2>
                        </div>
                    </div>
                </div>

                <div className='jugadores-section'>
                    <h1>Jugadores</h1>
                    <div className='jugadores-grid'>
                        {
                            this.state.jugadoresPrueba.map((jugador, index) => {
                                return(
                                    <div key={index} className='cardJugador'>
                                        <h1>ID Equipo: {jugador.idEquipo}</h1>
                                        <h1>ID Usuario: {jugador.idUsuario}</h1>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default EquipoComponent