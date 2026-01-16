import axios from 'axios';
import React, { Component } from 'react'
import Global from '../Global';
import '../css/EquipoComponent.css';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/AuthContext';

export class EquipoComponent extends Component {
    static contextType = AuthContext;

    url = Global.apiDeportes
    state = {
        equipoCompleto: false,
        eresMiembro: false,
        eresCapitan: true,
        usuarioMiembroEquipo: {},
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
        colores: [],
        mostrarColores: false,
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
        console.log(this.context.usuario)
        this.loadEquipo();
        this.loadColores();
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
                    }, () => {
                        // Ejecutar checkMiembro después de que el estado se haya actualizado
                        this.checkMiembro();
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

    loadColores = () => {
        let request = "api/Colores";
        axios.get(this.url + request)
            .then(res => {
                this.setState({ colores: res.data });
            })
            .catch(error => {
                console.error("Error al cargar colores:", error);
            });
    }

    toggleColores = () => {
        this.setState({ mostrarColores: !this.state.mostrarColores });
    }

    cambiarColor = (idColor, nombreColor) => {
        Swal.fire({
            title: '¿Cambiar color del equipo?',
            text: `¿Deseas cambiar el color del equipo a ${nombreColor}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                let idEquipo = this.props.idEquipo;
                let request = `api/Equipos/UpdateEquipacionEquipo/${idEquipo}/${idColor}`;
                
                axios.put(this.url + request)
                    .then(res => {
                        console.log("Color actualizado:", res.data);
                        Swal.fire(
                            '¡Actualizado!',
                            `El color del equipo se cambió a ${nombreColor}.`,
                            'success'
                        );
                        this.setState({ 
                            colorName: nombreColor,
                            mostrarColores: false 
                        });
                        // Actualizar el equipo completo
                        this.loadEquipo();
                    })
                    .catch(error => {
                        console.error("Error al cambiar color:", error);
                        this.setState({ mostrarColores: false });
                        Swal.fire(
                            'Error',
                            error.response?.status === 404 
                                ? 'El equipo o color no fue encontrado.' 
                                : 'No se pudo cambiar el color del equipo.',
                            'error'
                        );
                    });
            } else {
                this.setState({ mostrarColores: false });
            }
        });
    }

    checkMiembro = () => {
        let miembro = this.state.jugadores.filter((jugador) => 
            jugador.usuario == (this.context.usuario.nombre + " " + this.context.usuario.apellidos)
        )

        if(miembro[0] != null){
            this.setState({eresMiembro: true, usuarioMiembroEquipo: miembro[0]})
            return true;
        }
        else{
            this.setState({eresMiembro: false})
            return false;
        }
    }

    salirDelEquipo = () => {
        // Verificar si el usuario está logueado
        if (!this.context.logeado) {
            Swal.fire({
                title: 'No has iniciado sesión',
                text: 'Debes iniciar sesión para salir del equipo',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
            return;
        }
        
        if(!this.state.eresMiembro){
            Swal.fire({
                title: 'No eres miembro',
                text: 'Debes ser miembro para salir del equipo',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        // Lógica para salir del equipo
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Deseas salir de este equipo?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
              
                let idUsuarioMiembro = this.state.usuarioMiembroEquipo.idMiembroEquipo
                console.log("usuario miembro",idUsuarioMiembro)
            
                let request = "api/MiembroEquipos/" + idUsuarioMiembro
                axios.delete(this.url + request).then(res => {
                    console.log("abandonado: "+res.data)
                    Swal.fire(
                        '¡Abandonaste!',
                        'Has salido del equipo.',
                        'success'
                    );
                    this.loadEquipo();
                    console.log("Saliendo del equipo...");
                }).catch(error => {
                    console.error("Error al salir del equipo:", error);
                    Swal.fire(
                        'Error',
                        'No se pudo salir del equipo.',
                        'error'
                    );
                });
                console.log("Saliendo del equipo...");
            }
        });
    }

    entrarAlEquipo = () => {
        // Verificar si el usuario está logueado
        if (!this.context.logeado) {
            Swal.fire({
                title: 'No has iniciado sesión',
                text: 'Debes iniciar sesión para unirte a un equipo',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        // Lógica para entrar al equipo
        Swal.fire({
            title: '¿Unirte al equipo?',
            text: `¿Deseas unirte a ${this.state.equipo.nombreEquipo}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, unirme',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                let idEquipo = this.props.idEquipo;
                let token = this.context.token;
                console.log(token)
                let request = "api/UsuariosDeportes/ApuntarmeEquipo/" + idEquipo
                axios.post(this.url + request, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }).then(res => {
                    console.log("insertado: "+res.data)
                    Swal.fire(
                        '¡Inscrito!',
                        'Has entrado en el equipo.',
                        'success'
                    );
                    this.loadEquipo();
                    console.log("Uniéndose al equipo...");
                }).catch(error => {
                    console.error("Error al entrar al equipo:", error);
                    Swal.fire(
                        'Error',
                        'No se pudo entrar al equipo.',
                        'error'
                    );
                });
            }
        });
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
                            <h2>Color: 
                                <span 
                                    className='color-badge clickable' 
                                    onClick={this.toggleColores}
                                    title="Clic para cambiar color"
                                >
                                    {this.state.colorName}
                                </span>
                            </h2>
                            {this.state.mostrarColores && (
                                <div className='colores-dropdown'>
                                    <h3>Selecciona un color:</h3>
                                    {this.state.colores.map((color) => (
                                        <div 
                                            key={color.idColor}
                                            className='color-option'
                                            onClick={() => this.cambiarColor(color.idColor, color.nombreColor)}
                                        >
                                            {color.nombreColor}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className='stat-item'>
                            <h2 style={{ color: "#43da7d" }}>Mínimo de Jugadores: {this.state.equipo.minimoJugadores}</h2>
                            <h2>Jugadores actuales: {this.state.jugadores.length}</h2>
                        </div>
                    </div>
                </div>

                <div className='jugadores-section'>
                    <h1>Jugadores</h1>
                    <div className='jugadores-grid'>
                        {
                            this.state.jugadores.map((jugador, index) => {
                                return (
                                    <div key={index} className='cardJugador'>
                                        <h1>{jugador.usuario}</h1>
                                        <img src={jugador.imagen || "https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_640.png"} alt={jugador.usuario} />
                                        <h1 style={{ color: "#71d5f3" }}>Curso: {jugador.curso}</h1>
                                        {
                                            this.state.eresCapitan &&
                                            <button className='btn-expulsar' onClick={() => this.expulsarJugador(jugador.idMiembroEquipo)}>Expulsar jugador</button>
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