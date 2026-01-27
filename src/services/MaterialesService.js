import axios from 'axios';
import Global from '../Global';

class MaterialesService {
    url = Global.apiDeportes;

    /**
     * Obtiene todos los materiales
     */
    obtenerMateriales() {
        let request = "api/Materiales/MaterialUsuarios";
        return axios.get(this.url + request);
    }

    /**
     * Obtiene materiales por idEventoActividad
     * @param {number} idEventoActividad - ID del evento actividad
     * @returns Array de objetos con material, usuarioMaterial y usuarioAportacionMaterial
     */
    getMaterialesPorActividad(idEventoActividad) {
        let request = `api/Materiales/MaterialesUsuarioActividad/${idEventoActividad}`;
        return axios.get(this.url + request);
    }

    /**
     * Crea una nueva solicitud de material
     * @param {Object} datos - Datos del material a crear
     */
    crearMaterial(datos) {
        let request = "api/Materiales/create";
        return axios.post(this.url + request, datos);
    }

    /**
     * Actualiza un material existente (para marcar como aportado)
     * @param {Object} datos - Datos del material a actualizar
     */
    actualizarMaterial(datos) {
        let request = "api/Materiales/update";
        return axios.put(this.url + request, datos);
    }
}

export default new MaterialesService();
