import { useState } from 'react';

function ProfileSettingsPage() {
    const [profile, setProfile] = useState({
        name: 'Jan Janssen',
        address: 'Straatnaam 123, Stad',
        email: 'jan.janssen@example.com',
        phone: '0612345678'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Profielgegevens zijn bijgewerkt:', profile);
    };

    return (
        <div className="profile-edit">
            <h1>Profiel Bewerken</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Naam</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="address">Adres</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={profile.address}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="email">E-mail</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="phone">Telefoonnummer</label>
                    <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Opslaan</button>
            </form>
        </div>
    );
}

export default ProfileSettingsPage;
