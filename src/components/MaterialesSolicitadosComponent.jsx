import React, { Component } from 'react';
import '../css/MaterialesSolicitadosComponent.css';
import AuthContext from '../context/AuthContext';
import Swal from 'sweetalert2';
import MaterialesService from '../services/MaterialesService';

export class MaterialesSolicitadosComponent extends Component {
    static contextType = AuthContext;
    
    constructor(props) {
        super(props);
        this.state = {
            materiales: [],
            cargando: true,
            error: null,
            mostrarModalSolicitar: false,
            mostrarModalAportar: false,
            nombreMaterial: '',
            materialSeleccionado: null,
            idEventoActividadModal: '',
            idEventoActividadList: []
        };
    }

    componentDidMount() {
        this.obtenerMateriales();
        this.obtenerEventosActividades();
    }

    obtenerMateriales = () => {
        MaterialesService.obtenerMateriales()
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

    obtenerEventosActividades = () => {
        MaterialesService.obtenerEventosActividades()
            .then(response => {
                this.setState({
                    idEventoActividadList: response.data
                });
            })
            .catch(error => {
                console.error('Error al obtener eventos actividades:', error);
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

    abrirModalSolicitar = () => {
        this.setState({
            mostrarModalSolicitar: true,
            nombreMaterial: '',
            idEventoActividadModal: ''
        });
    }

    cerrarModalSolicitar = () => {
        this.setState({
            mostrarModalSolicitar: false,
            nombreMaterial: '',
            idEventoActividadModal: ''
        });
    }

    abrirModalAportar = (material) => {
        this.setState({
            mostrarModalAportar: true,
            materialSeleccionado: material
        });
    }

    cerrarModalAportar = () => {
        this.setState({
            mostrarModalAportar: false,
            materialSeleccionado: null
        });
    }

    solicitarMaterial = () => {
        if (!this.state.nombreMaterial || !this.state.idEventoActividadModal) {
            Swal.fire('Error', 'Por favor completa todos los campos', 'error');
            return;
        }

        if (!this.context.usuario || !this.context.usuario.idUsuario) {
            Swal.fire('Error', 'Debes iniciar sesión', 'error');
            return;
        }

        const datos = {
            idMaterial: 0,
            idEventoActividad: parseInt(this.state.idEventoActividadModal),
            idUsuario: this.context.usuario.idUsuario,
            nombreMaterial: this.state.nombreMaterial,
            pendiente: true,
            fechaSolicitud: new Date().toISOString()
        };

        MaterialesService.crearMaterial(datos)
            .then(response => {
                Swal.fire('¡Éxito!', 'Material solicitado correctamente', 'success');
                this.cerrarModalSolicitar();
                this.obtenerMateriales();
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire('Error', 'Error al solicitar el material', 'error');
            });
    }

    aportarMaterial = () => {
        if (!this.state.materialSeleccionado) {
            Swal.fire('Error', 'Selecciona un material', 'error');
            return;
        }

        if (!this.context.usuario || !this.context.usuario.idUsuario) {
            Swal.fire('Error', 'Debes iniciar sesión', 'error');
            return;
        }

        const datos = {
            idMaterial: this.state.materialSeleccionado.idMaterial,
            idEventoActividad: this.state.materialSeleccionado.idEventoActividad,
            idUsuario: this.context.usuario.idUsuario,
            nombreMaterial: this.state.materialSeleccionado.nombreMaterial,
            pendiente: false,
            fechaSolicitud: this.state.materialSeleccionado.fechaSolicitud
        };

        MaterialesService.actualizarMaterial(datos)
            .then(response => {
                Swal.fire('¡Éxito!', 'Material aportado correctamente', 'success');
                this.cerrarModalAportar();
                this.obtenerMateriales();
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire('Error', 'Error al aportar el material', 'error');
            });
    }

    render() {
        const { materiales, cargando, error, mostrarModalSolicitar, mostrarModalAportar, materialSeleccionado } = this.state;

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

        return (
            <div className="materiales-container">
                <div className="materiales-header">
                    <h1>Materiales</h1>
                    <button 
                        className="btn-solicitar"
                        onClick={this.abrirModalSolicitar}
                    >
                        + Solicitar Material
                    </button>
                </div>

                {materiales.length === 0 ? (
                    <div className="sin-materiales">No hay materiales solicitados</div>
                ) : (
                    <div className="materiales-grid">
                        {materiales.map((material) => (
                            <div 
                                key={material.idMaterial} 
                                className={`material-card ${material.pendiente ? 'pendiente' : 'aportado'}`}
                            >
                                <div className="material-header">
                                    <h3>{material.nombreMaterial}</h3>
                                    <span className={`estado ${material.pendiente ? 'pendiente' : 'aportado'}`}>
                                        {material.pendiente ? '⏳ Pendiente' : '✓ Aportado'}
                                    </span>
                                </div>

                                <div className="material-body">
                                    <div className="material-info">
                                        <span className="label">Actividad:</span>
                                        <span className="valor">ID {material.idEventoActividad}</span>
                                    </div>

                                    <div className="material-info">
                                        <span className="label">Solicitado por:</span>
                                        <span className="valor">Usuario {material.idUsuario}</span>
                                    </div>

                                    <div className="material-info">
                                        <span className="label">Fecha:</span>
                                        <span className="valor">{this.formatearFecha(material.fechaSolicitud)}</span>
                                    </div>
                                </div>

                                <div className="material-footer">
                                    {material.pendiente && (
                                        <button 
                                            className="btn-aportar"
                                            onClick={() => this.abrirModalAportar(material)}
                                        >
                                            Aportar Material
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal Solicitar Material */}
                {mostrarModalSolicitar && (
                    <div className="mat-modal-overlay" onClick={this.cerrarModalSolicitar}>
                        <div className="mat-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="mat-modal-header">
                                <h2>Solicitar Material</h2>
                                <button className="mat-close-btn" onClick={this.cerrarModalSolicitar}>✕</button>
                            </div>

                            <div className="mat-modal-body">
                                <div className="mat-form-group">
                                    <label>Nombre del Material *</label>
                                    <input 
                                        type="text"
                                        value={this.state.nombreMaterial}
                                        onChange={(e) => this.setState({ nombreMaterial: e.target.value })}
                                        placeholder="Ej: Balón, Cono de tráfico..."
                                    />
                                </div>

                                <div className="mat-form-group">
                                    <label>Actividad/Evento *</label>
                                    <select 
                                        value={this.state.idEventoActividadModal}
                                        onChange={(e) => this.setState({ idEventoActividadModal: e.target.value })}
                                    >
                                        <option value="">Selecciona una actividad</option>
                                        {this.state.idEventoActividadList.map((actividad) => (
                                            <option key={actividad.idEventoActividad} value={actividad.idEventoActividad}>
                                                Actividad {actividad.idEventoActividad}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mat-modal-footer">
                                <button className="mat-btn-cancelar" onClick={this.cerrarModalSolicitar}>
                                    Cancelar
                                </button>
                                <button className="mat-btn-confirmar" onClick={this.solicitarMaterial}>
                                    Solicitar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Aportar Material */}
                {mostrarModalAportar && materialSeleccionado && (
                    <div className="mat-modal-overlay" onClick={this.cerrarModalAportar}>
                        <div className="mat-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="mat-modal-header">
                                <h2>Aportar Material</h2>
                                <button className="mat-close-btn" onClick={this.cerrarModalAportar}>✕</button>
                            </div>

                            <div className="mat-modal-body">
                                <div className="mat-form-group">
                                    <label>Material a aportar:</label>
                                    <p className="material-info-modal"><strong>{materialSeleccionado.nombreMaterial}</strong></p>
                                </div>


                                <div className="mat-form-group">
                                    <label>Fecha solicitado:</label>
                                    <p className="material-info-modal">{this.formatearFecha(materialSeleccionado.fechaSolicitud)}</p>
                                </div>

                            </div>

                            <div className="mat-modal-footer">
                                <button className="mat-btn-cancelar" onClick={this.cerrarModalAportar}>
                                    Cancelar
                                </button>
                                <button className="mat-btn-confirmar" onClick={this.aportarMaterial}>
                                    Confirmar Aportación
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default MaterialesSolicitadosComponent;