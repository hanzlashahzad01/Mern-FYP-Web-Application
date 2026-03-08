const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, './config.env') });

const testGemini = async () => {
    const key = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;
    console.log('Testing Gemini with API Key:', key ? 'Present' : 'MISSING');

    if (!key) {
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(key);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log('Gemini Response:', response.text());
        console.log('SUCCESS!');
    } catch (error) {
        console.error('FAILURE Detail:', error);
    }
};

testGemini();
