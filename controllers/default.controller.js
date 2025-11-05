const path = require('path');
const fs = require('fs');

const getAllCountryNamesHandler = async (req, res) => {
    try {
        const lang = req.headers.language || req.headers['accept-language'] || 'en';
        const translationPath = path.join(__dirname, `../locales/${lang}/translation.json`);
        const raw = await fs.promises.readFile(translationPath, 'utf-8');
        const translation = JSON.parse(raw);
        const countryObj = translation.country;
        if (!countryObj) {
            return res.status(404).json({ success: false, message: 'No country data found', data: [] });
        }
        // Return only the names as an array
        const countries = Object.values(countryObj);
        return res.status(200).json({ success: true, message: 'Countries fetched successfully', data: countries });
    } catch (error) {
        console.error('getAllCountryNamesHandler error', error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: [] });
    }
};

module.exports = { getAllCountryNamesHandler };
