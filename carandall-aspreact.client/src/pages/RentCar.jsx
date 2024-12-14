import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/RentCar.css';

const RentCar = () => {
    const {voertuigId} = useParams(); // Haal de voertuigId uit de URL
    const [voertuig, setVehicle] = useState(null);
    const [rentalPeriods, setRentalPeriods] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const response = await fetch(`https://localhost:7159/api/voertuig/${voertuigId}`);
                if (!response.ok) throw new Error('Failed to fetch vehicle data');
                const data = await response.json();
                setVehicle(data);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchRentalPeriods = async () => {
            try {
                const response = await fetch(`https://localhost:7159/api/verhuuraanvragen/voertuigen/${voertuigId}`);
                if (!response.ok) throw new Error('Failed to fetch rental periods');
                const data = await response.json();
                setRentalPeriods(data.map(request => `Gehuurd van ${request.startdatum} tot ${request.einddatum}`));
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

        const rentData = {
            voertuigId,
            startdatum: startDate,
            einddatum: endDate,
            status: "In behandeling",
        };

        try {
            const response = await fetch('https://localhost:7159/api/verhuuraanvragen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rentData),
            });

            if (response.ok) {
                alert('Huurverzoek succesvol ingediend!');
                setStartDate(null);
                setEndDate(null);
            } else {
                throw new Error('Failed to submit rental request');
            }
        } catch (error) {
            alert('Er is iets mis gegaan bij het indienen van het huurverzoek.');
            console.error(error);
        }
    };

    if (!voertuig) {
        return <p>Loading vehicle data...</p>;
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
            </div>

            <div className="rental-overview">
                <h3>Overzicht Gehuurde Periodes</h3>
                <ul>
                    {rentalPeriods.length > 0 ? (
                        rentalPeriods.map((period, index) => (
                            <li key={index}>Gehuurd op: {period}</li>
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
                <button onClick={handleRent}>Huur Dit Voertuig</button>
            </div>
        </div>
    );
};

export default RentCar;

/*
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css'; // Standaard CSS voor de kalender
import '../styles/RentCar.css';
import '../index.css';

const RentCar = () => {
    const { voertuigId } = useParams(); // Haal de voertuigId uit de URL
    const [voertuig, setVehicle] = useState(null);
    const [rentalRequests, setRentalRequests] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const response = await fetch(`https://localhost:7159/api/voertuig/${voertuigId}`);
                if (!response.ok) throw new Error('Failed to fetch vehicle data');
                const data = await response.json();
                setVehicle(data);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchRentalRequests = async () => {
            try {
                const response = await fetch(`https://localhost:7159/api/verhuuraanvragen/voertuigen/${voertuigId}`);
                if (!response.ok) throw new Error('Failed to fetch rental requests');
                const data = await response.json();
                setRentalRequests(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchVehicle();
        fetchRentalRequests();
    }, [voertuigId]);

    const handleRent = async () => {
        // Check of beide datums zijn ingevuld
        if (!startDate || !endDate) {
            alert('Kies een start- en einddatum.');
            return;
        }

        // Valideer of de startdatum eerder is dan de einddatum
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            alert('De startdatum moet eerder zijn dan de einddatum.');
            return;
        }

        const rentData = {
            voertuigId: voertuigId,
            startdatum: startDate,
            einddatum: endDate,
            status: "In behandeling",
            huurderId: "USER_ID", // Hier moet je het huurderId dynamisch instellen
        };

        try {
            const response = await fetch('https://localhost:7159/api/verhuuraanvraag', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rentData),
            });

            if (response.ok) {
                alert('Huurverzoek succesvol ingediend!');
            } else {
                const errorData = await response.json();
                alert(`Fout bij het indienen: ${errorData.message || 'Onbekende fout'}`);
            }
        } catch (error) {
            alert('Er is iets mis gegaan bij het indienen van het huurverzoek.');
            console.error(error);
        }
    };

    if (!voertuig) {
        return <p>Loading vehicle data...</p>;
    }

    // Verkrijg de periodes van verhuuraanvragen als strings
    const rentalPeriods = rentalRequests.map(request => {
        const start = new Date(request.startdatum).toLocaleDateString();
        const end = new Date(request.einddatum).toLocaleDateString();
        return `${start} - ${end}`;
    });

    return (
        <div className="rent-car-container">
            <h2>Huur {voertuig.merk} {voertuig.type}</h2>

            <div className="vehicle-info">
                <p><strong>Kenteken:</strong> {voertuig.kenteken}</p>
                <p><strong>Kleur:</strong> {voertuig.kleur}</p>
                <p><strong>Soort:</strong> {voertuig.soort}</p>
                <p><strong>Status:</strong> {voertuig.status}</p>
                {voertuig.aanschafjaar && <p><strong>Aanschafjaar:</strong> {voertuig.aanschafjaar}</p>}
            </div>

            <div className="rental-periods">
                <h3>Overzicht Gehuurde Dagen</h3>
                {rentalPeriods.length > 0 ? (
                    <ul>
                        {rentalPeriods.map((period, index) => (
                            <li key={index}>Gehuurd voor: {period}</li>
                        ))}
                    </ul>
                ) : (
                    <p>Er zijn geen verhuuraanvragen voor dit voertuig.</p>
                )}
            </div>

            <div className="rental-form">
                <h3>Huur Periode</h3>
                <label>
                    Startdatum:
                    <input type="date" onChange={(e) => setStartDate(e.target.value)} />
                </label>
                <label>
                    Einddatum:
                    <input type="date" onChange={(e) => setEndDate(e.target.value)} />
                </label>
                <button onClick={handleRent}>Huur Dit Voertuig</button>

            </div>
        </div>
    );
};

export default RentCar;

*/
