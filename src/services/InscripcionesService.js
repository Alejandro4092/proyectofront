import axios from "axios"
import Global from "../Global"

export default class InscripcionesService {
    inscribirse = async (idEventoActividad, quiereSerCapitan, token) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/UsuariosDeportes/InscribirmeEvento/" + idEventoActividad + "/" + quiereSerCapitan
            axios.post(request, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    obtenerInscripciones = async () => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/Inscripciones"
            axios.get(request).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    desinscribirse = async (idInscripcion, token) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/Inscripciones/" + idInscripcion
            axios.delete(request, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    getInscripcionesUsuario = async (idUsuario) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/Inscripciones/FindInscripcionesUser/" + idUsuario
            axios.get(request).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }
}
