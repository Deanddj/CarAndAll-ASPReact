import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CarList from './CarList';
import RentCar from './RentCar';
import '../styles/Dashboard.css';
import { FaUserCircle } from 'react-icons/fa';
import Account from './Account.jsx';
import Bedrijf from './Bedrijf.jsx';
import Notifications from './Notifications.jsx';
import VehicleOverview from './VehicleOverview.jsx';
import HuurgeschiedenisHuurder from './HuurgeschiedenisHuurder.jsx';
import HuurgeschiedenisBeheerder from './HuurgeschiedenisBeheerder.jsx';
import Verhuuraanvragen from './Verhuuraanvragen.jsx';
import UitwisselenVoertuig from './UitwisselenVoertuig.jsx';
import axios from 'axios';
import fetchUserData from '../api/userDataApi';
import { MessageProvider, useMessage } from '../context/MessageProvider';
import { MessageBox } from '../components/MessageBox/MessageBox';

const DashboardContent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('');
    const [userDetails, setUserDetails] = useState(null);
    const [vehicleId, setVehicleId] = useState(null);
    const { showMessage, closeMessage } = useMessage();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const section = params.get('section');
        if (section) {
            setActiveSection(section);
            if (section.startsWith('rentcar/')) {
                const id = section.split('/')[1];
                setVehicleId(id);
            }
        }
    }, [location]);

    useEffect(() => {
        fetchUserData()
            .then(data => setUserDetails(data))
            .catch(error => {
                console.error('Error fetching user data:', error);
                showMessage('Failed to fetch user details', 'error');
            });
    }, []);

    const [previousSection, setPreviousSection] = useState(activeSection);

    useEffect(() => {
        if (previousSection !== activeSection) {
            closeMessage();
            setPreviousSection(activeSection);
        }
    }, [activeSection, previousSection, closeMessage]);

    const handleSectionChange = (section) => {
        if (section !== activeSection) {
            setActiveSection(section);
            navigate(`?section=${section}`);
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
        } catch (error) {
            console.error('Logout failed: ', error);
            showMessage('Logout failed. Please try again.', 'error');
        }
    };

    const renderSection = () => {
        if (activeSection.startsWith('rentcar') && vehicleId) {
            return <RentCar voertuigId={vehicleId} />;
        }

        switch (activeSection) {
            case 'huren':
                return <CarList onChangeSection={handleSectionChange} />;
            case 'editVoertuigen':
                return <VehicleOverview />;
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
            case 'uitwisselenVoertuig':
                return <UitwisselenVoertuig userDetails={userDetails} />;
            case 'verhuuraanvragen':
                return <Verhuuraanvragen />;
            default:
                return <div className="section">Welkom bij de dashboard!</div>;
        }
    };

    return (
        <div className="dashboard-layout">
            <nav className="dashboard-navbar">
                <a className="navbar-logo" href="/">
                    <h2>CarAndAll</h2>
                </a>
                <div className="navbar-right-section">
                    <a className="navbar-logout" onClick={handleLogout}>
                        Log uit
                    </a>
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
                            <img src="public/rental.svg" className="icon" alt="Voertuigen" /> Huren
                        </button>
                        <button
                            onClick={() => handleSectionChange('huurgeschiedenishuurder')}
                            className={activeSection === 'huurgeschiedenishuurder' ? 'active' : ''}
                        >
                            <img src="public/history.svg" className="icon" alt="Voertuigen" /> Geschiedenis
                        </button>
                    </>
                )}
                {userDetails && userDetails.type === 'Medewerker' && userDetails.rol === 'Backoffice' && (
                    <>
                        <button
                            onClick={() => handleSectionChange('editVoertuigen')}
                            className={activeSection === 'editVoertuigen' ? 'active' : ''}
                        >
                            <img src="public/car(2).svg" className="icon" alt="Voertuigen" /> Voertuigen
                        </button>
                        <button
                            onClick={() => handleSectionChange('verhuuraanvragen')}
                            className={activeSection === 'verhuuraanvragen' ? 'active' : ''}
                        >
                            <img src="public/quote-request.svg" className="icon" alt="Verhuurdaanvragen" />Aanvragen
                        </button>
                    </>
                )}
                {userDetails && userDetails.type === 'Medewerker' && userDetails.rol === 'Frontoffice'&& (
                    <>
                        <button
                            onClick={() => handleSectionChange('uitwisselenVoertuig')}
                            className={activeSection === 'uitwisselenVoertuig' ? 'active' : ''}
                        >
                            <img src="public/car(2).svg" className="icon" alt="Voertuigen" /> Uitwisselen
                        </button>
                    </>
                )}
                <button
                    onClick={() => handleSectionChange('notifications')}
                    className={activeSection === 'notifications' ? 'active' : ''}
                >
                    <img src="public/notification.svg" className="icon" alt="Notificaties" /> Notificaties
                </button>
                <button
                    onClick={() => handleSectionChange('account')}
                    className={activeSection === 'account' ? 'active' : ''}
                >
                    <img src="public/profile.svg" className="icon" alt="Account" /> Account
                </button>
                {userDetails && userDetails.type === 'ZakelijkeBeheerder' && (
                    <>
                        <button
                            onClick={() => handleSectionChange('bedrijf')}
                            className={activeSection === 'bedrijf' ? 'active' : ''}
                        >
                            <img src="public/city.svg" className="icon" alt="Voertuigen" /> Bedrijf
                        </button>
                        <button
                            onClick={() => handleSectionChange('huurgeschiedenisBeheerder')}
                            className={activeSection === 'huurgeschiedenisBeheerder' ? 'active' : ''}
                        >
                            <img src="public/history.svg" className="icon" alt="Huur Geschiedenis" /> Geschiedenis
                        </button>
                    </>
                )}

                <hr className="separator" />
                <div className="account-section">
                    <div className="user-icon">
                        <img src="public/user.svg" alt="User" className="icon" />
                    </div>
                    <span onClick={handleLogout} className="logout-text">Log uit</span>
                </div>
            </aside>

            <main className="dashboard-content">
                <MessageBox />
                {renderSection()}
            </main>
        </div>
    );
};

const Dashboard = () => (
    <MessageProvider>
        <DashboardContent />
    </MessageProvider>
);

export default Dashboard;