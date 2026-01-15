import React, { Component } from 'react'
import Global from '../Global';
import { NavLink } from 'react-router-dom'
import axios from 'axios'
import '../css/Actividades.css'


export class ActividadesComponent extends Component {
    url = Global.apiDeportes;
    state = {
        actividades: [],
    };
    loadActividades = () => {
    let request = "api/Actividades/ActividadesEvento/" + this.props.idEvento;
    axios.get(this.url + request).then((response) => {
        console.log("Leyendo actividades");
        this.setState({
            actividades: response.data,
        });
        });
    };
    componentDidMount = () => {
        this.loadActividades();
    };
    render() {
    return (
        <div className="actividades-wrapper">
            <div className="actividades-head">
                <h1 className="actividades-title">Actividades</h1>
            </div>

            <div className="actividades-grid">
                {this.state.actividades.map((actividad) => (
                    <NavLink 
                        to={`/equipos/${actividad.idEvento}/${actividad.idActividad}`}
                        key={actividad.idEventoActividad}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <article className="actividad-card">
                            <div className="actividad-title">{actividad.nombreActividad}</div>
                            <div className="actividad-fecha">{actividad.fechaEvento}</div>
                            <p className="actividad-desc">
                                Mínimo de jugadores: {actividad.minimoJugadores}
                            </p>
                            <div className="actividad-tags">
                                <span className="chip chip-primary">Posición: {actividad.posicion}</span>
                                <button className="btn-inscribirse" onClick={(e) => e.preventDefault()}>Inscribirse</button>
                            </div>
                        </article>
                    </NavLink>
                ))}
            </div>
        </div>
        )
    }
}

export default ActividadesComponent