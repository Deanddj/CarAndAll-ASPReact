import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Notifications.css";
import { useNavigate } from 'react-router-dom';
import '../index.css';

const Verhuuraanvragen = () => {
    const [aanvragen, setAanvragen] = useState([]);
    const [fout, setFout] = useState(null);

    useEffect(() => {
        const fetchAanvragen = async () => {
            try {
                const response = await fetch('https://localhost:7159/api/verhuuraanvragen/alle-aanvragen');
                const data = await response.json();

                console.log('Ontvangen data:', data);

                if (Array.isArray(data.$values)) {
                    setAanvragen(data.$values);
                } else {
                    setFout('De ontvangen data is geen geldige array.');
                }
            } catch (error) {
                setFout('Er is een fout opgetreden bij de API-aanroep.');
            }
        };

        fetchAanvragen();
    }, []);


    // Voor goedkeuren
    const goedkeuren = async (id) => {
        try {
            const response = await fetch(`https://localhost:7159/api/verhuuraanvragen/goedkeuren/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const updatedAanvraag = await response.json();
                setAanvragen(prevAanvragen =>
                    prevAanvragen.map(aanvraag =>
                        aanvraag.id === id ? updatedAanvraag : aanvraag
                    )
                );
            } else {
                setFout('Er is een probleem bij het goedkeuren van de aanvraag.');
            }
        } catch (error) {
            setFout('Er is een fout opgetreden bij de API-aanroep.');
        }
    };

    // Voor afkeuren
    const afkeuren = async (id) => {
        try {
            const response = await fetch(`https://localhost:7159/api/verhuuraanvragen/afkeuren/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const updatedAanvraag = await response.json();
                setAanvragen(prevAanvragen =>
                    prevAanvragen.map(aanvraag =>
                        aanvraag.id === id ? updatedAanvraag : aanvraag
                    )
                );
            } else {
                setFout('Er is een probleem bij het afkeuren van de aanvraag.');
            }
        } catch (error) {
            setFout('Er is een fout opgetreden bij de API-aanroep.');
        }
    };

    return (
        <div>
            <h1>Verhuuraanvragen</h1>
            <p> No Diddy</p>
            {fout && <p style={{ color: 'red' }}>{fout}</p>}
            <table>
                <thead>
                    <tr>
                        <th>Naam</th>
                        <th>Start Datum</th>
                        <th>Eind Datum</th>
                        <th>Status</th>
                        <th>Actie</th>
                    </tr>
                </thead>
                <tbody>
                    {aanvragen.map((aanvraag) => (
                        <tr key={aanvraag.verhuuraanvraagId}>
                            <td>{aanvraag.naam}</td>
                            <td>{aanvraag.startdatum}</td>
                            <td>{aanvraag.einddatum}</td>
                            <td>{aanvraag.status}</td>
                            <td>
                                <button onClick={() => goedkeuren(aanvraag.id)}>Goedgekeuren</button>
                                <button onClick={() => afkeuren(aanvraag.id)}>Afkeuren</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Verhuuraanvragen;