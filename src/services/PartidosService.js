import axios from "axios"
import Global from "../Global"

export default class PartidosService {
    // GET - Obtener todos los resultados
    getPartidos = async () => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/PartidoResultado"
            axios.get(request).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    // GET - Obtener resultados por actividad
    getPartidosPorActividad = async (idEventoActividad) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/PartidoResultado/PartidosResultadosActividad/" + idEventoActividad
            axios.get(request).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    // GET - Obtener resultados por equipo
    getPartidosEquipo = async (idEquipo) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/PartidoResultado/PartidosEquipo/" + idEquipo
            axios.get(request).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    // GET - Obtener resultado por ID
    getPartidoResultado = async (id) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/PartidoResultado/" + id
            axios.get(request).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    // POST - Crear nuevo resultado
    createPartidoResultado = async (partidoResultado, token) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/PartidoResultado/create"
            let headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
            axios.post(request, partidoResultado, { headers: headers }).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    // PUT - Actualizar resultado
    updatePartidoResultado = async (partidoResultado, token) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/PartidoResultado/update"
            let headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
            axios.put(request, partidoResultado, { headers: headers }).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    // DELETE - Eliminar resultado
    deletePartidoResultado = async (id, token) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/PartidoResultado/" + id
            let headers = {
                'Authorization': `Bearer ${token}`
            }
            axios.delete(request, { headers: headers }).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }
}
