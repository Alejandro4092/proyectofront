import axios from 'axios';
import React, { Component } from 'react'
import Global from '../Global';
import '../css/EquipoComponent.css';
import Swal from 'sweetalert2';

export class EquipoComponent extends Component {
    url = Global.apiDeportes
    state = {
        equipoCompleto: false,
        eresMiembro: false,
        eresCapitan: true,
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
        //let idEventoActividad = this.props.idEventoActividad;
        let request = "api/Equipos/" + idEquipo
        axios.get(this.url + request).then(res => {
            // Esperar a que getColorName termine antes de hacer setState
            this.getColorName(res.data.idColor).then(color => {
                // let curso = this.getNombreCurso
                this.findJugadoresEquipo(res.data.idEquipo).then(jugadoresEquipo => {
                    console.log(color)
                    this.setState({
                        equipo: res.data,
                        colorName: color,
                        jugadores: jugadoresEquipo
                    })
                })
            })
        })
    }

    getColorName = (idColor) => {
        let request = "api/Colores/" + idColor
        // Retornar la promesa para poder usar .then() en loadEquipo
        return axios.get(this.url + request).then(res => {
            let colorName = res.data.nombreColor
            console.log("color", colorName)
            return colorName;
        })
    }

    findJugadoresEquipo = (idEquipo) => {
        let request = "api/Equipos/UsuariosEquipo/" + idEquipo
        return axios.get(this.url + request).then(res => {
            let players = res.data
            console.log("jugadores", players)
            return players;
        })
    }

    salirDelEquipo = () => {

    }

    entrarAlEquipo = () => {

    }

    expulsarJugador = (idMiembroEquipo) => {
        //solo capitan
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Deseas expulsar a este jugador del equipo?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, expulsar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                let request = "api/MiembroEquipos/" + idMiembroEquipo
                axios.delete(this.url + request).then(res => {
                    console.log("borrado", res.data)
                    Swal.fire(
                        '¡Expulsado!',
                        'El jugador ha sido expulsado del equipo.',
                        'success'
                    );
                    this.loadEquipo();
                }).catch(error => {
                    console.error("Error al expulsar jugador:", error);
                    Swal.fire(
                        'Error',
                        'No se pudo expulsar al jugador del equipo.',
                        'error'
                    );
                });
            }
        });
    }

    render() {
        return (
            <div className='equipo-detail-container'>
                <div className='equipo-header'>
                    <h1>{this.state.equipo.nombreEquipo}</h1>
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
                            <h2>Color: <span className='color-badge'>{this.state.colorName}</span></h2>
                        </div>
                        <div className='stat-item'>
                            <h2 style={{color: "#43da7d"}}>Mínimo de Jugadores: {this.state.equipo.minimoJugadores}</h2>
                            <h2>Jugadores actuales: {this.state.jugadores.length}</h2>
                        </div>
                    </div>
                </div>

                <div className='jugadores-section'>
                    <h1>Jugadores</h1>
                    <div className='jugadores-grid'>
                        {
                            this.state.jugadores.map((jugador, index) => {
                                return(
                                    <div key={index} className='cardJugador'>
                                        <h1>{jugador.usuario}</h1>
                                        <img src={jugador.imagen || "https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_640.png"} alt={jugador.usuario} />
                                        <h1 style={{color: "#71d5f3"}}>Curso: {jugador.curso}</h1>
                                        {
                                            this.state.eresCapitan &&
                                            <button className='btn-expulsar' onClick={() => this.expulsarJugador(jugador.idMiembroEquipo) }>Expulsar jugador</button>
                                        }
                                        
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