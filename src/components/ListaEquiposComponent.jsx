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

const serviceEquipos = new EquiposService();
const serviceCapitan = new CapitanService();
const serviceActividades = new ActividadesService();
export class ListaEquiposComponent extends Component {
    url = Global.apiDeportes
    static contextType = AuthContext;
    

    state = {
        equipos: [],
        capitan: {},
        eresCapitan: false,
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


render() {
    return (
        <div className='equipos-container'>
            <div className='equipos-header'>
                <h1>Equipos</h1>
                <h1 className='capitan-info'>
                    Capitán: <span className='capitan-nombre'>{this.state.capitan.usuario}</span>
                </h1>
                {
                    this.state.eresCapitan && 
                    <NavLink
                        to={`/crear-equipo/${this.props.idEvento}/${this.props.idActividad}`}
                        className='btn-crear-equipo'
                    >
                        + Crear Equipo
                    </NavLink>
                }
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
        </div>
    )
}
}

export default ListaEquiposComponent