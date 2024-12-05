const Navbar = ({ setActiveSection }) => {
    return (
        <div className="dashboard-navbar">
            <button onClick={() => setActiveSection('home')}>Home</button>
            <button onClick={() => setActiveSection('notifications')}>Notifications</button>
            <button onClick={() => setActiveSection('account')}>Account</button>
        </div>
    );
};

export default Navbar;
