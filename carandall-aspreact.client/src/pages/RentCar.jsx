import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import '../styles/RentCar.css';

const RentCar = () => {
    const location = useLocation();
    const [voertuigId, setVoertuigId] = useState(null);
    const [voertuig, setVoertuig] = useState(null);
    const [rentalPeriods, setRentalPeriods] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const section = params.get('section');
        if (section && section.startsWith('rentcar/')) {
            const id = section.split('/')[1];  // Splits 'rentcar/61' en haal '61' eruit
            setVoertuigId(id);
        }
    }, [location]);


    useEffect(() => {
        if (!voertuigId) return;  // Als voertuigId nog niet is ingesteld, doe niks

        const fetchVehicle = async () => {
            try {
                const response = await fetch(`https://localhost:7159/api/voertuig/${voertuigId}`);
                if (!response.ok) throw new Error('Failed to fetch vehicle data');
                const data = await response.json();
                setVoertuig(data);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchRentalPeriods = async () => {
            try {
                const response = await fetch(`https://localhost:7159/api/voertuig/voertuigAanvragen/${voertuigId}`);
                if (!response.ok) throw new Error('Failed to fetch rental periods');

                const cars = await response.json();
                const data = cars.$values || [];
                console.log(data);

                setRentalPeriods(data); // Ruwe data opslaan
            } catch (error) {
                console.error(error);
            }
        };

        fetchVehicle();
        fetchRentalPeriods();
    }, [voertuigId]);

    const handleRent = async () => {
        if (!startDate || !endDate) {
            alert('Kies een start- en einddatum.');
            return;
        }

        if (new Date(startDate) >= new Date(endDate)) {
            alert('De startdatum moet eerder zijn dan de einddatum.');
            return;
        }
        
        const selectedStartDate = new Date(startDate);
        const selectedEndDate = new Date(endDate);

        const isOverlap = rentalPeriods.some((period) => {
            const periodStart = new Date(period.startdatum);
            const periodEnd = new Date(period.einddatum);

            return (selectedStartDate <= periodEnd && selectedEndDate >= periodStart);
        });

        if (isOverlap) {
            alert('De geselecteerde periode overlapt met een bestaande huurperiode. Kies een andere periode.');
            return;
        }

        const rentData = {
            Startdatum: startDate,
            Einddatum: endDate,
            VoertuigId: parseInt(voertuigId, 10),
            VoertuigMerk: voertuig.merk,
            VoertuigType: voertuig.type,
            VoertuigPrijs: voertuig.prijs,
        };

        console.log('Verstuurde data:', rentData);

        if (!isOverlap) {
            try {
                const response = await fetch('https://localhost:7159/api/voertuig', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(rentData),
                    credentials: 'include',
                })


                if (response.ok) {
                    alert('Huurverzoek succesvol ingediend!');
                    setStartDate(null);
                    setEndDate(null);
                } else {
                    const errorData = await response.json();
                    alert(`Er is iets mis gegaan: ${errorData.message || 'Onbekende fout'}`);
                }
            } catch (error) {
                alert('Er is iets mis gegaan bij het indienen van het huurverzoek.');
                console.error(error);
            }
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('nl-NL', options);
    };

    if (!voertuig) {
        return (
            <div className="dashboard-container">
                <div className="loading-dots">
                    Voertuigen laden<span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
            </div>
        );
    }

    return (
        <div className="rent-car-container">
            <h2>Huur {voertuig.merk} {voertuig.type}</h2>

            <div className="vehicle-info">
                <p><strong>Kenteken:</strong> {voertuig.kenteken}</p>
                <p><strong>Kleur:</strong> {voertuig.kleur}</p>
                <p><strong>Soort:</strong> {voertuig.soort}</p>
                <p><strong>Status:</strong> {voertuig.status}</p>
                {voertuig.aanschafjaar && <p><strong>Aanschafjaar:</strong> {voertuig.aanschafjaar}</p>}
                <p><strong>Prijs:</strong> &euro; {voertuig.prijs}</p>

            </div>

            <div className="rental-overview">
                <h3>Overzicht Gehuurde Periodes</h3>
                <ul>
                    {rentalPeriods.length > 0 ? (
                        rentalPeriods.map((period, index) => (
                            <li key={index}>
                                Gehuurd van {formatDate(period.startdatum)} t/m {formatDate(period.einddatum)}
                            </li>
                        ))
                    ) : (
                        <p>Er zijn geen verhuurperiodes voor dit voertuig.</p>
                    )}
                </ul>
            </div>

            <div className="rental-form">
                <h3>Huur Periode</h3>
                <label>
                    Startdatum:
                    <input
                        type="date"
                        value={startDate || ''}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </label>
                <label>
                    Einddatum:
                    <input
                        type="date"
                        value={endDate || ''}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </label>
                <button onClick={handleRent}
                    aria-label="Klik om dit voertuig te huren"
                >
                    Huur Dit Voertuig
                </button>

            </div>
        </div>
    );
};

export default RentCar;
