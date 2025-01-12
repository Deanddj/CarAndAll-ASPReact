import { createContext, useState, useContext } from 'react';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const [message, setMessage] = useState({ text: '', type: '', id: null });

    const showMessage = (text, type) => {
        closeMessage();
        setMessage({ text, type, id: Date.now() });
        setTimeout(() => {
            const dashboardContent = document.querySelector('.dashboard-content');
            if (dashboardContent) {
                dashboardContent.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        }, 0);
    };

    const closeMessage = () => {
        setMessage({ text: '', type: '', id: null });
    };

    return (
        <MessageContext.Provider value={{ message, showMessage, closeMessage }}>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessage = () => useContext(MessageContext);