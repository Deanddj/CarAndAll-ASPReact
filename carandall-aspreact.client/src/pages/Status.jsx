import { useState, useEffect } from 'react';
import axios from 'axios';

const Status = () => {
    const [vehicles, setVehicles] = useState([]);
    const [statuses, setStatuses] = useState({});

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await axios.get('https://localhost:7159/api/Voertuig/voertuigen/met-aanvragen');
                const vehicleData = response.data.$values;
                setVehicles(vehicleData);

                const initialStatuses = {};
                vehicleData.forEach(vehicle => {
                    initialStatuses[vehicle.voertuigId] = vehicle.status || 'Beschikbaar';
                });
                setStatuses(initialStatuses);
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            }
        };

        fetchVehicles();
    }, []);

    const handleStatusChange = (id, newStatus) => {
        setStatuses(prevStatuses => ({
            ...prevStatuses,
            [id]: newStatus
        }));

        axios.put(`YOUR_API_ENDPOINT_HERE/${id}`, { status: newStatus })
            .then(response => {
                console.log('Status updated:', response.data);
            })
            .catch(error => {
                console.error('Error updating status:', error);
            });
    };

    return (
        <div>
            <h1>Vehicle Status Management</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Merk</th>
                        <th>Type</th>
                        <th>Kenteken</th>
                        <th>Kleur</th>
                        <th>Status</th>
                        <th>Change Status</th>
                    </tr>
                </thead>
                <tbody>
                    {vehicles.map(vehicle => (
                        <tr key={vehicle.voertuigId}>
                            <td>{vehicle.voertuigId}</td>
                            <td>{vehicle.merk}</td>
                            <td>{vehicle.type}</td>
                            <td>{vehicle.kenteken}</td>
                            <td>{vehicle.kleur}</td>
                            <td>{statuses[vehicle.voertuigId]}</td>
                            <td>
                                <select
                                    value={statuses[vehicle.voertuigId]}
                                    onChange={(e) => handleStatusChange(vehicle.voertuigId, e.target.value)}
                                >
                                    <option value="Beschikbaar">Beschikbaar</option>
                                    <option value="In reparatie">In reparatie</option>
                                    <option value="Verhuurd">Verhuurd</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Status;