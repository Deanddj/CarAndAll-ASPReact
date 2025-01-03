import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Bedrijf.css';
import sendNotification from '../api/notificationApi';

axios.defaults.baseURL = 'https://localhost:7159';
axios.defaults.withCredentials = true;

const BedrijfPage = ({ userDetails }) => {
    const [email, setEmail] = useState('');
    const [invitationStatus, setInvitationStatus] = useState(null);
    const [isInviting, setIsInviting] = useState(false);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [subscriptionType, setSubscriptionType] = useState('');

    //const handleSubscriptionChange = (e) => {
    //    setSubscriptionType(e.target.value);
    //};

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleInvite = async () => {
        if (!email) {
            alert('Voer a.u.b. een geldige email in.');
            return;
        }

        const getEmailDomain = (email) => {
            const emailParts = email.split('@');
            return emailParts.length === 2 ? emailParts[1] : '';
        };

        const emailDomain = getEmailDomain(email);
        const userDomain = getEmailDomain(userDetails?.userName);

        if (userDomain && emailDomain && userDomain !== emailDomain) {
            alert("Je kunt alleen gebruikers met hetzelfde bedrijfsdomein uitnodigen.");
            return;
        }

        if (userDetails?.userName === email) {
            alert("Je kunt jezelf niet uitnodigen.");
            return;
        }

        setIsInviting(true);
        try {
            await sendNotification(email, "BedrijfVerzoek", userDetails?.bedrijf?.bedrijfId, "Bedrijf Uitnodiging",
                `Je bent uitgenodigd om het bedrijf '${userDetails?.bedrijf?.naam}' te deelnemen, 
                klik op een van de onderstaande opties.`);
            setInvitationStatus('Uitnodiging verstuurd!.');
        } catch (error) {
            console.error('Error versturen van uitnodiging', error);
            setInvitationStatus('Uitnodiging niet verstuurd.');
        } finally {
            setIsInviting(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await axios.get(`/api/bedrijf/get/${userDetails?.bedrijf?.bedrijfId}`);
            const huurders = response.data.huurders?.$values || [];
            setUsers(huurders);
        } catch (error) {
            console.error('Fout met het ophalen van gebruikers:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await axios.delete(`/api/bedrijf/remove-user/${userId}`);
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Fout met het verwijderen van de gebruiker:', error);
        }
    };

    useEffect(() => {
        if (userDetails?.bedrijf?.bedrijfId) {
            fetchUsers();
        }
        //setSubscriptionType(userDetails?.bedrijf);
    }, [userDetails]);



    return (
        <div className="bedrijf-page">
            <div className="subscription-section">
                <h2>Selecteer Abonnementstype</h2>
                <div className="subscription-options">
                    <div
                        className={`subscription-option ${subscriptionType === 'prepaid' ? 'selected' : ''}`}
                        onClick={() => setSubscriptionType('prepaid')}
                    >
                        <h3>Prepaid</h3>
                        <p>Betaal vooraf en krijg volledige controle over uw uitgaven.</p>
                    </div>
                    <div
                        className={`subscription-option ${subscriptionType === 'pay-as-you-go' ? 'selected' : ''}`}
                        onClick={() => setSubscriptionType('pay-as-you-go')}
                    >
                        <h3>Pay-as-you-go</h3>
                        <p>Betaal alleen voor wat u gebruikt, zonder verplichtingen.</p>
                    </div>
                </div>
            </div>

            <div className="section-box">
                <h2>Nodig medewerkers uit voor uw Bedrijf</h2>
                <div className="invite-form">
                    <label htmlFor="email">Voer Email in:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Voer email address in"
                    />
                    <button onClick={handleInvite} disabled={isInviting}>
                        {isInviting ? 'Inviting...' : 'Invite'}
                    </button>
                </div>
                {invitationStatus && (
                    <div className={`status-message ${invitationStatus.includes('Failed') ? 'error' : 'success'}`}>
                        {invitationStatus}
                    </div>
                )}
            </div>

            <div className="section-box">
                <h3>Huidige Medewerkers</h3>
                {loadingUsers ? (
                    <p>Loading users...</p>
                ) : (
                    <ul className="user-list">
                        {users.map(user => (
                            <li key={user.id} className="user-item">
                                <span>{user.naam} ({user.email})</span>
                                <button
                                    className="delete-button"
                                    onClick={() => handleDeleteUser(user.id)}
                                >
                                    Verwijder
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default BedrijfPage;