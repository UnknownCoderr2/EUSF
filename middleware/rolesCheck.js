const allowedRoles = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            console.log(roles);
            console.log(req.user.role);
            return res.status(403).json({ success: false, message: req.t("auth.unauthorized_access"), data: '' });
        }
        next();
    };
}

module.exports = { allowedRoles };