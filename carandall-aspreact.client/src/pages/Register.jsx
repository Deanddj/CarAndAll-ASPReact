import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMessage } from '../context/MessageProvider.jsx';
import { MessageBox } from '../components/MessageBox/MessageBox.jsx';
import '../styles/Register.css';
import '../index.css';
import axios from 'axios';

const Register = () => {
    const [email, setEmail] = useState('');
    const [naam, setNaam] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [kvk, setKVK] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [accountType, setAccountType] = useState('particulier');
    const { showMessage } = useMessage();
    const navigate = useNavigate();        
    const [acceptedToS, setAcceptedToS] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showMessage("Wachtwoorden komen niet overeen.", "error");
            return;
        }

        if (acceptedToS === false) {
            showMessage("U moet akkoord gaan met de algemene voorwaarden om een account aan te maken.", "error");
            return;
        }

        const data = {
            Naam: naam,
            Email: email,
            Wachtwoord: password,
            Adres: address,
            Telefoonnummer: accountType === 'particulier' ? phone : null,
            Kvk: accountType === 'zakelijk' ? kvk : null,
            BedrijfNaam: accountType === 'zakelijk' ? companyName : null,
            BedrijfAdres: accountType === 'zakelijk' ? companyAddress : null,
            AccountType: accountType
        };

        try {
            const response = await axios.post('https://localhost:7159/api/account/register', data, {
                headers: { 'Content-Type': 'application/json' }
            });

            showMessage("Registratie succesvol.", "success");
            navigate('/login');
        } catch (error) {
            if (error.response?.data) {
                const { Message, Errors } = error.response.data;

                showMessage(Message || "Registratie mislukt.", "error");

                if (Errors && Array.isArray(Errors)) {
                    Errors.forEach((error) => {
                        showMessage(error, "error");
                    });
                }
            } else {
                showMessage("Er is een onbekende fout opgetreden.", "error");
            }
        }
    };

    const handleToggle = () => {
        setAccountType(accountType === 'particulier' ? 'zakelijk' : 'particulier');
    };

    return (
        <div className="register-container">
            <div className="message-box">
                <MessageBox />
            </div>
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
                            <label htmlFor="naam">Naam</label>
                            <input
                                type="text"
                                id="naam"
                                value={naam}
                                onChange={(e) => setNaam(e.target.value)}
                                required
                            />
                        </div>
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
                    <div className="right-side">
                        {accountType === 'zakelijk' ? (
                            <>
                                <div className="input-group">
                                    <label htmlFor="companyName">Bedrijfsnaam</label>
                                    <input
                                        type="text"
                                        id="companyName"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        required
                                    />
                                </div>
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
                                    <label htmlFor="companyAddress">Bedrijf Adres</label>
                                    <input
                                        type="text"
                                        id="companyAddress"
                                        value={companyAddress}
                                        onChange={(e) => setCompanyAddress(e.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                </div>
                <div className="tos-container">
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={acceptedToS}
                            onChange={() => setAcceptedToS(!acceptedToS)}
                        />
                        <span className="slider"></span>
                    </label>
                    <span className="tos-label">
                        Ik accepteer de <a href="/terms" target="_blank">algemene voorwaarden</a>
                    </span>
                </div>
                <button type="submit" className="register-button">
                    Registreer
                </button>
            </form>
            <div className="login-link">
                <p>Heb je al een account? <Link to="/login">Log hier in</Link></p>
            </div>
        </div>
    );
};

export default Register;