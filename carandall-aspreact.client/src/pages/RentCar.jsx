/*import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/CarList.css'; // Zorg ervoor dat je je aangepaste CSS hebt geïmporteerd
import '../index.css';

const RentCar = () => {
    const {voertuigId} = useParams();  // Haal de voertuigId uit de URL
    const [voertuig, setVehicle] = useState(null);
    const [rentalRequests, setRentalRequests] = useState([]);

    useEffect(() => {
        // Haal voertuiggegevens op
        const fetchVehicle = async () => {
            const response = await fetch(`https://localhost:7159/api/voertuig/${voertuigId}`);
            const data = await response.json();
            setVehicle(data);
        };

        // Haal verhuuraanvragen op
        const fetchRentalRequests = async () => {
            const response = await fetch(`https://localhost:7159/api/verhuuraanvragen/voertuigen/${voertuigId}`);
            const data = await response.json();
            setRentalRequests(data);
        };

        fetchVehicle();
        fetchRentalRequests();
    }, [voertuigId]);

    const handleRent = async () => {
        const rentData = {
            voertuigId: voertuigId,
            startdatum: new Date(),  // Voorbeeld: de huur begint nu
            einddatum: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // Twee dagen later
            status: "In behandeling",
            huurderId: "USER_ID",  // Hier moet je het huurderId dynamisch instellen
        };

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
            alert('Er is iets mis gegaan bij het indienen van het huurverzoek.');
        }
    };

    if (!voertuig) {
        return <p>Loading vehicle data...</p>;
    }

    return (
        <div>
            <h2>Huur {voertuig.merk} {voertuig.type}</h2>
            <p>Kenteken: {voertuig.kenteken}</p>
            <p>Huidige status: {voertuig.status}</p>


            <h3>Verhuuraanvragen</h3>
            <ul>
                {rentalRequests.map((request) => (
                    <li key={request.verhuuraanvraagId}>
                        {request.startdatum} - {request.einddatum} ({request.status})
                    </li>
                ))}
            </ul>

            <button onClick={handleRent}>Huur dit voertuig</button>
        </div>
    );
};

export default RentCar;*/


import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const RentCar = () => {
    const {voertuigId} = useParams(); // Haal het voertuigId op uit de URL
    const [car, setCar] = useState(null); // Opslag voor de specifieke auto

    useEffect(() => {
        
        const fetchCarDetails = async () => {
            console.log('fetch gestart');
            console.log('carId is:' + voertuigId);
            try {
                const response = await fetch(`https://localhost:7159/api/voertuig/${voertuigId}`);
                console.log(response);
                if (!response.ok) {
                    throw new Error('Failed to fetch car details');
                }
                const data = await response.json();
                setCar(data);          

                console.log(data);
                console.log(data.kleur);
            } catch (error) {
                console.error(error.message);
            }
        };

        fetchCarDetails();
    }, [voertuigId]);

    if (!car) {
        return <p>Loading...</p>;
    }

    return (
        <div className="car-details">
            <h2>{car.merk} {car.type}</h2>
            <p>Kleur: {car.kleur}</p>
            <p>Kenteken: {car.kenteken}</p>
            <p>Status: {car.status}</p>
            {car.aanschafjaar && <p>Aanschafjaar: {car.aanschafjaar}</p>}
            <p>Soort: {car.soort}</p>
        </div>
    );
};

export default RentCar;