import axios from "axios"
import Global from "../Global"

export default class ProfesEventosService {
    // GET: Obtiene profesores activos
    getProfesoresActivos = async (token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/ProfesEventos/ProfesActivos"
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

    // GET: Obtiene un profesor por su ID
    getProfesorById = async (idProfesor, token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/ProfesEventos/FindProfe?idprofesor=" + idProfesor
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

    // GET: Obtiene profesores con eventos
    getProfesoresConEventos = async (token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/ProfesEventos/ProfesConEventos"
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

    // GET: Obtiene profesores sin eventos
    getProfesoresSinEventos = async (token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/ProfesEventos/ProfesSinEventos"
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

    // POST: Asocia un profesor a un evento
    asociarProfesorEvento = async (idEvento, idProfesor, token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/ProfesEventos/AsociarProfesorEvento/" + idEvento + "/" + idProfesor
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

    // DELETE: Elimina un profesor de un evento
    eliminarProfesorEvento = async (idEvento, token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/ProfesEventos/EliminarProfesorEvento/" + idEvento
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
