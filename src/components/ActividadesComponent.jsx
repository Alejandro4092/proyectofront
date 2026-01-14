import React, { Component } from 'react'
import Global from '../Global';
import { NavLink } from 'react-router-dom'
import axios from 'axios'
import '../css/Actividades.css'


export class ActividadesComponent extends Component {
    url = Global.apiFutbol;
    state = {
        actividades: ["Futbol", "Baloncesto", "Ping Pong","Videojuegos"]
    };
    // loadActividades = () => {
    // let request = "api/Actividades/ActividadesEvento/" + this.props.params.idEvento;
    // axios.get(this.url + request).then((response) => {
    //     console.log("Leyendo actividades");
    //     this.setState({
    //         actividades: response.data,
    //     });
    //     });
    // };
    // componentDidMount = () => {
    //     this.loadActividades();
    // };
    render() {
    return (
        <div className="actividades-wrapper">
            <div className="actividades-head">
                <h1 className="actividades-title">Actividades</h1>
                <p className="actividades-sub">Texto de ejemplo</p>
            </div>

            <div className="actividades-grid">
                {this.state.actividades.map((actividad, index) => (
                    <article className="actividad-card" key={index}>
                        <div className="actividad-title">{actividad}</div>
                        <div className="actividad-fecha">2026-01-14T18:53:21.440Z</div>
                        <p className="actividad-desc">
                            Descripción pendiente. Aquí podrás ver los detalles de la actividad cuando la API esté activa.
                        </p>
                        <div className="actividad-tags">
                            <span className="chip chip-primary">Actividad #{index + 1}</span>
                            <button className="btn-inscribirse">Inscribirse</button>
                        </div>
                    </article>
                ))}
            </div>
        </div>
        )
    }
}

export default ActividadesComponent