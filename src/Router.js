import React, { Component } from 'react'
import { BrowserRouter, Route, Routes, useParams, useLocation } from 'react-router-dom'
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
import CrearActividadComponent from './components/CrearActividadComponent'
import { AuthProvider } from './context/AuthContext'
import MaterialesSolicitadosComponent from './components/MaterialesSolicitadosComponent'
import NotFoundComponent from './components/NotFoundComponent'
import PagosComponent from './components/PagosComponent'
import GestionarActividadesComponent from './components/GestionarActividadesComponent'
import PrivateRoute from './context/PrivateRoute'
import GestionarOrganizadoresComponent from './components/GestionarOrganizadoresComponent'
import InscripcionesCapitanComponent from './components/InscripcionesCapitanComponent'

// Componente para mostrar navbar condicionalmente
function ConditionalNavbar() {
    const location = useLocation();
    const hideNavbar = location.pathname === '/login';

    return !hideNavbar ? <NavbarComponent /> : null;
}

export default class Router extends Component {
    render() {
        function EditarEvento() {
            let params = useParams();
            return <EditarEventoWrapper idEvento={params.id} />;
        }

        function EquipoComponentElement() {
            const { idEquipo } = useParams()
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
        function GestionarActividadesElement() {
            let { idEvento } = useParams();
            return <GestionarActividadesComponent idEvento={idEvento} />;
        }
        return (
            <AuthProvider>
                <BrowserRouter>
                    <ConditionalNavbar />
                    <div className="main-container">
                        <Routes>
                            <Route path='/login' element={<LoginComponent />} />
                            <Route path='/' element={<PrivateRoute><Home /></PrivateRoute>} />
                            <Route path='/perfil' element={<PrivateRoute><PerfilComponent /></PrivateRoute>} />
                            <Route path='/crear-equipo/:idEvento/:idActividad' element={<PrivateRoute><CrearEquipoElement /></PrivateRoute>} />
                            <Route path='/eventos' element={<PrivateRoute><EventosComponent /></PrivateRoute>} />
                            <Route path='/crear-evento' element={<PrivateRoute><CrearEventoWrapper /></PrivateRoute>} />
                            <Route path='/editar-evento/:id' element={<PrivateRoute><EditarEvento /></PrivateRoute>} />
                            <Route path='/equipos' element={<PrivateRoute><ListaEquiposComponent /></PrivateRoute>} />
                            <Route path='/equipos/:idEvento/:idActividad' element={<PrivateRoute><ListaEquiposElement /></PrivateRoute>} />
                            <Route path='/equipo/:idEquipo' element={<PrivateRoute><EquipoComponentElement /></PrivateRoute>} />
                            <Route path='/actividades/:idEvento' element={<PrivateRoute><ActividadesElement /></PrivateRoute>} />
                            <Route path='/crear-actividad' element={<PrivateRoute><CrearActividadComponent /></PrivateRoute>} />
                            <Route path='/gestionar-actividades/:idEvento' element={<PrivateRoute><GestionarActividadesElement /></PrivateRoute>} />
                            <Route path='/partidos' element={<PrivateRoute><PartidosComponent /></PrivateRoute>} />
                            <Route path='/materialesSolicitados' element={<PrivateRoute><MaterialesSolicitadosComponent /></PrivateRoute>} />
                            <Route path='/pagos' element={<PrivateRoute><PagosComponent /></PrivateRoute>} />
                            <Route path='/gestionarOrganizadores' element={<GestionarOrganizadoresComponent />} />
                            <Route path='/inscripcionesCapitan' element={<PrivateRoute><InscripcionesCapitanComponent /></PrivateRoute>} />
                            <Route path='*' element={<NotFoundComponent />} />

                        </Routes>
                    </div>
                </BrowserRouter>
            </AuthProvider>
        )
    }
}