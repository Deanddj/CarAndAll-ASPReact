import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Huurgeschiedenis.css';
import '../index.css';
import dropdownArrow from '../assets/Dropdown menu arrow.png';

const HuurgeschiedenisBeheerder = () => {
    const [cars, setCars] = useState([]);
    const [filteredCars, setFilteredCars] = useState([]);
    const [typeFilter, setTypeFilter] = useState('Alles');
    const [OrderBy, setOrderBy] = useState('Default');
    const [orderByAscDesc, setOrderByAscDesc] = useState('asc');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [openDetails, setOpenDetails] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userResponse = await fetch('https://localhost:7159/api/account/get', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!userResponse.ok) {
                    if (userResponse.status === 401) {
                        alert('Je moet zijn ingelogd voor deze pagina.');
                        navigate('/login');
                    } else {
                        throw new Error('Fout met gebruikersdata verkrijgen.');
                    }
                }

                const userData = await userResponse.json();
                setUserDetails(userData);

                const bedrijfId = userData.bedrijf?.bedrijfId;
                console.log("message van huurgeschiedenis:");

                console.log(`De id van het bedrijf is: ${bedrijfId}`);
                if (!bedrijfId) throw new Error('Geen bedrijfs-ID gevonden.');

                const bedrijfResponse = await fetch(`https://localhost:7159/api/bedrijf/get/${bedrijfId}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!bedrijfResponse.ok) {
                    throw new Error('Fout met het ophalen van gebruikers van het bedrijf.');
                }

                const bedrijfData = await bedrijfResponse.json();
                const users = bedrijfData.huurders.$values.map(huurder => huurder.id) || [];

                console.log(`De leden van het bedrijf zijn: `, users);


                let allCars = [];
                for (const user of users) {
                    console.log(`De user id is: ${user}`);
                    const userCarsResponse = await fetch(`https://localhost:7159/api/voertuig/verhuuraanvragen/op/${user}`, {
                        method: 'GET',
                        credentials: 'include',
                    });

                    if (userCarsResponse.ok) {
                        const userCarsData = await userCarsResponse.json();
                        allCars = [...allCars, ...(userCarsData.$values || [])];
                    }
                }

                setCars(allCars);
                setFilteredCars(allCars);
            } catch (error) {
                console.error('Fout:', error.message);
            }
        };

        fetchData();
    }, [navigate]);

    const sorters = {
        Default: (a, b) => a.voertuigId - b.voertuigId,
        Prijs: (a, b) => a.prijs - b.prijs,
        Merk: (a, b) => a.merk.localeCompare(b.merk),
        Type: (a, b) => a.type.localeCompare(b.type),
        Bouwjaar: (a, b) => a.aanschafjaar - b.aanschafjaar,
    };

    const handleFilterChange = () => {
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            alert('De einddatum mag niet eerder zijn dan de startdatum.');
            setStartDate(null);
            setEndDate(null);
            return;
        }
        const filtered = cars.filter((car) => {
            const matchesType = typeFilter === 'Alles' || car.soort === typeFilter;

            const selectedStartDate = new Date(startDate);
            const selectedEndDate = new Date(endDate);

            const matchesDates =
                !startDate ||
                !endDate ||
                (Array.isArray(car.verhuuraanvragen.$values) &&
                    car.verhuuraanvragen.$values.some((aanvraag) => {
                        const aanvraagStart = new Date(aanvraag.startdatum);
                        const aanvraagEnd = new Date(aanvraag.einddatum);

                        return (
                            selectedStartDate <= aanvraagEnd &&
                            selectedEndDate >= aanvraagStart
                        );
                    }));

            return matchesType && matchesDates;
        });

        const sorted = filtered.sort((a, b) => {
            const sortOp = sorters[OrderBy] || ((a, b) => 0);
            return orderByAscDesc === 'asc' ? sortOp(a, b) : sortOp(b, a);
        });

        setFilteredCars(sorted);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const toggleDetails = (carId) => {
        setOpenDetails((prev) => (prev === carId ? null : carId));
    };

    useEffect(() => {
        handleFilterChange();
    }, [typeFilter, OrderBy, orderByAscDesc, startDate, endDate]);

    return (
        <div className="car-list">
            <h2>Huurgeschiedenis Wagenparkbeheerder</h2>

            <div className="filter-container">
                <div>
                    <label>Startdatum:</label>
                    <input
                        type="date"
                        value={startDate || ''}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                <div>
                    <label>Einddatum:</label>
                    <input
                        type="date"
                        value={endDate || ''}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                <div>
                    <label>Voertuig:</label>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value="Alles">Alles</option>
                        <option value="Auto">Auto</option>
                        <option value="Camper">Camper</option>
                        <option value="Caravan">Caravan</option>
                    </select>
                </div>

                <div className="sort-container">
                    <label>Sorteren Op:</label>
                    <div className="sort-select-wrapper">
                        <select value={OrderBy} onChange={(e) => setOrderBy(e.target.value)}>
                            <option value="Default">Default</option>
                            <option value="Prijs">Prijs</option>
                            <option value="Bouwjaar">Bouwjaar</option>
                            <option value="Merk">Merk</option>
                            <option value="Type">Type</option>
                        </select>
                        <button
                            onClick={() => setOrderByAscDesc((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                            className={`sort-arrow ${orderByAscDesc}`}
                        />
                    </div>
                </div>
            </div>

            <div className="huur-items">
                {filteredCars.map((car) => (
                    <button
                        key={car.voertuigId}
                        className="huur-item"
                        onClick={() => toggleDetails(car.voertuigId)}
                    >
                        <div className="huur-item-header">
                            <div className="car-image-placeholder"></div>
                            <div>
                                <p className="car-title">{car.merk} {car.type}</p>
                                <p className="car-dates">
                                    <b>{formatDate(car.verhuuraanvragen.$values[0]?.startdatum)}</b> - <b>{formatDate(car.verhuuraanvragen.$values[0]?.einddatum)}</b>
                                </p>
                            </div>
                        </div>
                        <img
                            src={dropdownArrow}
                            alt="Dropdown Arrow"
                            className={`dropdown-arrow-right ${openDetails === car.voertuigId ? 'open' : ''}`}
                        />
                        <div
                            id={`details-${car.voertuigId}`}
                            className="huur-item-details"
                            style={{ display: openDetails === car.voertuigId ? 'block' : 'none' }}
                        >
                            <p>Kleur: {car.kleur}</p>
                            <p>Status: {car.status}</p>
                            <p>Kenteken: {car.kenteken}</p>
                            <p>Aanschafjaar: {car.aanschafjaar}</p>
                            <p>Prijs: &euro;{car.prijs}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default HuurgeschiedenisBeheerder;
