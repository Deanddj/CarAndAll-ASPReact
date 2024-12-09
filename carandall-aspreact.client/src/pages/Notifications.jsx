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

    useEffect(() => {
        axios.get('/api/account/get', { withCredentials: true })
            .then(response => {
                setUserDetails(response.data);
            })
            .catch(error => {
                if (error.response && error.response.status === 401) {
                    alert('You need to be logged in to access this page.');
                    window.location.href = '/login';
                } else {
                    console.error('Error fetching user data:', error);
                    setError(error.message);
                }
            });
    }, []);

    useEffect(() => {
        if (userDetails && userDetails.email) {
            const fetchNotifications = async () => {
                try {
                    const response = await axios.get(`/api/notifications/${encodeURIComponent(userDetails.email)}`);
                    setNotifications(response.data);
                } catch (err) {
                    console.error("Error fetching notifications:", err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchNotifications();
        }
    }, [userDetails]);

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
            console.error("Error marking notification as read:", err);
            setError(err.message);
        }
    };

    if (loading) {
        return <p>Loading notifications...</p>;
    }

    if (error) {
        return <p>Error fetching notifications: {error}</p>;
    }

    if (!notifications.length) {
        return <p>No notifications found.</p>;
    }

    return (
        <div className="notifications-container">
            <h2>Notifications</h2>
            <ul className="notifications-list">
                {notifications.map((notification) => (
                    <li
                        key={notification.notificationId}
                        className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                        onClick={() => !notification.isRead && markAsRead(notification.notificationId)}
                    >
                        <h3 className={notification.isRead ? 'read-title' : 'unread-title'}>
                            {notification.title}
                        </h3>
                        {notification.isRead && <p>{notification.message}</p>}
                        <small>{new Date(notification.createdAt).toLocaleString()}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notifications;