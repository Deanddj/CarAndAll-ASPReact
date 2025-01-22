import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Huurgeschiedenis.css';
import '../index.css';
import dropdownArrow from '../assets/Dropdown menu arrow.png';
import auto from '../assets/car logo.png';
import caravan from '../assets/Caravan logo.png';
import camper from '../assets/Camper logo.png';
import spongebob from '../assets/spongebob dumb stare.gif';

const HuurgeschiedenisHuurder = () => {
    const [cars, setCars] = useState([]);
    const [filteredCars, setFilteredCars] = useState([]);
    const [typeFilter, setTypeFilter] = useState('Alles');
    const [OrderBy, setOrderBy] = useState('Default');
    const [orderByAscDesc, setOrderByAscDesc] = useState('asc');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [openDetails, setOpenDetails] = useState(null);
    const [openStatus, setOpenStatus] = useState({
        'Goedgekeurd': true,   // All containers open by default
        'In behandeling': true,
        'Afgewezen': true
    });

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
                setUserDetails(data);
            } catch (error) {
                console.error('Fout:', error.message);
            }
        };

        const fetchCars = async () => {
            try {
                const response = await fetch('https://localhost:7159/api/voertuig/voertuigen/met-aanvragen/van-user', {
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

    const calculateTotalPrice = (startDate, endDate, pricePerDay) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Bereken het aantal dagen
        const timeDifference = end - start;
        const days = timeDifference / (1000 * 3600 * 24); // Omrekenen van milliseconden naar dagen

        // Vermenigvuldig met de prijs per dag
        return days * pricePerDay;
    };

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

                        const isOverlap =
                            selectedStartDate <= aanvraagEnd &&
                            selectedEndDate >= aanvraagStart;
                        return isOverlap;
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
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Maanden zijn 0-gebaseerd
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const toggleDetails = (carId) => {
        setOpenDetails((prev) => (prev === carId ? null : carId));
    };

    const toggleStatusDetails = (status) => {
        setOpenStatus((prev) => ({
            ...prev,
            [status]: !prev[status]  // Toggle the state for the clicked status container
        }));
    };

    useEffect(() => {
        handleFilterChange();
    }, [typeFilter, OrderBy, orderByAscDesc, startDate, endDate]);

    // Functie om verhuuraanvragen per status te groeperen
    const groupByStatus = (cars) => {
        const statusGroups = {
            'Goedgekeurd': [],
            'In behandeling': [],
            'Afgewezen': []
        };

        cars.forEach(car => {
            if (Array.isArray(car.verhuuraanvragen.$values)) {
                car.verhuuraanvragen.$values.forEach(aanvraag => {
                    if (statusGroups[aanvraag.status]) {
                        statusGroups[aanvraag.status].push({ car, aanvraag });
                    }
                });
            }
        });

        return statusGroups;
    };

    const statusGroups = groupByStatus(filteredCars);

    return (
        <div className="car-list">
            <h2>Huurgeschiedenis</h2>

            {/* Filter and Sorter Section */}
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

            {['Goedgekeurd', 'In behandeling', 'Afgewezen'].map(status => (
                <div key={status} className={`vehicle-container ${status.toLowerCase().replace(' ', '-')}`}>
                    <h3 onClick={() => toggleStatusDetails(status)}>
                        {status}
                        <img
                            src={dropdownArrow}
                            alt="Dropdown Arrow"
                            className={`dropdown-arrow-right ${openStatus[status] ? 'open' : ''}`}
                        />
                    </h3>
                    {openStatus[status] && (
                        <div className="huur-items">
                            {statusGroups[status].map(({ car, aanvraag }) => {
                                const totalPrice = calculateTotalPrice(aanvraag.startdatum, aanvraag.einddatum, car.prijs);

                                //console.log(`De afbeelding is: ${car.afbeelding}`);
                                //var foto = car.afbeelding
                                //    ? `../Voertuigen/${car.afbeelding}`
                                //    : null;

                                //if (!foto) {
                                //    switch (car.soort) {
                                //        case 'Auto':
                                //            foto = auto;
                                //            break;
                                //        case 'Camper':
                                //            foto = camper;
                                //            break;
                                //        case 'Caravan':
                                //            foto = caravan;
                                //            break;
                                //        default:
                                //            foto = spongebob; 
                                //    }
                                //}

                                return (
                                    <div key={aanvraag.verhuuraanvraagId} className="huur-item">
                                        <div className="huur-item-header" onClick={() => toggleDetails(aanvraag.verhuuraanvraagId)}>
                                            <div className="car-image-placeholder">
                                                <img src={spongebob} alt={`${car.soort} icoon`} className="car-icon" />
                                            </div>
                                            <div className="car-info">
                                                <p className="car-title">{car.merk} {car.type}</p>
                                                <p className="car-dates">
                                                    {formatDate(aanvraag.startdatum)} - {formatDate(aanvraag.einddatum)}
                                                </p>
                                            </div>
                                            <img
                                                src={dropdownArrow}
                                                alt="Dropdown Arrow"
                                                className={`dropdown-arrow-right ${openDetails === aanvraag.verhuuraanvraagId ? 'open' : ''}`}
                                            />
                                        </div>

                                        {openDetails === aanvraag.verhuuraanvraagId && (
                                            <div className="huur-item-details">
                                                <p>Kleur: {car.kleur}</p>
                                                <p>Status: {car.status}</p>
                                                <p>Kenteken: {car.kenteken}</p>
                                                <p>Aanschafjaar: {car.aanschafjaar}</p>
                                                <p>Totale prijs: &euro;{totalPrice.toFixed(2)}</p>
                                                <p>Status aanvraag: {aanvraag.status}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default HuurgeschiedenisHuurder;
