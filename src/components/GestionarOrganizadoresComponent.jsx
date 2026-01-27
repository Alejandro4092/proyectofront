import React, { Component } from 'react';
import AuthContext from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import OrganizadoresService from '../services/OrganizadoresService';
import Swal from 'sweetalert2';
import '../css/GestionarOrganizadoresComponent.css';

const serviceOrganizadores = new OrganizadoresService();

class GestionarOrganizadoresComponent extends Component {
    static contextType = AuthContext;

    state = {
        organizadores: [],
        todosUsuarios: [],
        loading: true,
        loadingUsuarios: true,
        idUsuarioSeleccionado: '',
        submitting: false
    };

    componentDidMount() {
        this.cargarOrganizadores();
        this.cargarTodosUsuarios();
    }

    cargarTodosUsuarios = async () => {
        try {
            this.setState({ loadingUsuarios: true });
            const data = await serviceOrganizadores.getTodosUsuariosCursosActivos();
            this.setState({ 
                todosUsuarios: data,
                loadingUsuarios: false 
            });
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            this.setState({ loadingUsuarios: false });
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los usuarios',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    }

    cargarOrganizadores = async () => {
        try {
            this.setState({ loading: true });
            const data = await serviceOrganizadores.getOrganizadores();
            this.setState({ 
                organizadores: data,
                loading: false 
            });
        } catch (error) {
            console.error('Error al cargar organizadores:', error);
            this.setState({ loading: false });
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los organizadores',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    }

    handleInputChange = (e) => {
        this.setState({ idUsuarioSeleccionado: e.target.value });
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        
        const { idUsuarioSeleccionado } = this.state;
        const { token } = this.context;

        if (!idUsuarioSeleccionado) {
            Swal.fire({
                title: 'Campo requerido',
                text: 'Por favor seleccione un usuario',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        try {
            this.setState({ submitting: true });
            await serviceOrganizadores.createOrganizador(idUsuarioSeleccionado, token);
            
            Swal.fire({
                title: '¡Éxito!',
                text: 'Organizador creado correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });

            this.setState({ idUsuarioSeleccionado: '' });
            this.cargarOrganizadores(); // Recargar la lista
        } catch (error) {
            console.error('Error al crear organizador:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo crear el organizador',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        } finally {
            this.setState({ submitting: false });
        }
    }

    render() {
        const { rol, logeado } = this.context;
        const { organizadores, todosUsuarios, loading, loadingUsuarios, idUsuarioSeleccionado, submitting } = this.state;

        // Verificar que el usuario esté logueado
        if (!logeado) {
            return <Navigate to="/login" replace />;
        }

        // Verificar que el usuario sea administrador
        if (rol !== 'ADMINISTRADOR') {
            return <Navigate to="/" replace />;
        }

        // Filtrar usuarios que ya no son organizadores
        const idsOrganizadores = organizadores.map(org => org.idUsuario);
        const usuariosDisponibles = todosUsuarios.filter(usuario => 
            !idsOrganizadores.includes(usuario.idUsuario)
        );

        return (
            <div className="gestionar-organizadores-container">
                <div className="gestionar-organizadores-header">
                    <h1>Gestionar Organizadores</h1>
                    <p>Administración de Organizadores</p>
                </div>

                <div className="content">
                    {/* Formulario para crear organizador */}
                    <div className="crear-organizador-section">
                        <h2>Asignar Nuevo Organizador</h2>
                        <form onSubmit={this.handleSubmit} className="crear-organizador-form">
                            <div className="form-group">
                                <label htmlFor="idUsuario">Seleccionar Usuario:</label>
                                {loadingUsuarios ? (
                                    <p className="loading-select">Cargando usuarios...</p>
                                ) : (
                                    <select
                                        id="idUsuario"
                                        value={idUsuarioSeleccionado}
                                        onChange={this.handleInputChange}
                                        className="form-select"
                                        disabled={submitting}
                                    >
                                        <option value="">-- Seleccione un usuario --</option>
                                        {usuariosDisponibles.map((usuario) => (
                                            <option key={usuario.idUsuario} value={usuario.idUsuario}>
                                                {usuario.usuario}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <button 
                                type="submit" 
                                className="btn-submit"
                                disabled={submitting || loadingUsuarios}
                            >
                                {submitting ? 'Asignando...' : 'Asignar Organizador'}
                            </button>
                        </form>
                    </div>

                    {/* Lista de organizadores */}
                    <div className="organizadores-section">
                        <h2>Organizadores Actuales</h2>
                        {loading ? (
                            <p className="loading-text">Cargando organizadores...</p>
                        ) : organizadores.length === 0 ? (
                            <p className="no-data-text">No hay organizadores registrados</p>
                        ) : (
                            <div className="organizadores-list">
                                <table className="organizadores-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {organizadores.map((org) => (
                                            <tr key={org.idUsuario}>
                                                <td>{org.idUsuario}</td>
                                                <td>{org.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default GestionarOrganizadoresComponent;
