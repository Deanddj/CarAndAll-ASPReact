import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CarList.css'; // Zorg ervoor dat je je aangepaste CSS hebt geïmporteerd
import '../index.css';

const CarList = () => {
    const [cars, setCars] = useState([]); // Opslag voor alle auto's
    const [filteredCars, setFilteredCars] = useState([]); // Opslag voor gefilterde auto's
    const [statusFilter, setStatusFilter] = useState('All'); // Huidige status filterwaarde
    const [typeFilter, setTypeFilter] = useState('All'); // Huidige soort filterwaarde
    const navigate = useNavigate();

    // Fetch voertuigen van de server
    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await fetch('https://localhost:7159/api/voertuig');
                if (!response.ok) {
                    throw new Error('Failed to fetch vehicles');
                }
                const data = await response.json();

                const cars = data.$values || [];
                setCars(cars);
                setFilteredCars(cars);
            } catch (error) {
                console.error(error.message);
            }
        };

        fetchCars();
    }, []);

    // Functie om filters te verwerken
    const handleFilterChange = () => {
        const filtered = cars.filter((car) => {
            const matchesStatus = statusFilter === 'All' || car.status === statusFilter;
            const matchesType = typeFilter === 'All' || car.soort === typeFilter;

            return matchesStatus && matchesType;
        });

        setFilteredCars(filtered);
    };

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
    };

    const handleTypeFilterChange = (event) => {
        setTypeFilter(event.target.value);
    };

    // Pas de filters toe bij elke wijziging
    useEffect(() => {
        handleFilterChange();
    }, [statusFilter, typeFilter]);

    return (
        <div className="car-list">
            <h2>Voertuigen Te Huur</h2>

            {/* Container voor de filters */}
            <div className="filter-container">
                {/* Status filter */}
                <div>
                    <label htmlFor="status-filter">Filter Op Status:</label>
                    <select id="status-filter" value={statusFilter} onChange={handleStatusFilterChange}>
                        <option value="All">All</option>
                        <option value="Beschikbaar">Beschikbaar</option>
                        <option value="In reparatie">In reparatie</option>
                        <option value="Verhuurd">Verhuurd</option>
                    </select>
                </div>

                {/* Soort filter */}
                <div>
                    <label htmlFor="type-filter">Filter Op Type Voertuig:</label>
                    <select id="type-filter" value={typeFilter} onChange={handleTypeFilterChange}>
                        <option value="All">All</option>
                        <option value="Auto">Auto</option>
                        <option value="Camper">Camper</option>
                        <option value="Caravan">Caravan</option>
                    </select>
                </div>
            </div>

            {/* Gefilterde lijst van auto's */}
            <div className="car-items">
                {filteredCars.map((car) => (
                    <div key={car.voertuigId} className="car-item">
                        <h3>{car.merk} {car.type}</h3>
                        <p>Kleur: {car.kleur}</p>
                        <p>Kenteken: {car.kenteken}</p>
                        <p>Status: {car.status}</p>
                        {car.aanschafjaar && <p>Aanschafjaar: {car.aanschafjaar}</p>}
                        <p>Soort: {car.soort}</p>
                        <button
                            onClick={() => {
                                console.log("Navigating to ID:", car.voertuigId); // Controleer de waarde
                                navigate(`/rentCar/${car.voertuigId}`);
                            }}
                        >
                            Huren
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CarList;
