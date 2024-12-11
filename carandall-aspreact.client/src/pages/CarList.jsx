import React, { useEffect, useState } from 'react';
//import axios from 'axios';


const CarList = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await fetch('https://localhost:7159/api/voertuig');
                if (response.ok) {
                    const data = await response.json();
                    setCars(data);
                } else {
                    console.error('Failed to fetch vehicles');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCars();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="car-list">
            <h2>Cars for Rental</h2>
            <div className="car-items">
                {cars.map((car) => (
                    <div key={car.voertuigId} className="car-item">
                        <h3>{car.merk} {car.type}</h3>
                        <p>{car.status}</p>
                        <p><strong>Kleur:</strong> {car.kleur}</p>
                        <p><strong>Aanschafjaar:</strong> {car.aanschafjaar || 'Onbekend'}</p>
                        <p><strong>Type:</strong> {car.soort}</p>
                        <button>Rent Now</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CarList;


