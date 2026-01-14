import React, { Component } from 'react'
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import NavbarComponent from './components/NavbarComponent'
import Home from './components/Home'
import './css/Router.css'
import PerfilComponent from './components/PerfilComponent'
import ListaEquiposComponent from './components/ListaEquiposComponent'
import { EquipoComponent } from './components/EquipoComponent'

export class Router extends Component {
    render() {
        function EquipoComponentElement(){
            const {idEquipo} = useParams()
            const {idEventoActividad} = useParams()
            return <EquipoComponent idEquipo={idEquipo} idEventoActividad={idEventoActividad} />
        }
        return (
        <BrowserRouter>
            <NavbarComponent/>
            <div className="main-container">
                <Routes>
                    <Route path='/' element={<Home/>}/>
                    <Route path='/perfil' element={<PerfilComponent/>}/>
                    <Route path='/equipos' element={<ListaEquiposComponent/>}/>
                    <Route path='/equipo/:idEquipo/:idEventoActividad' element={<EquipoComponentElement/>}/>

                </Routes>
            </div>
        </BrowserRouter>
        )
    }
}

export default Router