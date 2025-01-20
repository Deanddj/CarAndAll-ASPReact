import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { MessageProvider } from './context/MessageProvider.jsx';
import './index.css';
import Homepage from './pages/HomePage.jsx';
import Footer from './pages/Footer.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Register from './pages/Register.jsx';
import ProtectedRoute from './pages/ProtectedRoute';
import RentCar from './pages/RentCar';
import PrivacyBeleid from './pages/PrivacyBeleid';


const AppWithFooter = () => {
    const location = useLocation();
    const noFooterPaths = ['/dashboard'];

    return (
        <MessageProvider>
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />\
                <Route path="/rentCar/:voertuigId" element={<RentCar />} />
                <Route path="/privacybeleid" element={<PrivacyBeleid />} />

            </Routes>

            {!noFooterPaths.includes(location.pathname) && <Footer />}
        </MessageProvider>
    );
};

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Router>
            <AppWithFooter />
        </Router>
    </StrictMode>
);
