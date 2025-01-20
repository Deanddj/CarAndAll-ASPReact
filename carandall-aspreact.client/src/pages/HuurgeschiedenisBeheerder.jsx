import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HuurgeschiedenisBeheerder.css';
import '../index.css';
import dropdownArrow from '../assets/Dropdown menu arrow.png';

const HuurgeschiedenisBeheerder = () => {
    const [cars, setCars] = useState([]);
    const [originalCars, setOriginalCars] = useState({});
    const [filteredCars, setFilteredCars] = useState([]);
    const [typeFilter, setTypeFilter] = useState('Alles');
    const [OrderBy, setOrderBy] = useState('Default');
    const [orderByAscDesc, setOrderByAscDesc] = useState('asc');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [openDetails, setOpenDetails] = useState(null);
    const [openHuurItemDetails, setOpenHuurItemDetails] = useState(null);
    const [openStatus, setOpenStatus] = useState({
        'Goedgekeurd': true,   // All containers open by default
        'In behandeling': true,
        'Afgewezen': true
    });
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
                if (!bedrijfId) throw new Error('Geen bedrijfs-ID gevonden.');

                const bedrijfResponse = await fetch(`https://localhost:7159/api/bedrijf/get/${bedrijfId}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!bedrijfResponse.ok) {
                    throw new Error('Fout met het ophalen van gebruikers van het bedrijf.');
                }

                const bedrijfData = await bedrijfResponse.json();
                const huurders = bedrijfData.huurders.$values || [];

                const huurderData = {};
                for (const huurder of huurders) {
                    const userCarsResponse = await fetch(`https://localhost:7159/api/voertuig/verhuuraanvragen/op/${huurder.id}`, {
                        method: 'GET',
                        credentials: 'include',
                    });

                    if (!userCarsResponse.ok) {
                        console.warn(`Kon voertuigen niet ophalen voor huurder: ${huurder.naam}`);
                        continue;
                    }

                    const userCarsData = await userCarsResponse.json();
                    huurderData[huurder.naam] = userCarsData.$values.map((voertuig) => ({
                        voertuigId: voertuig.voertuigId,
                        soort: voertuig.soort,
                        merk: voertuig.merk,
                        type: voertuig.type,
                        kenteken: voertuig.kenteken,
                        kleur: voertuig.kleur,
                        aanschafjaar: voertuig.aanschafjaar,
                        status: voertuig.status,
                        prijs: voertuig.prijs,
                        verhuuraanvragen: voertuig.verhuuraanvragen.$values.map((aanvraag) => ({
                            verhuuraanvraagId: aanvraag.verhuuraanvraagId,
                            startdatum: aanvraag.startdatum,
                            einddatum: aanvraag.einddatum,
                            status: aanvraag.status,
                        })),
                    }));
                }

                console.log('Georganiseerde huurder data:', huurderData);
                setOriginalCars(huurderData);
                setCars(huurderData);
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

    const handleFilterChange = (huurderNaam) => {
        // Check of de einddatum niet eerder is dan de startdatum
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            alert('De einddatum mag niet eerder zijn dan de startdatum.');
            setStartDate(null);
            setEndDate(null);
            return;
        }

        // Filter logica voor de auto's van de specifieke huurder
        const huurderCars = originalCars[huurderNaam] || [];

        const filtered = huurderCars.filter((car) => {
            const matchesType = true;

            const selectedStartDate = startDate ? new Date(startDate) : null;
            const selectedEndDate = endDate ? new Date(endDate) : null;

            const matchesDates =
                !startDate || !endDate || // Geen filter voor datums
                (Array.isArray(car.verhuuraanvragen) && // Direct check if it's an array
                    car.verhuuraanvragen.some((aanvraag) => {
                        const aanvraagStart = new Date(aanvraag.startdatum);
                        const aanvraagEnd = new Date(aanvraag.einddatum);

                        const isOverlap =
                            selectedStartDate <= aanvraagEnd &&
                            selectedEndDate >= aanvraagStart;

                        return isOverlap;
                    })
                );

            return matchesType && matchesDates;
        });

        const sorted = filtered.sort((a, b) => {
            const sortOp = sorters[OrderBy] || ((a, b) => 0);
            return orderByAscDesc === 'asc' ? sortOp(a, b) : sortOp(b, a);
        });

        setCars((prevCars) => {
            return {
                ...prevCars,
                [huurderNaam]: sorted,
            };
        });
    };

    useEffect(() => {
        if (openDetails) {
            handleFilterChange(openDetails);
        }
    }, [typeFilter, OrderBy, orderByAscDesc, startDate, endDate, openDetails]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const calculateTotalPrice = (startDate, endDate, pricePerDay) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const timeDifference = end - start;
        const days = timeDifference / (1000 * 3600 * 24); 

        return days * pricePerDay;
    };

    const groupByStatus = (huurderCars) => {
        const statusGroups = {
            'Goedgekeurd': [],
            'In behandeling': [],
            'Afgewezen': []
        };

        huurderCars.forEach(car => {
            if (Array.isArray(car.verhuuraanvragen)) {
                car.verhuuraanvragen.forEach(aanvraag => {
                    if (statusGroups[aanvraag.status]) {
                        statusGroups[aanvraag.status].push({ car, aanvraag });
                    }
                });
            }
        });
        return statusGroups;
    };

    const toggleHuurderDetails = (huurderNaam) => {
        setOpenDetails((prev) => (prev === huurderNaam ? null : huurderNaam));
    };

    const toggleStatusDetails = (status) => {
        setOpenStatus((prev) => ({
            ...prev,
            [status]: !prev[status]  
        }));
    };

    const toggleHuurItemDetails = (aanvraagId) => {
        setOpenHuurItemDetails((prev) => (prev === aanvraagId ? null : aanvraagId));
    };

    return (
        <div className="car-list">
            <h2>Huurgeschiedenis</h2>

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

            {Object.keys(cars).map((huurderNaam) => {
                const huurderCars = cars[huurderNaam];
                const statusGroups = groupByStatus(huurderCars);

                return (
                    <div key={huurderNaam} className="huurder-container">
                        <h3 onClick={() => toggleHuurderDetails(huurderNaam)}>
                            {huurderNaam}
                            <img
                                src={dropdownArrow}
                                alt="Dropdown Arrow"
                                className={`dropdown-arrow-right ${openDetails === huurderNaam ? 'open' : ''}`}
                            />
                        </h3>
                        {openDetails === huurderNaam && (
                            <div className="huurder-details">
                                {['Goedgekeurd', 'In behandeling', 'Afgewezen'].map((status) => (
                                    <div key={status} className={`status-container ${status.toLowerCase().replace(' ', '-')}`}>
                                        <p className="status-counter">{statusGroups[status].length} items</p>
                                        <h4 onClick={() => toggleStatusDetails(status)}>
                                            {status}
                                            <img
                                                src={dropdownArrow}
                                                alt="Dropdown Arrow"
                                                className={`dropdown-arrow-right ${openStatus[status] ? 'open' : ''}`}
                                            />
                                        </h4>
                                        {openStatus[status] && (
                                            <div className="huur-items">
                                                {statusGroups[status].map(({ car, aanvraag }) => {
                                                    const totalPrice = calculateTotalPrice(aanvraag.startdatum, aanvraag.einddatum, car.prijs);

                                                    return (
                                                        <div key={aanvraag.verhuuraanvraagId} className="huur-item">
                                                            <div className="huur-item-header" onClick={() => toggleHuurItemDetails(aanvraag.verhuuraanvraagId)}>
                                                                <div className="car-image-placeholder"></div>
                                                                <div className="car-info">
                                                                    <p className="car-title">{car.merk} {car.type}</p>
                                                                    <p className="car-dates">
                                                                        {formatDate(aanvraag.startdatum)} - {formatDate(aanvraag.einddatum)}
                                                                    </p>
                                                                </div>
                                                                <img
                                                                    src={dropdownArrow}
                                                                    alt="Dropdown Arrow"
                                                                    className={`dropdown-arrow-right ${openHuurItemDetails === aanvraag.verhuuraanvraagId ? 'open' : ''}`}
                                                                />
                                                            </div>

                                                            {openHuurItemDetails === aanvraag.verhuuraanvraagId && (
                                                                <div className="huur-item-details">
                                                                    <p>Kleur: {car.kleur}</p>
                                                                    <p>Status: {car.status}</p>
                                                                    <p>Kenteken: {car.kenteken}</p>
                                                                    <p>Aanschafjaar: {car.aanschafjaar}</p>
                                                                    <p>Totale prijs: €{totalPrice.toFixed(2)}</p>
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
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default HuurgeschiedenisBeheerder;