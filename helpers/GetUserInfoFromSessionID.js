const getUserIdFromSession = async (sessionid) => {
    if (!sessionid) return null;
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(sessionid, process.env.JWT_SECRET);
        const user = decoded.id
        return user
    } catch (err) {
        console.log("Could not get user from session id", err);
        return null;
    }
}

module.exports = {  getUserIdFromSession };