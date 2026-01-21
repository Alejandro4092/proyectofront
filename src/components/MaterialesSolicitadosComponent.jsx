import React, { Component } from 'react';
import axios from 'axios';
import Global from '../Global';
import '../css/MaterialesSolicitadosComponent.css';

export class MaterialesSolicitadosComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            materiales: [],
            cargando: true,
            error: null
        };
        this.url = Global.apiDeportes;
    }

    componentDidMount() {
        this.obtenerMateriales();
    }

    obtenerMateriales = () => {
        let request = "api/Materiales";
        axios.get(this.url + request)
            .then(response => {
                this.setState({ 
                    materiales: response.data,
                    cargando: false 
                });
            })
            .catch(error => {
                console.error('Error:', error);
                this.setState({ 
                    error: 'Error al cargar los materiales',
                    cargando: false 
                });
            });
    }

    formatearFecha = (fecha) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    render() {
        const { materiales, cargando, error } = this.state;

        if (cargando) {
            return (
                <div className="materiales-container">
                    <div className="cargando">Cargando materiales...</div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="materiales-container">
                    <div className="error">{error}</div>
                </div>
            );
        }

        if (materiales.length === 0) {
            return (
                <div className="materiales-container">
                    <div className="sin-materiales">No hay materiales solicitados</div>
                </div>
            );
        }

        return (
            <div className="materiales-container">
                <h1>Materiales Solicitados</h1>
                <div className="materiales-grid">
                    {materiales.map((material) => (
                        <div 
                            key={material.idMaterial} 
                            className={`material-card ${material.pendiente ? 'pendiente' : 'aportado'}`}
                        >
                            <div className="material-header">
                                <h3>{material.nombreMaterial}</h3>
                                <span className={`estado ${material.pendiente ? 'pendiente' : 'aportado'}`}>
                                    {material.pendiente ? 'Pendiente' : 'Aportado'}
                                </span>
                            </div>

                            <div className="material-body">
                                <div className="material-info">
                                    <span className="label">Actividad ID:</span>
                                    <span className="valor">{material.idEventoActividad}</span>
                                </div>

                                <div className="material-info">
                                    <span className="label">Solicitado por:</span>
                                    <span className="valor">Usuario {material.idUsuario}</span>
                                </div>

                                <div className="material-info">
                                    <span className="label">Fecha solicitud:</span>
                                    <span className="valor">{this.formatearFecha(material.fechaSolicitud)}</span>
                                </div>

                                {!material.pendiente && material.idUsuarioAportacion && (
                                    <div className="material-info">
                                        <span className="label">Aportado por:</span>
                                        <span className="valor">Usuario {material.idUsuarioAportacion}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default MaterialesSolicitadosComponent;