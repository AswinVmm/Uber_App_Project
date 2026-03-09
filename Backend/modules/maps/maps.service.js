const axios = require("axios");

exports.getRoute = async (coordinates) => {
    const response = await axios.post(
        "https://api.openrouteservice.org/v2/directions/driving-car",
        { coordinates },
        {
            headers: {
                Authorization: process.env.ORS_API_KEY,
                "Content-Type": "application/json"
            }
        }
    );

    return response.data;
};