import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Account.css';

axios.defaults.baseURL = 'https://localhost:7159';
axios.defaults.withCredentials = true;

const AccountSection = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [updatedData, setUpdatedData] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        axios.get('/api/account/isAuthenticated')
            .then(() => {
                return axios.get('/api/account/get', { withCredentials: true });
            })
            .then(response => {
                setUserDetails(response.data);
                setUpdatedData(response.data);
            })
            .catch(error => {
                if (error.response && error.response.status === 401) {
                    alert('Je moet zijn ingelogd voor deze pagina.');
                    window.location.href = '/login';
                } else {
                    console.error('Fout met het verkrijgen van gebruikersdata:', error);
                }
            });
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
                alert('Gebruiker data succesvol bijgewerkt.');

                return axios.get('/api/account/get');
            })
            .then((response) => {
                setUserDetails(response.data);
                setIsEditing(false);
            })
            .catch(error => {
                console.error('Foout met bijwerken van gebruiker data:', error);
                alert('Gebruikers data bijwerken mislukt.');
            });

    };


    const handleDelete = () => {
        axios.delete('/api/account/delete')
            .then(() => {
                alert('Account data deleted');
                window.location.href = '/';
            })
            .catch(error => console.error('Fout met verwijderen van gebruiker data:', error));
    };

    if (!userDetails) return <div>Loading...</div>;

    return (
        <div className="account-section">
            <h2>Account Details</h2>
            {!isEditing ? (
                <div>
                    <p><strong>Name:</strong> {userDetails.naam}</p>
                    {userDetails.telefoonnummer && <p><strong>Address:</strong> {userDetails.adres}</p>}
                    <p><strong>Email:</strong> {userDetails.userName}</p>
                    {userDetails.telefoonnummer && <p><strong>Phone Number:</strong> {userDetails.telefoonnummer}</p>}
                    {userDetails.bedrijf && (
                        <>
                            <p><strong>Bedrijf Naam:</strong> {userDetails.bedrijf.naam}</p>
                            <p><strong>Bedrijf Adres:</strong> {userDetails.bedrijf.adres}</p>
                            <p><strong>KVK:</strong> {userDetails.bedrijf.kvk}</p>
                        </>
                    )}
                    <button onClick={() => setIsEditing(true)} style={{ marginRight: '10px', marginTop: '10px' }}>
                        Edit
                    </button>
                </div>
            ) : (
                <div>
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            name="naam"
                            value={updatedData.naam || ''}
                            onChange={handleChange}
                        />
                    </div>
                    {userDetails.telefoonnummer && (
                        <div>
                            <label>Address:</label>
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
                            <label>Phone Number:</label>
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
                    <button onClick={handleSave} style={{ marginRight: '10px' }}>
                        Save
                    </button>
                        <button onClick={() => {
                            setUpdatedData(userDetails);
                            setIsEditing(false);
                        }} style={{ backgroundColor: 'lightgray' }}>
                        Cancel
                    </button>
                </div>
            )}
            <button onClick={handleDelete} style={{ backgroundColor: 'red' }}>
                Delete Account Data
            </button>
        </div>
    );
};

export default AccountSection;