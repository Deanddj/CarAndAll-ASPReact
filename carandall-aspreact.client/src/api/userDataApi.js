import axios from 'axios';

const fetchUserData = async () => {
    try {
        await axios.get('/api/account/isAuthenticated');

        const response = await axios.get('/api/account/get', { withCredentials: true });

        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            alert('Je moet zijn ingelogd voor deze pagina.');
            window.location.href = '/login';
        } else {
            console.error('Fout met het verkrijgen van gebruikersdata:', error);
        }
        throw error;
    }
};

export default fetchUserData;
