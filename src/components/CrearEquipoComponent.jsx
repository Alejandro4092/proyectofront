import React, { Component } from 'react';
import axios from 'axios';
import Global from '../Global';
import { Navigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/AuthContext';
import '../css/CrearEquipoComponent.css';

export class CrearEquipoComponent extends Component {
    static contextType = AuthContext;

    url = Global.apiDeportes;

    state = {
        nombreEquipo: '',
        minimoJugadores: 1,
        idColor: 1,
        colores: [],
        loading: false,
        redirect: false,
        redirectPath: ''
    }

    componentDidMount = () => {
        // Verificar que el usuario esté logueado
        if (!this.context.logeado) {
            Swal.fire({
                title: 'No has iniciado sesión',
                text: 'Debes iniciar sesión para crear un equipo',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            }).then(() => {
                this.setState({ redirect: true, redirectPath: '/login' });
            });
            return;
        }
        console.log(this.context.usuario)
        this.loadColores();
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

    getEventoActividad = async () => {
        let request = "api/ActividadesEvento/FindIdEventoActividad/" + this.props.idEvento + "/" + this.props.idActividad;
        try {
            const res = await axios.get(this.url + request);
            return res.data.idEventoActividad;
        } catch (error) {
            console.error("Error al obtener el id:", error);
            throw error;
        }
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        });
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        if(this.context.role != "CAPITAN" || this.context.role != "ADMINISTRADOR"){
            Swal.fire({
                title: 'Error',
                text: 'Debes ser capitán para crear un equipo',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return;
        }
        const { nombreEquipo, minimoJugadores, idColor } = this.state;

        // Validaciones
        if (!nombreEquipo.trim()) {
            Swal.fire({
                title: 'Error',
                text: 'El nombre del equipo es obligatorio',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        if (minimoJugadores < 1) {
            Swal.fire({
                title: 'Error',
                text: 'El mínimo de jugadores debe ser al menos 1',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        this.setState({ loading: true });

        try {
            const idEventoActividadParam = await this.getEventoActividad();

            // Preparar datos para enviar
            const nuevoEquipo = {
                idEquipo: 0, // El servidor lo asignará
                idEventoActividad: idEventoActividadParam,
                nombreEquipo: nombreEquipo.trim(),
                minimoJugadores: parseInt(minimoJugadores),
                idColor: parseInt(idColor),
                idCurso: this.context.usuario.idCurso
            };

            let request = "api/Equipos/create";
            let token = this.context.token;
            

            const res = await axios.post(this.url + request, nuevoEquipo, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("Equipo creado:", res.data);

            Swal.fire({
                title: '¡Éxito!',
                text: 'El equipo ha sido creado correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                // Redirigir a la lista de equipos
                this.setState({
                    redirect: true,
                    redirectPath: `/equipos/${this.props.idEvento}/${this.props.idActividad}`
                });
            });
        } catch (error) {
            console.error("Error al crear equipo:", error);
            this.setState({ loading: false });
            Swal.fire({
                title: 'Error',
                text: 'No se pudo crear el equipo. Inténtalo de nuevo.',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }
    }

    render() {
        if (this.state.redirect) {
            return <Navigate to={this.state.redirectPath} />;
        }

        return (
            <div className="crear-equipo-container">
                <div className="crear-equipo-wrapper">
                    <div className="crear-equipo-header">
                        <h1>Crear Nuevo Equipo</h1>
                        <Link to={`/equipos/${this.props.idEvento}/${this.props.idActividad}`} className="btn-volver">← Volver</Link>
                    </div>

                    <form onSubmit={this.handleSubmit} className="crear-equipo-form">
                        <div className="form-group">
                            <label htmlFor="nombreEquipo">Nombre del Equipo *</label>
                            <input
                                type="text"
                                id="nombreEquipo"
                                name="nombreEquipo"
                                value={this.state.nombreEquipo}
                                onChange={this.handleInputChange}
                                placeholder="Ingresa el nombre del equipo"
                                disabled={this.state.loading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="minimoJugadores">Mínimo de Jugadores *</label>
                            <input
                                type="number"
                                id="minimoJugadores"
                                name="minimoJugadores"
                                value={this.state.minimoJugadores}
                                onChange={this.handleInputChange}
                                min="1"
                                disabled={this.state.loading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="idColor">Color del Equipo *</label>
                            <select
                                id="idColor"
                                name="idColor"
                                value={this.state.idColor}
                                onChange={this.handleInputChange}
                                disabled={this.state.loading}
                                required
                            >
                                {this.state.colores.length > 0 ? (
                                    this.state.colores.map((color) => (
                                        <option key={color.idColor} value={color.idColor}>
                                            {color.nombreColor}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">Cargando colores...</option>
                                )}
                            </select>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn-crear"
                                disabled={this.state.loading}
                            >
                                {this.state.loading ? 'Creando equipo...' : 'Crear Equipo'}
                            </button>

                            <button
                                type="button"
                                className="btn-cancelar"
                                onClick={() => this.setState({
                                    redirect: true,
                                    redirectPath: `/equipos/${this.props.idEvento}/${this.props.idActividad}`
                                })}
                                disabled={this.state.loading}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default CrearEquipoComponent;
