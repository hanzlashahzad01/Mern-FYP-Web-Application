const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../config.env') });

const analyzeProductImage = async (base64Data) => {
    const key = process.env.GEMINI_API_KEY?.trim();

    if (!key || key === 'your_gemini_api_key_here') {
        throw new Error('Gemini API Key is missing or invalid in config.env');
    }

    const genAI = new GoogleGenerativeAI(key);

    // Using gemini-1.5-flash as default for better rate limits handling
    try {
        console.log('AI: Initializing analysis with Gemini 1.5 Flash...');
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Match the mime type
        const mimeMatch = base64Data.match(/^data:(.*);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

        // Robust base64 extraction
        const base64Content = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data.split(',')[1];

        const prompt = `
            Analyze this image and identify the product. 
            Provide a 3-5 word description, 5-8 relevant keywords, and one category from this list:
            ['Jewelry', 'Home Decor', 'Art & Prints', 'Clothing', 'Pottery', 'Textiles', 'Bath & Body', 'Leather', 'Glass', 'Metalwork', 'Kitchen', 'Garden', 'Beauty', 'Accessories']
            
            Return ONLY a JSON object:
            {
                "description": "...",
                "keywords": ["...", "..."],
                "suggestedCategory": "..."
            }
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Content,
                    mimeType: mimeType
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Improved JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI returned an invalid response format');
        }

        console.log('AI: Analysis complete.');
        return JSON.parse(jsonMatch[0]);

    } catch (error) {
        console.error('AI Detail:', error.message);

        if (error.status === 429 || error.message.includes('429')) {
            throw new Error('Google API Limit: Please wait 30 seconds before trying again. The free key allows only a few searches per minute.');
        }

        if (error.status === 404) {
            throw new Error('Gemini model not found. Please verify your API key account has access to Gemini 1.5 Flash.');
        }

        throw new Error(`AI Analysis Error: ${error.message}`);
    }
};

module.exports = {
    analyzeProductImage
};
