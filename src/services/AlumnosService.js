import axios from 'axios';
import Global from '../Global';

class AlumnosService {
    url = Global.apiDeportes;

    // GET: Obtiene el conjunto de Cursos Activos
    getCursosActivos = async () => {
        try {
            const response = await axios.get(this.url + 'api/GestionEvento/CursosActivos');
            return response.data;
        } catch (error) {
            console.error('Error al obtener cursos activos:', error);
            throw error;
        }
    }

    // GET: Obtiene el conjunto de Usuarios por curso
    getUsuariosCurso = async (idCurso) => {
        try {
            const response = await axios.get(this.url + `api/GestionEvento/UsuariosCurso/${idCurso}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener usuarios del curso:', error);
            throw error;
        }
    }

    // GET: Obtiene todos los alumnos de todos los cursos activos
    getTodosAlumnos = async () => {
        try {
            const cursos = await this.getCursosActivos();
            const promesasUsuarios = cursos.map(curso => this.getUsuariosCurso(curso.idCurso));
            const resultados = await Promise.all(promesasUsuarios);
            // Aplanar el array y eliminar duplicados por idUsuario
            const todosAlumnos = resultados.flat();
            const alumnosUnicos = Array.from(
                new Map(todosAlumnos.map(u => [u.idUsuario, u])).values()
            );
            return alumnosUnicos;
        } catch (error) {
            console.error('Error al obtener todos los alumnos:', error);
            throw error;
        }
    }

    // GET: Obtiene alumnos por curso específico
    getAlumnosPorCurso = async (idCurso) => {
        try {
            const response = await this.getUsuariosCurso(idCurso);
            return response;
        } catch (error) {
            console.error('Error al obtener alumnos del curso:', error);
            throw error;
        }
    }
}

export default new AlumnosService();
