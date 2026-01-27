import axios from 'axios';
import Global from '../Global';

class OrganizadoresService {
    url = Global.apiDeportes;

    // GET: Obtiene el conjunto de Cursos Activos, tabla CURSOS
    getCursosActivos = async () => {
        try {
            const response = await axios.get(this.url + 'api/GestionEvento/CursosActivos');
            return response.data;
        } catch (error) {
            console.error('Error al obtener cursos activos:', error);
            throw error;
        }
    }

    // GET: Obtiene el conjunto de Usuarios por curso, tabla VISTAUSUARIOS
    getUsuariosCurso = async (idCurso) => {
        try {
            const response = await axios.get(this.url + `api/GestionEvento/UsuariosCurso/${idCurso}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener usuarios del curso:', error);
            throw error;
        }
    }

    // GET: Obtiene todos los usuarios de todos los cursos activos
    getTodosUsuariosCursosActivos = async () => {
        try {
            const cursos = await this.getCursosActivos();
            const promesasUsuarios = cursos.map(curso => this.getUsuariosCurso(curso.idCurso));
            const resultados = await Promise.all(promesasUsuarios);
            // Aplanar el array y eliminar duplicados por idUsuario
            const todosUsuarios = resultados.flat();
            const usuariosUnicos = Array.from(
                new Map(todosUsuarios.map(u => [u.idUsuario, u])).values()
            );
            return usuariosUnicos;
        } catch (error) {
            console.error('Error al obtener todos los usuarios:', error);
            throw error;
        }
    }

    // GET: Obtiene el conjunto de Organizadores del CURSO ESCOLAR, tabla VISTAUSUARIOS
    getOrganizadores = async () => {
        try {
            const response = await axios.get(this.url + 'api/Organizadores/OrganizadoresEvento');
            return response.data;
        } catch (error) {
            console.error('Error al obtener organizadores:', error);
            throw error;
        }
    }

    // POST: Crea un nuevo Usuario organizador mediante su ID, tabla ORGANIZADOR EVENTO
    // TOKEN ADMINISTRADOR requerido
    createOrganizador = async (idUsuarioOrganizador, token) => {
        try {
            const response = await axios.post(
                this.url + `api/Organizadores/create/${idUsuarioOrganizador}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error al crear organizador:', error);
            throw error;
        }
    }
}

export default OrganizadoresService;
