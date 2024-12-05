import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';
import '../index.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                'https://localhost:7159/api/account/login',
                { email, password },
                {
                    withCredentials: true,
                }
            );

            console.log(response.data.message);
            alert('Login successful');
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
            alert('Invalid email or password');
        }
    };

    return (
        <div className="login-container">
            <h2>Inloggen bij CarAndAll</h2>
            <form onSubmit={handleLogin} className="login-form">
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
                <button type="submit" className="login-button">Inloggen</button>
            </form>
            <div className="register-link">
                <p>Geen account? <Link to="/register">Registreer hier</Link></p>
            </div>
        </div>
    );
};

export default Login;