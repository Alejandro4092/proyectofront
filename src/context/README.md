# Sistema de Autenticación con Context API

Este proyecto implementa un sistema de autenticación global utilizando React Context API.

## Estructura

```
src/
  context/
    AuthContext.js       - Contexto y Provider de autenticación
    AuthHelpers.js       - Hook useAuth y HOC withAuth
    PrivateRoute.js      - Componente para rutas protegidas
```

## Uso del Contexto

### 1. En Componentes Funcionales (con Hook)

```javascript
import { useAuth } from '../context/AuthHelpers';

function MiComponente() {
    const { usuario, logeado, rol, login, cerrarSesion } = useAuth();
    
    return (
        <div>
            {logeado ? (
                <p>Bienvenido {usuario.nombre}</p>
            ) : (
                <p>No has iniciado sesión</p>
            )}
        </div>
    );
}
```

### 2. En Componentes de Clase (con contextType)

```javascript
import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';

class MiComponente extends Component {
    static contextType = AuthContext;
    
    render() {
        const { usuario, logeado, rol } = this.context;
        
        return (
            <div>
                {logeado && <p>Bienvenido {usuario.nombre}</p>}
            </div>
        );
    }
}
```

### 3. En Componentes de Clase (con HOC)

```javascript
import { withAuth } from '../context/AuthHelpers';

class MiComponente extends Component {
    render() {
        const { usuario, logeado } = this.props.auth;
        return <div>{usuario?.nombre}</div>;
    }
}

export default withAuth(MiComponente);
```

## Propiedades del Contexto

El contexto de autenticación proporciona las siguientes propiedades:

- `usuario` - Objeto con los datos del usuario autenticado (null si no está logueado)
- `rol` - String con el rol del usuario ("Admin", "Profesor", "Alumno", etc.)
- `logeado` - Boolean que indica si hay un usuario autenticado
- `loading` - Boolean que indica si se está verificando la sesión
- `token` - String con el token JWT del usuario
- `login(userName, password)` - Función para iniciar sesión
- `cerrarSesion()` - Función para cerrar sesión
- `actualizarUsuario(usuario)` - Función para actualizar los datos del usuario

## Rutas Protegidas

Para proteger rutas que requieren autenticación:

```javascript
import { PrivateRoute } from './context/PrivateRoute';

// Ruta que requiere autenticación
<Route 
    path="/perfil" 
    element={
        <PrivateRoute>
            <PerfilComponent />
        </PrivateRoute>
    } 
/>

// Ruta que requiere rol específico
<Route 
    path="/admin" 
    element={
        <PrivateRoute rolesPermitidos={['Admin']}>
            <AdminComponent />
        </PrivateRoute>
    } 
/>

// Ruta que requiere uno de varios roles
<Route 
    path="/profesores" 
    element={
        <PrivateRoute rolesPermitidos={['Admin', 'Profesor']}>
            <ProfesoresComponent />
        </PrivateRoute>
    } 
/>
```

## Ejemplo de Login

```javascript
const handleLogin = async () => {
    const resultado = await login('usuario@test.com', 'password123');
    
    if (resultado.success) {
        console.log('Login exitoso', resultado.usuario);
        // Redirigir o actualizar UI
    } else {
        console.error('Error:', resultado.error);
        // Mostrar mensaje de error
    }
};
```

## Ejemplo de Logout

```javascript
const handleLogout = () => {
    cerrarSesion();
    // El usuario será redirigido automáticamente
};
```

## Persistencia

El sistema guarda automáticamente el token y los datos del usuario en `localStorage`, por lo que la sesión persiste incluso después de recargar la página.

## Ventajas

1. **Estado Global**: El estado del usuario es accesible desde cualquier componente
2. **Sin Props Drilling**: No necesitas pasar props a través de múltiples niveles
3. **Persistencia**: La sesión se mantiene al recargar la página
4. **Centralizado**: Toda la lógica de autenticación en un solo lugar
5. **Fácil de usar**: Hook simple para componentes funcionales
6. **Compatible**: Funciona con componentes de clase y funcionales
