import React from 'react';
import "../styles/PrivacyBeleid.css";
import { FaUserCircle } from 'react-icons/fa';

const PrivacyBeleid = () => {
    return (
        <div>
            {}
            <nav className="homepage-navbar">
                <div className="logo">
                    <h2>CarAndAll</h2>
                </div>
                <div className="profile">
                    <a href="/dashboard">
                        <button className="dashboard-btn">Dashboard</button>
                    </a>
                    <a href="/dashboard?section=account">
                        <FaUserCircle className="account-icon" />
                    </a>
                </div>
                </nav>

        <div className="containerPrivacy">
            <h1>Privacybeleid CarAndAll</h1>
            <p1><strong>Inleiding</strong></p1>
            <p>Welkom bij CarAndAll. Bij ons staat de bescherming van uw persoonsgegevens voorop. In dit privacybeleid leggen we uit hoe we omgaan met de gegevens van onze gebruikers, zowel particuliere klanten als bedrijven en hoe we uw privacy waarborgen.</p>

            <h2>Verwerking van persoonsgegevens</h2>
            <h3>Particuliere klanten</h3>
            <p>Van particuliere huurders verzamelen en verwerken wij de volgende gegevens:</p>
            <ul>
                <li>Naam</li>
                <li>E-mailadres</li>
                <li>Wachtwoord</li>
                <li>Telefoonnummer</li>
                <li>Adres</li>
            </ul>
            <p>Deze gegevens worden gebruikt om onze diensten aan te bieden, uw boekingen te beheren en u te voorzien van klantenondersteuning.</p>

            <h3>Zakelijke klanten</h3>
                <p>Zakelijke klanten kunnen onderverdeeld worden in twee categorie&euml;n:</p>
            <h4>Zakelijke beheerders</h4>
            <ul>
                <li>Naam</li>
                <li>E-mailadres</li>
                <li>Wachtwoord</li>
                <li>Bedrijfsnaam</li>
                <li>Kamer van Koophandel (KvK)-nummer</li>
                <li>Bedrijfsadres</li>
            </ul>
            <h4>Zakelijke huurders</h4>
            <ul>
                <li>Naam</li>
                <li>E-mailadres</li>
                <li>Wachtwoord</li>
                <li>Telefoonnummer</li>
                <li>Adres</li>
                </ul>

            <h2>Beheer van gegevens</h2>
            <p>Alle gebruikers (particulieren, zakelijke beheerders en zakelijke huurders) hebben de mogelijkheid om:</p>
            <ul>
                <li>Hun gegevens te bekijken en te wijzigen via hun accountinstellingen.</li>
                <li>Hun account te verwijderen, wat resulteert in de volledige verwijdering van hun gegevens uit onze systemen.</li>
            </ul>

            <h2>Bewaartermijnen</h2>
            <p>Wij bewaren uw persoonsgegevens zolang dat nodig is voor de doeleinden waarvoor ze zijn verzameld of zolang als wettelijk vereist. Data wordt opgeslagen gedurende de contractduur en tot 7 jaar na be&euml;indiging in lijn met wettelijke verplichtingen. Wanneer u uw account verwijdert, worden al uw gegevens permanent uit onze systemen verwijderd.</p>

            <h2>Beveiliging van gegevens</h2>
            <p>Wij nemen passende technische en organisatorische maatregelen om uw persoonsgegevens te beschermen tegen verlies, misbruik, ongeautoriseerde toegang, openbaarmaking en wijziging.</p>

            <h2>Uw rechten</h2>
            <p>U heeft het recht om:</p>
            <ul>
                <li>Inzage te vragen in de persoonsgegevens die wij van u verwerken.</li>
                <li>Correctie of verwijdering van uw gegevens te vragen.</li>
                <li>Beperking van de verwerking van uw gegevens aan te vragen.</li>
                <li>Bezwaar te maken tegen de verwerking van uw gegevens.</li>
            </ul>

            <h2>Wijzigingen in dit privacybeleid</h2>
            <p>Wij behouden ons het recht voor om dit privacybeleid te wijzigen. Eventuele wijzigingen zullen op onze website worden gepubliceerd. We raden u aan om regelmatig ons privacybeleid te controleren.</p>
            
            <h2>Contact</h2>
            <p>Als u vragen heeft over dit privacybeleid of over de manier waarop wij uw gegevens verwerken, kunt u contact met ons opnemen via:</p>
            <p>E-mail: <strong>klantenservice@CarAndAll.com</strong></p>
            <p>Telefoon: <strong>0612345678</strong></p>
            <p>Adres: <strong>CarAndAll 12, 1234 AB</strong></p>
            </div>
        </div>
    );
};

export default PrivacyBeleid;
