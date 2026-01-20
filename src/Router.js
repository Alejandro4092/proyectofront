import React, { Component } from 'react'
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import NavbarComponent from './components/NavbarComponent'
import Home from './components/Home'
import './css/Router.css'
import PerfilComponent from './components/PerfilComponent'
import EventosComponent from './components/EventosComponent'
import CrearEventoWrapper from './components/CrearEventoComponent'
import { EditarEventoWrapper } from './components/EditarEventoComponent'
import ListaEquiposComponent from './components/ListaEquiposComponent'
import { EquipoComponent } from './components/EquipoComponent'
import ActividadesComponent from './components/ActividadesComponent'
import LoginComponent from './components/LoginComponent'
import PartidosComponent from './components/PartidosComponent'
import CrearEquipoComponent from './components/CrearEquipoComponent'
import { AuthProvider } from './context/AuthContext'

export default class Router extends Component {
    render() {
        function EditarEvento() {
            let params = useParams();
            return <EditarEventoWrapper idEvento={params.id} />;
        }

        function EquipoComponentElement(){
            const {idEquipo} = useParams()
            return <EquipoComponent idEquipo={idEquipo} />
        }
        function ActividadesElement() {
            let { idEvento } = useParams();
            return <ActividadesComponent idEvento={idEvento} />;
        }
        function ListaEquiposElement() {
            let { idEvento } = useParams();
            let { idActividad } = useParams();
            return <ListaEquiposComponent idEvento={idEvento} idActividad={idActividad} />;
        }
        function CrearEquipoElement() {
            let { idEvento } = useParams();
            let { idActividad } = useParams();
            return <CrearEquipoComponent idEvento={idEvento} idActividad={idActividad} />;
        }
        return (
        <AuthProvider>
            <BrowserRouter>
                <NavbarComponent/>
                <div className="main-container">
                    <Routes>
                        <Route path='/' element={<Home/>}/>
                        <Route path='/login' element={<LoginComponent/>}/>
                        <Route path='/perfil' element={<PerfilComponent/>}/>
                        <Route path='/crear-equipo/:idEvento/:idActividad' element={<CrearEquipoElement/>}/>
                        <Route path='/eventos' element={<EventosComponent/>}/>
                        <Route path='/crear-evento' element={<CrearEventoWrapper/>}/>
                        <Route path='/editar-evento/:id' element={<EditarEvento/>}/>
                        <Route path='/equipos' element={<ListaEquiposComponent/>}/>
                        <Route path='/equipos/:idEvento/:idActividad/' element={<ListaEquiposElement/>}/>
                        <Route path='/equipo/:idEquipo' element={<EquipoComponentElement/>}/>
                        <Route path='/actividades/:idEvento' element={<ActividadesElement/>}/>
                        <Route path='/partidos' element={<PartidosComponent/>}/>
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
        )
    }
}