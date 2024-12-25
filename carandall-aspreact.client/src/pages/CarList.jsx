import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CarList.css';
import '../index.css';
import ArrowImage from '../assets/Pijl wijst naar beneden.png'; // Afbeelding importeren

const CarList = () => {
    const [cars, setCars] = useState([]);
    const [filteredCars, setFilteredCars] = useState([]);
    const [statusFilter, setStatusFilter] = useState('Alles');
    const [typeFilter, setTypeFilter] = useState('Alles');
    const [OrderBy, setOrderBy] = useState('Prijs'); // Default sorteren op prijs
    const [orderByAscDesc, setOrderByAscDesc] = useState('asc'); // 'asc' voor oplopend, 'desc' voor aflopend
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
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

    const sorters = {
        'Prijs': (a, b) => a.prijs - b.prijs,
        'Merk': (a, b) => a.merk.localeCompare(b.merk),
        'Type': (a, b) => a.type.localeCompare(b.type),
        'Bouwjaar': (a, b) => a.aanschafjaar - b.aanschafjaar,
    };

    const handleFilterChange = () => {
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            alert("De einddatum mag niet eerder zijn dan de startdatum.");
            setStartDate(null);
            setEndDate(null);
            return;
        }

        const filtered = cars.filter((car) => {
            const matchesStatus =
                statusFilter === 'Alles' ||
                (statusFilter === 'Verhuurd' && car.heeftGoedgekeurdeAanvraag) ||
                (statusFilter === 'Beschikbaar' && !car.heeftGoedgekeurdeAanvraag && car.status === 'Beschikbaar') ||
                (statusFilter === car.status);

            const matchesType = typeFilter === 'Alles' || car.soort === typeFilter;

            const selectedStartDate = new Date(startDate);
            const selectedEndDate = new Date(endDate);

            const matchesDates = !startDate || !endDate || (Array.isArray(car.verhuuraanvragen.$values) && car.verhuuraanvragen.$values.every((aanvraag) => {
                const aanvraagStart = new Date(aanvraag.startdatum);
                const aanvraagEnd = new Date(aanvraag.einddatum);
                const isOverlap = (selectedStartDate <= aanvraagEnd && selectedEndDate >= aanvraagStart);
                return !isOverlap;
            }));

            return matchesStatus && matchesType && matchesDates;
        });

        const sorted = filtered.sort((a, b) => { //dit is de gesorteerde lijst voertuigen
            const sortOp = sorters[OrderBy] || ((a, b) => 0); //dit bepaalt op wat je wilt sorteren zoals prijs of bouwjaar etc
            if (orderByAscDesc === 'asc') {
                return sortOp(a, b);
            } else {
                return sortOp(b, a);
            } // dit bepaalt of het oplopend of aflopend is en vervolgens returned de lijst gebasseerd daarop
        });

        setFilteredCars(sorted);
    };

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
    };

    const handleTypeFilterChange = (event) => {
        setTypeFilter(event.target.value);
    };

    const handleOrderByChange = (event) => {
        setOrderBy(event.target.value);
    };

    const handleOrderByAscDescChange = () => {
        setOrderByAscDesc((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const handleStartDateChange = (event) => {
        setStartDate(event.target.value);
    };

    const handleEndDateChange = (event) => {
        setEndDate(event.target.value);
    };

    useEffect(() => {
        handleFilterChange();
    }, [statusFilter, typeFilter, OrderBy, orderByAscDesc, startDate, endDate]);

    return (
        <div className="car-list">
            <h2>Voertuigen Te Huur</h2>

            <div className="filter-container">
                <div>
                    <label>Startdatum:</label>
                    <input
                        type="date"
                        value={startDate || ''}
                        onChange={handleStartDateChange}
                    />
                </div>

                <div>
                    <label>Einddatum:</label>
                    <input
                        type="date"
                        value={endDate || ''}
                        onChange={handleEndDateChange}
                    />
                </div>

                <div>
                    <label>Status:</label>
                    <select value={statusFilter} onChange={handleStatusFilterChange}>
                        <option value="Alles">Alles</option>
                        <option value="Beschikbaar">Beschikbaar</option>
                        <option value="In reparatie">In reparatie</option>
                        <option value="Verhuurd">Verhuurd</option>
                    </select>
                </div>

                <div>
                    <label>Voertuig:</label>
                    <select value={typeFilter} onChange={handleTypeFilterChange}>
                        <option value="Alles">Alles</option>
                        <option value="Auto">Auto</option>
                        <option value="Camper">Camper</option>
                        <option value="Caravan">Caravan</option>
                    </select>
                </div>

                <div className="sort-container">
                    <label>Sorteren Op:</label>
                    <div className="sort-select-wrapper">
                        <select value={OrderBy} onChange={handleOrderByChange}>
                            <option value="Prijs">Prijs</option>
                            <option value="Bouwjaar">Bouwjaar</option>
                            <option value="Merk">Merk</option>
                            <option value="Type">Type</option>
                        </select>
                        <button
                            onClick={handleOrderByAscDescChange}
                            className={`sort-arrow ${orderByAscDesc}`}
                        />
                    </div>
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
                        <p>Prijs per dag: {car.prijs}</p>
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
