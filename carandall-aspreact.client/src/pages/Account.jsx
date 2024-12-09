import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Account.css';

axios.defaults.baseURL = 'https://localhost:7159';
axios.defaults.withCredentials = true;

const AccountSection = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [updatedData, setUpdatedData] = useState({});

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
        if (
            (userDetails.telefoonnummer && (!updatedData.telefoonnummer || updatedData.telefoonnummer.trim() === '')) ||
            (userDetails.kvk && (!updatedData.kvk || updatedData.kvk.trim() === ''))
        ) {
            alert('Telefoonnummer and KVK cannot be empty once provided.');
            return;
        }

        axios.put('/api/account/update', updatedData)
            .then(() => {
                alert('Account details updated successfully.');
                setUserDetails(updatedData);
            })
            .catch(error => console.error('Error updating user data:', error));
    };

    const handleDelete = () => {
        axios.delete('/api/account/delete')
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
                <input type="text" name="name" value={updatedData.name || ''} onChange={handleChange} />
            </div>
            <div>
                <label>Address:</label>
                <input type="text" name="address" value={updatedData.adres || ''} onChange={handleChange} />
            </div>
            <div>
                <label>Email:</label>
                <input type="email" name="email" value={updatedData.email || ''} onChange={handleChange} />
            </div>
            {userDetails.telefoonnummer && (
                <div>
                    <label>Phone Number:</label>
                    <input
                        type="text"
                        name="phoneNumber"
                        value={updatedData.telefoonnummer}
                        onChange={handleChange}
                    />
                </div>
            )}
            {userDetails.kvk && (
                <div>
                    <label>KVK:</label>
                    <input type="text" name="kvk" value={updatedData.kvk} onChange={handleChange} />
                </div>
            )}
            <div>
                <button onClick={handleSave} style={{ marginRight: '10px' }}>
                    Save
                </button>
                <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white' }}>
                    Delete Account Data
                </button>
            </div>
        </div>
    );
};

export default AccountSection;