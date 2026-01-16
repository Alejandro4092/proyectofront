import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthHelpers';

/**
 * Componente para proteger rutas que requieren autenticación
 * @param {Object} props - Propiedades del componente
 * @param {React.Component} props.children - Componente hijo a renderizar si está autenticado
 * @param {Array<string>} props.rolesPermitidos - Roles permitidos para acceder (opcional)
 */
export const PrivateRoute = ({ children, rolesPermitidos = [] }) => {
    const { logeado, loading, rol } = useAuth();

    // Mostrar loader mientras se verifica la sesión
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <p>Cargando...</p>
            </div>
        );
    }

    // Si no está logueado, redirigir al login
    if (!logeado) {
        return <Navigate to="/login" replace />;
    }

    // Si hay roles permitidos y el usuario no tiene el rol adecuado
    if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(rol)) {
        return <Navigate to="/" replace />;
    }

    // Si está autenticado y tiene el rol adecuado, renderizar el componente
    return children;
};

export default PrivateRoute;
