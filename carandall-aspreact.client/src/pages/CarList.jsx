import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CarList.css';
import '../index.css';
import auto from '../assets/car logo.png';
import caravan from '../assets/Caravan logo.png';
import camper from '../assets/Camper logo.png';
import spongebob from '../assets/spongebob dumb stare.gif';

const CarList = ({ onChangeSection }) => {
    const [cars, setCars] = useState([]);
    const [filteredCars, setFilteredCars] = useState([]);
    const [statusFilter, setStatusFilter] = useState('Alles');
    const [typeFilter, setTypeFilter] = useState('Alles');
    const [OrderBy, setOrderBy] = useState('Default');
    const [orderByAscDesc, setOrderByAscDesc] = useState('asc');
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
                        throw new Error('Fout met gebruikersdata verkrijgen.');
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
                const response = await fetch('https://localhost:7159/api/voertuig/voertuigen/met-aanvragen', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error('Fout met voertuigen verkrijgen.');
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
                return !(selectedStartDate <= aanvraagEnd && selectedEndDate >= aanvraagStart);
            }));

            return matchesStatus && matchesType && matchesDates;
        });

        const sorted = filtered.sort((a, b) => {
            const sortOp = sorters[OrderBy] || ((a, b) => 0);
            return orderByAscDesc === 'asc' ? sortOp(a, b) : sortOp(b, a);
        });

        setFilteredCars(sorted);
    };

    const handleNavigateToRentCar = (voertuigId) => {
        onChangeSection(`rentcar/${voertuigId}`);
    }

    useEffect(() => {
        handleFilterChange();
    }, [statusFilter, typeFilter, OrderBy, orderByAscDesc, startDate, endDate]);

    return (
        <div className="car-list">
            <h1>Voertuigen Te Huur</h1>

            <div className="filter-container">
                <div>
                    <label htmlFor="startDate">Startdatum:</label>
                    <input
                        id="startDate"
                        type="date"
                        value={startDate || ''}
                        onChange={(e) => setStartDate(e.target.value)}
                        aria-required="true"
                    />
                </div>

                <div>
                    <label htmlFor="endDate">Einddatum:</label>
                    <input
                        id="endDate"
                        type="date"
                        value={endDate || ''}
                        onChange={(e) => setEndDate(e.target.value)}
                        aria-required="true"
                    />
                </div>

                <div>
                    <label htmlFor="vehicleType">Soort Voertuig:</label>
                    <select
                        id="vehicleType"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        {userDetails?.bedrijf ? (
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
                    <label htmlFor="sortOrder">Sorteren Op:</label>
                    <div className="sort-select-wrapper">
                        <select
                            id="sortOrder"
                            value={OrderBy}
                            onChange={(e) => setOrderBy(e.target.value)}
                        >
                            <option value="Default">Default</option>
                            <option value="Prijs">Prijs</option>
                            <option value="Bouwjaar">Bouwjaar</option>
                            <option value="Merk">Merk</option>
                            <option value="Type">Type</option>
                        </select>
                        <button
                            onClick={() => setOrderByAscDesc(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className={`sort-arrow ${orderByAscDesc}`}
                            aria-label={orderByAscDesc === 'asc' ? 'Oplopend sorteren' : 'Aflopend sorteren'}
                        />
                    </div>
                </div>
            </div>

            <div className="car-items">
                {(!startDate || !endDate) && (
                    <p className="message" role="alert">Voer eerst een begin- en einddatum in om beschikbare voertuigen te bekijken.</p>
                )}
                {startDate && endDate && (
                    <div role="list" className="car-items">
                        {filteredCars.map((car) => {
                            let foto = car.afbeelding ? `../Voertuigen/${car.afbeelding}` : null;
                            if (!foto) {
                                switch (car.soort) {
                                    case 'Auto': foto = auto; break;
                                    case 'Camper': foto = camper; break;
                                    case 'Caravan': foto = caravan; break;
                                    default: foto = spongebob;
                                }
                            }

                            return (
                                <div key={car.voertuigId} role="listitem" className="car-item">
                                    <div className="car-image">
                                        <img
                                            src={foto}
                                            alt={`${car.merk} ${car.type}`}
                                            className="car-icon"
                                        />
                                    </div>
                                    <div className="info-box">
                                        <div className="car-details">
                                            <div className="title-div">
                                                <h2 className="Car-title">
                                                    {car.merk} {car.type}
                                                </h2>
                                            </div>
                                            <p><strong>Kleur: </strong>{car.kleur}</p>
                                            {car.aanschafjaar && <p><strong>Aanschafjaar:</strong> {car.aanschafjaar}</p>}
                                            <p><strong>Prijs per dag:</strong> &euro;{car.prijs}</p>
                                            <button
                                                onClick={() => handleNavigateToRentCar(car.voertuigId)}
                                                aria-label={`Huur ${car.merk} ${car.type}`}
                                            >
                                                Huren
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CarList;