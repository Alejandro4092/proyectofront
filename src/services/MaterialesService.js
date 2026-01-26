import axios from "axios"
import Global from "../Global"

export default class MaterialesService {
    getMateriales = async () => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/Materiales"
            axios.get(request).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }
}