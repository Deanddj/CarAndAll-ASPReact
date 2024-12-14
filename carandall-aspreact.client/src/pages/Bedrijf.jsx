import { useState } from 'react';
import axios from 'axios';
import '../styles/Bedrijf.css';
import sendNotification from '../api/notificationApi';

axios.defaults.baseURL = 'https://localhost:7159';
axios.defaults.withCredentials = true;

const BedrijfPage = ({ userDetails }) => {
    const [email, setEmail] = useState('');
    const [invitationStatus, setInvitationStatus] = useState(null);
    const [isInviting, setIsInviting] = useState(false);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleInvite = async () => {
        if (!email) {
            alert('Please enter an email address.');
            return;
        }

        if (userDetails?.userName == email) {
            alert("You can't invite yourself");
            return
        }

        setIsInviting(true);
        try {
            await sendNotification(email, "BedrijfVerzoek", userDetails?.bedrijf?.bedrijfId, "Bedrijf Uitnodiging",
                `Je bent uitgenodigd om het bedrijf ${userDetails?.bedrijf?.naam} te deelnemen, 
                klik op een van de onderstaande opties.`);
        } catch (error) {
            console.error('Error sending invitation:', error);
            setInvitationStatus('Failed to send invitation.');
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="bedrijf-page">
            <h2>Invite User to Your Company</h2>
            <div className="invite-form">
                <label htmlFor="email">Enter User Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter email address"
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
    );
};

export default BedrijfPage;