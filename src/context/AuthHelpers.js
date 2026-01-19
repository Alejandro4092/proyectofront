import React from 'react';
import { AuthContext } from './AuthContext';

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
    const context = React.useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    
    return context;
};

// HOC (Higher Order Component) para componentes de clase
export const withAuth = (Component) => {
    return class WithAuth extends React.Component {
        render() {
            return (
                <AuthContext.Consumer>
                    {(auth) => <Component {...this.props} auth={auth} />}
                </AuthContext.Consumer>
            );
        }
    };
};
