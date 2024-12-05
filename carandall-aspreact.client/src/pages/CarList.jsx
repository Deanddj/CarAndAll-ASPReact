const CarList = () => {
    const cars = [
        { id: 1, name: 'Toyota Corolla', price: 50, description: 'Compact and fuel-efficient.' },
        { id: 2, name: 'Ford Mustang', price: 150, description: 'Luxury sports car.' },
        { id: 3, name: 'Tesla Model 3', price: 100, description: 'Electric vehicle with autopilot.' },
        { id: 4, name: 'BMW X5', price: 120, description: 'Luxury SUV with great comfort.' },
    ];

    return (
        <div className="car-list">
            <h2>Cars for Rental</h2>
            <div className="car-items">
                {cars.map((car) => (
                    <div key={car.id} className="car-item">
                        <h3>{car.name}</h3>
                        <p>{car.description}</p>
                        <p><strong>${car.price}</strong> per day</p>
                        <button>Rent Now</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CarList;
