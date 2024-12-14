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

        console.log("Notificatie verstuurd:", response.data);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        const errorMessage = error.response ? error.response.data : error.message;

        console.error("Fout met versturen van notificatie:", errorMessage);

        return {
            success: false,
            message: errorMessage,
        };
    }
};

export default postNotification;