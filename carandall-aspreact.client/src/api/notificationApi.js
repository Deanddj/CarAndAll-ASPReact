import axios from "axios";

const postNotification = async (email, type, bedrijfId, title, message) => {
    try {
        const response = await axios.post("https://localhost:7159/api/notifications", {
            email,
            type,
            bedrijfId,
            title,
            message,
        });
        console.log("Notificacite verstuurd:", response.data);
    } catch (error) {
        console.error("Fout met versturen van notificatie:", error);
    }
};

export default postNotification;