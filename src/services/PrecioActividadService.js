import axios from "axios"
import Global from "../Global"

export default class PrecioActividadService {
    getPreciosActividades = async () => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/PrecioActividad"
            axios.get(request).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    getPrecioActividad = async (id) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/PrecioActividad/" + id
            axios.get(request).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    crearPrecioActividad = async (datos, token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/PrecioActividad/create"
            axios.post(request, datos, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    actualizarPrecioActividad = async (datos, token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/PrecioActividad/update"
            axios.put(request, datos, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }
}
