import { useMessage } from '../../context/MessageProvider.jsx';
import './MessageBox.css'

export const MessageBox = () => {
    const { message, closeMessage } = useMessage();

    if (!message.text) return null;

    return (
        <div
            key={message.id}
            style={{
                padding: '10px',
                marginBottom: '15px',
                color: message.type === 'success' ? 'green' : 'red',
                border: `2px solid ${message.type === 'success' ? 'green' : 'red'}`,
                borderRadius: '5px',
                position: 'relative',
                backgroundColor:
                    message.type === 'success' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                animation: 'bubble 0.6s ease-out',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto',
                width: '80%',
                maxWidth: '600px',
            }}
        >
            {message.text}
            <button
                onClick={closeMessage}
                style={{
                    position: 'absolute',
                    top: '5px',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: message.type === 'success' ? 'green' : 'red',
                    fontSize: '20px',
                    cursor: 'pointer',
                }}
            >
                &times;
            </button>
        </div>
    );
};