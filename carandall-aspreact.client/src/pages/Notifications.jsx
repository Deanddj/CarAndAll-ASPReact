import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Notifications.css";

axios.defaults.baseURL = 'https://localhost:7159';
axios.defaults.withCredentials = true;

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [openNotificationId, setOpenNotificationId] = useState(null);

    useEffect(() => {
        axios.get('/api/account/get', { withCredentials: true })
            .then(response => {
                setUserDetails(response.data);
            })
            .catch(error => {
                if (error.response && error.response.status === 401) {
                    alert('Je moet zijn ingelogd voor deze pagina.');
                    window.location.href = '/login';
                } else {
                    console.error('Fout met gebruikersdata verkrijgen:', error);
                    setError(error.message);
                }
            });
    }, []);

    useEffect(() => {
        if (userDetails && userDetails.userName) {
            fetchNotifications();
        }
    }, [userDetails]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`/api/notifications/`);
            setNotifications(response.data.$values);;
        } catch (err) {
            console.error("Fout met notificatiedata verkrijgen:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`/api/notifications/${notificationId}/mark-read`);
            setNotifications(prevNotifications =>
                prevNotifications.map(notification =>
                    notification.notificationId === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
        } catch (err) {
            console.error("Fout met notificatie markeren als gelezen:", err);
            setError(err.message);
        }
    };

    const handleAccept = async (notificationId) => {
        try {
            await axios.put(`/api/notifications/${notificationId}/accept`);
            console.log(`Notificatie ${notificationId} geaccepteerd`);
            await fetchNotifications();
        } catch (err) {
            console.error("Fout met verkrijgen van notificatie:", err);
        }
    };

    const handleDecline = async (notificationId) => {
        try {
            await axios.put(`/api/notifications/${notificationId}/decline`);
            console.log(`Declined notification ${notificationId}`);
            await fetchNotifications();
        } catch (err) {
            console.error("Error declining notification:", err);
        }
    };

    const handleToggleNotification = (notificationId) => {
        setOpenNotificationId(prev => (prev === notificationId ? null : notificationId));
        if (openNotificationId !== notificationId) {
            markAsRead(notificationId);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-dots">
                    Laden<span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
            </div>
        );
    }

    if (error) {
        return <p>Error verkrijgen van notificaties: {error}</p>;
    }

    if (!notifications.length) {
        return <p>Geen notificaties gevonden.</p>;
    }

    return (
        <div className="notifications-container">
            <h2>Notificaties</h2>
            <ul className="notifications-list">
                {notifications.map((notification) => (
                    <li
                        key={notification.notificationId}
                        className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                        onClick={() => handleToggleNotification(notification.notificationId)}
                    >
                        <h3 className={notification.isRead ? 'read-title' : 'unread-title'}>
                            {notification.title}
                        </h3>
                        {notification.isRead && openNotificationId === notification.notificationId && notification.type === "Bericht" && (
                            <p>{notification.message}</p>
                        )}
                        {notification.isRead && openNotificationId === notification.notificationId && notification.type === "BedrijfVerzoek" && (
                            <div>
                                <p>{notification.message}</p>
                                <div className="buttons-container">
                                    <button
                                        className="accept-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAccept(notification.notificationId);
                                        }}
                                        aria-label="Accepteer bedrijfuitnodiging"
                                    >
                                        Accepteer
                                    </button>
                                    <button
                                        className="decline-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDecline(notification.notificationId);
                                        }}
                                        aria-label="Weiger bedrijfuitnodiging"
                                    >
                                        Weiger
                                    </button>
                                </div>
                            </div>
                        )}
                        <small>{new Date(notification.createdAt).toLocaleString()}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notifications;