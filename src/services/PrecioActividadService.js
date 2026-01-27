import axios from "axios"
import Global from "../Global"

export default class PrecioActividadService {
    getPreciosActividades = async () => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/PrecioActividad"
            axios.get(request).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    getPrecioActividad = async (id) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/PrecioActividad/" + id
            axios.get(request).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }
}
