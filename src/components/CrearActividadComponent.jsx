import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import Global from '../Global';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../css/CrearActividadComponent.css';
import { AuthContext } from '../context/AuthContext';

export class CrearActividadComponent extends Component {
    static contextType = AuthContext;

    url = Global.apiDeportes;
    state = {
        nombre: '',
        minimoJugadores: '',
        redirect: false,
        loading: false
    };

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    handleSubmit = async (e) => {
        e.preventDefault();

        if (!this.state.nombre.trim() || !this.state.minimoJugadores) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, completa todos los campos'
            });
            return;
        }

        if (this.state.minimoJugadores < 1) {
            Swal.fire({
                icon: 'warning',
                title: 'Número inválido',
                text: 'El mínimo de jugadores debe ser al menos 1'
            });
            return;
        }

        const datos = {
            idActividad: 0,
            nombre: this.state.nombre.trim(),
            minimoJugadores: parseInt(this.state.minimoJugadores)
        };

        this.setState({ loading: true });

        try {
            let token = this.context.token;
            let request = this.url + "api/Actividades/create";
            
            const response = await axios.post(request, datos, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            Swal.fire({
                icon: 'success',
                title: '¡Actividad creada!',
                text: 'La actividad se ha creado correctamente',
                timer: 2000,
                showConfirmButton: false
            });

            this.setState({ redirect: true });

        } catch (error) {
            console.error('Error al crear actividad:', error);
            this.setState({ loading: false });
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data || 'Error al crear la actividad. Por favor, intenta de nuevo.'
            });
        }
    };

    render() {
        if (this.state.redirect) {
            return <Navigate to="/eventos" />;
        }

        return (
            <div className="crear-actividad-container">
                <div className="crear-actividad-card">
                    <h1 className="crear-actividad-title">Crear Nueva Actividad</h1>
                    <p className="crear-actividad-subtitle">
                        Crea una nueva actividad deportiva en el sistema
                    </p>

                    <form onSubmit={this.handleSubmit} className="crear-actividad-form">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre de la Actividad</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                className="form-input"
                                placeholder="Ej: Fútbol, Baloncesto, Voleibol..."
                                value={this.state.nombre}
                                onChange={this.handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="minimoJugadores">Mínimo de Jugadores</label>
                            <input
                                type="number"
                                id="minimoJugadores"
                                name="minimoJugadores"
                                className="form-input"
                                placeholder="Ej: 5"
                                min="1"
                                value={this.state.minimoJugadores}
                                onChange={this.handleChange}
                                required
                            />
                            <small className="form-help">
                                Número mínimo de jugadores necesarios para esta actividad
                            </small>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-cancelar"
                                onClick={() => this.setState({ redirect: true })}
                                disabled={this.state.loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn-crear"
                                disabled={this.state.loading}
                            >
                                {this.state.loading ? 'Creando...' : 'Crear Actividad'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default CrearActividadComponent;
