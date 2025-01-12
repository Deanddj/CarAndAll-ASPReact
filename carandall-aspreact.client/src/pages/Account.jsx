import { useState, useEffect } from 'react';
import { useMessage } from '../context/MessageProvider'
import axios from 'axios';
import fetchUserData from '../api/userDataApi';
import '../styles/Account.css';

axios.defaults.baseURL = 'https://localhost:7159';
axios.defaults.withCredentials = true;

const AccountSection = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [updatedData, setUpdatedData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const { showMessage } = useMessage();
    
    useEffect(() => {
        fetchUserData()
            .then(data => setUserDetails(data))
            .catch(error => console.error('Fout met het ophalen van gebruikergegevens: ', error));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('bedrijf.')) {
            const field = name.split('.')[1];
            setUpdatedData({
                ...updatedData,
                bedrijf: {
                    ...updatedData.bedrijf,
                    [field]: value
                }
            });
        } else {
            setUpdatedData({ ...updatedData, [name]: value });
        }
    };

    const handleSave = () => {
        const payload = {
            naam: updatedData.naam || null,
            email: updatedData.userName || null,
            adres: updatedData.adres || null,
            telefoonnummer: updatedData.telefoonnummer || null,
            bedrijf: userDetails.type === 'ZakelijkeBeheerder' ? {
                naam: updatedData.bedrijf?.naam || null,
                adres: updatedData.bedrijf?.adres || null,
                kvk: updatedData.bedrijf?.kvk || null,
            } : null,
            rol: updatedData.rol || null,
            bedrijfId: updatedData.bedrijfId || null,
        };

        axios.put('/api/account/update', payload)
            .then(() => {
                showMessage("Gebruiker data succesvol bijgewerkt.", "success");

                return axios.get('/api/account/get');
            })
            .then((response) => {
                setUserDetails(response.data);
                setIsEditing(false);
            })
            .catch(error => {
                console.error('Foout met bijwerken van gebruiker data:', error);
                showMessage("Gebruikers data bijwerken mislukt.", "error");
            });
    };

    const handleDelete = () => {
        axios.delete('/api/notifications/deleteAll')
            .then(() => {
                window.location.href = '/';
            })
            .catch(error => console.error('Fout met verwijderen van notificaties:', error));
        axios.delete('/api/account/delete')
            .then(() => {
                window.location.href = '/';
            })
            .catch(error => console.error('Fout met verwijderen van gebruiker data:', error));
    };

    if (!userDetails) return <div>Loading...</div>;

    return (
        <>
            <div className="account-section">
                <h2>Account Gegevens</h2>
                {!isEditing ? (
                    <div>
                        <p><strong>Naam:</strong> {userDetails.naam}</p>
                        {userDetails.telefoonnummer && <p><strong>Adres:</strong> {userDetails.adres}</p>}
                        <p><strong>Email:</strong> {userDetails.userName}</p>
                        {userDetails.telefoonnummer && <p><strong>Telefoonnummer:</strong> {userDetails.telefoonnummer}</p>}
                        {userDetails.bedrijf && (
                            <>
                                <p><strong>Bedrijf Naam:</strong> {userDetails.bedrijf.naam}</p>
                                <p><strong>Bedrijf Adres:</strong> {userDetails.bedrijf.adres}</p>
                                <p><strong>KVK:</strong> {userDetails.bedrijf.kvk}</p>
                            </>
                        )}
                        <button
                            onClick={() => {
                                setUpdatedData(userDetails);
                                setIsEditing(true);
                            }}
                            style={{ marginRight: '1px', marginTop: '10px' }}
                        >
                            Bewerken
                        </button>

                    </div>
                ) : (
                    <div>
                        <div>
                            <label>Naam:</label>
                            <input
                                type="text"
                                name="naam"
                                value={updatedData.naam || ''}
                                onChange={handleChange}
                            />
                        </div>
                        {userDetails.telefoonnummer && (
                            <div>
                                <label>Adres:</label>
                                <input
                                    type="text"
                                    name="adres"
                                    value={updatedData.adres || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                        <div>
                            <label>Email:</label>
                            <input
                                type="email"
                                name="userName"
                                value={updatedData.userName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        {userDetails.telefoonnummer && (
                            <div>
                                <label>Telefoonnummer:</label>
                                <input
                                    type="text"
                                    name="telefoonnummer"
                                    value={updatedData.telefoonnummer || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                        {userDetails.bedrijf && (
                            <>
                                <div>
                                    <label>Bedrijf Naam:</label>
                                    <input
                                        type="text"
                                        name="bedrijf.naam"
                                        value={updatedData.bedrijf?.naam || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label>Bedrijf Adres:</label>
                                    <input
                                        type="text"
                                        name="bedrijf.adres"
                                        value={updatedData.bedrijf?.adres || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label>KVK:</label>
                                    <input
                                        type="text"
                                        name="bedrijf.kvk"
                                        value={updatedData.bedrijf?.kvk || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )}
                            <button onClick={handleSave} style={{ marginRight: '6px', backgroundColor: '#4CAF50'}}>
                            Opslaan
                        </button>
                            <button onClick={() => {
                                setUpdatedData(userDetails);
                                setIsEditing(false);
                            }} style={{ backgroundColor: '#8A8989' }}>
                            Annuleren
                        </button>
                    </div>
                )}
                <button onClick={handleDelete} style={{ backgroundColor: 'red' }}>
                    Account Verwijderen
                </button>
            </div>
        </>
    );
};

export default AccountSection;