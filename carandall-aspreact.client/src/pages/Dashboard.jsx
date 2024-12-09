import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CarList from './CarList';
import '../styles/Dashboard.css';
import { FaUserCircle } from 'react-icons/fa';
import Account from './Account.jsx';
import Notifications from './Notifications.jsx';
import axios from 'axios';

const Dashboard = () => {
    const location = useLocation();
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const section = params.get('section');
        if (section) {
            setActiveSection(section);
        }
    }, [location]);

    const renderSection = () => {
        switch (activeSection) {
            case 'home':
                return <CarList />;
            case 'notifications':
                return <Notifications />;
            case 'account':
                return <Account />;
            default:
                return <div className="section">Welcome to the Dashboard!</div>;
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                'https://localhost:7159/api/account/logout',
                {
                    withCredentials: true,
                }
            );

            window.location.reload();
            console.log(response.data.message);
        } catch (error) {
            console.error('Logout failed: ', error);
        }
    };

    return (
        <div className="dashboard-layout">
            <nav className="dashboard-navbar">
                <a className="navbar-logo" href="/">
                    <h2>CarAndAll</h2>
                </a>
                <div className="navbar-right-section">
                    <a className="navbar-logout" onClick={handleLogout}>Log uit</a>
                    <FaUserCircle className="account-icon" />
                </div>

            </nav>

            <aside className="dashboard-sidebar">
                <button onClick={() => setActiveSection('home')} className={activeSection === 'home' ? 'active' : ''}>
                    Home
                </button>
                <button onClick={() => setActiveSection('notifications')} className={activeSection === 'notifications' ? 'active' : ''}>
                    Notifications
                </button>
                <button onClick={() => setActiveSection('account')} className={activeSection === 'account' ? 'active' : ''}>
                    Account
                </button>
            </aside>

            <main className="dashboard-content">{renderSection()}</main>
        </div>
    );
};

export default Dashboard;