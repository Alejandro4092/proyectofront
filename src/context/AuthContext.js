import React, { createContext, Component } from 'react';
import axios from 'axios';
import Global from '../Global';

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
            token: null
        };

        this.url = Global.apiDeportes;
    }

    componentDidMount() {
        // Verificar si hay sesión guardada al cargar la aplicación
        this.verificarSesion();
    }

    // Verificar si existe una sesión guardada en localStorage
    verificarSesion = () => {
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
                    loading: false
                });
            } catch (error) {
                console.error('Error al parsear usuario:', error);
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
                token: token
            });

            return { success: true, usuario };

        } catch (error) {
            console.error('Error en login:', error);
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
            token: null
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

    render() {
        const { children } = this.props;
        
        const contextValue = {
            usuario: this.state.usuario,
            rol: this.state.rol,
            logeado: this.state.logeado,
            loading: this.state.loading,
            token: this.state.token,
            login: this.login,
            cerrarSesion: this.cerrarSesion,
            actualizarUsuario: this.actualizarUsuario
        };

        return (
            <AuthContext.Provider value={contextValue}>
                {children}
            </AuthContext.Provider>
        );
    }
}

export default AuthContext;
