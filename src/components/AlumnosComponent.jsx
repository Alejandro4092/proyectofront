import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AlumnosService from '../services/AlumnosService';
import Swal from 'sweetalert2';
import '../css/AlumnosComponent.css';

export default class AlumnosComponent extends Component {
    static contextType = AuthContext;

    state = {
        cursos: [],
        alumnos: [],
        alumnosFiltrados: [],
        loading: true,
        error: null,
        idCursoSeleccionado: ''
    }

    componentDidMount = () => {
        this.cargarCursos();
    }

    cargarCursos = async () => {
        try {
            this.setState({ loading: true });
            const cursos = await AlumnosService.getCursosActivos();
            this.setState({ 
                cursos, 
                loading: false,
                idCursoSeleccionado: cursos.length > 0 ? cursos[0].idCurso : ''
            }, () => {
                // Después de establecer el curso seleccionado, cargar alumnos
                if (this.state.idCursoSeleccionado) {
                    this.cargarAlumnosPorCurso(this.state.idCursoSeleccionado);
                }
            });
        } catch (error) {
            console.error('Error al cargar cursos:', error);
            this.setState({ error: 'Error al cargar los cursos', loading: false });
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los cursos',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
        }
    }

    cargarAlumnosPorCurso = async (idCurso) => {
        try {
            this.setState({ loading: true, idCursoSeleccionado: idCurso });
            const alumnos = await AlumnosService.getAlumnosPorCurso(idCurso);
            // Ordenar alumnos alfabéticamente por nombre
            const alumnosOrdenados = alumnos.sort((a, b) => {
                return a.usuario.localeCompare(b.usuario);
            });
            this.setState({ alumnos: alumnosOrdenados, alumnosFiltrados: alumnosOrdenados, loading: false });
        } catch (error) {
            console.error('Error al cargar alumnos:', error);
            this.setState({ error: 'Error al cargar los alumnos', loading: false, alumnos: [], alumnosFiltrados: [] });
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los alumnos',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
        }
    }

    handleCursoChange = (e) => {
        const idCurso = e.target.value;
        if (idCurso) {
            this.cargarAlumnosPorCurso(idCurso);
        }
    }

    render() {
        const { rol, logeado } = this.context;
        const { cursos, alumnosFiltrados, loading, error, idCursoSeleccionado } = this.state;

        // Verificar que el usuario esté logueado
        if (!logeado) {
            return <Navigate to="/login" replace />;
        }

        // Verificar que el usuario sea administrador
        if (rol !== "ADMINISTRADOR") {
            return <Navigate to="/" replace />;
        }

        return (
            <div className="alumnos-container">
                <div className="alumnos-header">
                    <h1>Gestión de Alumnos</h1>
                </div>
                
                <div className="alumnos-content">
                    {/* Select para elegir curso */}
                    <div className="curso-selector">
                        <label htmlFor="selectCurso">Seleccionar Curso:</label>
                        <select 
                            id="selectCurso"
                            value={idCursoSeleccionado}
                            onChange={this.handleCursoChange}
                            className="select-curso"
                            disabled={loading}
                        >
                            <option value="">-- Seleccione un curso --</option>
                            {cursos.map((curso) => (
                                <option key={curso.idCurso} value={curso.idCurso}>
                                    {curso.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {loading ? (
                        <p className="loading-text">Cargando alumnos...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : alumnosFiltrados.length === 0 ? (
                        <p className="no-data-text">No hay alumnos disponibles en este curso</p>
                    ) : (
                        <div className="alumnos-list">
                            <table className="tabla-alumnos">
                                <thead>
                                    <tr>
                                        <th>Foto</th>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alumnosFiltrados.map((alumno) => (
                                        <tr key={alumno.idUsuario}>
                                            <td>
                                                <img 
                                                    src={alumno.imagen || "https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_640.png"} 
                                                    alt={alumno.usuario}
                                                    className="foto-alumno"
                                                />
                                            </td>
                                            <td>{alumno.idUsuario}</td>
                                            <td>{alumno.usuario}</td>
                                            <td>{alumno.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

