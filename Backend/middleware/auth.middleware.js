const { verifyToken } = require("@clerk/backend");

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const session = await verifyToken(token);
        req.userId = session.sub;
        next();
    } catch {
        res.status(401).json({ error: "Unauthorized" });
    }
};