import axios from "axios"
import Global from "../Global"

export default class EventosService {
    getTodosEventos = async () => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/Eventos"
            axios.get(request).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    getEventosCursoEscolar = async (token) => {
        return new Promise(function (resolve, reject) {
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
        return new Promise(function (resolve, reject) {
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

    getEvento = async (idEvento, token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/Eventos/" + idEvento
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

    actualizarEvento = async (evento, token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/Eventos/update"
            axios.put(request, evento, {
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

    crearEvento = async (fecha, token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/Eventos/create/" + encodeURIComponent(fecha) + "?datofecha=" + encodeURIComponent(fecha)
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
    eliminarEventoCompleto = async (idEvento, token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "/api/Eventos/DeleteEventoPanic/" + idEvento
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
