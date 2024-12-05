import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('https://localhost:7159/api/account/isAuthenticated', {
                    withCredentials: true,
                });

                if (response.status === 200) {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Authentication check failed:', error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return <div>Loading...</div>; 
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
