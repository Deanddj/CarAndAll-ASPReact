import React, { useState, useEffect } from 'react';
import { useMessage } from '../context/MessageProvider';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import '../styles/UitwisselenVoertuig.css';
import '../index.css';

const UitwisselenVoertuig = ({ onChangeSection }) => {
    const [goedGekeurdeAanvragen, setGoedGekeurdeAanvragen] = useState([]);
    const [uitgegevenAanvragen, setUitgegevenAanvragen] = useState([]);
    const [userDetails, setUserDetails] = useState(null);
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedAanvraag, setSelectedAanvraag] = useState(null);
    const [opmerking, setOpmerking] = useState('');
    const { showMessage } = useMessage();

    const navigate = useNavigate();

    // Haal goedgekeurde aanvragen op
    const fetchGoedGekeurdeAanvragen = async () => {
        try {
            const response = await fetch('https://localhost:7159/api/Verhuuraanvragen/goedgekeurde-aanvragen', {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Fout met voertuigen verkrijgen.');
            }
            const data = await response.json();
            setGoedGekeurdeAanvragen(data.$values || []);
        } catch (error) {
            console.error(error.message);
        }
    };

    // Haal uitgegeven aanvragen op
    const fetchUitgegevenAanvragen = async () => {
        try {
            const response = await fetch('https://localhost:7159/api/Verhuuraanvragen/uitgegeven-aanvragen', {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Fout met voertuigen verkrijgen.');
            }
            const data = await response.json();
            setUitgegevenAanvragen(data.$values || []);
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch('https://localhost:7159/api/account/get', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        alert('Je moet zijn ingelogd voor deze pagina.');
                        window.location.href = '/login';
                    } else {
                        throw new Error('Fout met gebruikersdata verkrijgen.');
                    }
                }

                const data = await response.json();
                setUserDetails(data);
            } catch (error) {
                console.error('Fout:', error.message);
            }
        };

        fetchUserDetails();
        fetchGoedGekeurdeAanvragen();
        fetchUitgegevenAanvragen();
    }, []);

    const handleUitgave = async (aanvraag) => {
        try {
            const response = await fetch(`https://localhost:7159/api/verhuuraanvragen/uitgave-voertuigen/${aanvraag.verhuuraanvraagId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                showMessage("De verhuuraanvraag is gezet op 'goedgekeurd'.", "success");

                // Ophalen van de nieuwe goedgekeurde aanvragen
                fetchGoedGekeurdeAanvragen();
                fetchUitgegevenAanvragen();  // Als je ook de uitgegeven aanvragen wilt bijwerken
            }
        } catch (error) {
            showMessage("Er is iets fout gegaan", "error")
        }
    };



    const handleInname = async (status) => {
        try {
            console.log(status);
            var voertuigStatus = status;
  


            const response = await fetch(`https://localhost:7159/api/verhuuraanvragen/inname-voertuigen/${selectedAanvraag.verhuuraanvraagId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: voertuigStatus
                })
                , credentials: 'include'
            });

            console.log(`De gestuurde data is: ${voertuigStatus}`);

            if (response.ok) {
                showMessage("De voertuig is ingenomen.", "success");

                // Ophalen van de nieuwe gegevens voor zowel goedgekeurde als uitgegeven aanvragen
                fetchGoedGekeurdeAanvragen();
                fetchUitgegevenAanvragen();
            }
        } catch (error) {
            showMessage("Er is iets fout gegaan", "error")
        }
        setPopupVisible(false);
    };

    const handleInnameGeenSchade = async () => {
        handleInname("Beschikbaar");
    }

    const handleSchadeClaim = async () => {
        const voertuigId = selectedAanvraag.voertuig.voertuigId;
        console.log(selectedAanvraag);

        try {
            const response = await fetch(`https://localhost:7159/api/verhuuraanvragen/create/schadeclaim/${voertuigId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ commentaar: opmerking, datum: new Date().toISOString() })
            });

            if (response.ok) {
                handleInname("In reparatie");
                showMessage("Schadeclaim is ingediend.", "success");
            } else {
                showMessage("Er is een fout opgetreden bij het indienen van de schadeclaim.", "error");
                setPopupVisible(false);
            }
        } catch (error) {
            showMessage("Er is iets fout gegaan.", "error");
            setPopupVisible(false);
        }

        
    };

    const openPopup = (aanvraag) => {
        setSelectedAanvraag(aanvraag);
        setPopupVisible(true);
    };

    const closePopup = () => {
        setSelectedAanvraag(null);
        setPopupVisible(false);
    };

    return (
        <div className="uitgave-inname-container">
            <div className="uitgave">
                <h2>Uitgave Voertuigen</h2>
                {goedGekeurdeAanvragen.length > 0 ? (
                    <table className="uitgave-tabel">
                        <thead>
                            <tr>
                                <th>Naam Huurder</th>
                                <th>Aanvraag Status</th>
                                <th>Voertuig</th>
                                <th>Startdatum</th>
                                <th>Einddatum</th>
                                <th>Actie</th>
                            </tr>
                        </thead>
                        <tbody>
                            {goedGekeurdeAanvragen.map((aanvraag) => (
                                <tr key={aanvraag.$id}>
                                    <td>{aanvraag.user.naam}</td>
                                    <td>{aanvraag.status}</td>
                                    <td>{aanvraag.voertuig.merk} {aanvraag.voertuig.type}</td>
                                    <td>{new Date(aanvraag.startdatum).toLocaleDateString()}</td>
                                    <td>{new Date(aanvraag.einddatum).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            onClick={() => {
                                                handleUitgave(aanvraag);
                                            }}
                                            className="uitgave-button"
                                        >
                                            Uitgeven
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Geen goedgekeurde aanvragen beschikbaar.</p>
                )}
            </div>

            <div className="inname">
                <h2>Inname Voertuigen</h2>
                {uitgegevenAanvragen.length > 0 ? (
                    <table className="inname-tabel">
                        <thead>
                            <tr>
                                <th>Naam Huurder</th>
                                <th>Aanvraag Status</th>
                                <th>Voertuig</th>
                                <th>Startdatum</th>
                                <th>Einddatum</th>
                                <th>Actie</th>
                            </tr>
                        </thead>
                        <tbody>
                            {uitgegevenAanvragen.map((aanvraag) => (
                                <tr key={aanvraag.$id}>
                                    <td>{aanvraag.user.naam}</td>
                                    <td>{aanvraag.status}</td>
                                    <td>{aanvraag.voertuig.merk} {aanvraag.voertuig.type}</td>
                                    <td>{new Date(aanvraag.startdatum).toLocaleDateString()}</td>
                                    <td>{new Date(aanvraag.einddatum).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            onClick={() => {
                                                openPopup(aanvraag);
                                            }}
                                            className="inname-button"
                                        >
                                            Innemen
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Geen uitgegeven aanvragen beschikbaar.</p>
                )}
            </div>

            {popupVisible && (
                <div className="popup-overlay">
                    <div className="popup-form">
                        <h3>Schade claim</h3>
                        <div className="form-buttons">
                            <button onClick={handleInnameGeenSchade}>Geen schade</button>
                            <button onClick={handleSchadeClaim}>Schade claim indienen</button>
                        </div>
                        <textarea
                            placeholder="Voeg een opmerking toe over de schade..."
                            value={opmerking}
                            onChange={(e) => setOpmerking(e.target.value)}
                            rows="4"
                            className="commentaar-input"
                        />
                        <button onClick={closePopup} className="close-popup-button">X</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UitwisselenVoertuig;
