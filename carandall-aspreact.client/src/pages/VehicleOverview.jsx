import { useState, useEffect } from 'react';
import '../styles/VehicleOverview.css';

const VehicleOverview = () => {
    const [vehicles, setVehicles] = useState([]);
    const [editVehicleId, setEditVehicleId] = useState(null);
    const [vehicleData, setVehicleData] = useState({
        merk: '',
        type: '',
        kenteken: '',
        kleur: '',
        aanschafjaar: 0,
        soort: '',
        prijs: 0,
    });
    const [newVehicleData, setNewVehicleData] = useState({
        merk: '',
        type: '',
        kenteken: '',
        kleur: '',
        aanschafjaar: 0,
        soort: '',
        prijs: 0,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddPopup, setShowAddPopup] = useState(false);

    const fetchCars = async () => {
        try {
            const response = await fetch('https://localhost:7159/api/voertuig/voertuigen/met-aanvragen', {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Fout met voertuigen verkrijgen');
            }
            const data = await response.json();
            const cars = data.$values || [];
            setVehicles(cars);
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredVehicles = vehicles.filter(vehicle => {
        return (
            vehicle.merk.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const handleEditClick = (vehicleId, vehicle) => {
        setEditVehicleId(vehicleId);
        setVehicleData({
            merk: vehicle.merk,
            type: vehicle.type,
            kenteken: vehicle.kenteken,
            kleur: vehicle.kleur,
            aanschafjaar: vehicle.aanschafjaar,
            soort: vehicle.soort,
            prijs: vehicle.prijs,
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setVehicleData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        try {
            const updatedVehicleData = {
                merk: vehicleData.merk,
                type: vehicleData.type,
                kenteken: vehicleData.kenteken,
                kleur: vehicleData.kleur,
                aanschafjaar: vehicleData.aanschafjaar,
                soort: vehicleData.soort,
                prijs: vehicleData.prijs,
            };

            const response = await fetch(`https://localhost:7159/api/voertuig/${editVehicleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedVehicleData),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Fout met opslaan van voertuigen.');
            }

            fetchCars();
            setEditVehicleId(null);
            alert('Voertuigen zijn succesvol geupdate.');
        } catch (error) {
            console.error(error.message);
            alert('Fout met updaten van voertuigen.');
        }
    };

    const handleSaveNewVehicle = async () => {
        try {
            const response = await fetch('https://localhost:7159/api/Voertuig/voertuig/database/add', {
                method: 'POST',
                body: JSON.stringify(newVehicleData),
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Fout met toevoegen van voertuig.');
            }
            fetchCars();
            setShowAddPopup(false);
            setNewVehicleData({
                merk: '',
                type: '',
                kenteken: '',
                kleur: '',
                aanschafjaar: 0,
                soort: '',
                prijs: 0,
            });
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleAdd = () => {
        setNewVehicleData({
            merk: '',
            type: '',
            kenteken: '',
            kleur: '',
            aanschafjaar: 0,
            soort: '',
            prijs: 0,
        });
        setShowAddPopup(true);
    };

    const handleDelete = async (vehicleId) => {
        try {
            const response = await fetch(`https://localhost:7159/api/voertuig/${vehicleId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Fout met verwijderen van voertuig.');
            }

            fetchCars();
            alert('Voertuig succesvol verwijderd.');
        } catch (error) {
            console.error(error.message);
            alert('Fout met verwijderen van voertuig.');
        }
    };

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setNewVehicleData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    return (
        <>
            <div className="search-container">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Zoek voertuigen..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
                <button className="plus-button" onClick={handleAdd}>
                    <span className="plus-icon">+</span>
                </button>
            </div>

            {showAddPopup && (
                <div className="popup-overlay">
                    <div className="popup-form">
                        <h3>Nieuw Voertuig Toevoegen</h3>
                        <div>
                            <label>Soort:</label>
                            <select
                                name="soort"
                                value={newVehicleData.soort || ''}
                                onChange={handleAddChange}
                            >
                                <option value="auto">Auto</option>
                                <option value="camper">Camper</option>
                                <option value="caravan">Caravan</option>
                            </select>
                        </div>
                        <div>
                            <label>Merk:</label>
                            <input
                                type="text"
                                name="merk"
                                value={newVehicleData.merk || ''}
                                onChange={handleAddChange}
                            />
                        </div>
                        <div>
                            <label>Type:</label>
                            <input
                                type="text"
                                name="type"
                                value={newVehicleData.type || ''}
                                onChange={handleAddChange}
                            />
                        </div>
                        <div>
                            <label>Kenteken:</label>
                            <input
                                type="text"
                                name="kenteken"
                                value={newVehicleData.kenteken || ''}
                                onChange={handleAddChange}
                            />
                        </div>
                        <div>
                            <label>Kleur:</label>
                            <input
                                type="text"
                                name="kleur"
                                value={newVehicleData.kleur || ''}
                                onChange={handleAddChange}
                            />
                        </div>
                        <div>
                            <label>Aanschafjaar:</label>
                            <input
                                type="number"
                                name="aanschafjaar"
                                value={newVehicleData.aanschafjaar || ''}
                                onChange={handleAddChange}
                            />
                        </div>
                        <div>
                            <label>Prijs:</label>
                            <input
                                type="number"
                                name="prijs"
                                value={newVehicleData.prijs || ''}
                                onChange={handleAddChange}
                            />
                        </div>
                        <div>
                            <button onClick={handleSaveNewVehicle}>Opslaan</button>
                            <button onClick={() => setShowAddPopup(false)} style={{ backgroundColor: '#8A8989' }}>
                                Annuleren
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="vehicle-container">
                {filteredVehicles.map((vehicle) => (
                    <div key={vehicle.voertuigId} className="vehicle-card">
                        <div className="vehicle-info">
                            <p>{vehicle.merk} {vehicle.type}</p>
                            <div className="vehicle-actions">
                                <button
                                    className="edit-button"
                                    onClick={() => handleEditClick(vehicle.voertuigId, vehicle)}
                                >
                                    Wijzig
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={() => handleDelete(vehicle.voertuigId)}
                                >
                                    Verwijderen
                                </button>
                            </div>
                        </div>
                        <div
                            className={`edit-form-dropdown ${editVehicleId === vehicle.voertuigId ? 'active' : ''}`}
                        >
                            <h3>Wijzig voertuig</h3>
                            <div>
                                <label>Merk:</label>
                                <input
                                    type="text"
                                    name="merk"
                                    value={vehicleData.merk || ''}
                                    onChange={handleEditChange}
                                />
                            </div>
                            <div>
                                <label>Type:</label>
                                <input
                                    type="text"
                                    name="type"
                                    value={vehicleData.type || ''}
                                    onChange={handleEditChange}
                                />
                            </div>
                            <div>
                                <label>Kenteken:</label>
                                <input
                                    type="text"
                                    name="kenteken"
                                    value={vehicleData.kenteken || ''}
                                    onChange={handleEditChange}
                                />
                            </div>
                            <div>
                                <label>Kleur:</label>
                                <input
                                    type="text"
                                    name="kleur"
                                    value={vehicleData.kleur || ''}
                                    onChange={handleEditChange}
                                />
                            </div>
                            <div>
                                <label>Aanschafjaar:</label>
                                <input
                                    type="number"
                                    name="aanschafjaar"
                                    value={vehicleData.aanschafjaar || ''}
                                    onChange={handleEditChange}
                                />
                            </div>
                            <div>
                                <label>Prijs:</label>
                                <input
                                    type="number"
                                    name="prijs"
                                    value={vehicleData.prijs || ''}
                                    onChange={handleEditChange}
                                />
                            </div>
                            <div>
                                <button onClick={handleSave}>Opslaan</button>
                                <button
                                    onClick={() => setEditVehicleId(null)}
                                    style={{
                                        backgroundColor: '#8A8989'
                                    }}
                                >
                                    Annuleren
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default VehicleOverview;