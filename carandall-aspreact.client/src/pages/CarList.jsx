import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CarList.css';
import '../index.css';

const CarList = () => {
    const [cars, setCars] = useState([]);
    const [filteredCars, setFilteredCars] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await fetch('https://localhost:7159/api/verhuuraanvragen/voertuigen/met-aanvragen');
                if (!response.ok) {
                    throw new Error('Failed to fetch vehicles with rental data');
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

    const handleFilterChange = () => {
        const filtered = cars.filter((car) => {
            const matchesStatus =
                statusFilter === 'All' ||
                (statusFilter === 'Verhuurd' && car.heeftGoedgekeurdeAanvraag) ||
                (statusFilter === 'Beschikbaar' && !car.heeftGoedgekeurdeAanvraag && car.status === 'Beschikbaar') ||
                (statusFilter === car.status);

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

    useEffect(() => {
        handleFilterChange();
    }, [statusFilter, typeFilter]);

    return (
        <div className="car-list">
            <h2>Voertuigen Te Huur</h2>

            <div className="filter-container">
                <div>
                    <label htmlFor="status-filter">Filter Op Status:</label>
                    <select id="status-filter" value={statusFilter} onChange={handleStatusFilterChange}>
                        <option value="All">All</option>
                        <option value="Beschikbaar">Beschikbaar</option>
                        <option value="In reparatie">In reparatie</option>
                        <option value="Verhuurd">Verhuurd</option>
                    </select>
                </div>

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

            <div className="car-items">
                {filteredCars.map((car) => (
                    <div key={car.voertuigId} className="car-item">
                        <h3>{car.merk} {car.type}</h3>
                        <p>Kleur: {car.kleur}</p>
                        <p>Kenteken: {car.kenteken}</p>
                        <p>Status: {car.heeftGoedgekeurdeAanvraag ? 'Verhuurd' : car.status}</p>
                        {car.aanschafjaar && <p>Aanschafjaar: {car.aanschafjaar}</p>}
                        <p>Soort: {car.soort}</p>
                        <button
                            onClick={() => {
                                console.log("Navigating to ID:", car.voertuigId);
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
