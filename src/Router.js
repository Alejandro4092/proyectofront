import React, { Component } from 'react'
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import NavbarComponent from './components/NavbarComponent'
import Home from './components/Home'
import './css/Router.css'
import PerfilComponent from './components/PerfilComponent'
import ActividadesComponent from './components/ActividadesComponent'

export class Router extends Component {
    render() {
        function ActividadesElement() {
            let { idEvento } = useParams();
            return <ActividadesComponent idEvento={idEvento} />;
        }
        return (
        <BrowserRouter>
            <NavbarComponent/>
            <div className="main-container">
                <Routes>
                    <Route path='/' element={<Home/>}/>
                    <Route path='/perfil' element={<PerfilComponent/>}/>
                    <Route path='/actividades/:idEvento' element={<ActividadesElement/>}/>
                </Routes>
            </div>
        </BrowserRouter>
        )
    }
}

export default Router