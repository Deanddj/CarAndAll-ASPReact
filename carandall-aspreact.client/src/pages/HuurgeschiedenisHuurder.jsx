import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CarList.css';
import '../index.css';
import auto from '../assets/car logo.png';
import caravan from '../assets/Caravan logo.png';
import camper from '../assets/Camper logo.png';
import spongebob from '../assets/spongebob dumb stare.gif';

const HuurgeschiedenisHuurder = () => {
    const [cars, setCars] = useState([]);
    const [filteredCars, setFilteredCars] = useState([]);
    const [statusFilter, setStatusFilter] = useState('Alles');
    const [typeFilter, setTypeFilter] = useState('Alles');
    const [OrderBy, setOrderBy] = useState('Default'); // Default sorteren op prijs
    const [orderByAscDesc, setOrderByAscDesc] = useState('asc'); // 'asc' voor oplopend, 'desc' voor aflopend
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch('https://localhost:7159/api/account/get', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        alert('Je moet zijn ingelogd voor deze pagina.');
                        window.location.href = '/login';
                    } else {
                        throw new Error('Fout met gebruikersdata verkrijgen');
                    }
                }

                const data = await response.json();
                console.log(data);
                setUserDetails(data);
            } catch (error) {
                console.error('Fout:', error.message);
            }
        };

        const fetchCars = async () => {
            try {
                const response = await fetch('https://localhost:7159/api/voertuig/voertuigen/met-aanvragen', {
                    method: 'GET',
                    credentials: 'include',
                });
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

        fetchUserDetails();
        fetchCars();
    }, []);

    const sorters = {
        'Default': (a, b) => a.voertuigId - b.voertuigId,
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
                        {userDetails && userDetails.bedrijf ? (
                            <option value="Auto">Auto</option>
                        ) : (
                            <>
                                <option value="Alles">Alles</option>
                                <option value="Auto">Auto</option>
                                <option value="Camper">Camper</option>
                                <option value="Caravan">Caravan</option>
                            </>
                        )}
                    </select>
                </div>

                <div className="sort-container">
                    <label>Sorteren Op:</label>
                    <div className="sort-select-wrapper">
                        <select value={OrderBy} onChange={handleOrderByChange}>
                            <option value="Default">Default</option>
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
                {filteredCars.map((car) => {
                    // Kies de juiste foto op basis van het soort voertuig
                    let foto;
                    switch (car.soort) {
                        case 'Auto':
                            foto = auto; // Zet hier het pad naar de afbeelding van een auto
                            break;
                        case 'Camper':
                            foto = camper; // Zet hier het pad naar de afbeelding van een camper
                            break;
                        case 'Caravan':
                            foto = caravan; // Zet hier het pad naar de afbeelding van een caravan
                            break;
                        default:
                            foto = spongebob; // Zet hier een standaard afbeelding in geval van een onbekende soort
                    }

                    return (
                        <div key={car.voertuigId} className="car-item">
                            <div className="title-div">
                                <h3 className="Car-title">
                                    {car.merk} {car.type}
                                </h3>
                            </div>
                            <p>Kleur: {car.kleur}</p>
                            <p>Kenteken: {car.kenteken}</p>
                            <p>Status: {car.heeftGoedgekeurdeAanvraag ? 'Verhuurd' : car.status}</p>
                            {car.aanschafjaar && <p>Aanschafjaar: {car.aanschafjaar}</p>}
                            <p>Prijs per dag: {car.prijs}</p>
                            <p>
                                <div className="vehicle-icon">
                                    <img src={foto} alt={`${car.soort} icoon`} className="car-icon" />
                                </div>
                            </p>
                            <button
                                onClick={() => {
                                    console.log("Navigating to ID:", car.voertuigId);
                                    navigate(`/rentCar/${car.voertuigId}`);
                                }}
                            >
                                Huren
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );

};

export default HuurgeschiedenisHuurder;