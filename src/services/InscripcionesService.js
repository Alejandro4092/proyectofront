import axios from "axios"
import Global from "../Global"

export default class InscripcionesService {
    inscribirse = async (datos, token) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/Inscripciones"
            axios.post(request, datos, {
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
}
