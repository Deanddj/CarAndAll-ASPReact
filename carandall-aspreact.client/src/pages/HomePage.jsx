import '../styles/HomePage.css';
import '../index.css';
import { FaUserAlt } from "react-icons/fa";

function App() {
    return (
        <div className="App">
            <nav className="navbar">
                <div className="logo">
                    <h2>CarAndAll</h2>
                </div>
                <div className="profile">
                    <a href="/dashboard">
                        <button className="dashboard-btn">Dashboard</button>
                    </a>
                    <a href="/dashboard/account">
                        <FaUserAlt className='profileIcon' href="/dashboard/account" />
                    </a>
                </div>
            </nav>

            <section className="main-content">
                <div className="content-overlay">
                    <div className="content-box">
                        <h1>Simpel voertuigen huren</h1>
                        <p className="subtext">
                            Bij CarAndAll maken we het huren van auto's eenvoudig en betrouwbaar. Of je nu particulier of zakelijk
                            een auto nodig hebt, wij bieden flexibele oplossingen die bij jouw behoeften passen.
                        </p>
                        <button onClick={() => document.getElementById('bottom-section').scrollIntoView({ behavior: 'smooth' })}>
                            Opties bekijken
                        </button>
                    </div>
                </div>
            </section>

            <section className="rent-options" id="bottom-section">
                <div className="background-overlay"></div>
                <h2>Kies jouw type verhuur</h2>
                <p>Klik op een van de onderstaande opties om verder te gaan</p>
                <div className="options-container">
                    <a href="/login" className="option-box">
                        <h3>Particulier</h3>
                        <p>Huur een auto voor persoonlijke doeleinden met flexibele voorwaarden en voordelen. De beste prijzen voor privegebruik!</p>
                    </a>
                    <a href="/login" className="option-box">
                        <h3>Zakelijk</h3>
                        <p>CarAndAll biedt een scala aan zakelijke verhuuropties voor bedrijven, inclusief lange termijn verhuur en bedrijfswagenopties.</p>
                    </a>
                </div>
            </section>
        </div>
    );
}

export default App;