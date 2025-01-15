import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import '../index.css';
import '../styles/Verhuuraanvragen.css';

const Verhuuraanvragen = () => {
    const [aanvragen, setAanvragen] = useState([]);
    const [fout, setFout] = useState(null);

    const fetchNaamByUserId = async (userId) => {
        try {
            const response = await axios.get(`https://localhost:7159/api/account/getName/${userId}`);
            return response.data.naam || "Onbekend";
        } catch (error) {
            console.error(error);
            return "Onbekend";
        }
    };

    const fetchAanvragen = async () => {
        try {
            const response = await fetch('https://localhost:7159/api/verhuuraanvragen/alle-aanvragen');
            const data = await response.json();
            if (data && Array.isArray(data.$values)) {
                const enrichedAanvragen = await Promise.all(
                    data.$values.map(async (aanvraag) => {
                        const naam = await fetchNaamByUserId(aanvraag.huurderId);
                        return { ...aanvraag, naam };
                    })
                );
                setAanvragen(enrichedAanvragen);
            } else {
                setFout('Ongeldige data ontvangen.');
            }
        } catch (error) {
            setFout('Er is een fout opgetreden.');
        }
    };

    useEffect(() => {
        fetchAanvragen();
    }, []);

    const updateRequestStatus = async (id, updatedAanvraag) => {
        const naam = await fetchNaamByUserId(updatedAanvraag.huurderId);
        setAanvragen(prevAanvragen =>
            prevAanvragen.map(aanvraag =>
                aanvraag.verhuuraanvraagId === id ? { ...updatedAanvraag, naam } : aanvraag
            )
        );
    };

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
                updateRequestStatus(id, updatedAanvraag);
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
                updateRequestStatus(id, updatedAanvraag);
            } else {
                setFout('Er is een probleem bij het afkeuren van de aanvraag.');
            }
        } catch (error) {
            setFout('Er is een fout opgetreden bij de API-aanroep.');
        }
    };

    return (
        <div className="verhuuraanvragen-wrapper">
            <h1>Verhuuraanvragen</h1>
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
                                <button onClick={() => goedkeuren(aanvraag.verhuuraanvraagId)}>Goedgekeuren</button>
                                <button onClick={() => afkeuren(aanvraag.verhuuraanvraagId)}>Afkeuren</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Verhuuraanvragen;
