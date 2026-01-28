import axios from "axios"
import Global from "../Global"

export default class PagosService {
    getPagosCurso = async (idCurso, token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/Pagos/PagosCurso/" + idCurso
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

    getPagosCompletoCurso = async (idCurso, token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/Pagos/PagosCompletoCurso/" + idCurso
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

    getPagosEvento = async (idEvento, token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/Pagos/PagosEvento/" + idEvento
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

    crearPago = async (idEventoActividad, idCurso, cantidad, token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/Pagos/PagoEventoActividad/" + idEventoActividad + "/" + idCurso + "/" + cantidad
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

    updatePago = async (idPago, cantidad, estado, token) => {
        return new Promise(function (resolve, reject) {
            let request = Global.apiDeportes + "api/Pagos/UpdatePago/" + idPago + "/" + cantidad + "/" + estado
            axios.put(request, {}, {
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
