import React, { Component } from 'react'
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import NavbarComponent from './components/NavbarComponent'
import Home from './components/Home'
import './css/Router.css'
import PerfilComponent from './components/PerfilComponent'
import EventosComponent from './components/EventosComponent'
import CrearEventoWrapper from './components/CrearEventoComponent'
import { EditarEventoWrapper } from './components/EditarEventoComponent'

export default class Router extends Component {
    render() {
        function EditarEvento() {
            let params = useParams();
            return <EditarEventoWrapper idEvento={params.id} />;
        }

        return (
        <BrowserRouter>
            <NavbarComponent/>
            <div className="main-container">
                <Routes>
                    <Route path='/' element={<Home/>}/>
                    <Route path='/perfil' element={<PerfilComponent/>}/>
                    <Route path='/eventos' element={<EventosComponent/>}/>
                    <Route path='/crear-evento' element={<CrearEventoWrapper/>}/>
                    <Route path='/editar-evento/:id' element={<EditarEvento/>}/>
                </Routes>
            </div>
        </BrowserRouter>
        )
    }
}