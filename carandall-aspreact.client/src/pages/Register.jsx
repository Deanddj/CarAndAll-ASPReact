import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.css';
import '../index.css';
import axios from 'axios';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [kvk, setKVK] = useState('');
    const [accountType, setAccountType] = useState('particulier');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Wachtwoorden komen niet overeen');
            return;
        }

        const data = {
            email,
            password,
            adres: address,
            telefoonnummer: accountType === 'particulier' ? phone : null,
            kvk: accountType === 'zakelijk' ? kvk : null,
        };

        try {
            const response = await axios.post('https://localhost:7159/api/account/register', data, {
                headers: { 'Content-Type': 'application/json' }
            });
            alert(response.data.message || 'Registration successful');
            navigate('/login')
        } catch (error) {
            alert('Registration failed: ' + (error.response?.data || error.message));
        }
    };

    const handleToggle = () => {
        setAccountType(accountType === 'particulier' ? 'zakelijk' : 'particulier');
    };

    return (
        <div className="register-container">
            <h2>Registreer bij CarAndAll</h2>
            <form onSubmit={handleRegister} className={`register-form ${accountType}`}>
                <div className="slider-container">
                    <div className="slider-labels right">
                        <span className={accountType === 'particulier' ? 'active' : ''}>Particulier</span>
                    </div>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={accountType === 'zakelijk'}
                            onChange={handleToggle}
                        />
                        <span className="slider"></span>
                    </label>
                    <div className="slider-labels left">
                        <span className={accountType === 'zakelijk' ? 'active' : ''}>Zakelijk</span>
                    </div>
                </div>
                <div className="form-layout">
                    <div className="left-side">
                        <div className="input-group">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Wachtwoord</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="confirmPassword">Bevestig Wachtwoord</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {accountType === 'zakelijk' ? (
                        <div className="right-side">
                            <div className="input-group">
                                <label htmlFor="kvk">KVK</label>
                                <input
                                    type="text"
                                    id="kvk"
                                    value={kvk}
                                    onChange={(e) => setKVK(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="address">Adres</label>
                                <input
                                    type="text"
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="right-side">
                            <div className="input-group">
                                <label htmlFor="phone">Telefoonnummer</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="address">Adres</label>
                                <input
                                    type="text"
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}
                </div>
                <button type="submit" className="register-button">Registreer</button>
            </form>
            <div className="login-link">
                <p>Heb je al een account? <Link to="/login">Log hier in</Link></p>
            </div>
        </div>
    );
};

export default Register;
