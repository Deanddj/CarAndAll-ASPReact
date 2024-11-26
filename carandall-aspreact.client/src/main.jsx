import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import Homepage from './pages/HomePage.jsx';
import ProfileSettingsPage from './pages/ProfileSettingsPage.jsx';
import Footer from './pages/Footer.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Router>
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/dashboard/account" element={<ProfileSettingsPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
            <Footer />
        </Router>
    </StrictMode>
);
