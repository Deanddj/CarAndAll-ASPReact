import '../styles/Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; 2024 CarAndAll. Alle rechten voorbehouden.</p>
                <p>
                    <a href="/privacy-policy">Privacybeleid</a> |
                    <a href="/terms-of-service"> Algemene Voorwaarden</a> |
                    <a href="/contact">Contact</a>
                </p>
            </div>
        </footer>
    );
}

export default Footer;
