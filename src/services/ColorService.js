import axios from "axios"
import Global from "../Global"

export default class ColorService {
    getColorName = async (idColor) => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/Colores/" + idColor
            axios.get(request).then(res => {
                resolve(res.data.nombreColor)
            }).catch(error => {
                reject(error)
            })
        })
    }

    getColores = async () => {
        return new Promise(function(resolve, reject){
            let request = Global.apiDeportes + "api/Colores"
            axios.get(request).then(res => {
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    }
}
