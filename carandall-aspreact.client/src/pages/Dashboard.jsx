import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CarList from './CarList';
import RentCar from './RentCar';
import '../styles/Dashboard.css';
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
        } else if (userDetails) {
            switch (userDetails.type) {
                case 'Huurder':
                    setActiveSection('huren');
                    break;
                case 'ZakelijkeBeheerder':
                    setActiveSection('bedrijf');
                    break;
                case 'Medewerker':
                    console.log(userDetails.rol);
                    if (userDetails.rol === 'Backoffice') {
                        setActiveSection('editVoertuigen');
                    } else if (userDetails.rol === 'Frontoffice') {
                        setActiveSection('uitwisselenVoertuig');
                    }
                    break;
                default:
                    console.warn('Unknown user type:', userDetails.type);
            }
        }
    }, [location.pathname, location.search, userDetails]);

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
                return <Bedrijf userDetails={userDetails} setUserDetails={setUserDetails} />;
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
                    <img src="public/logout.svg" className="icon" alt="Logout" onClick={handleLogout} />
                </div>
            </nav>

            <aside className="dashboard-sidebar">
                {userDetails && userDetails.type === 'Huurder' && (
                    <>
                        <button
                            onClick={() => handleSectionChange('huren')}
                            className={activeSection === 'huren' ? 'active' : ''}
                            aria-label="Naar verhuursectie"
                        >
                            <img src="public/rental.svg" className="icon" alt="Huren icoon" /> Huren
                        </button>
                        <button
                            onClick={() => handleSectionChange('huurgeschiedenishuurder')}
                            className={activeSection === 'huurgeschiedenishuurder' ? 'active' : ''}
                            aria-label="Naar huurgeschiedenis sectie"
                        >
                            <img src="public/history.svg" className="icon" alt="Geschiedenis icoon" /> Geschiedenis
                        </button>
                    </>
                )}
                {userDetails && userDetails.type === 'Medewerker' && userDetails.rol === 'Backoffice' && (
                    <>
                        <button
                            onClick={() => handleSectionChange('editVoertuigen')}
                            className={activeSection === 'editVoertuigen' ? 'active' : ''}
                            aria-label="Voertuigen bewerken, toevoegen of verwijderen"
                        >
                            <img src="public/car(2).svg" className="icon" alt="Voertuigen icoon" /> Voertuigen
                        </button>
                        <button
                            onClick={() => handleSectionChange('verhuuraanvragen')}
                            className={activeSection === 'verhuuraanvragen' ? 'active' : ''}
                            aria-label="Bekijk verhuuraanvragen"
                        >
                            <img src="public/quote-request.svg" className="icon" alt="Verhuuraanvragen icoon" />Aanvragen
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
                    aria-label="Bekijk notificaties"
                >
                    <img src="public/notification.svg" className="icon" alt="Notificaties icoon" /> Notificaties
                </button>
                <button
                    onClick={() => handleSectionChange('account')}
                    className={activeSection === 'account' ? 'active' : ''}
                    aria-label="Bekijk account instellingen"
                >
                    <img src="public/profile.svg" className="icon" alt="Account icoon" /> Account
                </button>
                {userDetails && userDetails.type === 'ZakelijkeBeheerder' && (
                    <>
                        <button
                            onClick={() => handleSectionChange('bedrijf')}
                            className={activeSection === 'bedrijf' ? 'active' : ''}
                            aria-label="Bekijk bedrijfsinstellingen"
                        >
                            <img src="public/city.svg" className="icon" alt="Bedrijf icoon" /> Bedrijf
                        </button>
                        <button
                            onClick={() => handleSectionChange('huurgeschiedenisBeheerder')}
                            className={activeSection === 'huurgeschiedenisBeheerder' ? 'active' : ''}
                            aria-label="Bekijk huurgeschiedenis van bedrijfsmedewerkers"
                        >
                            <img src="public/history.svg" className="icon" alt="Huur Geschiedenis" /> Geschiedenis
                        </button>
                    </>
                )}

                <hr className="separator" />
                <div className="account-section">
                    <div onClick={() => handleSectionChange('account')} className="user-icon">
                        <img src="public/user.svg" alt="User" className="icon" />
                    </div>
                    {userDetails && userDetails.naam != null && (
                        <span onClick={() => handleSectionChange('account')} className="account-name">{userDetails.naam}</span>
                    )}
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