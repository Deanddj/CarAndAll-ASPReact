import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Register.css';
import '../index.css'

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Wachtwoorden komen niet overeen');
            return;
        }
        alert('Geregistreerd met email: ' + email);
    };

    return (
        <div className="register-container">
            <h2>Registreer bij CarAndAll</h2>
            <form onSubmit={handleRegister} className="register-form">
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
                <button type="submit" className="register-button">Registreer</button>
            </form>
            <div className="login-link">
                <p>Heb je al een account? <Link to="/login">Log hier in</Link></p>
            </div>
        </div>
    );
};

export default Register;
