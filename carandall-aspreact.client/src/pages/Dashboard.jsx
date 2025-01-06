import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CarList from './CarList';
import RentCar from './RentCar';
import '../styles/Dashboard.css';
import { FaUserCircle } from 'react-icons/fa';
import Account from './Account.jsx';
import Bedrijf from './Bedrijf.jsx';
import Status from './Status.jsx';
import Notifications from './Notifications.jsx';
import HuurgeschiedenisHuurder from './HuurgeschiedenisHuurder.jsx';
import HuurgeschiedenisBeheerder from './HuurgeschiedenisBeheerder.jsx';
import axios from 'axios';
import fetchUserData from '../api/userDataApi';

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('home');
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const section = params.get('section');
        if (section) {
            setActiveSection(section);
        }
    }, [location]);

    useEffect(() => {
        fetchUserData()
            .then(data => setUserDetails(data))
            .catch(error => console.error('Error fetching user data:', error));
    }, []);

    const handleSectionChange = (section) => {
        setActiveSection(section);
        navigate(`?section=${section}`);
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'huren':
                return <CarList />;
            case 'status':
                return <Status />;
            case 'notifications':
                return <Notifications />;
            case 'account':
                return <Account />;
            case 'bedrijf':
                return <Bedrijf userDetails={userDetails} />;
            case 'huurgeschiedenishuurder':
                return <HuurgeschiedenisHuurder userDetails={userDetails} />;
            case 'huurgeschiedenisBeheerder':
                return <HuurgeschiedenisBeheerder userDetails={userDetails} />;

            default:
                return <div className="section">Welcome to the Dashboard!</div>;
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'https://localhost:7159/api/account/logout',
                {},
                { withCredentials: true }
            );
            window.location.reload();
            console.log(response.data.message);
        } catch (error) {
            console.error('Uitloggen mislukt: ', error);
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
                {userDetails && userDetails.type === 'Huurder' && (
                    <>
                        <button
                            onClick={() => handleSectionChange('huren')}
                            className={activeSection === 'huren' ? 'active' : ''}
                        >
                            Huren
                        </button>
                        <button
                            onClick={() => handleSectionChange('huurgeschiedenishuurder')}
                            className={activeSection === 'huurgeschiedenishuurder' ? 'active' : ''}
                        >
                            HuurgeschiedenisHuurder
                        </button>
                    </>
                )}
                {userDetails && userDetails.type === 'Mederwerker' && (
                    <button
                        onClick={() => handleSectionChange('status')}
                        className={activeSection === 'status' ? 'active' : ''}
                    >
                        Status
                    </button>
                )}
                <button
                    onClick={() => handleSectionChange('notifications')}
                    className={activeSection === 'notifications' ? 'active' : ''}
                >
                    Notificaties
                </button>
                <button
                    onClick={() => handleSectionChange('account')}
                    className={activeSection === 'account' ? 'active' : ''}
                >
                    Account
                </button>
                {userDetails && userDetails.type === 'ZakelijkeBeheerder' && (
                    <>
                       <button
                        onClick={() => handleSectionChange('bedrijf')}
                        className={activeSection === 'bedrijf' ? 'active' : ''}
                    >
                        Bedrijf
                    </button>
                        <button
                            onClick={() => handleSectionChange('huurgeschiedenisBeheerder')}
                            className={activeSection === 'huurgeschiedenisBeheerder' ? 'active' : ''}
                        >
                            HuurgeschiedenisBeheeerder
                        </button>
                    </>
                )}
            </aside>

            <main className="dashboard-content">{renderSection()}</main>
        </div>
    );
};

export default Dashboard;
