import axios from "axios"
import Global from "../Global"

export default class CapitanService {
    getCapitanes = async (token) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/CapitanActividades"
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

    getCapitanEventoActividad = async (idEventoActividad, token) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/CapitanActividades/FindCapitanEventoActividad/" + idEventoActividad
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
}