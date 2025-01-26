import { useEffect, useState } from "react";
import { useMessage } from '../context/MessageProvider'
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import '../index.css';
import '../styles/Verhuuraanvragen.css';

const Verhuuraanvragen = () => {
    const [aanvragen, setAanvragen] = useState([]);
    const [fout, setFout] = useState(null);
    const { showMessage } = useMessage();

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
            const response = await fetch('https://localhost:7159/api/verhuuraanvragen/alle-aanvragen', {
                method: 'GET',
                credentials: 'include',
            });

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
                aanvraag.verhuuraanvraagId === id
                    ? { ...updatedAanvraag, naam, voertuig: aanvraag.voertuig } // Zorg dat voertuig mee komt
                    : aanvraag
            )
        );
    };


    // Voor goedkeuren
    const goedkeuren = async (aanvraag) => {
        console.log(`De aanvraag is:`, aanvraag);
        try {
            console.log(`De userid is ${aanvraag.huurderId}`);

            const userDetails = await fetch(`https://localhost:7159/api/account/getEmailAdres/${aanvraag.huurderId}`); 
            if (!userDetails.ok) {
                throw new Error('Netwerkfout of gebruikersgegevens niet gevonden');
            }
            const data = await userDetails.json();
            var email = data.email;

        } catch (err) {
            alert('Fout: ' + err.message); 
        }

        try {
            const response = await fetch(`https://localhost:7159/api/verhuuraanvragen/goedkeuren/${aanvraag.verhuuraanvraagId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: aanvraag.verhuuraanvraagId, 
                    email: email,
                    voertuig: aanvraag.voertuig,
                    startDatum: aanvraag.startdatum,
                    eindDatum: aanvraag.einddatum
                })
                , credentials: 'include'

            });

            if (response.ok) {
                const updatedAanvraag = await response.json();
                updateRequestStatus(aanvraag.verhuuraanvraagId, updatedAanvraag);
                showMessage("De verhuuraanvraag is gezet op 'goedgekeurd'.", "success");
            } else {
                setFout('Er is een probleem bij het goedkeuren van de aanvraag.');
            }
        } catch (error) {
            showMessage("Er is iets fout gegaanb", "error")
            setFout('Er is een fout opgetreden bij de API-aanroep.');
        }
    };


    // Voor afkeuren
    const afkeuren = async (aanvraag) => {
        try {
            console.log(`De userid is ${aanvraag.huurderId}`);

            const userDetails = await fetch(`https://localhost:7159/api/account/getEmailAdres/${aanvraag.huurderId}`);
            if (!userDetails.ok) {
                throw new Error('Netwerkfout of gebruikersgegevens niet gevonden');
            }
            const data = await userDetails.json();
            var email = data.email;

        } catch (err) {
            alert('Fout: ' + err.message);
        }

        try {
            const response = await fetch(`https://localhost:7159/api/verhuuraanvragen/afkeuren/${aanvraag.verhuuraanvraagId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: aanvraag.verhuuraanvraagId,
                    email: email,
                    voertuig: aanvraag.voertuig,
                    startDatum: aanvraag.startdatum,
                    eindDatum: aanvraag.einddatum
                })
                , credentials: 'include'

            });

            if (response.ok) {
                const updatedAanvraag = await response.json();
                updateRequestStatus(aanvraag.verhuuraanvraagId, updatedAanvraag);
                showMessage("De verhuuraanvraag is gezet op 'afgewezen' ", "success")
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
                        <th>Klant</th>
                        <th>Voertuig</th>
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
                            <td>{aanvraag.voertuig.merk} {aanvraag.voertuig.type}</td>
                            <td>{aanvraag.startdatum.slice(0, 10)}</td>
                            <td>{aanvraag.einddatum.slice(0, 10)}</td>
                            <td>{aanvraag.status}</td>
                            <td>
                                <button onClick={() => goedkeuren(aanvraag)}>Goedgekeuren</button>
                                <button onClick={() => afkeuren(aanvraag)}>Afkeuren</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Verhuuraanvragen;
