const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, './config.env') });

const listModels = async () => {
    const key = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;
    if (!key) {
        console.error('API key missing');
        return;
    }

    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        console.log('Available Models:', response.data.models.map(m => m.name));
    } catch (error) {
        console.error('Error listing models:', error.response ? error.response.status : error.message);
        if (error.response) console.error('Data:', error.response.data);
    }
};

listModels();
