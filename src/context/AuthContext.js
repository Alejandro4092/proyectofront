import React, { createContext, Component } from 'react';
import axios from 'axios';
import Global from '../Global';
import OrganizadoresService from '../services/OrganizadoresService';

const serviceOrganizadores = new OrganizadoresService();

// Crear el contexto
export const AuthContext = createContext();

// Proveedor del contexto
export class AuthProvider extends Component {
    constructor(props) {
        super(props);
        
        // Estado inicial
        this.state = {
            usuario: null,
            rol: "",
            logeado: false,
            loading: true,
            token: null,
            esOrganizador: false,
            esProfesor: false
        };

        this.url = Global.apiDeportes;
    }

    componentDidMount() {
        // Verificar si hay sesión guardada al cargar la aplicación
        this.verificarSesion();
    }

    // Verificar si existe una sesión guardada en localStorage
    verificarSesion = async () => {
        const usuarioString = localStorage.getItem('usuario');
        const token = localStorage.getItem('token');
        
        if (usuarioString && token) {
            try {
                const usuario = JSON.parse(usuarioString);
                this.setState({
                    usuario: usuario,
                    rol: usuario.role,
                    logeado: true,
                    token: token,
                    loading: false,
                    esProfesor: usuario.role === 'PROFESOR'
                });
                // Verificar si es organizador
                await this.checkOrganizador(usuario.idUsuario);
            } catch (error) {
                // Error handled
                this.cerrarSesion();
            }
        } else {
            this.setState({ loading: false });
        }
    }

    // Realizar login
    login = async (userName, password) => {
        try {
            const loginData = {
                userName: userName,
                password: password
            };

            // Petición de login
            const loginResponse = await axios.post(
                this.url + 'api/Auth/LoginEventos', 
                loginData
            );

            const token = loginResponse.data.response;
            
            // Obtener perfil del usuario
            const perfilResponse = await axios.get(
                this.url + 'api/UsuariosDeportes/Perfil',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const usuario = perfilResponse.data;

            // Guardar en localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('usuario', JSON.stringify(usuario));

            // Actualizar estado
            this.setState({
                usuario: usuario,
                rol: usuario.role,
                logeado: true,
                token: token,
                esProfesor: usuario.role === 'PROFESOR'
            });

            // Verificar si es organizador
            await this.checkOrganizador(usuario.idUsuario);

            return { success: true, usuario };

        } catch (error) {
            // Error handled
            return { 
                success: false, 
                error: 'Usuario o contraseña incorrectos' 
            };
        }
    }

    // Cerrar sesión
    cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        
        this.setState({
            usuario: null,
            rol: "",
            logeado: false,
            token: null,
            esOrganizador: false,
            esProfesor: false
        });
    }

    // Actualizar usuario (por ejemplo, después de editar perfil)
    actualizarUsuario = (usuarioActualizado) => {
        localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
        
        this.setState({
            usuario: usuarioActualizado,
            rol: usuarioActualizado.role
        });
    }

    // Verificar si el usuario es organizador
    checkOrganizador = async (idUsuario) => {
        if (!idUsuario) return;
        
        try {
            const idsOrganizadores = await serviceOrganizadores.getIdsOrganizadoresEvento();
            const esOrganizador = idsOrganizadores.some(id => id === idUsuario);
            this.setState({ esOrganizador });
        } catch (error) {
            // Error handled
            this.setState({ esOrganizador: false });
        }
    }

    render() {
        const { children } = this.props;
        
        const contextValue = {
            usuario: this.state.usuario,
            user: this.state.usuario,
            rol: this.state.rol,
            logeado: this.state.logeado,
            loading: this.state.loading,
            token: this.state.token,
            esOrganizador: this.state.esOrganizador,
            esProfesor: this.state.esProfesor,
            login: this.login,
            cerrarSesion: this.cerrarSesion,
            actualizarUsuario: this.actualizarUsuario,
            checkOrganizador: this.checkOrganizador
        };

        return (
            <AuthContext.Provider value={contextValue}>
                {children}
            </AuthContext.Provider>
        );
    }
}

export default AuthContext;
