import axios from "axios"
import Global from "../Global"

export default class EquiposService {
    getEquiposActividad = async (idActividad, idEvento) => {
        return new Promise(function(resolve){
            let request = Global.apiDeportes + "api/Equipos/EquiposActividadEvento/" + idActividad + "/" + idEvento
            axios.get(request).then(res => {
                console.log(res.data)
                resolve(res.data)
            })
        })
    }

    getEquipo = async (idEquipo) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/Equipos/" + idEquipo
            axios.get(request).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    crearEquipo = async (equipo, token) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/Equipos/create"
            axios.post(request, equipo, {
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

    // actualizarEquipo = async (idEquipo, equipo, token) => {
    //     return new Promise(function(resolve, reject){
    //         let request = Global.apiDeportes + "api/Equipos/" + idEquipo
    //         axios.put(request, equipo, {
    //             headers: {
    //                 'Authorization': `Bearer ${token}`
    //             }
    //         }).then(res => {
    //             resolve(res.data)
    //         }).catch(error => {
    //             reject(error)
    //         })
    //     })
    // }

    eliminarEquipo = async (idEquipo, token) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/Equipos/" + idEquipo
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

    getJugadoresEquipo = async (idEquipo) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/Equipos/UsuariosEquipo/" + idEquipo
            axios.get(request).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    actualizarColorEquipo = async (idEquipo, idColor, token) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/Equipos/UpdateEquipacionEquipo/" + idEquipo + "/" + idColor
            axios.put(request, {
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

    apuntarseEquipo = async (idEquipo, token) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/UsuariosDeportes/ApuntarmeEquipo/" + idEquipo
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

    salirseEquipo = async (idEquipo, idUsuario, token) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/MiembroEquipos/DeleteMiembroEquipoUsuario/" + idEquipo + "/" + idUsuario
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

    expulsarJugador = async (idMiembroEquipo, token) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/MiembroEquipos/" + idMiembroEquipo
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