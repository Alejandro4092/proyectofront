import axios from "axios"
import Global from "../Global"

export default class EventosService {
    getEventosCursoEscolar = async (token) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/Eventos/EventosCursoEscolar"
            axios.get(request, {
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

    eliminarEvento = async (idEvento, token) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/Eventos/" + idEvento
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