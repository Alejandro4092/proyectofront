import axios from "axios"
import Global from "../Global"

export default class GestionEventoService {
    getCursosActivos = async (token) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/GestionEvento/CursosActivos"
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
