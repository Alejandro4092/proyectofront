import axios from "axios"
import Global from "../Global"

export default class PartidosService {
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
}
