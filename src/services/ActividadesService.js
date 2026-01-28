import axios from "axios"
import Global from "../Global"

export default class ActividadesService {
    getActividades = async (token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/Actividades"
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

    getActividadesEvento = async (idEvento) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/Actividades/ActividadesEvento/" + idEvento
            axios.get(request).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    getEventoActividad = async (idEvento, idActividad) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/ActividadesEvento/FindIdEventoActividad/" + idEvento + "/" + idActividad
            axios.get(request).then(res => {
                resolve(res.data.idEventoActividad)
            }).catch(error => {
                reject(error)
            })
        })
    }

    getActividadesUsuario = async (token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/UsuariosDeportes/ActividadesUser"
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

    asociarEventoActividad = async (idEvento, idActividad, token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/ActividadesEvento/create/" + idEvento + "/" + idActividad
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

    eliminarEventoActividad = async (idEventoActividad, token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/ActividadesEvento/" + idEventoActividad
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

    obtenerEventosActividades = async () => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/ActividadesEvento"
            axios.get(request).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    crearActividad = async (datos, token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/Actividades/create"
            axios.post(request, datos, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }
}