import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/RentCar.css';

const RentCar = () => {
    const { voertuigId } = useParams();
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
            Startdatum: startDate,
            Einddatum: endDate,
            VoertuigId: parseInt(voertuigId, 10),
        };

        console.log('Verstuurde data:', rentData);

        try {
            const response = await fetch('https://localhost:7159/api/verhuuraanvragen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rentData),
                credentials: 'include',
            });

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
                            <li key={index}>{period}</li>
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
