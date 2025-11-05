const path = require("path");

const getImageUrl = (req, filePath) => {
    if (!filePath) return null;


    const relativePath = path.relative(path.join(process.cwd(), "documents"), filePath).replace(/\\/g, '/');


    return `${process.env.BASE_URL}/documents/${relativePath}`;
};

module.exports = { getImageUrl };
