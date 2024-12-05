import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Account.css';

axios.defaults.baseURL = 'https://localhost:7159';
axios.defaults.withCredentials = true;

const AccountSection = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [isEditable, setIsEditable] = useState(false);
    const [updatedData, setUpdatedData] = useState({});

    useEffect(() => {
        axios.get('/api/account/isAuthenticated')
            .then(() => {
                return axios.get('/api/account', { withCredentials: true });
            })
            .then(response => {
                setUserDetails(response.data);
                setUpdatedData(response.data);
            })
            .catch(error => {
                if (error.response && error.response.status === 401) {
                    alert('You need to be logged in to access this page.');
                    window.location.href = '/login';
                } else {
                    console.error('Error fetching user data:', error);
                }
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedData({ ...updatedData, [name]: value });
    };

    const handleSave = () => {
        axios.put('/api/account', updatedData)
            .then(() => {
                setIsEditable(false);
                setUserDetails(updatedData);
            })
            .catch(error => console.error('Error updating user data:', error));
    };

    const handleDelete = () => {
        axios.delete('/api/account')
            .then(() => {
                alert('Account data deleted');
                window.location.href = '/';
            })
            .catch(error => console.error('Error deleting user data:', error));
    };

    if (!userDetails) return <div>Loading...</div>;

    return (
        <div className="account-section">
            <h2>Account Details</h2>
            <div>
                <label>Name:</label>
                {isEditable ? (
                    <input type="text" name="name" value={updatedData.name} onChange={handleChange} />
                ) : (
                    <span>{userDetails.userName}</span>
                )}
            </div>
            <div>
                <label>Address:</label>
                {isEditable ? (
                    <input type="text" name="address" value={updatedData.adres} onChange={handleChange} />
                ) : (
                    <span>{userDetails.adres}</span>
                )}
            </div>
            <div>
                <label>Email:</label>
                {isEditable ? (
                    <input type="email" name="email" value={updatedData.email} onChange={handleChange} />
                ) : (
                    <span>{userDetails.email}</span>
                )}
            </div>
            <div>
                <label>Phone Number:</label>
                {isEditable ? (
                    <input type="text" name="phoneNumber" value={updatedData.telefoonnummer} onChange={handleChange} />
                ) : (
                    <span>{userDetails.telefoonnummer || 'N/A'}</span>
                )}
            </div>
            <div>
                <label>KVK:</label>
                {isEditable ? (
                    <input type="text" name="kvk" value={updatedData.kvk} onChange={handleChange} />
                ) : (
                    <span>{userDetails.kvk || 'N/A'}</span>
                )}
            </div>
            <div>
                <button onClick={() => setIsEditable(!isEditable)}>
                    {isEditable ? 'Cancel' : 'Edit'}
                </button>
                {isEditable && <button onClick={handleSave}>Save</button>}
                <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white' }}>
                    Delete Account Data
                </button>
            </div>
        </div>
    );
};

export default AccountSection;